import runAutonomy from "../autonomy/runAutonomy.js";
import analyzeSignals from "../analysis/analyzeSignals.js";
import { getStateId } from "../../stateHelpers.js";
import { analyzeCollectiveState } from "../analysis/analyzeCollectiveState.js";
import { AUTONOMY_ACTIONS } from "../../constants/actions.js";
import { STATE_NAMES } from "../../constants/statuses.js";
import processScheduledActions from "../scheduling/processScheduledActions.js";

export default function simulationTick(run) {
  if (!run) return null;

  // ====================================================
  // PHASE 1: AUTONOMY
  // ====================================================

  const autonomyDecisions = runAutonomy(run);
  const collectiveState = analyzeCollectiveState(run);

  const activated = autonomyDecisions.filter(
    (decision) => decision.action === AUTONOMY_ACTIONS.ACTIVATE,
  ).length;

  const observed = autonomyDecisions.filter(
    (decision) => decision.action === AUTONOMY_ACTIONS.OBSERVE,
  ).length;

  const idle = autonomyDecisions.filter(
    (decision) => decision.action === AUTONOMY_ACTIONS.IDLE,
  ).length;

  const stateChanges = autonomyDecisions.filter(
    (decision) => decision.stateChanged === true,
  ).length;

  // ====================================================
  // PHASE 2: SIGNALS
  // ====================================================

  const signalStatistics = analyzeSignals(run);
  const scheduledActions = processScheduledActions(run);

  // ====================================================
  // PHASE 3: TICK RESULT
  // ====================================================

  // ====================================================
  // STATE STATISTICS
  // ====================================================

  const activeStateId = getStateId(STATE_NAMES.ACTIVE);
  const inactiveStateId = getStateId(STATE_NAMES.INACTIVE);
  const synchronizedStateId = getStateId(STATE_NAMES.SYNCHRONIZED);

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
    scheduledActions,
    states: stateStatistics,
    timestamp: new Date().toISOString(),
  };
}
