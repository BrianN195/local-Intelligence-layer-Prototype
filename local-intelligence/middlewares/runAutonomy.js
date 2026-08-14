import analyzeNeighborhood from "./analyzeNeighborhood.js";
import agentAutonomy from "./agentAutonomy.js";
import executeAutonomousAction from "./executeAutonomousAction.js";

export default function runAutonomy(run) {
  const decisions = [];

  for (const agent of run.agents) {
    if (!agent.neighborhoodId) {
      continue;
    }

    const neighborhoodData = analyzeNeighborhood(
      run,
      agent.id,
    );

    const decision = agentAutonomy(
      agent,
      neighborhoodData,
    );

    if (!decision) {
      continue;
    }

    const stateChanged = executeAutonomousAction(
      agent,
      decision,
      run,
    );

    decisions.push({
      agentId: agent.id,
      action: decision.action,
      reason: decision.reason,
      stateChanged,
    });
  }

  return decisions;
}