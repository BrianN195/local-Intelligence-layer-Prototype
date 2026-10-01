import { RULE_ACTIONS } from "../../constants/actions.js";

export function scheduleAppendedSignal(
  run,
  rule,
  sourceAgentId,
  appendedSignal,
) {
  if (!run || !rule || !appendedSignal) {
    return null;
  }

  const delayMs = Number(appendedSignal.delayMs ?? 0);

  if (!Number.isFinite(delayMs) || delayMs < 0) {
    return null;
  }

  if (!run.scheduledActions) {
    run.scheduledActions = [];
  }

  const scheduledAction = {
    id: `${run.id}-${Date.now()}-${run.scheduledActions.length + 1}`,
    experimentRunId: run.id,
    ruleId: rule.id,
    action: RULE_ACTIONS.SEND_SIGNAL,
    sourceAgentId,
    targetAgentId: appendedSignal.targetAgentId,
    signalType: appendedSignal.signalType,
    signalPayload: appendedSignal.signalPayload ?? {},
    signalProperties: appendedSignal.signalProperties ?? {},
    executeAt: new Date(Date.now() + delayMs).toISOString(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  run.scheduledActions.push(scheduledAction);
  return scheduledAction;
}