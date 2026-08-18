import analyzeCollectiveIntelligence from "./collectiveIntelligence";
import detectEmergentBehavior from "./detectEmergentBehavior";
import analyzeRuleAdaptation from "./selfOrganizingRules";

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