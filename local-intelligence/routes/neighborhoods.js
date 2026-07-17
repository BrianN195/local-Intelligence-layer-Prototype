import express from "express";
import { store } from "../store.js";
import { randomUUID } from "crypto";

const router = express.Router();

/* ====================================================
   CREATE NEIGHBORHOOD
==================================================== */
router.post("/neighborhoods", (req, res) => {
  const run = store.experimentRuns.find(
    (r) => r.id === req.body.experimentRunId,
  );

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const neighborhood = {
    id: randomUUID(),
    experimentRunId: run.id,
    agentIds: [],
  };

  run.neighborhoods.push(neighborhood);

  res.status(201).json(neighborhood);
});

/* ====================================================
   ADD AGENT(S) TO NEIGHBORHOOD
==================================================== */
router.post("/neighborhoods/:id/agents", (req, res) => {
  const run = store.experimentRuns.find(
    (r) => r.id === req.body.experimentRunId,
  );

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const neighborhood = run.neighborhoods.find((n) => n.id === req.params.id);

  if (!neighborhood) {
    return res.status(404).json({
      error: "Neighborhood not found",
    });
  }

  // Support both:
  // agentId: "..."
  // agentIds: ["...", "...", "..."]

  const agentIds = req.body.agentIds || [req.body.agentId];

  for (const agentId of agentIds) {
    const agent = run.agents.find((a) => a.id === agentId);

    if (!agent) {
      continue;
    }

    if (!neighborhood.agentIds.includes(agent.id)) {
      neighborhood.agentIds.push(agent.id);
    }

    if (!agent.neighborhoodIds.includes(neighborhood.id)) {
      agent.neighborhoodIds.push(neighborhood.id);
    }
  }

  res.json(neighborhood);
});

export default router;
