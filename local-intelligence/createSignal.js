import { randomUUID } from "crypto";
import { processSignal } from "./domain/signals/signalEngine.js";
import { findAgentById } from "./repositories/agentRepository.js";
import { addSignal } from "./repositories/signalRepository.js";
import {
  PROPAGATION_MODES,
  PROPAGATION_SCOPES,
} from "./constants/propagation.js";
import { SIGNAL_STATUS } from "./constants/statuses.js";

export default function createSignal(
  run,
  {
    type,
    sourceAgentId,
    targetAgentId,
    payload = {},
    properties = {},
  },
) {
  if (!run) {
    return null;
  }

  const sourceExists = Boolean(findAgentById(run, sourceAgentId));
  const targetExists = Boolean(findAgentById(run, targetAgentId));

  if (!sourceExists || !targetExists) {
    return null;
  }

  const signal = {
    id: randomUUID(),

    experimentRunId: run.id,

    type,

    sourceAgentId,

    targetAgentId,

    payload,

    properties: {
      ttl: properties.ttl ?? 10,

      hopCount: properties.hopCount ?? 0,

      propagationMode:
        properties.propagationMode ?? PROPAGATION_MODES.BROADCAST,

      propagationScope:
        properties.propagationScope ?? PROPAGATION_SCOPES.NEIGHBORHOOD,

      propagationDirection:
        properties.propagationDirection ?? null,
    },

    status: SIGNAL_STATUS.CREATED,

    visitedAgents: [sourceAgentId],

    timestamp: new Date().toISOString(),

    blocked: false,
  };

  addSignal(run, signal);

  processSignal(signal, run);

  return signal;
}