import express from "express";
import { store } from "../store.js";
import { randomUUID } from "crypto";
import { processSignal } from "../engine.js";
import { findRoute } from "../routing.js";
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

  const { targetAgentId, targetNeighborhoodId } = req.body;

  if (targetAgentId && targetNeighborhoodId) {
    return res.status(400).json({
      error: "Provide either targetAgentId or targetNeighborhoodId, not both",
    });
  }

  // a signal aimed at an Agent is routed to the Neighborhood that owns it
  let destinationNeighborhoodId = targetNeighborhoodId ?? null;

  if (targetAgentId) {
    const targetAgent = run.agents.find((a) => a.id === targetAgentId);

    if (!targetAgent) {
      return res.status(404).json({ error: "Target Agent not found" });
    }

    if (!targetAgent.neighborhoodId) {
      return res.status(400).json({
        error: "Target Agent does not belong to a Neighborhood",
      });
    }

    destinationNeighborhoodId = targetAgent.neighborhoodId;
  }

  if (
    destinationNeighborhoodId &&
    !run.neighborhoods.some((n) => n.id === destinationNeighborhoodId)
  ) {
    return res.status(404).json({ error: "Target Neighborhood not found" });
  }

  // plan the route once, from the Neighborhood the signal starts in
  const sourceNeighborhoodId = run.agents.find(
    (a) => a.id === req.body.sourceId,
  )?.neighborhoodId ?? null;

  const route = destinationNeighborhoodId
    ? findRoute(run, sourceNeighborhoodId, destinationNeighborhoodId)
    : null;

  const signal = {
    id: randomUUID(),
    experimentRunId: run.id,
    type: req.body.type,
    sourceId: req.body.sourceId,
    targetId: req.body.targetId,
    targetAgentId: targetAgentId ?? null,
    targetNeighborhoodId: destinationNeighborhoodId,
    route: route ?? [],
    currentHop: 0,
    routeCalculated: Boolean(route),
    payload: req.body.payload ?? {},
    visitedAgents: [req.body.sourceId],
    visitedNeighborhoods: sourceNeighborhoodId ? [sourceNeighborhoodId] : [],
    isEntry: true,
    timestamp: new Date().toISOString()
  };

  run.signals.push(signal);

  processSignal(signal, run);

  res.status(201).json(signal);
});




export default router;