import { getStateName } from "../../stateHelpers.js";
import { RULE_ACTIONS } from "../../constants/actions.js";
import { RULE_TRIGGER_TYPES } from "../../constants/triggers.js";
import { scheduleAppendedSignal } from "./scheduleAppendedSignal.js";

export default function triggerStateChangeRules(
  run,
  agent,
  previousState,
  newState,
) {
  const ruleset = run.rulesets?.find((ruleset) => ruleset.active);

  if (!ruleset) return [];

  const fromState = getStateName(previousState);
  const toState = getStateName(newState);
  const scheduledActions = [];

  for (const rule of ruleset.rules ?? []) {
    const trigger = rule.trigger;

    if (!rule.enabled || trigger?.type !== RULE_TRIGGER_TYPES.STATE_CHANGED) {
      continue;
    }

    if (trigger.fromState && trigger.fromState !== fromState) continue;
    if (trigger.toState && trigger.toState !== toState) continue;
    if (rule.action !== RULE_ACTIONS.SEND_SIGNAL) continue;

    const scope = rule.scope ?? "global";

    if (scope === "agent" && rule.agentId !== agent.id) continue;
    if (
      scope === "neighborhood" &&
      rule.neighborhoodId !== agent.neighborhoodId
    ) {
      continue;
    }
    if (!["global", "agent", "neighborhood"].includes(scope)) continue;

    const scheduledAction = scheduleAppendedSignal(
      run,
      rule,
      agent.id,
      rule.appendedSignal,
    );

    if (scheduledAction) {
      scheduledActions.push(scheduledAction);
    }
  }

  return scheduledActions;
}
