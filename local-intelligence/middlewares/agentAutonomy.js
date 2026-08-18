import { getStateId } from "../stateHelpers.js";



export default function agentAutonomy(
  agent,
  neighborhoodData,
) {
  if (!agent || !neighborhoodData) {
    return null;
  }

  const activeNeighbors =
    neighborhoodData.activeLocalNeighbors ?? 0;

  const localNeighborCount =
    neighborhoodData.localNeighborCount ?? 0;

  // ----------------------------------------
  // HIGH LOCAL ACTIVITY
  // ----------------------------------------

  if (
    localNeighborCount > 0 &&
    activeNeighbors >= 2
  ) {
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