import { createHash } from 'node:crypto';
import { validateLearningEvent } from './schema.js';

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function hashPayload(payload) {
  return sha256(canonical(payload));
}

export function createAuditLedger({ genesis = 'REVERSA-FEYNMAN-ADAPTIVE-v2' } = {}) {
  const entries = [];
  const seen = new Set();
  const genesisHash = sha256(genesis);

  function append(event) {
    const validation = validateLearningEvent(event);
    if (!validation.valid) {
      throw new TypeError(`evento inválido: ${validation.errors.join('; ')}`);
    }
    if (seen.has(event.event_id)) {
      return Object.freeze({ appended: false, duplicate: true, entry: entries.find((item) => item.event_id === event.event_id) });
    }

    const previousHash = entries.length ? entries.at(-1).entry_hash : genesisHash;
    const payloadHash = hashPayload(event);
    const sequence = entries.length + 1;
    const entryHash = sha256(`${sequence}:${previousHash}:${payloadHash}`);
    const entry = Object.freeze({
      sequence,
      event_id: event.event_id,
      previous_hash: previousHash,
      payload_hash: payloadHash,
      entry_hash: entryHash,
      event,
    });
    entries.push(entry);
    seen.add(event.event_id);
    return Object.freeze({ appended: true, duplicate: false, entry });
  }

  function verify() {
    let previousHash = genesisHash;
    const errors = [];
    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      const expectedSequence = index + 1;
      const expectedPayload = hashPayload(entry.event);
      const expectedEntry = sha256(`${expectedSequence}:${previousHash}:${expectedPayload}`);
      if (entry.sequence !== expectedSequence) errors.push(`sequence mismatch at ${expectedSequence}`);
      if (entry.previous_hash !== previousHash) errors.push(`previous_hash mismatch at ${expectedSequence}`);
      if (entry.payload_hash !== expectedPayload) errors.push(`payload_hash mismatch at ${expectedSequence}`);
      if (entry.entry_hash !== expectedEntry) errors.push(`entry_hash mismatch at ${expectedSequence}`);
      previousHash = entry.entry_hash;
    }
    return Object.freeze({ valid: errors.length === 0, entries: entries.length, head: previousHash, errors: Object.freeze(errors) });
  }

  return Object.freeze({
    append,
    verify,
    size() { return entries.length; },
    head() { return entries.length ? entries.at(-1).entry_hash : genesisHash; },
    snapshot() { return Object.freeze([...entries]); },
    toJSONL() { return entries.map((entry) => JSON.stringify(entry)).join('\n'); },
  });
}
