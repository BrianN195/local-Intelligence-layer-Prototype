import executeRule from "./executeRule.js";

export default function evaluateRules(signal, run, neighborhoodData) {
  const triggeredRules = [];

  const ruleset = run.rulesets?.find((r) => r.active);

  if (!ruleset?.rules?.length) {
    return {
      triggeredRules: [],
      blocked: false,
    };
  }

  // Wichtig:
  // Rules werden in ihrer definierten Reihenfolge ausgeführt.
  // Deshalb sollte activate vor propagate stehen.
  for (const rule of ruleset.rules) {
    if (!rule.enabled) continue;

    if (rule.signalType !== signal.type) continue;

    if (
      rule.threshold !== undefined &&
      (signal.payload?.strength ?? 0) < rule.threshold
    ) {
      continue;
    }

    if (
      rule.minimumActiveNeighbors !== undefined &&
      neighborhoodData &&
      neighborhoodData.activeAgents < rule.minimumActiveNeighbors
    ) {
      continue;
    }

    const executed = executeRule(rule, signal, run);

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