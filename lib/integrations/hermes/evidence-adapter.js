import { isHermesDirectEvidence } from './evidence-authority.js';
import { assertHermesValid, validateHermesExecutionResult } from './schema.js';

export function executionResultToEvidenceProposals(execution, claims = []) {
  assertHermesValid(execution, validateHermesExecutionResult, 'Hermes execution result');
  if (!Array.isArray(claims) || claims.length === 0) return Object.freeze([]);

  const claimIds = new Set(
    claims
      .filter((claim) => claim && typeof claim.id === 'string' && claim.id.trim())
      .map((claim) => claim.id),
  );

  const proposals = execution.direct_evidence
    .filter((evidence) => (
      isHermesDirectEvidence(evidence)
      && typeof evidence.claim_id === 'string'
      && claimIds.has(evidence.claim_id)
    ))
    .map((evidence) => Object.freeze({
      claim_id: evidence.claim_id,
      execution_id: execution.execution_id,
      proposal: Object.freeze({
        proposed: 'OBSERVED',
        source: Object.freeze({
          kind: evidence.kind,
          ref: evidence.ref,
          direct: true,
        }),
      }),
      evidence_authority: false,
    }));

  return Object.freeze(proposals);
}
