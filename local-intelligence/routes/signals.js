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
    (r) => r.id === req.body.experimentRunId,
  );

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

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const signal = {
    id: randomUUID(),
    experimentRunId: run.id,
    type: req.body.type,
    sourceAgentId: req.body.sourceAgentId,
    targetAgentId: req.body.targetAgentId,
    payload: req.body.payload || {},
    properties: {
      // priorityMode: req.body.properties?.priorityMode ?? "highest",
      ttl: req.body.properties?.ttl ?? 10,
      hopCount: req.body.properties?.hopCount ?? 0,
      propagationMode: req.body.properties?.propagationMode ?? "broadcast",
      propagationScope: req.body.propagationScope ?? "neighborhood",
    },
    status: req.body.status || "created",
    visitedAgents: [req.body.sourceAgentId],
    timestamp: new Date().toISOString(),
    blocked: req.body.blocked ?? false,
  };

  run.signals.push(signal);
  run.statistics.signalCount++;
  processSignal(signal, run);

  res.status(201).json(signal);
});

export default router;
