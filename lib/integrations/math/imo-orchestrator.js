import { createHash } from 'node:crypto';

const VALID_SUITES = new Set(['answerbench', 'proofbench', 'leanproofbench']);
const VALID_EXECUTIONS = new Set(['real', 'mock', 'replay']);

function nonEmpty(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} required`);
  return value;
}

function nonNegative(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative finite number`);
  }
  return value;
}

function intNonNegative(value, name) {
  if (!Number.isInteger(value) || value < 0) throw new TypeError(`${name} must be a non-negative integer`);
  return value;
}

function freeze(value) {
  if (Array.isArray(value)) return Object.freeze(value.map((item) => freeze(item)));
  if (value && typeof value === 'object') {
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, freeze(item)])));
  }
  return value;
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function hashText(text) {
  return createHash('sha256').update(String(text)).digest('hex');
}

function uniqueCount(models) {
  return new Set(models.map((model) => model.model_id)).size;
}

function validateModel(model, name = 'model') {
  if (!model || typeof model !== 'object') throw new TypeError(`${name} required`);
  const normalized = {
    schema: 'reversa.imo.model/v1',
    model_id: nonEmpty(model.model_id, `${name}.model_id`),
    provider: nonEmpty(model.provider, `${name}.provider`),
    version: nonEmpty(model.version, `${name}.version`),
    execution: nonEmpty(model.execution, `${name}.execution`),
    evidence_authority: false,
  };
  if (!VALID_EXECUTIONS.has(normalized.execution)) {
    throw new RangeError(`${name}.execution must be real, mock or replay`);
  }
  return freeze(normalized);
}

function validateModels(models, name) {
  if (!Array.isArray(models) || models.length < 1) throw new TypeError(`${name} must be a non-empty array`);
  return freeze(models.map((model, index) => validateModel(model, `${name}[${index}]`)));
}

function publicProblem(problem) {
  return freeze({
    problem_id: problem.problem_id,
    suite: problem.suite,
    statement: problem.statement,
    category: problem.category,
    subcategory: problem.subcategory,
    benchmark_repo: problem.benchmark_repo,
    benchmark_ref: problem.benchmark_ref,
    benchmark_path: problem.benchmark_path,
  });
}

function referenceForJudge(problem) {
  return freeze({
    reference_answer: problem.reference_answer ?? null,
    reference_solution: problem.reference_solution ?? null,
    grading_rubric: problem.grading_rubric ?? null,
  });
}

function scientificMethod(role) {
  return freeze({
    role,
    requirements: [
      'state the main hypothesis or strategy explicitly',
      'attempt to falsify the strategy or identify a counterexample',
      'check edge cases and hidden assumptions',
      'separate proved steps from conjectural gaps',
      'do not use confidence or fluency as a substitute for proof',
    ],
  });
}

function selectCrossModel(models, authorModelId, index) {
  const independent = models.filter((model) => model.model_id !== authorModelId);
  const pool = independent.length ? independent : models;
  return pool[index % pool.length];
}

function selectReviser(models, authorModelId, index) {
  return models.find((model) => model.model_id === authorModelId) ?? models[index % models.length];
}

function normalizeInvocation(result, role) {
  if (!result || typeof result !== 'object') throw new TypeError(`${role} invocation must return an object`);
  const normalized = {
    text: typeof result.text === 'string' ? result.text : '',
    verdict: typeof result.verdict === 'string' ? result.verdict : null,
    score: result.score,
    correct: result.correct,
    rationale: typeof result.rationale === 'string' ? result.rationale : null,
    confidence: result.confidence,
    latency_ms: result.latency_ms == null ? 0 : nonNegative(result.latency_ms, `${role}.latency_ms`),
    cost: result.cost == null ? 0 : nonNegative(result.cost, `${role}.cost`),
    tool_calls: result.tool_calls == null ? 0 : intNonNegative(result.tool_calls, `${role}.tool_calls`),
  };
  return normalized;
}

function validateJudgeResult(problem, result) {
  if (typeof result.score !== 'number' || !Number.isFinite(result.score)) throw new TypeError('judge.score must be finite number');
  const maxScore = problem.suite === 'answerbench' ? 1 : 7;
  if (result.score < 0 || result.score > maxScore) throw new RangeError(`judge.score must be between 0 and ${maxScore}`);
  if (typeof result.correct !== 'boolean') throw new TypeError('judge.correct must be boolean');
  if (result.confidence != null && (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1)) {
    throw new RangeError('judge.confidence must be in [0,1]');
  }
}

function candidateBase({ id, phase, authorModelId, text, parentId = null }) {
  return {
    schema: 'reversa.imo.candidate/v1',
    candidate_id: id,
    phase,
    author_model_id: authorModelId,
    parent_candidate_id: parentId,
    text,
    text_sha256: hashText(text),
    evidence_authority: false,
  };
}

function blindCandidate(candidate) {
  return freeze({
    candidate_id: candidate.candidate_id,
    phase: candidate.phase,
    parent_candidate_id: candidate.parent_candidate_id,
    text: candidate.text,
    text_sha256: candidate.text_sha256,
  });
}

function invocationMode(allModels, problem) {
  if (problem.smoke || allModels.some((model) => model.execution === 'mock')) return 'smoke';
  if (allModels.some((model) => model.execution === 'replay')) return 'replay';
  return 'real';
}

function classifyRun({ problem, mode, proposerModels, judgeModels, finalCandidate }) {
  if (mode === 'smoke') return 'smoke';
  if (mode === 'replay') return 'replay';

  const validCommit = typeof problem.benchmark_commit === 'string' && /^[0-9a-f]{40}$/i.test(problem.benchmark_commit);
  const solverDiversity = uniqueCount(proposerModels) >= 2;
  const judgeDiversity = uniqueCount(judgeModels) >= 2;
  const independentJudges = judgeModels.every((judge) => judge.model_id !== finalCandidate.author_model_id);

  if (validCommit && solverDiversity && judgeDiversity && independentJudges) return 'multi-model-confirmatory';
  return 'pilot';
}

export function createIMOProblem({
  problem_id,
  suite,
  benchmark_repo,
  benchmark_ref,
  benchmark_path,
  benchmark_commit = null,
  statement,
  category = null,
  subcategory = null,
  reference_answer = null,
  reference_solution = null,
  grading_rubric = null,
  smoke = false,
  metadata = {},
} = {}) {
  nonEmpty(problem_id, 'problem_id');
  nonEmpty(suite, 'suite');
  if (!VALID_SUITES.has(suite)) throw new RangeError('suite must be answerbench, proofbench or leanproofbench');
  nonEmpty(benchmark_repo, 'benchmark_repo');
  nonEmpty(benchmark_ref, 'benchmark_ref');
  nonEmpty(benchmark_path, 'benchmark_path');
  nonEmpty(statement, 'statement');
  if (benchmark_commit != null && !/^[0-9a-f]{40}$/i.test(benchmark_commit)) throw new TypeError('benchmark_commit must be 40-char hex SHA');
  if (typeof smoke !== 'boolean') throw new TypeError('smoke must be boolean');
  if (suite === 'answerbench' && (typeof reference_answer !== 'string' || !reference_answer.trim())) {
    throw new TypeError('reference_answer required for answerbench');
  }
  if ((suite === 'proofbench' || suite === 'leanproofbench') && (typeof reference_solution !== 'string' || !reference_solution.trim())) {
    throw new TypeError('reference_solution required for proof benchmark');
  }
  if ((suite === 'proofbench' || suite === 'leanproofbench') && (typeof grading_rubric !== 'string' || !grading_rubric.trim())) {
    throw new TypeError('grading_rubric required for proof benchmark');
  }

  return freeze({
    schema: 'reversa.imo.problem/v1',
    problem_id,
    suite,
    benchmark_repo,
    benchmark_ref,
    benchmark_path,
    benchmark_commit,
    statement,
    category,
    subcategory,
    reference_answer,
    reference_solution,
    grading_rubric,
    smoke,
    metadata,
    evidence_authority: false,
  });
}

export function createIMOScientificOrchestrator({
  invoke,
  proposerModels,
  criticModels,
  verifierModels,
  reviserModels,
  judgeModels,
} = {}) {
  if (typeof invoke !== 'function') throw new TypeError('invoke function required');
  const proposers = validateModels(proposerModels, 'proposerModels');
  const critics = validateModels(criticModels, 'criticModels');
  const verifiers = validateModels(verifierModels, 'verifierModels');
  const revisers = validateModels(reviserModels, 'reviserModels');
  const judges = validateModels(judgeModels, 'judgeModels');
  const allModels = [...proposers, ...critics, ...verifiers, ...revisers, ...judges];

  return freeze({
    async run(problem, { seed = 0 } = {}) {
      if (!problem || problem.schema !== 'reversa.imo.problem/v1') throw new TypeError('valid IMO problem required');
      intNonNegative(seed, 'seed');
      const publicView = publicProblem(problem);
      const invocationLog = [];
      let totalLatency = 0;
      let totalCost = 0;
      let totalToolCalls = 0;

      async function call(model, request) {
        const result = normalizeInvocation(await invoke(model, freeze(request)), request.role);
        totalLatency += result.latency_ms;
        totalCost += result.cost;
        totalToolCalls += result.tool_calls;
        invocationLog.push(freeze({
          role: request.role,
          model_id: model.model_id,
          provider: model.provider,
          version: model.version,
          execution: model.execution,
          request_sha256: hashText(JSON.stringify(request)),
          response_sha256: hashText(JSON.stringify(result)),
          latency_ms: result.latency_ms,
          cost: result.cost,
          tool_calls: result.tool_calls,
        }));
        return result;
      }

      const proposals = [];
      for (let index = 0; index < proposers.length; index += 1) {
        const model = proposers[index];
        const result = await call(model, {
          role: 'proposer',
          seed,
          problem: publicView,
          scientific_method: scientificMethod('proposer'),
          instruction: 'Solve independently. Produce a rigorous proof or derivation and explicitly identify any unresolved gap.',
        });
        if (!result.text.trim()) throw new Error(`empty proposer output from ${model.model_id}`);
        proposals.push(freeze(candidateBase({
          id: `candidate-${String(index + 1).padStart(3, '0')}-initial`,
          phase: 'initial',
          authorModelId: model.model_id,
          text: result.text,
        })));
      }

      const critiques = [];
      const verifications = [];
      const revisions = [];

      for (let index = 0; index < proposals.length; index += 1) {
        const candidate = proposals[index];
        const criticModel = selectCrossModel(critics, candidate.author_model_id, index);
        const critique = await call(criticModel, {
          role: 'critic',
          seed,
          problem: publicView,
          candidate,
          scientific_method: scientificMethod('critic'),
          instruction: 'Attack the proof. Search for counterexamples, unjustified implications, hidden assumptions and missing cases.',
        });
        critiques.push(freeze({
          candidate_id: candidate.candidate_id,
          critic_model_id: criticModel.model_id,
          independent: criticModel.model_id !== candidate.author_model_id,
          text: critique.text,
          evidence_authority: false,
        }));

        const verifierModel = selectCrossModel(verifiers, candidate.author_model_id, index);
        const verification = await call(verifierModel, {
          role: 'verifier',
          seed,
          problem: publicView,
          candidate,
          critique: critiques[critiques.length - 1],
          scientific_method: scientificMethod('verifier'),
          instruction: 'Independently verify each critical step and attempt explicit falsification. Return a verdict and remaining gaps.',
        });
        verifications.push(freeze({
          candidate_id: candidate.candidate_id,
          verifier_model_id: verifierModel.model_id,
          independent: verifierModel.model_id !== candidate.author_model_id,
          verdict: verification.verdict,
          text: verification.text,
          evidence_authority: false,
        }));

        const reviserModel = selectReviser(revisers, candidate.author_model_id, index);
        const revision = await call(reviserModel, {
          role: 'reviser',
          seed,
          problem: publicView,
          candidate,
          critique: critiques[critiques.length - 1],
          verification: verifications[verifications.length - 1],
          scientific_method: scientificMethod('reviser'),
          instruction: 'Revise only when justified. Repair demonstrated gaps, preserve correct arguments, and state any remaining uncertainty.',
        });
        if (!revision.text.trim()) throw new Error(`empty reviser output from ${reviserModel.model_id}`);
        revisions.push(freeze(candidateBase({
          id: `candidate-${String(index + 1).padStart(3, '0')}-revised`,
          phase: 'revised',
          authorModelId: reviserModel.model_id,
          text: revision.text,
          parentId: candidate.candidate_id,
        })));
      }

      const allCandidates = [...proposals, ...revisions];
      const judged = [];
      const reference = referenceForJudge(problem);
      for (const candidate of allCandidates) {
        const judgments = [];
        for (const judgeModel of judges) {
          const judgment = await call(judgeModel, {
            role: 'judge',
            seed,
            problem: publicView,
            candidate: blindCandidate(candidate),
            reference,
            instruction: problem.suite === 'answerbench'
              ? 'Grade the final short answer against the reference. Score 1 if correct, otherwise 0.'
              : 'Grade blindly under the provided IMO rubric. Score from 0 to 7 and identify the decisive correctness or gap.',
          });
          validateJudgeResult(problem, judgment);
          judgments.push(freeze({
            schema: 'reversa.imo.judgment/v1',
            candidate_id: candidate.candidate_id,
            judge_model_id: judgeModel.model_id,
            score: judgment.score,
            correct: judgment.correct,
            rationale: judgment.rationale,
            confidence: judgment.confidence ?? null,
            evidence_authority: false,
          }));
        }
        const scores = judgments.map((item) => item.score);
        judged.push(freeze({
          ...candidate,
          judgments,
          score_mean: mean(scores),
          score_min: Math.min(...scores),
          score_max: Math.max(...scores),
          judge_disagreement: Math.max(...scores) - Math.min(...scores),
          correct_vote_rate: mean(judgments.map((item) => (item.correct ? 1 : 0))),
        }));
      }

      const ranked = [...judged].sort((a, b) => {
        if (b.score_mean !== a.score_mean) return b.score_mean - a.score_mean;
        if (a.judge_disagreement !== b.judge_disagreement) return a.judge_disagreement - b.judge_disagreement;
        if (a.phase !== b.phase) return a.phase === 'revised' ? -1 : 1;
        return a.candidate_id.localeCompare(b.candidate_id);
      });
      const finalCandidate = ranked[0];

      const initialJudged = judged.filter((item) => item.phase === 'initial');
      const revisedJudged = judged.filter((item) => item.phase === 'revised');
      const bestInitial = Math.max(...initialJudged.map((item) => item.score_mean));
      const bestRevised = Math.max(...revisedJudged.map((item) => item.score_mean));
      let corrected = 0;
      let degraded = 0;
      for (const revision of revisedJudged) {
        const parent = initialJudged.find((item) => item.candidate_id === revision.parent_candidate_id);
        if (!parent) continue;
        if (revision.score_mean > parent.score_mean) corrected += 1;
        if (revision.score_mean < parent.score_mean) degraded += 1;
      }

      const mode = invocationMode(allModels, problem);
      const runClass = classifyRun({ problem, mode, proposerModels: proposers, judgeModels: judges, finalCandidate });
      const scientificResult = runClass === 'multi-model-confirmatory';
      const criticIndependentRate = mean(critiques.map((item) => (item.independent ? 1 : 0)));
      const verifierIndependentRate = mean(verifications.map((item) => (item.independent ? 1 : 0)));

      return freeze({
        schema: 'reversa.imo.run/v1',
        problem_id: problem.problem_id,
        suite: problem.suite,
        seed,
        run_class: runClass,
        scientific_result: scientificResult,
        benchmark: {
          repo: problem.benchmark_repo,
          ref: problem.benchmark_ref,
          path: problem.benchmark_path,
          commit: problem.benchmark_commit,
        },
        proposals,
        critiques,
        verifications,
        revisions,
        judged_candidates: judged,
        final_candidate: finalCandidate,
        metrics: {
          best_initial_score: bestInitial,
          best_revised_score: bestRevised,
          orchestration_gain: finalCandidate.score_mean - bestInitial,
          correction_rate: proposals.length ? corrected / proposals.length : 0,
          degradation_rate: proposals.length ? degraded / proposals.length : 0,
          judge_disagreement: mean(judged.map((item) => item.judge_disagreement)),
          solver_model_count: uniqueCount(proposers),
          critic_model_count: uniqueCount(critics),
          verifier_model_count: uniqueCount(verifiers),
          reviser_model_count: uniqueCount(revisers),
          judge_model_count: uniqueCount(judges),
          critic_independent_rate: criticIndependentRate,
          verifier_independent_rate: verifierIndependentRate,
          total_latency_ms: totalLatency,
          total_cost: totalCost,
          total_tool_calls: totalToolCalls,
        },
        invocation_log: invocationLog,
        evidence_authority: false,
      });
    },
  });
}

export function createIMOReport(runs = []) {
  if (!Array.isArray(runs)) throw new TypeError('runs must be an array');
  if (runs.some((run) => !run || run.schema !== 'reversa.imo.run/v1')) throw new TypeError('all runs must be valid IMO runs');
  const byClass = Object.fromEntries(['smoke', 'replay', 'pilot', 'multi-model-confirmatory'].map((runClass) => [
    runClass,
    runs.filter((run) => run.run_class === runClass).length,
  ]));
  const confirmatory = runs.filter((run) => run.run_class === 'multi-model-confirmatory');
  return freeze({
    schema: 'reversa.imo.report/v1',
    total_runs: runs.length,
    run_classes: byClass,
    confirmatory_runs: confirmatory.length,
    mean_confirmatory_score: mean(confirmatory.map((run) => run.final_candidate.score_mean)),
    mean_orchestration_gain: mean(confirmatory.map((run) => run.metrics.orchestration_gain)),
    scientific_result: confirmatory.length > 0,
    causal_claim: false,
    evidence_authority: false,
  });
}
