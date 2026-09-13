import {
  DIRECT_EVIDENCE_KINDS,
  EPISTEMIC_STATES,
} from './constants.js';

export function assertEpistemicState(value) {
  if (!EPISTEMIC_STATES.includes(value)) {
    throw new TypeError(`estado epistemológico inválido: ${value}`);
  }
  return value;
}

export function isDirectEvidence(source = {}) {
  return Boolean(
    source
      && source.direct === true
      && DIRECT_EVIDENCE_KINDS.includes(source.kind)
      && typeof source.ref === 'string'
      && source.ref.trim().length > 0,
  );
}

export function evaluateEvidenceProposal({
  current = 'UNVERIFIED',
  proposed,
  source = {},
} = {}) {
  assertEpistemicState(current);
  assertEpistemicState(proposed);

  if (proposed !== 'OBSERVED') {
    return Object.freeze({
      accepted: true,
      current,
      proposed,
      effective: proposed,
      reason: 'non-observed transition',
    });
  }

  if (source.kind === 'learned-policy' || source.kind === 'mci-trust' || source.kind === 'human') {
    return Object.freeze({
      accepted: false,
      current,
      proposed,
      effective: current,
      reason: `${source.kind} não pode produzir OBSERVED`,
    });
  }

  if (!isDirectEvidence(source)) {
    return Object.freeze({
      accepted: false,
      current,
      proposed,
      effective: current,
      reason: 'OBSERVED exige evidência direta com kind e ref rastreáveis',
    });
  }

  return Object.freeze({
    accepted: true,
    current,
    proposed,
    effective: 'OBSERVED',
    reason: 'direct evidence accepted',
  });
}

export function applyEvidenceProposal(claim, proposal) {
  if (!claim || typeof claim !== 'object') {
    throw new TypeError('claim deve ser um objeto');
  }

  const decision = evaluateEvidenceProposal({
    current: claim.epistemic_state ?? 'UNVERIFIED',
    ...proposal,
  });

  return Object.freeze({
    ...claim,
    epistemic_state: decision.effective,
    epistemic_guard: decision,
  });
}
