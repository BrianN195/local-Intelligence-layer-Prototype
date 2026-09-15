import { getStateId } from "../stateHelpers.js";

export default function agentAutonomy(agent, neighborhoodData, run) {
  if (!agent || !neighborhoodData || !run) return null;

  const activeStateId = getStateId("active");
  const inactiveStateId = getStateId("inactive");
  const waitingStateId = getStateId("waiting");
  const listeningStateId = getStateId("listening");

  const activeNeighbors =
    neighborhoodData.activeLocalNeighbors ?? 0;

  const localNeighbors =
    neighborhoodData.localNeighbors ?? [];

  const localNeighborCount =
    neighborhoodData.localNeighborCount ?? 0;

  const listeningNeighbors = localNeighbors.filter(
    (neighborId) => {
      const neighbor = run.agents.find(
        (a) => a.id === neighborId,
      );

      return neighbor?.stateId === listeningStateId;
    },
  ).length;

  // ===================================
  // LISTENING + ACTIVE + LISTENING
  // ===================================

  if (
    agent.stateId === listeningStateId &&
    activeNeighbors >= 1 &&
    listeningNeighbors >= 1
  ) {
    return {
      action: "activate",
      reason: "active_and_listening_neighbors",
    };
  }

  // ===================================
  // 2+ ACTIVE NEIGHBORS
  // ===================================

  if (
    (agent.stateId === inactiveStateId ||
      agent.stateId === waitingStateId ||
      agent.stateId === listeningStateId) &&
    activeNeighbors >= 2
  ) {
    return {
      action: "activate",
      reason: "high_local_activity",
    };
  }

  // ===================================
  // 1 ACTIVE NEIGHBOR
  // ===================================

  if (
    (agent.stateId === inactiveStateId ||
      agent.stateId === waitingStateId) &&
    activeNeighbors === 1
  ) {
    return {
      action: "listen",
      reason: "single_active_neighbor",
    };
  }

  // ===================================
  // LISTENING WITHOUT ACTIVE ACTIVITY
  // ===================================

  if (
    agent.stateId === listeningStateId &&
    activeNeighbors === 0
  ) {
    return {
      action: "wait",
      reason: "no_active_activity",
    };
  }

  // ===================================
  // NO LOCAL ACTIVITY
  // ===================================

  if (
    activeNeighbors === 0 &&
    localNeighborCount > 0
  ) {
    return {
      action: "idle",
      reason: "no_local_activity",
    };
  }

  return {
    action: "observe",
    reason: "moderate_local_activity",
  };
}