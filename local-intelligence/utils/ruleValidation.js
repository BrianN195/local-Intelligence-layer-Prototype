import { RULE_ACTIONS } from "../constants/actions.js";
import { RULE_TRIGGER_TYPES } from "../constants/triggers.js";
import { STATE_NAMES } from "../constants/statuses.js";

export function validateRuleScope(rule) {
  const scope = rule.scope ?? "global";

  if (
    scope !== "global" &&
    scope !== "agent" &&
    scope !== "neighborhood"
  ) {
    return {
      valid: false,
      error:
        "scope must be global, agent, or neighborhood.",
    };
  }

  if (
    scope === "agent" &&
    !rule.agentId
  ) {
    return {
      valid: false,
      error:
        "agentId is required for agent-scoped rules.",
    };
  }

  if (
    scope === "neighborhood" &&
    !rule.neighborhoodId
  ) {
    return {
      valid: false,
      error:
        "neighborhoodId is required for neighborhood-scoped rules.",
    };
  }

  if (rule.trigger) {
    if (rule.trigger.type !== RULE_TRIGGER_TYPES.STATE_CHANGED) {
      return {
        valid: false,
        error: "trigger.type must be state_changed.",
      };
    }

    const validStates = Object.values(STATE_NAMES);

    if (
      rule.trigger.fromState &&
      !validStates.includes(rule.trigger.fromState)
    ) {
      return {
        valid: false,
        error: "trigger.fromState is not a valid state.",
      };
    }

    if (
      rule.trigger.toState &&
      !validStates.includes(rule.trigger.toState)
    ) {
      return {
        valid: false,
        error: "trigger.toState is not a valid state.",
      };
    }

    if (rule.action !== RULE_ACTIONS.SEND_SIGNAL) {
      return {
        valid: false,
        error: "state_changed rules must use the send_signal action.",
      };
    }

    const appendedSignal = rule.appendedSignal;
    const delayMs = Number(appendedSignal?.delayMs);

    if (
      !appendedSignal ||
      !appendedSignal.targetAgentId ||
      !appendedSignal.signalType ||
      !Number.isFinite(delayMs) ||
      delayMs < 0
    ) {
      return {
        valid: false,
        error:
          "appendedSignal requires targetAgentId, signalType, and a non-negative delayMs.",
      };
    }
  }

  if (rule.action === RULE_ACTIONS.SEND_SIGNAL && !rule.trigger) {
    return {
      valid: false,
      error: "send_signal rules require a trigger.",
    };
  }

  return {
    valid: true,
  };
}