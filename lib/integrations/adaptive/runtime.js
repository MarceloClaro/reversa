import { DEFAULT_ADAPTIVE_ACTIONS } from './constants.js';
import { buildAcmeObservation, createAcmeBridge, validateAdaptiveAction } from './acme-bridge.js';
import { createAuditLedger } from './ledger.js';
import { detectAdaptiveDrift } from './drift.js';
import {
  createDecisionRecord,
  evaluateOfflinePolicy,
  evaluatePromotionReadiness,
} from './evaluation.js';
import { governAdaptiveProposal, requestPolicyActivation } from './governance.js';
import { createMciBridge } from './mci-bridge.js';
import { proposeShadowAction } from './policy.js';
import { buildAdaptiveGovernanceReport } from './report.js';

export function createAdaptiveRuntime({
  candidateActions = DEFAULT_ADAPTIVE_ACTIONS,
  maxHistory = 500,
  exploration = 0.15,
  driftOptions = {},
  mciTransport,
  acmeTransport,
  abstainBelow = 0.20,
} = {}) {
  if (!Number.isInteger(maxHistory) || maxHistory < 1) {
    throw new TypeError('maxHistory deve ser inteiro positivo');
  }
  if (!Array.isArray(candidateActions) || candidateActions.length === 0) {
    throw new TypeError('candidateActions deve conter ações');
  }

  const safeCandidateActions = [...new Set(candidateActions)];
  const invalidActions = safeCandidateActions.filter((actionId) => !validateAdaptiveAction(actionId).allowed);
  if (invalidActions.length) {
    throw new TypeError(`candidateActions fora da allowlist: ${invalidActions.join(', ')}`);
  }

  const ledger = createAuditLedger();
  const experiences = [];
  const decisionRecords = [];
  const pendingDecisions = new Map();
  const mciBridge = createMciBridge({ transport: mciTransport, abstainBelow });
  const acmeBridge = createAcmeBridge({ transport: acmeTransport });

  function trimHistory() {
    if (experiences.length > maxHistory) experiences.splice(0, experiences.length - maxHistory);
    if (decisionRecords.length > maxHistory) decisionRecords.splice(0, decisionRecords.length - maxHistory);
  }

  function decide(event) {
    const existing = pendingDecisions.get(event?.event_id);
    if (existing) return existing;

    // buildAcmeObservation valida o Learning Event, mas não usa outcome. A proposal
    // é calculada exclusivamente com experiências anteriores ao evento atual.
    const observation = buildAcmeObservation(event);
    const drift = detectAdaptiveDrift(experiences, driftOptions);
    const proposal = proposeShadowAction({
      observation,
      experiences,
      candidateActions: safeCandidateActions,
      exploration,
    });
    const governance = governAdaptiveProposal({ proposal, drift });

    const decision = Object.freeze({
      event_id: event.event_id,
      task_id: event.task_id,
      stage: event.stage,
      decided_at: new Date().toISOString(),
      baseline_action: event.action.id,
      history_count_before_decision: experiences.length,
      observation,
      drift,
      proposal,
      governance,
      evidence_authority: false,
    });
    pendingDecisions.set(event.event_id, decision);
    return decision;
  }

  async function observe(event, { decision, dispatch = false } = {}) {
    const resolvedDecision = decision ?? pendingDecisions.get(event?.event_id) ?? decide(event);
    if (resolvedDecision.event_id !== event.event_id) {
      throw new TypeError('decision.event_id deve corresponder ao event.event_id');
    }

    const appended = ledger.append(event);
    if (!appended.appended) {
      pendingDecisions.delete(event.event_id);
      return Object.freeze({
        duplicate: true,
        event_id: event.event_id,
        ledger: ledger.verify(),
      });
    }

    const mciEnvelope = mciBridge.build(event);
    const experience = acmeBridge.buildExperience(event);
    const decisionRecord = createDecisionRecord({
      event,
      proposal: resolvedDecision.proposal,
      experience,
      baselineAction: resolvedDecision.baseline_action,
      decidedAt: resolvedDecision.decided_at,
    });

    experiences.push(experience);
    decisionRecords.push(decisionRecord);
    trimHistory();
    pendingDecisions.delete(event.event_id);

    const driftAfterObservation = detectAdaptiveDrift(experiences, driftOptions);

    let dispatchResult = Object.freeze({ requested: false });
    if (dispatch) {
      const [mci, acme] = await Promise.all([
        mciBridge.dispatch(event),
        acmeBridge.submit(event),
      ]);
      dispatchResult = Object.freeze({ requested: true, mci, acme });
    }

    return Object.freeze({
      duplicate: false,
      event_id: event.event_id,
      ledger: ledger.verify(),
      decision: resolvedDecision,
      decision_record: decisionRecord,
      mci_envelope: mciEnvelope,
      acme_experience: experience,
      drift: driftAfterObservation,
      proposal: resolvedDecision.proposal,
      governance: resolvedDecision.governance,
      dispatch: dispatchResult,
    });
  }

  async function ingest(event, options = {}) {
    const decision = decide(event);
    return observe(event, { ...options, decision });
  }

  function requestActivation(proposal, request) {
    return requestPolicyActivation(proposal, request);
  }

  function evaluateActivation({ proposal, drift, approved = false, activeMode = false, minHistory, minConfidence } = {}) {
    return governAdaptiveProposal({
      proposal,
      drift,
      approved,
      activeMode,
      minHistory,
      minConfidence,
    });
  }

  function offlineEvaluation(options = {}) {
    return evaluateOfflinePolicy(decisionRecords, options);
  }

  function promotionReadiness({ evaluation, thresholds } = {}) {
    const resolvedEvaluation = evaluation ?? offlineEvaluation();
    return evaluatePromotionReadiness(resolvedEvaluation, {
      drift: detectAdaptiveDrift(experiences, driftOptions),
      ledger: ledger.verify(),
      thresholds,
    });
  }

  function governanceReport({ evaluation, readiness, metadata } = {}) {
    const resolvedEvaluation = evaluation ?? offlineEvaluation();
    const resolvedReadiness = readiness ?? promotionReadiness({ evaluation: resolvedEvaluation });
    return buildAdaptiveGovernanceReport({
      evaluation: resolvedEvaluation,
      readiness: resolvedReadiness,
      drift: detectAdaptiveDrift(experiences, driftOptions),
      ledger: ledger.verify(),
      metadata,
    });
  }

  return Object.freeze({
    decide,
    observe,
    ingest,
    requestActivation,
    evaluateActivation,
    offlineEvaluation,
    promotionReadiness,
    governanceReport,
    history() { return Object.freeze([...experiences]); },
    decisionHistory() { return Object.freeze([...decisionRecords]); },
    pendingDecisions() { return Object.freeze([...pendingDecisions.values()]); },
    candidateActions() { return Object.freeze([...safeCandidateActions]); },
    ledgerSnapshot() { return ledger.snapshot(); },
    verifyLedger() { return ledger.verify(); },
  });
}
