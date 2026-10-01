import { randomUUID } from "crypto";
import { findExperimentRunById } from "../repositories/experimentRunRepository.js";
import {
  addRuleset,
  deactivateRulesets,
} from "../repositories/rulesetRepository.js";

export function createRuleset(req, res) {
  const run = findExperimentRunById(req.body.experimentRunId);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  const rules = (req.body.rules ?? []).map((rule) => ({
  ...rule,

  scope: rule.scope ?? "global",

  agentId: rule.agentId ?? null,

  neighborhoodId:
    rule.neighborhoodId ?? null,
}));

  const ruleset = {
    id: randomUUID(),
    name: req.body.name || "Default RuleSet",
    experimentRunId: run.id,
    rules,
    active: req.body.active ?? true,
    createdAt: new Date().toISOString(),
    activatedAt: new Date().toISOString(),
    deactivatedAt: null,
    version: req.body.version || "v1",
    metadata: {},
  };

  deactivateRulesets(run, new Date().toISOString());

  addRuleset(run, ruleset);

  res.status(201).json(ruleset);
}