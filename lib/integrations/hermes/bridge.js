import {
  buildHermesExecutionResult,
  buildHermesMemoryEvent,
  buildHermesSkillProposal,
  buildHermesTrajectory,
} from './contracts.js';
import { createHermesEvidenceGovernor } from './evidence-governor.js';
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

export function createHermesBridge({ transport, evidenceTransport } = {}) {
  if (transport !== undefined && typeof transport !== 'function') {
    throw new TypeError('Hermes transport must be a function when provided');
  }
  if (evidenceTransport !== undefined && typeof evidenceTransport !== 'function') {
    throw new TypeError('Hermes evidence transport must be a function when provided');
  }

  const evidence = createHermesEvidenceGovernor({ transport: evidenceTransport });

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
    evidence,
    dispatch,
  });
}
