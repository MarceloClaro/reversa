import {
  DIRECT_EVIDENCE_KINDS,
  EPISTEMIC_STATES,
} from '../adaptive/constants.js';

export const HERMES_EVIDENCE_GOVERNOR = 'hermes-evidence-governor/v2';

const FORBIDDEN_OBSERVED_SOURCES = Object.freeze([
  'hermes-memory',
  'hermes-confidence',
  'hermes-user-model',
  'hermes-skill-proposal',
  'learned-policy',
  'mci-trust',
  'human',
]);

export function assertHermesEpistemicState(value) {
  if (!EPISTEMIC_STATES.includes(value)) {
    throw new TypeError(`estado epistemológico inválido: ${value}`);
  }
  return value;
}

export function isHermesDirectEvidence(source = {}) {
  return Boolean(
    source
      && source.direct === true
      && DIRECT_EVIDENCE_KINDS.includes(source.kind)
      && typeof source.ref === 'string'
      && source.ref.trim().length > 0,
  );
}

function freezeSource(source = {}) {
  return Object.freeze({ ...source });
}

function decision({
  accepted,
  current,
  proposed,
  effective,
  reason,
  source = {},
  evidenceAuthority = 'none',
}) {
  return Object.freeze({
    governor: HERMES_EVIDENCE_GOVERNOR,
    accepted,
    current,
    proposed,
    effective,
    reason,
    evidence_authority: evidenceAuthority,
    source: freezeSource(source),
  });
}

export function evaluateHermesEvidence({
  current = 'UNVERIFIED',
  proposed,
  source = {},
} = {}) {
  assertHermesEpistemicState(current);
  assertHermesEpistemicState(proposed);

  if (proposed !== 'OBSERVED') {
    return decision({
      accepted: true,
      current,
      proposed,
      effective: proposed,
      reason: 'non-observed transition',
      source,
      evidenceAuthority: 'contextual-non-observed',
    });
  }

  if (FORBIDDEN_OBSERVED_SOURCES.includes(source.kind)) {
    return decision({
      accepted: false,
      current,
      proposed,
      effective: current,
      reason: `${source.kind} não pode produzir OBSERVED`,
      source,
    });
  }

  if (!isHermesDirectEvidence(source)) {
    return decision({
      accepted: false,
      current,
      proposed,
      effective: current,
      reason: 'OBSERVED exige evidência direta com kind e ref rastreáveis',
      source,
    });
  }

  return decision({
    accepted: true,
    current,
    proposed,
    effective: 'OBSERVED',
    reason: 'direct evidence accepted by Hermes Evidence Governor',
    source,
    evidenceAuthority: 'direct-traceable-evidence',
  });
}

export function applyHermesEvidenceProposal(claim, proposal) {
  if (!claim || typeof claim !== 'object') {
    throw new TypeError('claim deve ser um objeto');
  }
  if (!proposal || typeof proposal !== 'object') {
    throw new TypeError('proposal deve ser um objeto');
  }

  const result = evaluateHermesEvidence({
    current: claim.epistemic_state ?? 'UNVERIFIED',
    ...proposal,
  });

  return Object.freeze({
    ...claim,
    epistemic_state: result.effective,
    epistemic_governor: result,
    // Compatibilidade temporária com consumidores anteriores.
    epistemic_guard: result,
  });
}

export function createHermesEvidenceGovernor({ transport } = {}) {
  if (transport !== undefined && typeof transport !== 'function') {
    throw new TypeError('Hermes evidence transport must be a function when provided');
  }

  async function collectEvidence(request = {}) {
    if (!transport) {
      return Object.freeze({
        requested: false,
        reason: 'no-transport-configured',
        governor: HERMES_EVIDENCE_GOVERNOR,
      });
    }

    const candidate = await transport(Object.freeze({ ...request }));
    if (!candidate || typeof candidate !== 'object') {
      return Object.freeze({
        requested: true,
        candidate: null,
        decision: decision({
          accepted: false,
          current: request.current ?? 'UNVERIFIED',
          proposed: request.proposed ?? 'UNVERIFIED',
          effective: request.current ?? 'UNVERIFIED',
          reason: 'invalid Hermes evidence candidate',
          source: {},
        }),
      });
    }

    const current = request.current ?? candidate.current ?? 'UNVERIFIED';
    const proposed = candidate.proposed ?? request.proposed ?? 'UNVERIFIED';
    const source = candidate.source ?? {};
    const evaluated = evaluateHermesEvidence({ current, proposed, source });

    return Object.freeze({
      requested: true,
      candidate: Object.freeze({ ...candidate }),
      decision: evaluated,
    });
  }

  return Object.freeze({
    governor: HERMES_EVIDENCE_GOVERNOR,
    evaluate: evaluateHermesEvidence,
    apply: applyHermesEvidenceProposal,
    collectEvidence,
  });
}

// Aliases de migração para consumidores legados. Novos consumidores devem usar
// explicitamente as funções Hermes acima.
export const evaluateEvidenceProposal = evaluateHermesEvidence;
export const applyEvidenceProposal = applyHermesEvidenceProposal;
