import { randomUUID } from 'node:crypto';

const STATUS = Object.freeze({ 0: 'succeeded' });

export function createExecutionFabric({ providers = {} } = {}) {
  const registry = new Map(Object.entries(providers));
  return Object.freeze({
    providers: () => Object.freeze([...registry.keys()].sort()),
    register(name, handler) {
      if (typeof name !== 'string' || !name.trim()) throw new TypeError('provider name required');
      if (typeof handler !== 'function') throw new TypeError('provider handler must be a function');
      registry.set(name, handler);
      return this;
    },
    async execute({ provider, command, task_id = randomUUID(), cwd = '.', env = {}, timeout_ms = null, metadata = {} } = {}) {
      if (!registry.has(provider)) throw new Error(`execution provider not registered: ${provider}`);
      if (typeof command !== 'string' || !command.trim()) throw new TypeError('command required');
      const started = Date.now();
      const raw = await registry.get(provider)(Object.freeze({ command, task_id, cwd, env: { ...env }, timeout_ms, metadata: { ...metadata } }));
      const exit = Number.isInteger(raw?.exit_code) ? raw.exit_code : 1;
      return Object.freeze({
        schema: 'reversa.execution.result/v2',
        execution_id: raw?.execution_id ?? randomUUID(),
        task_id,
        provider,
        status: raw?.status ?? STATUS[exit] ?? 'failed',
        exit_code: exit,
        stdout: typeof raw?.stdout === 'string' ? raw.stdout : '',
        stderr: typeof raw?.stderr === 'string' ? raw.stderr : '',
        artifacts: Object.freeze(Array.isArray(raw?.artifacts) ? [...raw.artifacts] : []),
        duration_ms: Number.isFinite(raw?.duration_ms) ? raw.duration_ms : Math.max(0, Date.now() - started),
        direct_evidence: Object.freeze(Array.isArray(raw?.direct_evidence) ? [...raw.direct_evidence] : []),
        evidence_authority: false,
      });
    },
    providerHints: Object.freeze(['SWE-ReX', 'OpenHands Agent Server', 'Docker/Podman wrapper', 'local sandbox wrapper']),
  });
}
