function nonEmpty(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} required`);
  return value;
}

function parseJsonObject(text) {
  if (typeof text !== 'string' || !text.trim()) throw new Error('model returned empty content');
  const trimmed = text.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    return JSON.parse(unfenced);
  } catch {
    const start = unfenced.indexOf('{');
    const end = unfenced.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(unfenced.slice(start, end + 1));
    throw new Error('model output is not valid JSON');
  }
}

function responseContract(role) {
  if (role === 'judge') {
    return {
      score: 'number',
      correct: 'boolean',
      rationale: 'string',
      confidence: 'number in [0,1]',
    };
  }
  if (role === 'verifier') {
    return {
      text: 'string',
      verdict: 'plausible | gap | refuted | unresolved',
    };
  }
  return { text: 'string' };
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

export function createOpenAICompatibleIMOAdapter({
  baseUrl,
  apiKey = null,
  fetchImpl = globalThis.fetch,
  defaultHeaders = {},
  temperature = 0,
  maxTokens = 8192,
  timeoutMs = 180000,
} = {}) {
  nonEmpty(baseUrl, 'baseUrl');
  if (typeof fetchImpl !== 'function') throw new TypeError('fetchImpl function required');
  if (typeof temperature !== 'number' || !Number.isFinite(temperature) || temperature < 0) {
    throw new TypeError('temperature must be a non-negative finite number');
  }
  if (!Number.isInteger(maxTokens) || maxTokens < 1) throw new TypeError('maxTokens must be a positive integer');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1) throw new TypeError('timeoutMs must be a positive integer');

  const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  return async (model, request) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const started = Date.now();
    try {
      const headers = {
        'content-type': 'application/json',
        ...defaultHeaders,
      };
      if (apiKey) headers.authorization = `Bearer ${apiKey}`;

      const system = [
        `You are the ${request.role} in a rigorous multi-model IMO reasoning protocol.`,
        'Follow the scientific-method requirements in the request.',
        'Return JSON only, with no markdown fencing.',
        `Required response object: ${JSON.stringify(responseContract(request.role))}`,
        'Never invent access to hidden benchmark references that are absent from the request.',
      ].join('\n');

      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: model.model_id,
          temperature,
          max_tokens: maxTokens,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: JSON.stringify(request) },
          ],
        }),
      });

      if (!response || typeof response.ok !== 'boolean') throw new Error('invalid fetch response');
      if (!response.ok) {
        const body = typeof response.text === 'function' ? await response.text() : '';
        throw new Error(`OpenAI-compatible provider HTTP ${response.status}: ${body.slice(0, 500)}`);
      }
      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content;
      const parsed = parseJsonObject(content);
      const usage = payload?.usage ?? {};
      return {
        ...parsed,
        latency_ms: Math.max(0, Date.now() - started),
        cost: typeof payload?.cost === 'number' && Number.isFinite(payload.cost) ? payload.cost : 0,
        tool_calls: Array.isArray(payload?.choices?.[0]?.message?.tool_calls)
          ? payload.choices[0].message.tool_calls.length
          : 0,
        usage: {
          prompt_tokens: usage.prompt_tokens ?? null,
          completion_tokens: usage.completion_tokens ?? null,
          total_tokens: usage.total_tokens ?? null,
        },
      };
    } finally {
      clearTimeout(timer);
    }
  };
}
