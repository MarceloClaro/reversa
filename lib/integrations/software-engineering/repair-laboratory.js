import { randomUUID } from 'node:crypto';

function assertLocalization(localization) {
  if (!localization || typeof localization !== 'object') throw new TypeError('localization required');
  for (const key of ['file', 'symbol', 'region']) {
    if (typeof localization[key] !== 'string' || !localization[key].trim()) throw new TypeError(`localization.${key} required`);
  }
}

function strictMetric(value, name) {
  if (value === undefined || value === null) return 0;
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`validations.${name} must be a finite number`);
  return value;
}

function score(validations = {}) {
  const tests = strictMetric(validations.tests, 'tests');
  const statik = strictMetric(validations.static, 'static');
  const mutation = strictMetric(validations.mutation, 'mutation');
  const regression = strictMetric(validations.regression, 'regression');
  return Math.max(-1, Math.min(1, tests * 0.35 + statik * 0.2 + mutation * 0.35 - regression * 0.4 + 0.1));
}

export function createRepairLaboratory() {
  return Object.freeze({
    createCandidate({ localization, patch, validations = {}, metadata = {} } = {}) {
      assertLocalization(localization);
      if (typeof patch !== 'string' || !patch.trim()) throw new TypeError('patch required');
      return Object.freeze({
        schema: 'reversa.repair.candidate/v1',
        candidate_id: randomUUID(),
        localization: Object.freeze({ ...localization }),
        patch,
        validations: Object.freeze({ ...validations }),
        score: score(validations),
        metadata: Object.freeze({ ...metadata }),
        evidence_authority: false,
      });
    },
    rankCandidates(candidates = []) {
      if (!Array.isArray(candidates)) throw new TypeError('candidates must be an array');
      return Object.freeze([...candidates].sort((a, b) => b.score - a.score || a.candidate_id.localeCompare(b.candidate_id)));
    },
    pipeline: Object.freeze(['repository', 'file', 'symbol', 'edit-region', 'candidate-patches', 'validation', 'ranking']),
    referencePattern: 'Agentless localization -> repair -> patch validation',
  });
}
