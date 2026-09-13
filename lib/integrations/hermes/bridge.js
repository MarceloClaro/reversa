import {
  buildHermesExecutionResult,
  buildHermesMemoryEvent,
  buildHermesSkillProposal,
  buildHermesTrajectory,
} from './contracts.js';
import { createHermesEvidenceAuthority } from './evidence-authority.js';
import {
  validateHermesExecutionResult,
  validateHermesMemoryEvent,
  validateHermesSkillProposal,
  validateHermesTrajectory,
} from './schema.js';

function validateAnyHermesContract(contract) {
  const validators = [
    validateHermesMemoryEvent,
    validateHermesSkillProposal,
    validateHermesTrajectory,
    validateHermesExecutionResult,
  ];
  return validators.some((validator) => validator(contract).valid);
}

export function createHermesBridge({ transport } = {}) {
  if (transport !== undefined && typeof transport !== 'function') {
    throw new TypeError('Hermes transport must be a function when provided');
  }

  const evidenceAuthority = createHermesEvidenceAuthority();

  async function dispatch(contract) {
    if (!validateAnyHermesContract(contract)) {
      throw new TypeError('invalid Hermes contract');
    }
    if (!transport) {
      return Object.freeze({ requested: false, reason: 'no-transport-configured' });
    }
    const response = await transport(contract);
    return Object.freeze({ requested: true, response });
  }

  return Object.freeze({
    memory: buildHermesMemoryEvent,
    skillProposal: buildHermesSkillProposal,
    trajectory: buildHermesTrajectory,
    executionResult: buildHermesExecutionResult,
    evidenceAuthority,
    evaluateEvidence: evidenceAuthority.evaluate,
    applyEvidence: evidenceAuthority.apply,
    dispatch,
  });
}
