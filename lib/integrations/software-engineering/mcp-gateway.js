export function createMcpGateway({ handlers = {} } = {}) {
  const registry = new Map(Object.entries(handlers));
  return Object.freeze({
    listTools() {
      return Object.freeze([...registry.keys()].sort().map((name) => Object.freeze({ name })));
    },
    register(name, handler) {
      if (typeof name !== 'string' || !name.startsWith('reversa.')) throw new TypeError('tool name must start with reversa.');
      if (typeof handler !== 'function') throw new TypeError('tool handler must be a function');
      registry.set(name, handler);
      return this;
    },
    async callTool(name, args = {}) {
      if (!registry.has(name)) throw new Error(`tool is not registered/allowlisted: ${name}`);
      return registry.get(name)(Object.freeze({ ...args }));
    },
    protocol: Object.freeze({
      compatibility: 'MCP adapter-ready',
      sdk_dependency: false,
      recommendation: 'wrap this allowlisted dispatch with the official MCP SDK externally when transport interoperability is required',
    }),
  });
}
