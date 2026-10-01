import analyzeCollectiveIntelligence from "./collectiveIntelligence.js";
import detectEmergentBehavior from "./detectEmergentBehavior.js";
import analyzeRuleAdaptation from "./selfOrganizingRules.js";

export function analyzeCollectiveState(run) {
  const collectiveIntelligence =
    analyzeCollectiveIntelligence(run);

  const emergentBehavior =
    detectEmergentBehavior(run);

  const ruleAdaptation =
    analyzeRuleAdaptation(
      run,
      emergentBehavior,
    );

  return {
    collectiveIntelligence,
    emergentBehavior,
    ruleAdaptation,
  };
}