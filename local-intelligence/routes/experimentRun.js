import express from "express";
import { store } from "../store.js";
import { randomUUID } from "crypto";
import { calculateMetrics } from "../metrics.js";
const router = express.Router();
/* ====================================================
   CREATE EXPERIMENT RUN
==================================================== */
router.post("/experiment-runs/:id", (req, res) => {
  const { id } = req.params;

  const existingRun = store.experimentRuns.find(
    (run) => run.id === id
  );

  if (existingRun) {
    return res.status(409).json({
      error: "ExperimentRun already exists",
    });
  }

  const run = {
    id,
    status: "inactive",

    agents: [],
    neighborhoods: [],
    rulesets: [],
    signals: [],

    stateHistory: [],

    propagationEvents: [],
    observationMetrics: [],
    collectiveBehaviorResults: [],
  };

  store.experimentRuns.push(run);

  res.status(201).json(run);
});

/* ====================================================
   SUMMARY
==================================================== */
router.get("/experiment-runs/:id/summary", (req, res) => {
  const run = store.experimentRuns.find(
    (r) => r.id === req.params.id
  );

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  res.json(run);
});

/* ====================================================
Export Data
==================================================== */
router.get("/experiment-runs/:id/export", (req, res) => {
  const run = store.experimentRuns.find(
    (r) => r.id === req.params.id
  );

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  res.json({
    experimentRun: run,
    exportedAt: new Date().toISOString()
  });
});

/* ====================================================
got Metrics
==================================================== */
router.get("/experiment-runs/:id/metrics", (req,res)=>{

  const run = store.experimentRuns.find(
    r => r.id === req.params.id
  );


  if(!run){
    return res.status(404).json({
      error:"ExperimentRun not found"
    });
  }


  const metrics = calculateMetrics(run);


  run.observationMetrics.push(
    ...metrics
  );


  res.json(metrics);

});

/* ====================================================
   EXPERIMENT LOGS
==================================================== */
router.get("/experiment-runs/:id/logs", (req, res) => {

  const run = store.experimentRuns.find(
    (r) => r.id === req.params.id
  );

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found"
    });
  }

  res.json({

    experimentRun: {
      id: run.id,
      status: run.status
    },

    agents: run.agents,

    neighborhoods: run.neighborhoods,

    rulesets: run.rulesets,

    signals: run.signals,

    stateHistory: run.stateHistory,

    propagationEvents: run.propagationEvents,

    observationMetrics: run.observationMetrics

  });

});

/* ====================================================
   ANALYZE COLLECTIVE BEHAVIOR
==================================================== */
router.post("/experiment-runs/:id/analyze", (req, res) => {

  const run = store.experimentRuns.find(
    (r) => r.id === req.params.id
  );

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found"
    });
  }

  const synchronization =
    run.observationMetrics.find(
      (m) => m.type === "synchronization"
    )?.value || 0;

  let type = "unknown";
  let summary = "No dominant collective behavior detected.";

  if (synchronization >= 0.8) {
    type = "synchronization";
    summary =
      "Most agents reached a synchronized state.";
  } else if (synchronization >= 0.5) {
    type = "wave";
    summary =
      "Signals propagated through multiple agents.";
  } else {
    type = "local-activity";
    summary =
      "Only local interactions occurred.";
  }

  const result = {

    id: randomUUID(),

    experimentRunId: run.id,

    type,

    score: synchronization,

    confidence: 1,

    startTime: run.startedAt,

    endTime: new Date().toISOString(),

    summary

  };

  run.collectiveBehaviorResults.push(result);

  res.status(201).json(result);

});
/* ====================================================
   GET ONLY COLLECTIVE BEHAVIOR
==================================================== */
router.get("/experiment-runs/:id/results", (req, res) => {

  const run = store.experimentRuns.find(
    r => r.id === req.params.id
  );

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found"
    });
  }

  res.json(run.collectiveBehaviorResults);

});
export default router;