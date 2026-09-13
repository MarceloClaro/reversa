const SCHEMAS = Object.freeze({
  'reversa.code-intelligence.graph/v1': { required: ['schema', 'symbols', 'edges', 'ranking', 'evidence_authority'] },
  'reversa.execution.result/v2': { required: ['schema', 'execution_id', 'task_id', 'provider', 'status', 'exit_code', 'stdout', 'stderr', 'artifacts', 'evidence_authority'] },
  'reversa.repair.candidate/v1': { required: ['schema', 'candidate_id', 'localization', 'patch', 'validations', 'score', 'evidence_authority'] },
  'reversa.quality.report/v1': { required: ['schema', 'tests', 'static_analysis', 'mutation_score', 'passed', 'evidence_authority'] },
  'reversa.trace/v1': { required: ['schema', 'trace_id', 'spans', 'evidence_authority'] },
  'reversa.benchmark.result/v1': {
    required: ['schema', 'variant', 'total', 'succeeded', 'success_rate', 'mean_latency_ms', 'mean_cost', 'regressions', 'evidence_authority'],
    numeric: ['total', 'succeeded', 'success_rate', 'mean_latency_ms', 'mean_cost', 'regressions'],
  },
  'reversa.optimizer.proposal/v1': {
    required: ['schema', 'proposal_id', 'target', 'candidate', 'score', 'mode', 'auto_apply', 'evidence_authority'],
    numeric: ['score'],
  },
});

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function result(errors) {
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

export function validateStrictContract(schemaName, value) {
  const definition = SCHEMAS[schemaName];
  if (!definition) return result([`unknown schema: ${schemaName}`]);
  if (!isPlainObject(value)) return result(['value must be an object']);
  const errors = [];
  if (value.schema !== schemaName) errors.push(`schema must equal ${schemaName}`);
  for (const key of definition.required) if (!(key in value)) errors.push(`${key} is required`);
  for (const key of definition.numeric ?? []) {
    if (key in value && (typeof value[key] !== 'number' || !Number.isFinite(value[key]))) {
      errors.push(`${key} must be a finite number without coercion`);
    }
  }
  if ('evidence_authority' in value && value.evidence_authority !== false) errors.push('evidence_authority must be false');
  return result(errors);
}

export function createAjvStrictAdapter({ ajv, schemaDocument } = {}) {
  if (!ajv || typeof ajv.compile !== 'function') throw new TypeError('Ajv-compatible instance with compile() required');
  if (ajv.opts && ajv.opts.strict === false) throw new TypeError('Ajv strict mode must not be disabled');
  if (!schemaDocument || typeof schemaDocument !== 'object') throw new TypeError('schemaDocument required');
  const validate = ajv.compile(schemaDocument);
  return Object.freeze({
    validate(value) {
      const valid = Boolean(validate(value));
      return Object.freeze({ valid, errors: Object.freeze(valid ? [] : [...(validate.errors ?? [])]) });
    },
    strict: true,
  });
}

export function createStrictContractRegistry() {
  return Object.freeze({
    schemas: Object.freeze(Object.keys(SCHEMAS)),
    validate: validateStrictContract,
    jsonSchemaVersion: 'https://json-schema.org/draft/2020-12/schema',
    ajv: Object.freeze({ supported: true, mode: 'optional-adapter', strict: true }),
  });
}
