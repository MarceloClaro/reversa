export function createDurableWorkflow({ load, save } = {}) {
  if (typeof load !== 'function' || typeof save !== 'function') throw new TypeError('durable workflow requires load/save functions');
  return Object.freeze({
    async run(workflowId, steps = [], context = {}) {
      if (typeof workflowId !== 'string' || !workflowId.trim()) throw new TypeError('workflowId required');
      const previous = await load(workflowId);
      const state = previous ?? { workflow_id: workflowId, completed: [], outputs: {}, status: 'running' };
      const completed = new Set(state.completed ?? []);
      for (const step of steps) {
        if (!step || typeof step.id !== 'string' || typeof step.run !== 'function') throw new TypeError('workflow step requires id and run');
        if (completed.has(step.id)) continue;
        const output = await step.run(Object.freeze({ ...context }), Object.freeze({ ...state }));
        completed.add(step.id);
        state.completed = [...completed];
        state.outputs = { ...(state.outputs ?? {}), [step.id]: output };
        state.last_step = step.id;
        state.updated_at = new Date().toISOString();
        await save(workflowId, state);
      }
      state.status = 'completed';
      state.updated_at = new Date().toISOString();
      await save(workflowId, state);
      return Object.freeze({ ...state, completed: Object.freeze([...state.completed]), outputs: Object.freeze({ ...state.outputs }) });
    },
    providerHints: Object.freeze(['LangGraph.js', 'Temporal', 'DBOS', 'Prefect', 'custom checkpoint store']),
  });
}
