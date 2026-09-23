import { getStateId } from "../../stateHelpers.js";
import { logState } from "../logging/runLogger.js";
import analyzeNeighborhood from "../analysis/analyzeNeighborhood.js";
import createSignal from "../../createSignal.js";
import { AUTONOMY_ACTIONS } from "../../constants/actions.js";
import { STATE_NAMES } from "../../constants/statuses.js";
import { PROPAGATION_MODES, PROPAGATION_SCOPES } from "../../constants/propagation.js";
import triggerStateChangeRules from "../scheduling/triggerStateChangeRules.js";

export default function executeAutonomousAction(agent, decision, run) {
  if (!agent || !decision) {
    return false;
  }

  const previousState = agent.stateId;

  switch (decision.action) {
    case AUTONOMY_ACTIONS.ACTIVATE: {
      const activeStateId = getStateId(STATE_NAMES.ACTIVE);

      if (agent.stateId === activeStateId) {
        return false;
      }

      agent.stateId = activeStateId;
      triggerStateChangeRules(run, agent, previousState, agent.stateId);
      break;
    }

    case AUTONOMY_ACTIONS.LISTEN: {
      const listeningStateId = getStateId(STATE_NAMES.LISTENING);

      if (agent.stateId === listeningStateId) {
        return false;
      }

      agent.stateId = listeningStateId;
      triggerStateChangeRules(run, agent, previousState, agent.stateId);
      break;
    }

    case AUTONOMY_ACTIONS.WAIT: {
      const waitingStateId = getStateId(STATE_NAMES.WAITING);

      if (agent.stateId === waitingStateId) {
        return false;
      }

      agent.stateId = waitingStateId;
      triggerStateChangeRules(run, agent, previousState, agent.stateId);
      break;
    }

    case AUTONOMY_ACTIONS.IDLE:
      break;

    case AUTONOMY_ACTIONS.OBSERVE:
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

  if (decision.action === AUTONOMY_ACTIONS.ACTIVATE) {
    const neighborhoodData = analyzeNeighborhood(run, agent.id);

    if (neighborhoodData?.localNeighbors?.length) {
      const inactiveStateId = getStateId(STATE_NAMES.INACTIVE);

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
          propagationMode: PROPAGATION_MODES.BROADCAST,
          propagationScope: PROPAGATION_SCOPES.NEIGHBORHOOD,
        },
      });
    }
  }

  return true;
}