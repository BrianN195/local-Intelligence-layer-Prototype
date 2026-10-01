import { getStateId } from "../../stateHelpers.js";
import { STATE_NAMES } from "../../constants/statuses.js";
import { AUTONOMY_ACTIONS } from "../../constants/actions.js";

export default function agentAutonomy(agent, neighborhoodData, run) {
  if (!agent || !neighborhoodData || !run) return null;

  const activeStateId = getStateId(STATE_NAMES.ACTIVE);
  const inactiveStateId = getStateId(STATE_NAMES.INACTIVE);
  const waitingStateId = getStateId(STATE_NAMES.WAITING);
  const listeningStateId = getStateId(STATE_NAMES.LISTENING);

  const activeNeighbors = neighborhoodData.activeLocalNeighbors ?? 0;

  const localNeighbors = neighborhoodData.localNeighbors ?? [];

  const localNeighborCount = neighborhoodData.localNeighborCount ?? 0;

  const listeningNeighbors = localNeighbors.filter((neighborId) => {
    const neighbor = run.agents.find((a) => a.id === neighborId);

    return neighbor?.stateId === listeningStateId;
  }).length;

  // ===================================
  // LISTENING + ACTIVE + LISTENING
  // ===================================

  if (
    agent.stateId === listeningStateId &&
    activeNeighbors >= 1 &&
    listeningNeighbors >= 1
  ) {
    return {
      action: AUTONOMY_ACTIONS.ACTIVATE,
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
      action: AUTONOMY_ACTIONS.ACTIVATE,
      reason: "high_local_activity",
    };
  }

  // ===================================
  // 1 ACTIVE NEIGHBOR
  // ===================================

  if (
    (agent.stateId === inactiveStateId || agent.stateId === waitingStateId) &&
    activeNeighbors === 1
  ) {
    return {
      action: AUTONOMY_ACTIONS.LISTEN,
      reason: "single_active_neighbor",
    };
  }

  // ===================================
  // LISTENING WITHOUT ACTIVE ACTIVITY
  // ===================================

  if (agent.stateId === listeningStateId && activeNeighbors === 0) {
    return {
      action: AUTONOMY_ACTIONS.WAIT,
      reason: "no_active_activity",
    };
  }
  // ===================================
  // LISTENING NEIGHBORS WITHOUT ACTIVE ACTIVITY
  // ===================================
  if (
    (agent.stateId === inactiveStateId || agent.stateId === waitingStateId) &&
    activeNeighbors === 0 &&
    listeningNeighbors >= 1
  ) {
    return {
      action: AUTONOMY_ACTIONS.WAIT,
      reason: "listening_neighbors_without_active_activity",
    };
  }
  // ===================================
  // NO LOCAL ACTIVITY
  // ===================================

  if (activeNeighbors === 0 && localNeighborCount > 0) {
    return {
      action: AUTONOMY_ACTIONS.IDLE,
      reason: "no_local_activity",
    };
  }

  return {
    action: AUTONOMY_ACTIONS.OBSERVE,
    reason: "moderate_local_activity",
  };
}
