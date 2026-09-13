function cleanSymbol(symbol) {
  if (!symbol || typeof symbol !== 'object') throw new TypeError('symbol must be an object');
  for (const key of ['id', 'file', 'name', 'kind']) {
    if (typeof symbol[key] !== 'string' || !symbol[key].trim()) throw new TypeError(`symbol.${key} required`);
  }
  return Object.freeze({
    id: symbol.id,
    file: symbol.file,
    name: symbol.name,
    kind: symbol.kind,
    signature: symbol.signature ?? null,
    range: symbol.range ?? null,
    metadata: Object.freeze({ ...(symbol.metadata ?? {}) }),
  });
}

function cleanEdge(edge, ids) {
  if (!edge || typeof edge !== 'object') throw new TypeError('edge must be an object');
  if (!ids.has(edge.from) || !ids.has(edge.to)) throw new TypeError('edge endpoints must reference known symbols');
  return Object.freeze({ from: edge.from, to: edge.to, kind: edge.kind ?? 'references', weight: Number.isFinite(edge.weight) ? edge.weight : 1 });
}

function rank(symbols, edges) {
  const scores = new Map(symbols.map((symbol) => [symbol.id, 0]));
  for (const edge of edges) {
    scores.set(edge.to, (scores.get(edge.to) ?? 0) + edge.weight);
    scores.set(edge.from, (scores.get(edge.from) ?? 0) + edge.weight * 0.25);
  }
  return Object.freeze(symbols
    .map((symbol) => Object.freeze({ id: symbol.id, score: scores.get(symbol.id) ?? 0 }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)));
}

export function createCodeIntelligence({ provider = null } = {}) {
  return Object.freeze({
    async inspect(request) {
      if (typeof provider !== 'function') throw new Error('code intelligence provider is not configured');
      const raw = await provider(Object.freeze({ ...request }));
      return this.normalizeGraph(raw);
    },
    normalizeGraph(raw = {}) {
      const symbols = Object.freeze((raw.symbols ?? []).map(cleanSymbol));
      const ids = new Set(symbols.map((s) => s.id));
      const edges = Object.freeze((raw.edges ?? []).map((e) => cleanEdge(e, ids)));
      return Object.freeze({
        schema: 'reversa.code-intelligence.graph/v1',
        generated_at: new Date().toISOString(),
        provider: raw.provider ?? 'normalized',
        symbols,
        edges,
        ranking: rank(symbols, edges),
        evidence_authority: false,
      });
    },
    providerHints: Object.freeze([
      'aider/tree-sitter repo-map',
      'ast-grep structural search',
      'semgrep semantic/static analysis',
    ]),
  });
}
