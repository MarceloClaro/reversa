import { DEFAULT_ADAPTIVE_ACTIONS } from './constants.js';
import { createAcmeBridge } from './acme-bridge.js';
import { createAuditLedger } from './ledger.js';
import { detectAdaptiveDrift } from './drift.js';
import { governAdaptiveProposal } from './governance.js';
import { createMciBridge } from './mci-bridge.js';
import { proposeShadowAction } from './policy.js';

export function createAdaptiveRuntime({
  candidateActions = DEFAULT_ADAPTIVE_ACTIONS,
  maxHistory = 500,
  exploration = 0.15,
  driftOptions = {},
  mciTransport,
  acmeTransport,
  abstainBelow = 0.20,
} = {}) {
  if (!Number.isInteger(maxHistory) || maxHistory < 1) {
    throw new TypeError('maxHistory deve ser inteiro positivo');
  }

  const ledger = createAuditLedger();
  const experiences = [];
  const mciBridge = createMciBridge({ transport: mciTransport, abstainBelow });
  const acmeBridge = createAcmeBridge({ transport: acmeTransport });

  async function ingest(event, { dispatch = false } = {}) {
    const appended = ledger.append(event);
    if (!appended.appended) {
      return Object.freeze({
        duplicate: true,
        event_id: event.event_id,
        ledger: ledger.verify(),
      });
    }

    const mciEnvelope = mciBridge.build(event);
    const experience = acmeBridge.buildExperience(event);
    experiences.push(experience);
    if (experiences.length > maxHistory) experiences.splice(0, experiences.length - maxHistory);

    const drift = detectAdaptiveDrift(experiences, driftOptions);
    const proposal = proposeShadowAction({
      observation: experience.observation,
      experiences,
      candidateActions,
      exploration,
    });
    const governance = governAdaptiveProposal({ proposal, drift });

    let dispatchResult = Object.freeze({ requested: false });
    if (dispatch) {
      const [mci, acme] = await Promise.all([
        mciBridge.dispatch(event),
        acmeBridge.submit(event),
      ]);
      dispatchResult = Object.freeze({ requested: true, mci, acme });
    }

    return Object.freeze({
      duplicate: false,
      event_id: event.event_id,
      ledger: ledger.verify(),
      mci_envelope: mciEnvelope,
      acme_experience: experience,
      drift,
      proposal,
      governance,
      dispatch: dispatchResult,
    });
  }

  function evaluateActivation({ proposal, drift, approved = false, activeMode = false, minHistory, minConfidence } = {}) {
    return governAdaptiveProposal({
      proposal,
      drift,
      approved,
      activeMode,
      minHistory,
      minConfidence,
    });
  }

  return Object.freeze({
    ingest,
    evaluateActivation,
    history() { return Object.freeze([...experiences]); },
    ledgerSnapshot() { return ledger.snapshot(); },
    verifyLedger() { return ledger.verify(); },
  });
}
