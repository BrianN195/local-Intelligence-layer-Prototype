import express from "express";
import { store } from "../store.js";
import { randomUUID } from "crypto";

const router = express.Router();

/* REGISTER AGENT */
router.post("/agents", (req, res) => {
  const run = store.experimentRuns.find(
    (r) => r.id === req.body.experimentRunId,
  );

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const agent = {
    id: randomUUID(),

    deviceId: req.body.deviceId,

    stateId: 1,

    neighborhoodId: null,
    
    position: {row: null, col: null},

    priority: req.body.priority ?? 1,

    status: "online",

    lastSeen: new Date().toISOString(),

    metadata: {},
  };

  run.agents.push(agent);

  run.stateHistory.push({
    id: randomUUID(),

    agentId: agent.id,

    previousState: null,

    newState: 1,

    timestamp: new Date().toISOString(),

    reason: "agent_registered",
});

  res.status(201).json(agent);
});
/* UPDATE AGENT STATE */
router.patch("/agents/:id/state", (req, res) => {
  const run = store.experimentRuns.find(
    (r) => r.id === req.body.experimentRunId,
  );

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const agent = run.agents.find((a) => a.id === req.params.id);

  if (!agent) {
    return res.status(404).json({
      error: "Agent not found",
    });
  }
  const previousState = agent.stateId;
  agent.stateId = req.body.stateId;
  agent.lastSeen = new Date().toISOString();
  run.stateHistory.push({
    id: randomUUID(),

    agentId: agent.id,

    previousState,

    newState: req.body.stateId,

    timestamp: new Date().toISOString(),

    reason: req.body.reason || "manual_update",
    
  });

  res.json(agent);
});
export default router;
