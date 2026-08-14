import { randomUUID } from "crypto";
import { getStateId } from "../stateHelpers.js";
import { processSignal } from "../engine.js";
import { canPropagateToNeighborhood } from "./propagationScope.js";
const actions = {
  activate,
  propagate,
  block,
  sync,
};

export default function executeRule(rule, signal, run) {
  const strength = signal.payload?.strength ?? 0;

  if (
    rule.threshold !== undefined &&
    rule.threshold !== null &&
    strength < rule.threshold
  ) {
    return false;
  }

  const action = actions[rule.action];

  if (!action) {
    return false;
  }

  action(signal, run);

  return true;
}

// ====================================================
// ACTIVATE
// ====================================================

function activate(signal, run) {
  const agent = run.agents.find(
    (a) => a.id === signal.targetAgentId,
  );

  if (!agent) return;

  const activeStateId = getStateId("active");

  if (agent.stateId === activeStateId) {
    return;
  }

  agent.stateId = activeStateId;
}

// ====================================================
// BLOCK
// ====================================================

function block(signal) {
  signal.blocked = true;
}

// ====================================================
// PROPAGATE
// ====================================================

function selectNeighbors(neighbors, mode, run) {
  switch (mode) {
    case "random":
      return neighbors.sort(() => Math.random() - 0.5).slice(0, 1);

    case "broadcast":
    default:
      return neighbors;

    case "priority":
      return neighbors.sort((a, b) => {
        const agentA = run.agents.find((agent) => agent.id === a);
        const agentB = run.agents.find((agent) => agent.id === b);

        return (agentB?.priority ?? 0) - (agentA?.priority ?? 0);
      });
  }
}

function propagate(signal, run) {
  if (signal.blocked) return;

  // ====================================================
  // TTL CHECK

  if ((signal.properties.ttl ?? 0) <= 0) {
    run.technicalWarnings.push({
      id: randomUUID(),

      experimentRunId: run.id,

      type: "TTL_EXPIRED",

      message: "Signal propagation stopped because TTL reached zero.",

      signalId: signal.id,

      timestamp: new Date().toISOString(),
    });

    run.warningCount++;

    signal.status = "completed";

    return;
  }

  // ====================================================
  // FIND CURRENT AGENT

  const sourceAgent = run.agents.find(
    (a) => a.id === signal.targetAgentId,
  );

  if (!sourceAgent) return;

  // ====================================================
  // FIND CURRENT NEIGHBORHOOD

  if (!sourceAgent.neighborhoodId) return;

  const currentNeighborhood = run.neighborhoods.find(
    (n) => n.id === sourceAgent.neighborhoodId,
  );

  if (!currentNeighborhood) return;

  // ====================================================
  // PROPAGATION SETTINGS

  const propagationMode =
    signal.properties?.propagationMode ?? "broadcast";

  const propagationScope =
    signal.properties?.propagationScope ?? "neighborhood";

  // ====================================================
  // FIND ALLOWED NEIGHBORHOODS

  const allowedNeighborhoods = run.neighborhoods.filter(
    (targetNeighborhood) =>
      canPropagateToNeighborhood(
        signal,
        currentNeighborhood,
        targetNeighborhood,
      ),
  );

  // ====================================================
  // PROPAGATE TO AGENTS

  let propagated = false;

  for (const neighborhood of allowedNeighborhoods) {
    let neighbors = [...neighborhood.agentIds];

    neighbors = selectNeighbors(
      neighbors,
      propagationMode,
      run,
    );

    for (const neighborId of neighbors) {
      // ---------------------------------------
      // SKIP INVALID TARGETS
      // ---------------------------------------

      if (neighborId === sourceAgent.id) continue;

      if (neighborId === signal.sourceAgentId) continue;

      if (signal.visitedAgents.includes(neighborId)) continue;

      // ---------------------------------------
      // PREVENT DUPLICATE SIGNALS
      // ---------------------------------------

      const alreadyQueued = run.signals.some(
        (s) =>
          s.parentSignalId ===
            (signal.parentSignalId || signal.id) &&
          s.targetAgentId === neighborId,
      );

      if (alreadyQueued) continue;

      // ---------------------------------------
      // CREATE PROPAGATED SIGNAL
      // ---------------------------------------

      const propagatedSignal = {
        id: randomUUID(),

        experimentRunId: run.id,

        type: signal.type,

        parentSignalId:
          signal.parentSignalId || signal.id,

        sourceAgentId: sourceAgent.id,

        targetAgentId: neighborId,

        payload: structuredClone(signal.payload),

        properties: {
          ...signal.properties,

          ttl: signal.properties.ttl - 1,

          hopCount:
            (signal.properties.hopCount ?? 0) + 1,
        },

        status: "created",

        visitedAgents: [
          ...signal.visitedAgents,
          neighborId,
        ],

        timestamp: new Date().toISOString(),

        blocked: false,
      };

      run.signals.push(propagatedSignal);

      propagated = true;

      processSignal(propagatedSignal, run);
    }
  }

  // ====================================================
  // UPDATE SIGNAL STATUS

  if (propagated) {
    signal.status = "propagated";
  }
}
  // 
// ====================================================
// SYNC
// ====================================================

function sync(signal, run) {
  const targetAgent = run.agents.find(
    (a) => a.id === signal.targetAgentId,
  );

  if (!targetAgent) return;

  const neighborhood = run.neighborhoods.find(
    (n) => n.id === targetAgent.neighborhoodId,
  );

  if (!neighborhood) return;

  const synchronizedStateId =
    getStateId("synchronized");

  for (const agentId of neighborhood.agentIds) {
    const agent = run.agents.find(
      (a) => a.id === agentId,
    );

    if (!agent) continue;

    if (agent.stateId === synchronizedStateId) {
      continue;
    }

    agent.stateId = synchronizedStateId;
  }
}
