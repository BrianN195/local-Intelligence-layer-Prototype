import { getStateId } from "../stateHelpers.js";



export default function agentAutonomy(agent, neighborhoodData) {
  if (!agent || !neighborhoodData) {
    return null;
  }

  const activeNeighbors =
    neighborhoodData.activeAgents ?? 0;

  const totalNeighbors =
    neighborhoodData.agentCount ?? 0;

  // ----------------------------------------
  // HIGH LOCAL ACTIVITY
  // ----------------------------------------

  if (activeNeighbors >= 3) {
    return {
      action: "activate",
      reason: "high_local_activity",
    };
  }

  // ----------------------------------------
  // NO LOCAL ACTIVITY
  // ----------------------------------------

  if (activeNeighbors === 0) {
    return {
      action: "idle",
      reason: "no_local_activity",
    };
  }

  // ----------------------------------------
  // MODERATE LOCAL ACTIVITY
  // ----------------------------------------

  return {
    action: "observe",
    reason: "moderate_local_activity",
  };
}