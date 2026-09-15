import { getStateId } from "../stateHelpers.js";
import { logState } from "./loggingFunc.js";
import analyzeNeighborhood from "./analyzeNeighborhood.js";
import createSignal from "../createSignal.js";

export default function executeAutonomousAction(agent, decision, run) {
  if (!agent || !decision) {
    return false;
  }

  const previousState = agent.stateId;

  switch (decision.action) {
    case "activate": {
      const activeStateId = getStateId("active");

      if (agent.stateId === activeStateId) {
        return false;
      }

      agent.stateId = activeStateId;
      break;
    }

    case "listen": {
      const listeningStateId = getStateId("listening");

      if (agent.stateId === listeningStateId) {
        return false;
      }

      agent.stateId = listeningStateId;
      break;
    }

    case "wait": {
      const waitingStateId = getStateId("waiting");

      if (agent.stateId === waitingStateId) {
        return false;
      }

      agent.stateId = waitingStateId;
      break;
    }

    case "idle":
      break;

    case "observe":
      return false;

    default:
      return false;
  }

  if (previousState === agent.stateId) {
    return false;
  }

  logState(
    run,
    agent.id,
    previousState,
    agent.stateId,
    null,
    [],
    `autonomous_${decision.action}`,
  );

  // =========================================
  // AUTONOMOUS SIGNAL
  // =========================================

  if (decision.action === "activate") {
    const neighborhoodData = analyzeNeighborhood(run, agent.id);

    if (neighborhoodData?.localNeighbors?.length) {
      const inactiveStateId = getStateId("inactive");

      const inactiveNeighborId =
        neighborhoodData.localNeighbors.find((neighborId) => {
          const neighbor = run.agents.find(
            (a) => a.id === neighborId,
          );

          return (
            neighbor &&
            neighbor.stateId === inactiveStateId
          );
        });

      if (!inactiveNeighborId) {
        return true;
      }

      createSignal(run, {
        type: "autonomous_activation",
        sourceAgentId: agent.id,
        targetAgentId: inactiveNeighborId,
        payload: {
          strength: 1,
          reason: decision.reason,
        },
        properties: {
          ttl: 5,
          propagationMode: "broadcast",
          propagationScope: "neighborhood",
        },
      });
    }
  }

  return true;
}