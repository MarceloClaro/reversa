import fs from 'node:fs';
import path from 'node:path';

import {
  createIMOProblem,
  createIMOScientificOrchestrator,
  createIMOReport,
  createIMOProviderRouter,
} from '../lib/integrations/math/index.js';

const outPath = process.argv[2] ?? '.reversa-bench/imo-smoke-report.json';

function model(model_id, provider, role) {
  return { model_id, provider, version: 'smoke-v1', execution: 'mock', role };
}

const solverA = model('smoke-solver-a', 'mock-a', 'solver');
const solverB = model('smoke-solver-b', 'mock-b', 'solver');
const criticA = model('smoke-critic-a', 'mock-a', 'critic');
const criticB = model('smoke-critic-b', 'mock-b', 'critic');
const judgeA = model('smoke-judge-a', 'mock-a', 'judge');
const judgeB = model('smoke-judge-b', 'mock-b', 'judge');

function mockHandler(modelSpec, request) {
  if (request.role === 'proposer') {
    return {
      text: modelSpec.model_id.endsWith('a')
        ? 'Hypothesis A. The invariant appears preserved, but one boundary case is omitted.'
        : 'Hypothesis B. Establish the invariant, test the boundary case, then derive the conclusion.',
      latency_ms: 1,
      cost: 0,
      tool_calls: 0,
    };
  }
  if (request.role === 'critic') {
    return {
      text: request.candidate.text.includes('omitted')
        ? 'Counterexample search identifies the missing boundary case.'
        : 'No direct contradiction found; demand an explicit boundary check.',
      latency_ms: 1,
      cost: 0,
      tool_calls: 0,
    };
  }
  if (request.role === 'verifier') {
    const gap = request.candidate.text.includes('omitted');
    return {
      text: gap ? 'Verification finds a gap.' : 'Verification supports the derivation under stated assumptions.',
      verdict: gap ? 'gap' : 'plausible',
      latency_ms: 1,
      cost: 0,
      tool_calls: 0,
    };
  }
  if (request.role === 'reviser') {
    return {
      text: `${request.candidate.text} Revision: boundary case is checked explicitly and the remaining steps are stated.`,
      latency_ms: 1,
      cost: 0,
      tool_calls: 0,
    };
  }
  if (request.role === 'judge') {
    const complete = request.candidate.text.includes('Revision') || request.candidate.text.includes('Hypothesis B');
    return {
      score: complete ? 7 : 4,
      correct: complete,
      rationale: complete ? 'Smoke rubric: structurally complete.' : 'Smoke rubric: missing boundary justification.',
      confidence: 0.8,
      latency_ms: 1,
      cost: 0,
      tool_calls: 0,
    };
  }
  throw new Error(`unsupported role ${request.role}`);
}

const router = createIMOProviderRouter({
  providers: {
    'mock-a': mockHandler,
    'mock-b': mockHandler,
  },
});

const problem = createIMOProblem({
  problem_id: 'imo-orchestration-smoke-001',
  suite: 'proofbench',
  benchmark_repo: 'google-deepmind/superhuman',
  benchmark_ref: '80b2527a0b4e4bfc6a8b28825fadbdcfdd6048a1',
  benchmark_path: 'imobench/proofbench_v2.csv',
  benchmark_commit: '80b2527a0b4e4bfc6a8b28825fadbdcfdd6048a1',
  statement: 'Synthetic smoke problem: prove that a stated toy invariant is preserved.',
  category: 'Smoke',
  reference_solution: 'Synthetic smoke reference. This is not an IMO-Bench task.',
  grading_rubric: 'Synthetic smoke rubric on the 0..7 interface.',
  smoke: true,
  metadata: { scientific_task: false, synthetic: true },
});

const orchestrator = createIMOScientificOrchestrator({
  invoke: router.invoke,
  proposerModels: [solverA, solverB],
  criticModels: [criticA, criticB],
  verifierModels: [criticA, criticB],
  reviserModels: [solverA, solverB],
  judgeModels: [judgeA, judgeB],
});

const run = await orchestrator.run(problem, { seed: 20260913 });
const report = createIMOReport([run]);
const payload = {
  schema: 'reversa.imo.smoke-artifact/v1',
  scientific_result: false,
  warning: 'Synthetic orchestration smoke only. Do not report as IMO-Bench performance.',
  source_pin: 'benchmarks/imo-superhuman/source.json',
  run,
  report,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`IMO smoke written to ${outPath}`);
console.log(`run_class=${run.run_class} scientific_result=${run.scientific_result}`);
