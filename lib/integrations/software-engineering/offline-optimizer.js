import { randomUUID } from 'node:crypto';

export function createOfflineOptimizer({ provider = null } = {}) {
  return Object.freeze({
    propose({ target, candidate, score = 0, metadata = {} } = {}) {
      if (typeof target !== 'string' || !target.trim()) throw new TypeError('target required');
      if (typeof candidate !== 'string' || !candidate.trim()) throw new TypeError('candidate required');
      if (typeof score !== 'number' || !Number.isFinite(score)) throw new TypeError('score must be a finite number');
      return Object.freeze({
        schema: 'reversa.optimizer.proposal/v1',
        proposal_id: randomUUID(),
        target,
        candidate,
        score,
        mode: 'shadow',
        auto_apply: false,
        requires_offline_evaluation: true,
        requires_review: true,
        provider: metadata.provider ?? 'manual',
        metadata: Object.freeze({ ...metadata }),
        evidence_authority: false,
      });
    },
    async optimize(request) {
      if (typeof provider !== 'function') throw new Error('offline optimizer provider is not configured');
      const raw = await provider(Object.freeze({ ...request }));
      return this.propose({ ...raw, metadata: { ...(raw?.metadata ?? {}), provider: raw?.provider ?? 'external' } });
    },
    providerHints: Object.freeze(['DSPy/GEPA', 'Hermes skill proposal generator', 'custom offline optimizer']),
  });
}
