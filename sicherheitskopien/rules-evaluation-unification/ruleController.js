import { randomUUID } from "crypto";
import executeRule from "../domain/rules/executeRule.js";
import {
  findExperimentRunById,
  getExperimentRuns,
} from "../repositories/experimentRunRepository.js";
import { findActiveRuleset } from "../repositories/rulesetRepository.js";
import {
  addRule,
  findRuleById,
  removeRuleById,
} from "../repositories/ruleRepository.js";
import { validateRuleScope } from "../utils/ruleValidation.js";

export function evaluateRules(req, res) {
  const { experimentRunId, signal } = req.body;

  const run = findExperimentRunById(
    experimentRunId,
  );

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  if (
    !run.rulesets ||
    run.rulesets.length === 0
  ) {
    return res.status(404).json({
      error: "No RuleSet assigned",
    });
  }

  const ruleset = findActiveRuleset(run);

  if (!ruleset) {
    return res.status(404).json({
      error: "No active RuleSet",
    });
  }

  const targetAgent = run.agents.find(
    (agent) => agent.id === signal.targetAgentId,
  );

  if (!targetAgent) {
    return res.status(404).json({
      error: "Signal target agent not found",
    });
  }

  const triggeredRules = [];

  for (const rule of ruleset.rules) {
    if (rule.signalType !== signal.type) {
      continue;
    }

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
      continue;
    }

    // ----------------------------------------
    // THRESHOLD
    // ----------------------------------------

    if (
      rule.threshold !== undefined &&
      rule.threshold !== null &&
      (signal.payload?.strength ?? 0) <
        rule.threshold
    ) {
      continue;
    }

    triggeredRules.push(rule);

    executeRule(
      rule,
      signal,
      run,
    );
  }

  return res.json({
    signal,
    triggeredRules,
  });
}

export function createRule(req, res) {
  const { experimentRunId, rule } = req.body;
  const run = findExperimentRunById(experimentRunId);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }
  const validation = validateRuleScope(rule);

  if (!validation.valid) {
    return res.status(400).json({
      error: validation.error,
    });
  }
  const ruleset = findActiveRuleset(run);

  if (!ruleset) {
    return res.status(404).json({ error: "No active RuleSet" });
  }

  const newRule = {
    id: randomUUID(),

    enabled: true,

    type: rule.type,

    // Regel-Scope
    scope: rule.scope ?? "global",

    // Nur bei agent-/neighborhood-Regeln relevant
    agentId: rule.agentId ?? null,

    neighborhoodId: rule.neighborhoodId ?? null,

    signalType: rule.signalType,

    action: rule.action,

    threshold: rule.threshold ?? null,

    minimumActiveNeighbors: rule.minimumActiveNeighbors ?? null,
    trigger: rule.trigger ?? null,
    appendedSignal: rule.appendedSignal ?? null,
  };

  addRule(ruleset, newRule);
  res.status(201).json(newRule);
}

export function getRules(req, res) {
  const run = findExperimentRunById(req.params.experimentRunId);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  const ruleset = findActiveRuleset(run);

  if (!ruleset) {
    return res.status(404).json({ error: "No active RuleSet" });
  }

  res.json(ruleset.rules);
}

export function updateRule(req, res) {
  for (const run of getExperimentRuns()) {
    for (const ruleset of run.rulesets) {
      const rule = findRuleById(ruleset, req.params.id);

      if (!rule) continue;

      rule.type = req.body.type ?? rule.type;

      rule.signalType = req.body.signalType ?? rule.signalType;

      rule.action = req.body.action ?? rule.action;

      rule.threshold = req.body.threshold ?? rule.threshold;

      rule.minimumActiveNeighbors =
        req.body.minimumActiveNeighbors ?? rule.minimumActiveNeighbors;

      // ----------------------------------------
      // RULE SCOPE
      // ----------------------------------------

      if (req.body.scope !== undefined) {
        rule.scope = req.body.scope;
      }

      if (req.body.agentId !== undefined) {
        rule.agentId = req.body.agentId;
      }

      if (req.body.neighborhoodId !== undefined) {
        rule.neighborhoodId = req.body.neighborhoodId;
      }

      if (req.body.trigger !== undefined) {
        rule.trigger = req.body.trigger;
      }

      if (req.body.appendedSignal !== undefined) {
        rule.appendedSignal = req.body.appendedSignal;
      }

      // ----------------------------------------
      // SCOPE CLEANUP
      // ----------------------------------------

      const scope = rule.scope ?? "global";

      if (scope === "global") {
        rule.agentId = null;
        rule.neighborhoodId = null;
      }

      if (scope === "agent") {
        rule.neighborhoodId = null;
      }

      if (scope === "neighborhood") {
        rule.agentId = null;
      }

      // ----------------------------------------
      // VALIDATE
      // ----------------------------------------

      const validation = validateRuleScope(rule);

      if (!validation.valid) {
        return res.status(400).json({
          error: validation.error,
        });
      }

      return res.json(rule);
    }
  }

  res.status(404).json({
    error: "Rule not found",
  });
}

export function deleteRule(req, res) {
  for (const run of getExperimentRuns()) {
    for (const ruleset of run.rulesets) {
      const removed = removeRuleById(ruleset, req.params.id);

      if (removed) return res.json(removed);
    }
  }

  res.status(404).json({ error: "Rule not found" });
}

export function setRuleEnabled(req, res) {
  for (const run of getExperimentRuns()) {
    for (const ruleset of run.rulesets) {
      const rule = findRuleById(ruleset, req.params.id);

      if (!rule) continue;

      rule.enabled = req.body.enabled;
      return res.json(rule);
    }
  }

  res.status(404).json({ error: "Rule not found" });
}
