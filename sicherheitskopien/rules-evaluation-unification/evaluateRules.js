import executeRule from "./executeRule.js";

export default function evaluateRules(
  signal,
  run,
  neighborhoodData,
) {
  const triggeredRules = [];

  const ruleset = run.rulesets?.find((r) => r.active);

  if (!ruleset?.rules?.length) {
    return {
      triggeredRules: [],
      blocked: false,
    };
  }

  const targetAgent = run.agents.find(
    (agent) => agent.id === signal.targetAgentId,
  );

  if (!targetAgent) {
    return {
      triggeredRules: [],
      blocked: false,
    };
  }

  for (const rule of ruleset.rules) {
    if (!rule.enabled) continue;

    if (rule.trigger?.type === "state_changed") continue;

    if (rule.signalType !== signal.type) continue;

    // ----------------------------------------
    // RULE SCOPE
    // ----------------------------------------

    const scope = rule.scope ?? "global";

    if (scope === "global") {
      // Regel gilt für alle Agents.
    }

    else if (scope === "agent") {
      if (rule.agentId !== targetAgent.id) {
        continue;
      }
    }

    else if (scope === "neighborhood") {
      if (
        rule.neighborhoodId !==
        targetAgent.neighborhoodId
      ) {
        continue;
      }
    }

    else {
      // Unbekannter Scope
      continue;
    }

    // ----------------------------------------
    // THRESHOLD
    // ----------------------------------------

    if (
      rule.threshold !== undefined &&
      rule.threshold !== null &&
      (signal.payload?.strength ?? 0) < rule.threshold
    ) {
      continue;
    }

    // ----------------------------------------
    // MINIMUM ACTIVE NEIGHBORS
    // ----------------------------------------

    if (
      rule.minimumActiveNeighbors !== undefined &&
      rule.minimumActiveNeighbors !== null &&
      neighborhoodData &&
      neighborhoodData.activeAgents <
        rule.minimumActiveNeighbors
    ) {
      continue;
    }

    // ----------------------------------------
    // EXECUTE RULE
    // ----------------------------------------

    const executed = executeRule(
      rule,
      signal,
      run,
    );

    if (executed) {
      triggeredRules.push(rule.id);
    }

    if (signal.blocked) {
      break;
    }
  }

  return {
    triggeredRules,
    blocked: signal.blocked,
  };
}