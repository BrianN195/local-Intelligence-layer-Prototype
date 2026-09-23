export function getRules(ruleset) {
  return ruleset?.rules ?? [];
}

export function findRuleById(ruleset, ruleId) {
  return getRules(ruleset).find((rule) => rule.id === ruleId);
}

export function addRule(ruleset, rule) {
  ruleset.rules.push(rule);
  return rule;
}

export function removeRuleById(ruleset, ruleId) {
  const index = getRules(ruleset).findIndex((rule) => rule.id === ruleId);

  if (index === -1) {
    return null;
  }

  return ruleset.rules.splice(index, 1)[0];
}
