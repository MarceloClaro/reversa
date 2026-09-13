export { createStrictContractRegistry, validateStrictContract, createAjvStrictAdapter } from './strict-contracts.js';
export { createCodeIntelligence } from './code-intelligence.js';
export { createExecutionFabric } from './execution-fabric.js';
export { createRepairLaboratory } from './repair-laboratory.js';
export { createQualityGateRunner } from './quality-gates.js';
export { createTraceCollector } from './observability.js';
export { createReversaBench } from './benchmark.js';
export {
  createBenchmarkTask,
  createBenchmarkRun,
  createReversaBenchExperimentalHarness,
  REVERSABENCH_DEFAULT_VARIANTS,
} from './experimental-harness.js';
export { createMcpGateway } from './mcp-gateway.js';
export { createDurableWorkflow } from './durable-workflow.js';
export { createOfflineOptimizer } from './offline-optimizer.js';

export const SOFTWARE_ENGINEERING_INTELLIGENCE_VERSION = 'v5';
export const SOFTWARE_ENGINEERING_INTELLIGENCE_SEQUENCE = Object.freeze([
  'v5.1 strict-contracts',
  'v5.2 code-intelligence',
  'v5.3 execution-fabric',
  'v5.4 repair-laboratory',
  'v5.5 quality-gates',
  'v5.6 observability',
  'v5.7 reversa-bench',
  'v5.7.1 reversa-bench-experimental-harness',
  'v5.8 mcp-gateway',
  'v5.9 durable-workflow',
  'v5.10 offline-optimizer',
]);
