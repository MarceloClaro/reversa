function nonEmpty(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} required`);
  return value;
}

export function createIMOProviderRouter({ providers = {} } = {}) {
  if (!providers || typeof providers !== 'object' || Array.isArray(providers)) {
    throw new TypeError('providers must be an object map');
  }
  const entries = Object.entries(providers);
  if (!entries.length) throw new TypeError('at least one provider adapter required');
  const registry = new Map();
  for (const [name, handler] of entries) {
    nonEmpty(name, 'provider name');
    if (typeof handler !== 'function') throw new TypeError(`provider ${name} must be a function`);
    registry.set(name, handler);
  }

  return Object.freeze({
    async invoke(model, request) {
      if (!model || typeof model !== 'object') throw new TypeError('model required');
      const provider = nonEmpty(model.provider, 'model.provider');
      const handler = registry.get(provider);
      if (!handler) throw new Error(`unregistered IMO provider: ${provider}`);
      return handler(model, request);
    },
    providers: Object.freeze([...registry.keys()].sort()),
  });
}

export function createCommandModelAdapter({ execute, buildCommand, parseOutput } = {}) {
  if (typeof execute !== 'function') throw new TypeError('execute function required');
  if (typeof buildCommand !== 'function') throw new TypeError('buildCommand function required');
  if (typeof parseOutput !== 'function') throw new TypeError('parseOutput function required');

  return async (model, request) => {
    const command = buildCommand(model, request);
    if (!command || typeof command !== 'object') throw new TypeError('buildCommand must return command descriptor');
    const started = Date.now();
    const raw = await execute(command);
    const parsed = await parseOutput(raw, { model, request });
    if (!parsed || typeof parsed !== 'object') throw new TypeError('parseOutput must return an object');
    return {
      ...parsed,
      latency_ms: parsed.latency_ms ?? Math.max(0, Date.now() - started),
      cost: parsed.cost ?? 0,
      tool_calls: parsed.tool_calls ?? 0,
    };
  };
}
