import { validateAdaptiveAction } from './acme-bridge.js';

export function requestPolicyActivation(proposal, {
  requestedBy,
  reason,
  timestamp = new Date().toISOString(),
} = {}) {
  if (!proposal || typeof proposal !== 'object' || typeof proposal.action_id !== 'string') {
    throw new TypeError('proposal.action_id é obrigatório');
  }
  if (proposal.mode !== 'shadow') {
    throw new TypeError('somente proposal em shadow pode solicitar ativação');
  }
  if (typeof requestedBy !== 'string' || !requestedBy.trim()) {
    throw new TypeError('requestedBy é obrigatório');
  }
  if (typeof reason !== 'string' || !reason.trim()) {
    throw new TypeError('reason é obrigatório');
  }
  if (Number.isNaN(Date.parse(timestamp))) {
    throw new TypeError('timestamp de ativação inválido');
  }

  return Object.freeze({
    ...proposal,
    mode: 'active',
    evidence_authority: false,
    activation_request: Object.freeze({
      requested_by: requestedBy,
      reason,
      timestamp,
    }),
  });
}

export function governAdaptiveProposal({
  proposal,
  drift = { detected: false, status: 'unknown' },
  approved = false,
  minHistory = 12,
  minConfidence = 0.60,
  activeMode = false,
} = {}) {
  if (!proposal || typeof proposal !== 'object' || typeof proposal.action_id !== 'string') {
    throw new TypeError('proposal.action_id é obrigatório');
  }

  const action = validateAdaptiveAction(proposal.action_id);
  const reasons = [];
  if (!action.allowed) reasons.push('action-not-allowlisted');
  if (drift.detected) reasons.push('drift-detected');
  if ((proposal.history_count ?? 0) < minHistory) reasons.push('insufficient-history');
  if ((proposal.confidence ?? 0) < minConfidence) reasons.push('low-policy-confidence');
  if (action.requires_approval && !approved) reasons.push('approval-required');
  if (!activeMode || proposal.mode !== 'active' || !proposal.activation_request) reasons.push('shadow-mode');

  const executable = reasons.length === 0;
  return Object.freeze({
    executable,
    action_id: proposal.action_id,
    evidence_authority: false,
    requires_approval: action.requires_approval,
    drift_status: drift.status ?? 'unknown',
    policy: proposal.policy ?? 'unknown',
    activation_request: proposal.activation_request ?? null,
    reasons: Object.freeze(reasons),
  });
}

export function shouldForceAbstention({ governance, mciEnvelope } = {}) {
  if (governance?.reasons?.includes('drift-detected')) return true;
  if (governance?.reasons?.includes('action-not-allowlisted')) return true;
  return Boolean(mciEnvelope?.metacognition?.should_abstain);
}
