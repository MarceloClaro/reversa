import { validateHermesMemoryEvent } from './schema.js';

export function classifyHermesMemory(memory) {
  const checked = validateHermesMemoryEvent(memory);
  if (!checked.valid) {
    return Object.freeze({
      accepted: false,
      epistemic_state: 'BLOCKED',
      evidence_authority: false,
      reason: `invalid-contract: ${checked.errors.join('; ')}`,
    });
  }

  if (memory.scope === 'personalization') {
    return Object.freeze({
      accepted: true,
      epistemic_state: memory.epistemic_state,
      evidence_authority: false,
      reason: 'personalization memory is isolated from evidentiary authority',
    });
  }

  return Object.freeze({
    accepted: true,
    epistemic_state: memory.epistemic_state,
    evidence_authority: false,
    reason: 'Hermes memory may inform context but cannot establish OBSERVED evidence',
  });
}
