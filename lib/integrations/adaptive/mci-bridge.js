import { MCI_ENVELOPE_SCHEMA } from './constants.js';
import { isLearningEvent } from './event.js';

function gatesFor(event) {
  const gates = new Set(['FEG-02', 'FEG-03']);
  if (event.state.epistemic_state === 'UNVERIFIED' || event.state.epistemic_state === 'BLOCKED') {
    gates.add('FEG-04');
    gates.add('FEG-06');
  }
  if (event.state.human_source_state) gates.add('FEG-07');
  if ((event.state.high_findings ?? 0) > 0 || (event.state.critical_findings ?? 0) > 0) {
    gates.add('FEG-05');
  }
  return [...gates];
}

export function buildMciEnvelope(event, { abstainBelow = 0.20 } = {}) {
  if (!isLearningEvent(event)) {
    throw new TypeError('evento Reversa inválido');
  }

  const confidence = event.state.confidence;
  const shouldAbstain = event.state.epistemic_state === 'BLOCKED'
    || (typeof confidence === 'number' && confidence < abstainBelow);

  return Object.freeze({
    schema: MCI_ENVELOPE_SCHEMA,
    source: 'ReversaFeynman',
    task_id: event.task_id,
    stage: event.stage,
    epistemic: Object.freeze({
      state: event.state.epistemic_state,
      human_source_state: event.state.human_source_state,
      feynman_score: event.state.feynman_score,
      blocked_count: event.state.blocked_count,
    }),
    metacognition: Object.freeze({
      confidence,
      trust: event.state.trust,
      should_abstain: shouldAbstain,
      required_gates: gatesFor(event),
    }),
    proposed_action: event.action,
    outcome: event.outcome,
    provenance: Object.freeze({
      event_schema: event.schema,
      event_id: event.event_id,
      timestamp: event.timestamp,
    }),
  });
}

export function createMciBridge({ transport, abstainBelow = 0.20 } = {}) {
  if (transport !== undefined && typeof transport !== 'function') {
    throw new TypeError('transport deve ser função assíncrona/síncrona');
  }

  return Object.freeze({
    build(event) {
      return buildMciEnvelope(event, { abstainBelow });
    },
    async dispatch(event) {
      const envelope = buildMciEnvelope(event, { abstainBelow });
      if (!transport) {
        return Object.freeze({ sent: false, envelope, reason: 'no transport configured' });
      }
      const response = await transport(envelope);
      return Object.freeze({ sent: true, envelope, response });
    },
  });
}
