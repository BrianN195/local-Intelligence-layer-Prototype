import { randomUUID } from "crypto";
import { processSignal } from "./engine.js";

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

  const sourceExists = run.agents.some(
    (agent) => agent.id === sourceAgentId,
  );

  const targetExists = run.agents.some(
    (agent) => agent.id === targetAgentId,
  );

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
        properties.propagationMode ?? "broadcast",

      propagationScope:
        properties.propagationScope ?? "neighborhood",

      propagationDirection:
        properties.propagationDirection ?? null,
    },

    status: "created",

    visitedAgents: [sourceAgentId],

    timestamp: new Date().toISOString(),

    blocked: false,
  };

  run.signals.push(signal);

  run.statistics.signalCount++;

  processSignal(signal, run);

  return signal;
}