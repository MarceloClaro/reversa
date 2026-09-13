import assert from 'node:assert/strict';

import {
  createIMOProblem,
  createIMOScientificOrchestrator,
} from '../lib/integrations/math/imo-orchestrator.js';

const problem = createIMOProblem({
  problem_id: 'imo-smoke-001',
  suite: 'proofbench',
  benchmark_repo: 'google-deepmind/superhuman',
  benchmark_ref: 'main',
  benchmark_path: 'imobench/proofbench_v2.csv',
  statement: 'Prove that a toy invariant is preserved.',
  category: 'Algebra',
  reference_solution: 'Reference proof hidden from solvers.',
  grading_rubric: 'Score 0..7; 7 means complete rigorous proof.',
  smoke: true,
});

assert.equal(problem.schema, 'reversa.imo.problem/v1');
assert.equal(problem.evidence_authority, false);

const seen = [];

async function invoke(model, request) {
  seen.push({ model: { ...model }, request: structuredClone(request) });
  const role = request.role;

  if (role === 'proposer') {
    return {
      text: model.model_id === 'solver-a'
        ? 'Candidate A: incomplete proof.'
        : 'Candidate B: complete proof with invariant and edge case.',
      latency_ms: 10,
      cost: 0,
      tool_calls: 0,
    };
  }

  if (role === 'critic') {
    return {
      text: request.candidate.text.includes('incomplete')
        ? 'Missing the edge case; attack the boundary explicitly.'
        : 'No fatal gap found; verify the boundary calculation.',
      latency_ms: 5,
      cost: 0,
      tool_calls: 0,
    };
  }

  if (role === 'verifier') {
    return {
      text: request.candidate.text.includes('incomplete')
        ? 'Refutation succeeded: boundary case is unsupported.'
        : 'Independent check did not find a contradiction.',
      verdict: request.candidate.text.includes('incomplete') ? 'gap' : 'plausible',
      latency_ms: 5,
      cost: 0,
      tool_calls: 0,
    };
  }

  if (role === 'reviser') {
    const improved = request.candidate.text.includes('incomplete');
    return {
      text: improved
        ? 'Revised A: now includes invariant proof and boundary case.'
        : `${request.candidate.text} Revision: boundary calculation made explicit.`,
      latency_ms: 7,
      cost: 0,
      tool_calls: 0,
    };
  }

  if (role === 'judge') {
    assert.ok(request.reference, 'judge must receive reference');
    assert.ok(!('model_id' in request.candidate), 'candidate identity must be blinded');
    const score = request.candidate.text.startsWith('Revised A') ? 6
      : request.candidate.text.includes('Candidate B') ? 7
        : 5;
    return {
      score,
      correct: score === 7,
      rationale: `blind score ${score}`,
      confidence: 0.8,
      latency_ms: 3,
      cost: 0,
      tool_calls: 0,
    };
  }

  throw new Error(`unexpected role: ${role}`);
}

const models = [
  { model_id: 'solver-a', provider: 'mock', version: '1', execution: 'mock' },
  { model_id: 'solver-b', provider: 'mock', version: '1', execution: 'mock' },
  { model_id: 'critic-a', provider: 'mock', version: '1', execution: 'mock' },
  { model_id: 'critic-b', provider: 'mock', version: '1', execution: 'mock' },
  { model_id: 'judge-a', provider: 'mock', version: '1', execution: 'mock' },
  { model_id: 'judge-b', provider: 'mock', version: '1', execution: 'mock' },
];

const orchestrator = createIMOScientificOrchestrator({
  invoke,
  proposerModels: models.slice(0, 2),
  criticModels: models.slice(2, 4),
  verifierModels: models.slice(2, 4),
  reviserModels: models.slice(0, 2),
  judgeModels: models.slice(4, 6),
});

const run = await orchestrator.run(problem, { seed: 42 });
assert.equal(run.schema, 'reversa.imo.run/v1');
assert.equal(run.run_class, 'smoke');
assert.equal(run.scientific_result, false);
assert.equal(run.evidence_authority, false);
assert.equal(run.proposals.length, 2);
assert.equal(run.revisions.length, 2);
assert.equal(run.final_candidate.score_mean, 7);
assert.equal(run.metrics.best_initial_score, 7);
assert.equal(run.metrics.best_revised_score, 7);
assert.equal(run.metrics.orchestration_gain, 0);
assert.equal(run.metrics.correction_rate, 0.5);
assert.equal(run.metrics.degradation_rate, 0);
assert.equal(run.metrics.solver_model_count, 2);
assert.equal(run.metrics.judge_model_count, 2);
assert.ok(run.metrics.judge_disagreement >= 0);

const nonJudgeRequests = seen.filter((x) => x.request.role !== 'judge');
for (const { request } of nonJudgeRequests) {
  const serialized = JSON.stringify(request);
  assert.ok(!serialized.includes('Reference proof hidden from solvers.'), 'reference solution leaked to non-judge role');
  assert.ok(!serialized.includes('Score 0..7'), 'rubric leaked to non-judge role');
}

const proposerRequests = seen.filter((x) => x.request.role === 'proposer');
assert.equal(proposerRequests.length, 2);
for (const { request } of proposerRequests) {
  assert.equal(request.peer_candidates, undefined, 'proposer must not see peer candidates');
}

const criticRequests = seen.filter((x) => x.request.role === 'critic');
assert.ok(criticRequests.every(({ model, request }) => model.model_id !== request.candidate.author_model_id));

const judgeRequests = seen.filter((x) => x.request.role === 'judge');
assert.equal(judgeRequests.length, 8, 'four blinded candidate versions x two judges expected');
assert.ok(judgeRequests.every(({ request }) => request.candidate.author_model_id === undefined));
assert.ok(judgeRequests.every(({ request }) => request.reference.reference_solution));

assert.throws(() => createIMOProblem({
  problem_id: 'bad', suite: 'proofbench', benchmark_repo: 'x', benchmark_ref: 'main', benchmark_path: 'x', statement: 'x', smoke: false,
}), /reference_solution|grading_rubric/i);

const realInvoke = async (model, request) => {
  if (request.role === 'judge') {
    return { score: 7, correct: true, rationale: 'ok', confidence: 0.9, latency_ms: 1, cost: 0, tool_calls: 0 };
  }
  return { text: `${request.role}:${model.model_id}`, verdict: 'plausible', latency_ms: 1, cost: 0, tool_calls: 0 };
};

const realProblem = createIMOProblem({
  problem_id: 'real-001',
  suite: 'proofbench',
  benchmark_repo: 'google-deepmind/superhuman',
  benchmark_ref: 'main',
  benchmark_path: 'imobench/proofbench_v2.csv',
  benchmark_commit: '0123456789abcdef0123456789abcdef01234567',
  statement: 'Prove X.',
  category: 'Number Theory',
  reference_solution: 'Hidden proof.',
  grading_rubric: '0..7',
  smoke: false,
});

const realModels = {
  p1: { model_id: 'model-p1', provider: 'provider-a', version: 'v1', execution: 'real' },
  p2: { model_id: 'model-p2', provider: 'provider-b', version: 'v2', execution: 'real' },
  c1: { model_id: 'model-c1', provider: 'provider-c', version: 'v1', execution: 'real' },
  c2: { model_id: 'model-c2', provider: 'provider-d', version: 'v1', execution: 'real' },
  j1: { model_id: 'model-j1', provider: 'provider-e', version: 'v1', execution: 'real' },
  j2: { model_id: 'model-j2', provider: 'provider-f', version: 'v1', execution: 'real' },
};

const realOrchestrator = createIMOScientificOrchestrator({
  invoke: realInvoke,
  proposerModels: [realModels.p1, realModels.p2],
  criticModels: [realModels.c1, realModels.c2],
  verifierModels: [realModels.c1, realModels.c2],
  reviserModels: [realModels.p1, realModels.p2],
  judgeModels: [realModels.j1, realModels.j2],
});
const realRun = await realOrchestrator.run(realProblem, { seed: 1 });
assert.equal(realRun.run_class, 'multi-model-confirmatory');
assert.equal(realRun.scientific_result, true);

const oneModel = { model_id: 'only-one', provider: 'provider', version: 'v1', execution: 'real' };
const oneJudge = { model_id: 'judge-only', provider: 'provider-j', version: 'v1', execution: 'real' };
const pilot = createIMOScientificOrchestrator({
  invoke: realInvoke,
  proposerModels: [oneModel],
  criticModels: [oneModel],
  verifierModels: [oneModel],
  reviserModels: [oneModel],
  judgeModels: [oneJudge],
});
const pilotRun = await pilot.run(realProblem, { seed: 2 });
assert.equal(pilotRun.run_class, 'pilot');
assert.equal(pilotRun.scientific_result, false);

console.log('✓ IMO Scientific Orchestration v1: leakage, diversidade, julgamento cego e gates científicos OK');
