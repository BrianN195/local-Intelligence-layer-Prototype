import { getStateId } from "../stateHelpers.js";
import { logState } from "./loggingFunc.js";

export default function executeAutonomousAction(
  agent,
  decision,
  run,
) {
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

    case "idle":
        break;
    case "observe":
      // No state change for now.
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

  return true;
}