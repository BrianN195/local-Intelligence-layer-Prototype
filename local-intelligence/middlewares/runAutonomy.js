import analyzeNeighborhood from "./analyzeNeighborhood.js";
import agentAutonomy from "./agentAutonomy.js";
import executeAutonomousAction from "./executeAutonomousAction.js";
import { randomUUID } from "crypto";

export default function runAutonomy(run) {
  const decisions = [];

  for (const agent of run.agents) {
    if (!agent.neighborhoodId) {
      continue;
    }

    if (agent.status !== "online") {
      continue;
    }

    if (agent.stateId === 6) {
      continue;
    }

    const neighborhoodData = analyzeNeighborhood(run, agent.id);

    if (!neighborhoodData) {
      continue;
    }

    const decision = agentAutonomy(
      agent,
      neighborhoodData,
      run
    );

    if (!decision) {
      continue;
    }

    const previousState = agent.stateId;

    run.observations.push({
      id: randomUUID(),

      experimentRunId: run.id,

      agentId: agent.id,

      type: "autonomous_decision",

      action: decision.action,

      reason: decision.reason,

      neighborhoodId: neighborhoodData.neighborhoodId,

      activeLocalNeighbors:
        neighborhoodData.activeLocalNeighbors ?? 0,

      localNeighborCount:
        neighborhoodData.localNeighborCount ?? 0,

      previousState,

      timestamp: new Date().toISOString(),
    });

    const stateChanged = executeAutonomousAction(
      agent,
      decision,
      run,
    );

    const newState = agent.stateId;

    decisions.push({
      agentId: agent.id,
      action: decision.action,
      reason: decision.reason,
      previousState,
      newState,
      stateChanged,
    });
  }

  return decisions;
}