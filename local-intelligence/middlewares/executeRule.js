import { randomUUID } from "crypto";
import { processSignal } from "../engine.js";
import { getStateId } from "../stateHelpers.js";

const actions = {
  activate,
  propagate,
  block,
  sync,
};

export default function executeRule(rule, signal, run) {
  const action = actions[rule.action];

  if (!action) {
    console.log(`Unknown Rule Action: ${rule.action}`);
    return;
  }

  return action(signal, run);
}

// ====================================================
// ACTIVATE
// ====================================================

function activate(signal, run) {
  const agent = run.agents.find(
    (a) => a.id === signal.targetAgentId,
  );

  if (!agent) return;

  agent.stateId = getStateId("active");
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

function propagate(signal, run) {

  if (signal.blocked) return;

  const sourceAgent = run.agents.find(
    (a) => a.id === signal.targetAgentId,
  );

  if (!sourceAgent) return;

  if (!sourceAgent.neighborhoodIds?.length) return;

  for (const neighborhoodId of sourceAgent.neighborhoodIds) {

    const neighborhood = run.neighborhoods.find(
      (n) => n.id === neighborhoodId,
    );

    if (!neighborhood) continue;

    for (const neighborId of neighborhood.agentIds) {

      // ---------------------------------------
      // Skip invalid targets
      // ---------------------------------------

      if (neighborId === sourceAgent.id) continue;

      if (neighborId === signal.sourceAgentId) continue;

      if (signal.visitedAgents.includes(neighborId)) continue;

      const alreadyQueued = run.signals.some(
        (s) =>
          s.parentSignalId === (signal.parentSignalId || signal.id) &&
          s.targetAgentId === neighborId,
      );

      if (alreadyQueued) continue;

      // ---------------------------------------
      // Create propagated signal
      // ---------------------------------------

      const propagatedSignal = {

        id: randomUUID(),

        experimentRunId: run.id,

        type: signal.type,

        parentSignalId: signal.parentSignalId || signal.id,

        sourceAgentId: sourceAgent.id,

        targetAgentId: neighborId,

        payload: structuredClone(signal.payload),

        properties: {
          ...signal.properties,
          hopCount: (signal.properties?.hopCount ?? 0) + 1,
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

      processSignal(propagatedSignal, run);
    }
  }
}
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

  for (const agentId of neighborhood.agentIds) {

    const agent = run.agents.find(
      (a) => a.id === agentId,
    );

    if (!agent) continue;

    agent.stateId = getStateId("synchronized");
  }
}