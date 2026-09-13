import { assertHermesValid, validateHermesTrajectory } from './schema.js';

export function trajectoryToLearningSignals(trajectory) {
  assertHermesValid(trajectory, validateHermesTrajectory, 'Hermes trajectory');

  const actionCounts = new Map();
  let failedSteps = 0;
  let toolCalls = 0;
  let knownDurationMs = 0;

  for (const step of trajectory.steps) {
    actionCounts.set(step.action, (actionCounts.get(step.action) ?? 0) + 1);
    if (step.status === 'failed') failedSteps += 1;
    if (step.tool) toolCalls += 1;
    if (Number.isFinite(Number(step.duration_ms))) knownDurationMs += Number(step.duration_ms);
  }

  const repeatedActions = [...actionCounts.values()]
    .reduce((total, count) => total + Math.max(0, count - 1), 0);

  return Object.freeze({
    trajectory_id: trajectory.trajectory_id,
    task_id: trajectory.task_id,
    step_count: trajectory.steps.length,
    failed_steps: failedSteps,
    tool_calls: toolCalls,
    known_duration_ms: knownDurationMs,
    repeated_actions: repeatedActions,
    completed: ['succeeded', 'failed', 'cancelled'].includes(trajectory.status),
    status: trajectory.status,
    evidence_authority: false,
  });
}
