import runAutonomy from "./runAutonomy.js";
import analyzeSignals from "./analyzeSignals.js";
import { getStateId } from "../stateHelpers.js";
import { analyzeCollectiveState } from "./analyzeCollectiveState.js";

export default function simulationTick(run) {
  if (!run) return null;

  // ====================================================
  // PHASE 1: AUTONOMY
  // ====================================================

  const autonomyDecisions = runAutonomy(run);
  const collectiveState = analyzeCollectiveState(run);

  const activated = autonomyDecisions.filter(
    (decision) => decision.action === "activate",
  ).length;

  const observed = autonomyDecisions.filter(
    (decision) => decision.action === "observe",
  ).length;

  const idle = autonomyDecisions.filter(
    (decision) => decision.action === "idle",
  ).length;

  const stateChanges = autonomyDecisions.filter(
    (decision) => decision.stateChanged === true,
  ).length;

  // ====================================================
  // PHASE 2: SIGNALS
  // ====================================================

  const signalStatistics = analyzeSignals(run);

  // ====================================================
  // PHASE 3: TICK RESULT
  // ====================================================

  // ====================================================
  // STATE STATISTICS
  // ====================================================

  const activeStateId = getStateId("active");
  const inactiveStateId = getStateId("inactive");
  const synchronizedStateId = getStateId("synchronized");

  const stateStatistics = {
    active: run.agents.filter((agent) => agent.stateId === activeStateId)
      .length,

    inactive: run.agents.filter((agent) => agent.stateId === inactiveStateId)
      .length,

    synchronized: run.agents.filter(
      (agent) => agent.stateId === synchronizedStateId,
    ).length,

    total: run.agents.length,
  };

  return {
    type: "simulation",

    autonomy: {
      decisions: autonomyDecisions,
      statistics: {
        decisions: autonomyDecisions.length,
        activated,
        observed,
        idle,
        stateChanges,
      },
    },
    collective: collectiveState,
    signals: signalStatistics,
    states: stateStatistics,
    timestamp: new Date().toISOString(),
  };
}
