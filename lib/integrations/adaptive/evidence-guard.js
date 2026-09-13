import {
  applyHermesEvidenceProposal,
  assertHermesEpistemicState,
  evaluateHermesEvidenceProposal,
  isHermesDirectEvidence,
} from '../hermes/evidence-authority.js';

// Backwards-compatible facade.
// Canonical implementation authority lives in ../hermes/evidence-authority.js.
export const assertEpistemicState = assertHermesEpistemicState;
export const isDirectEvidence = isHermesDirectEvidence;
export const evaluateEvidenceProposal = evaluateHermesEvidenceProposal;
export const applyEvidenceProposal = applyHermesEvidenceProposal;
