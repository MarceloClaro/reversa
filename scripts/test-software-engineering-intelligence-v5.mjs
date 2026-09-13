import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  createStrictContractRegistry,
  createCodeIntelligence,
  createExecutionFabric,
  createRepairLaboratory,
  createQualityGateRunner,
  createTraceCollector,
  createReversaBench,
  createMcpGateway,
  createDurableWorkflow,
  createOfflineOptimizer,
} from '../lib/integrations/software-engineering/index.js';

const contracts = createStrictContractRegistry();
assert.equal(contracts.validate('reversa.benchmark.result/v1', {
  schema: 'reversa.benchmark.result/v1',
  variant: 'baseline',
  total: 1,
  succeeded: 1,
  success_rate: '1',
  mean_latency_ms: 10,
  mean_cost: 0,
  regressions: 0,
  evidence_authority: false,
}).valid, false, 'strict validator must reject numeric strings');

const ci = createCodeIntelligence();
const graph = ci.normalizeGraph({
  symbols: [
    { id: 'a', file: 'a.js', name: 'a', kind: 'function' },
    { id: 'b', file: 'b.js', name: 'b', kind: 'function' },
  ],
  edges: [{ from: 'a', to: 'b', kind: 'calls' }],
});
assert.equal(graph.schema, 'reversa.code-intelligence.graph/v1');
assert.equal(graph.evidence_authority, false);
assert.deepEqual(graph.ranking.map((x) => x.id), ['b', 'a']);

const fabric = createExecutionFabric({
  providers: {
    fake: async (request) => ({ exit_code: 0, stdout: `ran:${request.command}`, stderr: '', artifacts: [] }),
  },
});
assert.rejects(() => fabric.execute({ provider: 'unknown', command: 'x' }), /provider/i);
const execResult = await fabric.execute({ provider: 'fake', command: 'npm test', task_id: 't1' });
assert.equal(execResult.schema, 'reversa.execution.result/v2');
assert.equal(execResult.status, 'succeeded');
assert.equal(execResult.evidence_authority, false);

const lab = createRepairLaboratory();
assert.throws(() => lab.createCandidate({ patch: 'x' }), /localization/i);
const c1 = lab.createCandidate({
  localization: { file: 'a.js', symbol: 'a', region: '1:2' },
  patch: 'patch-a',
  validations: { tests: 1, static: 1, mutation: 0.6, regression: 0 },
});
const c2 = lab.createCandidate({
  localization: { file: 'a.js', symbol: 'a', region: '1:2' },
  patch: 'patch-b',
  validations: { tests: 1, static: 1, mutation: 0.9, regression: 0 },
});
assert.equal(lab.rankCandidates([c1, c2])[0].patch, 'patch-b');

const quality = createQualityGateRunner();
const report = quality.evaluate({
  tests: { passed: 10, failed: 0 },
  static_analysis: { critical: 0, high: 0 },
  mutation: { killed: 9, survived: 1 },
});
assert.equal(report.schema, 'reversa.quality.report/v1');
assert.equal(report.evidence_authority, false);
assert.ok(report.mutation_score > 0.8);

const traces = createTraceCollector();
const input = Object.freeze({ task_id: 't1' });
const span = traces.startSpan('repair', input);
traces.endSpan(span.span_id, { ok: true });
assert.deepEqual(input, { task_id: 't1' });
assert.equal(traces.exportTrace().schema, 'reversa.trace/v1');

const bench = createReversaBench();
bench.record({ variant: 'baseline', success: true, latency_ms: 100, cost: 1, regressions: 0 });
bench.record({ variant: 'feynman-v5', success: true, latency_ms: 80, cost: 0.8, regressions: 0 });
bench.record({ variant: 'feynman-v5', success: false, latency_ms: 120, cost: 0.9, regressions: 1 });
const comparison = bench.compare();
assert.equal(comparison.results.length, 2);
assert.ok(comparison.results.every((x) => x.evidence_authority === false));

const gateway = createMcpGateway({
  handlers: {
    'reversa.inspect_repo': async ({ root }) => ({ root }),
  },
});
assert.deepEqual(gateway.listTools().map((x) => x.name), ['reversa.inspect_repo']);
assert.deepEqual(await gateway.callTool('reversa.inspect_repo', { root: '.' }), { root: '.' });
await assert.rejects(() => gateway.callTool('reversa.exec_anything', {}), /allowlisted|registered/i);

const checkpoints = new Map();
const durable = createDurableWorkflow({
  load: async (id) => checkpoints.get(id) ?? null,
  save: async (id, state) => checkpoints.set(id, structuredClone(state)),
});
let executions = 0;
const workflow = [
  { id: 'one', run: async () => { executions += 1; return 1; } },
  { id: 'two', run: async () => { executions += 1; return 2; } },
];
await durable.run('wf-1', workflow);
await durable.run('wf-1', workflow);
assert.equal(executions, 2, 'completed durable steps must not execute twice');

const optimizer = createOfflineOptimizer();
const proposal = optimizer.propose({ target: 'reversa-clarify', candidate: 'new instruction', score: 0.91 });
assert.equal(proposal.schema, 'reversa.optimizer.proposal/v1');
assert.equal(proposal.mode, 'shadow');
assert.equal(proposal.auto_apply, false);
assert.equal(proposal.evidence_authority, false);

const packageJson = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
const forbidden = ['openhands', 'swe-rex', 'swe-agent', 'semgrep', 'stryker', 'phoenix', 'langgraph', 'dspy', 'pydantic-ai'];
for (const name of forbidden) {
  assert.equal(Boolean(packageJson.dependencies?.[name]), false, `${name} must remain optional`);
}

console.log('✓ Software Engineering Intelligence v5: contratos, adapters e invariantes OK');
