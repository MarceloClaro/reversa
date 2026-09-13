// @deprecated Compatibility shim.
// Evidence governance is implemented by Hermes Evidence Governor v2.
// New code must import from lib/integrations/hermes/evidence-governor.js.
export {
  assertHermesEpistemicState as assertEpistemicState,
  isHermesDirectEvidence as isDirectEvidence,
  evaluateHermesEvidence as evaluateEvidenceProposal,
  applyHermesEvidenceProposal as applyEvidenceProposal,
} from '../hermes/evidence-governor.js';
