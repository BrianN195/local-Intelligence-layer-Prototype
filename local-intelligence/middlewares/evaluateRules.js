import executeRule from "./executeRule.js";

export default function evaluateRules(signal, run, neighborhoodData) {
  let triggeredRule = null;

  const ruleset = run.rulesets?.find((r) => r.active);

  if (!ruleset?.rules?.length) {
    return {
      triggeredRule: null,
      blocked: false,
    };
  }

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

    triggeredRule = rule.id;

    executeRule(rule, signal, run);

    if (signal.blocked) {
      break;
    }
  }

  return {
    triggeredRule,
    blocked: signal.blocked,
  };
}
