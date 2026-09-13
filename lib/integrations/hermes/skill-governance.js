import { validateHermesSkillProposal } from './schema.js';

export function governHermesSkillProposal(proposal, {
  reviewApproved = false,
  testsPassing = false,
  feynmanApproved = false,
  drift = { detected: false, status: 'unknown' },
} = {}) {
  const checked = validateHermesSkillProposal(proposal);
  const reasons = [];

  if (!checked.valid) reasons.push('invalid-contract');
  if (proposal?.mode !== 'shadow') reasons.push('shadow-required');
  if (reviewApproved !== true) reasons.push('review-required');
  if (testsPassing !== true) reasons.push('tests-required');
  if (feynmanApproved !== true) reasons.push('feynman-required');
  if (drift?.detected === true) reasons.push('drift-detected');
  if (proposal?.evidence_authority !== false) reasons.push('evidence-authority-escalation');

  return Object.freeze({
    eligible: reasons.length === 0,
    executable: false,
    file_mutation_performed: false,
    reasons: Object.freeze(reasons),
    note: 'eligibility never performs skill mutation; repository workflow must apply any approved change explicitly',
  });
}
