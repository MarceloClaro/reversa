import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  createIMOProblem,
  createIMOScientificOrchestrator,
  createIMOReport,
} from '../lib/integrations/math/index.js';

const [problemPath, adapterPath, outputPath = '.reversa-bench/imo-run.json'] = process.argv.slice(2);
if (!problemPath || !adapterPath) {
  console.error('usage: node scripts/run-imo-superhuman.mjs <problem.json> <adapter.mjs> [output.json]');
  process.exit(2);
}

const rawProblem = JSON.parse(fs.readFileSync(problemPath, 'utf8'));
const adapterModule = await import(pathToFileURL(path.resolve(adapterPath)).href);

const required = ['invoke', 'proposerModels', 'criticModels', 'verifierModels', 'reviserModels', 'judgeModels'];
for (const key of required) {
  if (!(key in adapterModule)) throw new Error(`adapter module must export ${key}`);
}

const problem = createIMOProblem(rawProblem);
const orchestrator = createIMOScientificOrchestrator({
  invoke: adapterModule.invoke,
  proposerModels: adapterModule.proposerModels,
  criticModels: adapterModule.criticModels,
  verifierModels: adapterModule.verifierModels,
  reviserModels: adapterModule.reviserModels,
  judgeModels: adapterModule.judgeModels,
});

const seed = Number.isInteger(adapterModule.seed) ? adapterModule.seed : 20260913;
const run = await orchestrator.run(problem, { seed });
const report = createIMOReport([run]);
const artifact = {
  schema: 'reversa.imo.experiment-artifact/v1',
  generated_at: new Date().toISOString(),
  problem_source: problemPath,
  adapter_source: adapterPath,
  run,
  report,
  evidence_authority: false,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
console.log(`IMO orchestration artifact written to ${outputPath}`);
console.log(`run_class=${run.run_class}`);
console.log(`scientific_result=${run.scientific_result}`);
console.log(`final_score=${run.final_candidate.score_mean}`);
console.log(`orchestration_gain=${run.metrics.orchestration_gain}`);
