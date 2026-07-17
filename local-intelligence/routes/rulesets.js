import express from "express";
import { store } from "../store.js";
import { randomUUID } from "crypto";

const router = express.Router();

/* ====================================================
Assign Rule Set
==================================================== */
router.post("/rulesets", (req, res) => {
  const run = store.experimentRuns.find(
    (r) => r.id === req.body.experimentRunId
  );

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  const ruleset = {
    id: randomUUID(),
    rules: req.body.rules || [],
    active: true
  };

  run.rulesets.push(ruleset);

  res.status(201).json(ruleset);
});


export default router;