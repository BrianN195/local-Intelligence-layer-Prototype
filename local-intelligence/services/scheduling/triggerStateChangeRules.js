import { getStateName } from "../../stateHelpers.js";
import { getStateId } from "../../stateHelpers.js";
import { RULE_ACTIONS } from "../../constants/actions.js";
import { RULE_TRIGGER_TYPES } from "../../constants/triggers.js";
import { STATE_NAMES } from "../../constants/statuses.js";
import { scheduleAppendedSignal } from "./scheduleAppendedSignal.js";

function getNeighborhoodById(run, neighborhoodId) {
  return run.neighborhoods.find(
    (neighborhood) => neighborhood.id === neighborhoodId,
  );
}

function matchesNeighborhoodTrigger(
  run,
  rule,
  neighborhood,
  previousState,
  newState,
  changedAgent,
) {
  const trigger = rule.trigger;

  if (!trigger || !neighborhood) {
    return false;
  }

  const activeStateId = getStateId(STATE_NAMES.ACTIVE);
  const inactiveStateId = getStateId(STATE_NAMES.INACTIVE);

  const agents = neighborhood.agentIds
    .map((id) => run.agents.find((agent) => agent.id === id))
    .filter(Boolean);

  if (agents.length === 0) {
    return false;
  }

  // -----------------------------------------
  // ALL ACTIVE
  // -----------------------------------------

  if (trigger.type === RULE_TRIGGER_TYPES.NEIGHBORHOOD_ALL_ACTIVE) {
    if (rule.scope === "neighborhood") {
      if (rule.neighborhoodId !== neighborhood.id) {
        return false;
      }
    }

    // Prüfen, ob die Neighborhood VOR der State-Änderung
    // noch nicht komplett active war.
    const wasFullyActive = agents.every((agent) => {
      if (agent.id === changedAgent.id) {
        return previousState === activeStateId;
      }

      return agent.stateId === activeStateId;
    });

    // Danach muss sie komplett active sein.
    const isFullyActive = agents.every((agent) => {
      if (agent.id === changedAgent.id) {
        return newState === activeStateId;
      }

      return agent.stateId === activeStateId;
    });

    return !wasFullyActive && isFullyActive;
  }

  // -----------------------------------------
  // ALL INACTIVE
  // -----------------------------------------

  if (trigger.type === RULE_TRIGGER_TYPES.NEIGHBORHOOD_ALL_INACTIVE) {
    if (rule.scope === "neighborhood") {
      if (rule.neighborhoodId !== neighborhood.id) {
        return false;
      }
    }

    const wasFullyInactive = agents.every((agent) => {
      if (agent.id === changedAgent.id) {
        return previousState === inactiveStateId;
      }

      return agent.stateId === inactiveStateId;
    });

    const isFullyInactive = agents.every((agent) => {
      if (agent.id === changedAgent.id) {
        return newState === inactiveStateId;
      }

      return agent.stateId === inactiveStateId;
    });

    return !wasFullyInactive && isFullyInactive;
  }

  return false;
}

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

  const neighborhood = getNeighborhoodById(
    run,
    agent.neighborhoodId,
  );

  for (const rule of ruleset.rules ?? []) {
    if (!rule.enabled) continue;

    const trigger = rule.trigger;

    if (!trigger) continue;

    // ==================================================
    // NORMAL STATE CHANGE
    // ==================================================

    if (trigger.type === RULE_TRIGGER_TYPES.STATE_CHANGED) {
      if (trigger.fromState && trigger.fromState !== fromState) {
        continue;
      }

      if (trigger.toState && trigger.toState !== toState) {
        continue;
      }

      const scope = rule.scope ?? "global";

      if (scope === "agent" && rule.agentId !== agent.id) {
        continue;
      }

      if (
        scope === "neighborhood" &&
        rule.neighborhoodId !== agent.neighborhoodId
      ) {
        continue;
      }

      if (!["global", "agent", "neighborhood"].includes(scope)) {
        continue;
      }

      if (rule.action !== RULE_ACTIONS.SEND_SIGNAL) {
        continue;
      }

      const scheduledAction = scheduleAppendedSignal(
        run,
        rule,
        agent.id,
        rule.appendedSignal,
      );

      if (scheduledAction) {
        scheduledActions.push(scheduledAction);
      }

      continue;
    }

    // ==================================================
    // NEIGHBORHOOD STATE TRIGGER
    // ==================================================

    if (
      trigger.type === RULE_TRIGGER_TYPES.NEIGHBORHOOD_ALL_ACTIVE ||
      trigger.type === RULE_TRIGGER_TYPES.NEIGHBORHOOD_ALL_INACTIVE
    ) {
      if (
        !matchesNeighborhoodTrigger(
          run,
          rule,
          neighborhood,
          previousState,
          newState,
          agent,
        )
      ) {
        continue;
      }

      if (rule.action !== RULE_ACTIONS.SEND_SIGNAL) {
        continue;
      }

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
  }

  return scheduledActions;
}
