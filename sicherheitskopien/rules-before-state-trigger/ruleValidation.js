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

  return {
    valid: true,
  };
}