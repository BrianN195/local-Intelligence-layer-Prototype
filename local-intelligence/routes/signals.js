import express from "express";
import { store } from "../store.js";
import { randomUUID } from "crypto";
import { processSignal } from "../engine.js";
const router = express.Router();

/* ====================================================
   SEND SIGNAL
==================================================== */
router.post("/signals", (req, res) => {
  const run = store.experimentRuns.find(
    (r) => r.id === req.body.experimentRunId
  );

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const signal = {
    id: randomUUID(),
    experimentRunId: run.id,
    type: req.body.type,
    sourceId: req.body.sourceId,
    targetId: req.body.targetId,
    payload: req.body.payload,
    properties: req.body.properties,
    status: req.body.status,
    visitedAgents: [req.body.sourceId],
    timestamp: new Date().toISOString(),
    blocked: req.body.blocked
  };

  run.signals.push(signal);

  processSignal(signal, run);

  res.status(201).json(signal);
});




export default router;