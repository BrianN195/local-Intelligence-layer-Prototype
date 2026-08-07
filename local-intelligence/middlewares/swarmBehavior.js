import { getStateId } from "../stateHelpers.js";

export default function swarmBehavior(
  targetAgent,
  neighborhoodData,
) {
  if (!targetAgent || !neighborhoodData) {
    return;
  }

  // Mehrheit aktiv
  if (neighborhoodData.activeRatio >= 0.7) {
    targetAgent.stateId = getStateId("active");
    return;
  }

  // Mehrheit synchronisiert
  if (neighborhoodData.synchronizedRatio >= 0.8) {
    targetAgent.stateId = getStateId("synchronized");
    return;
  }

  // Mehrheit inaktiv
  if (neighborhoodData.inactiveRatio >= 0.8) {
    targetAgent.stateId = getStateId("inactive");
  }
}