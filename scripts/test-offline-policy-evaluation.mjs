import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  buildAcmeExperience,
  buildAdaptiveGovernanceReport,
  createAdaptiveRuntime,
  createDecisionRecord,
  createLearningEvent,
  evaluateOfflinePolicy,
  evaluatePromotionReadiness,
  writeAdaptiveGovernanceReport,
} from '../lib/integrations/adaptive/index.js';

const BASE_TIME = Date.parse('2026-09-13T12:00:00.000Z');

function eventFor(index, actionId, success) {
  return createLearningEvent({
    taskId: `OFF-${String(index).padStart(3, '0')}`,
    stage: 'audit',
    epistemic: {
      state: success ? 'OBSERVED' : 'INFERRED',
      feynmanScore: success ? 11 : 6,
      highFindings: success ? 0 : 2,
      criticalFindings: success ? 0 : 1,
      blockedCount: 0,
    },
    confidence: {
      calibrated: success ? 0.88 : 0.35,
      trust: success ? 0.85 : 0.45,
    },
    action: { id: actionId },
    outcome: {
      specAccepted: success,
      testsPassing: success,
      observedEvidenceDelta: success ? 0.40 : -0.20,
      uncertaintyReduction: success ? 0.30 : -0.15,
      regressionCount: success ? 0 : 2,
      retries: success ? 0 : 3,
      calibratedConfidence: success ? 0.88 : 0.35,
      actualSuccess: success,
    },
    metadata: { eventId: `offline-event-${index}` },
    timestamp: new Date(BASE_TIME + (index * 1000)).toISOString(),
  });
}

function decisionRecord(index, actionId, success, shadowAction = 'route:reviewer') {
  const event = eventFor(index, actionId, success);
  const experience = buildAcmeExperience(event);
  return createDecisionRecord({
    event,
    experience,
    baselineAction: actionId,
    decidedAt: new Date(BASE_TIME + (index * 1000) - 100).toISOString(),
    proposal: {
      policy: 'contextual-shadow-v1',
      mode: 'shadow',
      action_id: shadowAction,
      confidence: 0.85,
      history_count: index,
      evidence_authority: false,
    },
  });
}

// 60 registros em ordem temporal. Reviewer tem outcome melhor que Clarify;
// a shadow policy recomenda reviewer sem alterar a ação realmente executada.
const records = [];
for (let index = 0; index < 60; index += 1) {
  const reviewer = index % 2 === 0;
  records.push(decisionRecord(
    index,
    reviewer ? 'route:reviewer' : 'route:clarify',
    reviewer,
  ));
}

const evaluation = evaluateOfflinePolicy(records, {
  trainFraction: 0.50,
  minActionSupport: 5,
  calibrationBins: 5,
});
assert.equal(evaluation.schema, 'reversa.offline.evaluation/v1');
assert.equal(evaluation.status, 'evaluated');
assert.equal(evaluation.train_records, 30);
assert.equal(evaluation.holdout_records, 30);
assert.equal(evaluation.shadow.matched_n, 15);
assert.equal(evaluation.shadow.coverage, 0.5);
assert.ok(evaluation.calibration.brier < 0.05);
assert.ok(evaluation.calibration.ece <= 0.20);
assert.ok(evaluation.estimate.estimated_reward_delta > 0);
assert.ok(evaluation.estimate.estimated_reward_delta_ci95.low >= 0);
assert.equal(evaluation.estimate.estimated_shadow_regret, 0);
assert.ok(evaluation.estimate.estimated_baseline_regret > 0);

const readiness = evaluatePromotionReadiness(evaluation, {
  drift: { detected: false, status: 'stable' },
  ledger: { valid: true },
});
assert.equal(readiness.eligible_for_activation_request, true);
assert.equal(readiness.auto_activate, false);
assert.equal(readiness.epistemic_authority, false);

const blockedByDrift = evaluatePromotionReadiness(evaluation, {
  drift: { detected: true, status: 'drift' },
  ledger: { valid: true },
});
assert.equal(blockedByDrift.eligible_for_activation_request, false);
assert.ok(blockedByDrift.reasons.includes('drift-detected'));

const report = buildAdaptiveGovernanceReport({
  evaluation,
  readiness,
  drift: { detected: false, status: 'stable' },
  ledger: { valid: true },
  metadata: {
    generatedAt: '2026-09-13T12:30:00.000Z',
    project: 'ReversaFeynman test',
  },
});
assert.equal(report.schema, 'reversa.adaptive.report/v1');
assert.match(report.markdown, /Adaptive Governance Report/);
assert.match(report.markdown, /Brier/);
assert.match(report.markdown, /IC95%/);
assert.match(report.markdown, /Auto-ativação \| não/);

const tempRoot = await mkdtemp(join(tmpdir(), 'reversa-feynman-v3-'));
try {
  const writeResult = await writeAdaptiveGovernanceReport(report, { rootDir: tempRoot });
  const persisted = await readFile(writeResult.path, 'utf8');
  assert.match(persisted, /avaliação offline observacional/);
  await assert.rejects(
    () => writeAdaptiveGovernanceReport(report, { rootDir: tempRoot, relativePath: '../escape.md' }),
    /não pode escapar/,
  );
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}

// Runtime v3: decide() usa apenas histórico anterior; observe() incorpora outcome depois.
const runtime = createAdaptiveRuntime({
  candidateActions: ['route:reviewer', 'route:clarify'],
  maxHistory: 100,
});
const firstEvent = eventFor(100, 'route:reviewer', true);
const firstDecision = runtime.decide(firstEvent);
assert.equal(firstDecision.history_count_before_decision, 0);
assert.equal(runtime.history().length, 0);
const firstObserved = await runtime.observe(firstEvent, { decision: firstDecision });
assert.equal(firstObserved.duplicate, false);
assert.equal(runtime.history().length, 1);
assert.equal(runtime.decisionHistory().length, 1);

const secondEvent = eventFor(101, 'route:clarify', false);
const secondDecision = runtime.decide(secondEvent);
assert.equal(secondDecision.history_count_before_decision, 1);
assert.equal(runtime.history().length, 1);
await runtime.observe(secondEvent, { decision: secondDecision });
assert.equal(runtime.history().length, 2);

// ingest() permanece retrocompatível, mas internamente respeita decide → observe.
const thirdEvent = eventFor(102, 'route:reviewer', true);
const thirdResult = await runtime.ingest(thirdEvent);
assert.equal(thirdResult.duplicate, false);
assert.equal(thirdResult.decision.history_count_before_decision, 2);
assert.equal(runtime.history().length, 3);

console.log('✓ Offline Policy Evaluation v3: holdout, calibration, regret, report e decide/observe OK');
