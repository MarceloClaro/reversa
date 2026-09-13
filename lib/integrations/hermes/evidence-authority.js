import {
  DIRECT_EVIDENCE_KINDS,
  EPISTEMIC_STATES,
} from '../adaptive/constants.js';
import { classifyHermesMemory } from './memory-firewall.js';
import { validateHermesMemoryEvent } from './schema.js';

export const HERMES_EVIDENCE_DECISION_SCHEMA = 'reversa.hermes.evidence.decision/v1';
export const HERMES_EVIDENCE_AUTHORITY_ENGINE = 'hermes-evidence-authority-v2';

const FORBIDDEN_OBSERVED_SOURCE_KINDS = Object.freeze([
  'hermes-memory',
  'hermes-skill',
  'hermes-confidence',
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

function summarizeMemoryContext(memoryContext = []) {
  const memories = Array.isArray(memoryContext) ? memoryContext : [];
  let valid = 0;
  let invalid = 0;
  let personalization = 0;
  const refs = [];

  for (const memory of memories) {
    const checked = validateHermesMemoryEvent(memory);
    if (!checked.valid) {
      invalid += 1;
      continue;
    }
    valid += 1;
    if (memory.scope === 'personalization') personalization += 1;
    if (typeof memory.memory_id === 'string' && memory.memory_id.trim()) {
      refs.push(`memory:${memory.memory_id}`);
    }
  }

  return Object.freeze({
    valid,
    invalid,
    personalization,
    refs: Object.freeze(refs),
  });
}

function decision({
  accepted,
  current,
  proposed,
  effective,
  reason,
  source,
  memorySummary,
}) {
  return Object.freeze({
    schema: HERMES_EVIDENCE_DECISION_SCHEMA,
    authority: 'hermes',
    engine: HERMES_EVIDENCE_AUTHORITY_ENGINE,
    accepted,
    current,
    proposed,
    effective,
    reason,
    direct_evidence: isHermesDirectEvidence(source),
    source_kind: source?.kind ?? null,
    source_ref: typeof source?.ref === 'string' ? source.ref : null,
    memory_context_count: memorySummary.valid,
    invalid_memory_context_count: memorySummary.invalid,
    personalization_memory_count: memorySummary.personalization,
    memory_refs: memorySummary.refs,
    evidence_authority: true,
  });
}

export function evaluateHermesEvidenceProposal({
  current = 'UNVERIFIED',
  proposed,
  source = {},
  memoryContext = [],
} = {}) {
  assertHermesEpistemicState(current);
  assertHermesEpistemicState(proposed);

  const memorySummary = summarizeMemoryContext(memoryContext);

  if (proposed !== 'OBSERVED') {
    return decision({
      accepted: true,
      current,
      proposed,
      effective: proposed,
      reason: 'non-observed transition accepted by Hermes evidence authority',
      source,
      memorySummary,
    });
  }

  if (FORBIDDEN_OBSERVED_SOURCE_KINDS.includes(source?.kind)) {
    return decision({
      accepted: false,
      current,
      proposed,
      effective: current,
      reason: `${source.kind} não pode produzir OBSERVED`,
      source,
      memorySummary,
    });
  }

  if (!isHermesDirectEvidence(source)) {
    return decision({
      accepted: false,
      current,
      proposed,
      effective: current,
      reason: 'OBSERVED exige evidência direta com kind e ref rastreáveis; memória Hermes é apenas contexto',
      source,
      memorySummary,
    });
  }

  return decision({
    accepted: true,
    current,
    proposed,
    effective: 'OBSERVED',
    reason: 'direct evidence accepted by Hermes evidence authority',
    source,
    memorySummary,
  });
}

export function applyHermesEvidenceProposal(claim, proposal, context = {}) {
  if (!claim || typeof claim !== 'object' || Array.isArray(claim)) {
    throw new TypeError('claim deve ser um objeto');
  }

  const decisionResult = evaluateHermesEvidenceProposal({
    current: claim.epistemic_state ?? 'UNVERIFIED',
    ...proposal,
    memoryContext: context.memoryContext ?? proposal?.memoryContext ?? [],
  });

  return Object.freeze({
    ...claim,
    epistemic_state: decisionResult.effective,
    hermes_evidence_authority: decisionResult,
    // Compatibility alias for existing consumers. Both fields reference the
    // exact same frozen decision object; the implementation authority is Hermes.
    epistemic_guard: decisionResult,
  });
}

export function createHermesEvidenceAuthority() {
  return Object.freeze({
    engine: HERMES_EVIDENCE_AUTHORITY_ENGINE,
    evaluate: evaluateHermesEvidenceProposal,
    apply: applyHermesEvidenceProposal,
    isDirectEvidence: isHermesDirectEvidence,
    classifyMemory: classifyHermesMemory,
  });
}
