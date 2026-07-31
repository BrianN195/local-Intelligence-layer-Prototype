import express from "express";
import { randomUUID } from "crypto";
import { store } from "../store.js";
import executeRule from "../middlewares/executeRule.js";
const router = express.Router();

/* ====================================================
   DEBUG RULE EVALUATION
==================================================== */
router.post("/rules/evaluate", (req, res) => {
  const { experimentRunId, signal } = req.body;

  const run = store.experimentRuns.find((r) => r.id === experimentRunId);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  if (!run.rulesets || run.rulesets.length === 0) {
    return res.status(404).json({
      error: "No RuleSet assigned",
    });
  }

  const ruleset = run.rulesets.find((r) => r.active);

  if (!ruleset) {
    return res.status(404).json({
      error: "No active RuleSet",
    });
  }

  const triggeredRules = [];

  for (const rule of ruleset.rules) {
    if (rule.signalType !== signal.type) continue;

    if (
      rule.threshold !== undefined &&
      signal.payload?.strength < rule.threshold
    ) {
      continue;
    }

    triggeredRules.push(rule);
    executeRule(rule, signal, run);
  }

  res.json({
    signal,
    triggeredRules,
  });
});
/* ====================================================
   ADD RULE
==================================================== */
router.post("/rules", (req, res) => {
  const { experimentRunId, rule } = req.body;

  const run = store.experimentRuns.find((r) => r.id === experimentRunId);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const ruleset = run.rulesets.find((r) => r.active);

  if (!ruleset) {
    return res.status(404).json({
      error: "No active RuleSet",
    });
  }

  const newRule = {
    id: randomUUID(),
    
    enabled: true,

    type: rule.type,

    signalType: rule.signalType,

    action: rule.action,

    threshold: rule.threshold ?? null,
  };

  ruleset.rules.push(newRule);

  res.status(201).json(newRule);
});
/* ====================================================
   SHOW ALL RULES
==================================================== */
router.get("/rules/:experimentRunId", (req, res) => {
  const run = store.experimentRuns.find(
    (r) => r.id === req.params.experimentRunId,
  );

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const ruleset = run.rulesets.find((r) => r.active);

  if (!ruleset) {
    return res.status(404).json({
      error: "No active RuleSet",
    });
  }

  res.json(ruleset.rules);
});
/* ====================================================
   EDIT RULE
==================================================== */
router.put("/rules/:id", (req, res) => {
  for (const run of store.experimentRuns) {
    for (const ruleset of run.rulesets) {
      const rule = ruleset.rules.find((r) => r.id === req.params.id);

      if (rule) {
        rule.type = req.body.type ?? rule.type;

        rule.signalType = req.body.signalType ?? rule.signalType;

        rule.action = req.body.action ?? rule.action;

        rule.threshold = req.body.threshold ?? rule.threshold;

        return res.json(rule);
      }
    }
  }

  res.status(404).json({
    error: "Rule not found",
  });
});
/* ====================================================
   DELETE RULE
==================================================== */
router.delete("/rules/:id", (req, res) => {
  for (const run of store.experimentRuns) {
    for (const ruleset of run.rulesets) {
      const index = ruleset.rules.findIndex((r) => r.id === req.params.id);

      if (index !== -1) {
        const removed = ruleset.rules.splice(index, 1);

        return res.json(removed[0]);
      }
    }
  }

  res.status(404).json({
    error: "Rule not found",
  });
});

/* ====================================================
   ENABLE / DISABLE RULE
==================================================== */
router.patch("/rules/:id/enabled", (req, res) => {

  for (const run of store.experimentRuns) {

    for (const ruleset of run.rulesets) {

      const rule = ruleset.rules.find(
        (r) => r.id === req.params.id
      );

      if (!rule) continue;

      rule.enabled = req.body.enabled;

      return res.json(rule);
    }
  }

  res.status(404).json({
    error: "Rule not found",
  });

});

export default router;
