import express from "express";
import { store } from "../store.js";
import createSignal from "../createSignal.js";


const router = express.Router();

/* ====================================================
   SEND SIGNAL
==================================================== */
router.post("/signals", (req, res) => {
  const run = store.experimentRuns.find(
    (r) => r.id === req.body.experimentRunId,
  );

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const sourceExists = run.agents.some(
    (agent) => agent.id === req.body.sourceAgentId,
  );

  const targetExists = run.agents.some(
    (agent) => agent.id === req.body.targetAgentId,
  );

  if (!sourceExists || !targetExists) {
    return res.status(400).json({
      error: "Invalid agent reference",
      sourceExists,
      targetExists,
    });
  }

  const signal = createSignal(run, {
    type: req.body.type,

    sourceAgentId:
      req.body.sourceAgentId,

    targetAgentId:
      req.body.targetAgentId,

    payload:
      req.body.payload || {},

    properties:
      req.body.properties || {},
  });

  if (!signal) {
    return res.status(400).json({
      error: "Signal could not be created",
    });
  }

  res.status(201).json(signal);
});

export default router;
