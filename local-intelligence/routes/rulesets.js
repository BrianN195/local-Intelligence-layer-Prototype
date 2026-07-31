import express from "express";
import { store } from "../store.js";
import { randomUUID } from "crypto";

const router = express.Router();

/* ====================================================
Assign Rule Set
==================================================== */
router.post("/rulesets", (req, res) => {
  const run = store.experimentRuns.find(
    (r) => r.id === req.body.experimentRunId,
  );

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  const ruleset = {
    id: randomUUID(),

    name: req.body.name || "Default RuleSet",

    experimentRunId: run.id,

    rules: req.body.rules ?? [],

    active: req.body.active ?? true,

    createdAt: new Date().toISOString(),

    activatedAt: new Date().toISOString(),

    deactivatedAt: null,

    version: req.body.version || "v1",

    metadata: {},
  };

  for (const rs of run.rulesets) {
    rs.active = false;
    rs.deactivatedAt = new Date().toISOString();
  }

  run.rulesets.push(ruleset);

  run.activeRuleSetId = ruleset.id;

  res.status(201).json(ruleset);
});

export default router;
