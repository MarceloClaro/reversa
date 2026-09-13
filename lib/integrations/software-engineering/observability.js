import { randomUUID } from 'node:crypto';

export function createTraceCollector({ traceId = randomUUID() } = {}) {
  const spans = [];
  return Object.freeze({
    startSpan(name, attributes = {}) {
      if (typeof name !== 'string' || !name.trim()) throw new TypeError('span name required');
      const span = { span_id: randomUUID(), name, started_at: new Date().toISOString(), ended_at: null, attributes: { ...attributes }, outcome: null };
      spans.push(span);
      return Object.freeze({ ...span, attributes: Object.freeze({ ...span.attributes }) });
    },
    endSpan(spanId, outcome = {}) {
      const span = spans.find((item) => item.span_id === spanId);
      if (!span) throw new Error(`unknown span: ${spanId}`);
      if (span.ended_at) return Object.freeze({ ...span });
      span.ended_at = new Date().toISOString();
      span.outcome = { ...outcome };
      return Object.freeze({ ...span, attributes: Object.freeze({ ...span.attributes }), outcome: Object.freeze({ ...span.outcome }) });
    },
    exportTrace() {
      return Object.freeze({
        schema: 'reversa.trace/v1',
        trace_id: traceId,
        spans: Object.freeze(spans.map((span) => Object.freeze({ ...span, attributes: Object.freeze({ ...span.attributes }), outcome: span.outcome ? Object.freeze({ ...span.outcome }) : null }))),
        export_hint: 'OpenTelemetry/Phoenix adapter may map these spans externally',
        evidence_authority: false,
      });
    },
  });
}
