export function getRulesets(run) {
  return run?.rulesets ?? [];
}

export function findActiveRuleset(run) {
  return getRulesets(run).find((ruleset) => ruleset.active);
}

export function addRuleset(run, ruleset) {
  run.rulesets.push(ruleset);
  run.activeRuleSetId = ruleset.id;
  return ruleset;
}

export function deactivateRulesets(run, deactivatedAt) {
  for (const ruleset of getRulesets(run)) {
    ruleset.active = false;
    ruleset.deactivatedAt = deactivatedAt;
  }
}
