import express from "express";
import { store } from "../store.js";
import { randomUUID } from "crypto";
import { calculateMetrics } from "../metrics.js";
import { analyzeCollectiveState } from "../engine.js";
const router = express.Router();
/* ====================================================
   CREATE EXPERIMENT RUN
==================================================== */
router.post("/experiment-runs/:id", (req, res) => {
  const { id } = req.params;

  const existingRun = store.experimentRuns.find((run) => run.id === id);

  if (existingRun) {
    return res.status(409).json({
      error: "ExperimentRun already exists",
    });
  }

  const run = {
    id,

    status: "created",

    lifecycle: {
      currentPhase: "initialization",
      previousPhase: null,
    },

    startedAt: null,
    endedAt: null,

    activeRuleSetId: null,
    currentNeighborhoodId: null,

    agents: [],
    neighborhoods: [],
    rulesets: [],

    signals: [],
    stateHistory: [],
    propagationEvents: [],

    observationMetrics: [],
    collectiveBehaviorResults: [],

    observations: [],
    technicalWarnings: [],
    failureStates: [],
    experimentParticipants: [],

    statistics: {
      observationCount: 0,
      signalCount: 0,
      propagationCount: 0,
      participantCount: 0,
    },

    warningCount: 0,
    failureCount: 0,

    summary: "",
    result: "",

    metadata: {},
  };

  store.experimentRuns.push(run);

  res.status(201).json(run);
});

/* ====================================================
   SUMMARY
==================================================== */
router.get("/experiment-runs/:id/summary", (req, res) => {
  const run = store.experimentRuns.find((r) => r.id === req.params.id);

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
  const run = store.experimentRuns.find((r) => r.id === req.params.id);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  res.json({
    experimentRun: run,
    exportedAt: new Date().toISOString(),
    version: "prototype",
  });
});

/* ====================================================
got Metrics
==================================================== */
router.get("/experiment-runs/:id/metrics", (req, res) => {
  const run = store.experimentRuns.find((r) => r.id === req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const metrics = calculateMetrics(run);

  run.observationMetrics = metrics;

  run.statistics.observationCount = metrics.length;

  res.json(metrics);
});

/* ====================================================
   EXPERIMENT LOGS
==================================================== */
router.get("/experiment-runs/:id/logs", (req, res) => {
  const run = store.experimentRuns.find((r) => r.id === req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  res.json({
    experimentRun: {
      id: run.id,
      status: run.status,
    },

    agents: run.agents,

    neighborhoods: run.neighborhoods,

    rulesets: run.rulesets,

    signals: run.signals,

    stateHistory: run.stateHistory,

    propagationEvents: run.propagationEvents,

    observationMetrics: run.observationMetrics,

    collectiveBehaviorResults: run.collectiveBehaviorResults,

    observations: run.observations,

    technicalWarnings: run.technicalWarnings,

    failureStates: run.failureStates,

    experimentParticipants: run.experimentParticipants,
  });
});

/* ====================================================
   ANALYZE COLLECTIVE BEHAVIOR
==================================================== */
router.post("/experiment-runs/:id/analyze", (req, res) => {
  const run = store.experimentRuns.find((r) => r.id === req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const synchronization =
    run.observationMetrics.find((m) => m.type === "synchronization")?.value ||
    0;

  let type = "unknown";
  let summary = "No dominant collective behavior detected.";

  if (synchronization >= 0.8) {
    type = "synchronization";
    summary = "Most agents reached a synchronized state.";
  } else if (synchronization >= 0.5) {
    type = "wave";
    summary = "Signals propagated through multiple agents.";
  } else {
    type = "local-activity";
    summary = "Only local interactions occurred.";
  }

  const result = {
    id: randomUUID(),

    experimentRunId: run.id,

    type,

    score: synchronization,

    confidence: synchronization,

    startTime: run.startedAt,

    endTime: new Date().toISOString(),

    summary,
  };

  run.collectiveBehaviorResults.push(result);

  run.summary = result.summary;

  run.result = result.type;

  res.status(201).json(result);
});
/* ====================================================
   GET ONLY COLLECTIVE BEHAVIOR
==================================================== */
router.get("/experiment-runs/:id/results", (req, res) => {
  const run = store.experimentRuns.find((r) => r.id === req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  res.json(run.collectiveBehaviorResults);
});

/* ====================================================
   START RUN
==================================================== */
router.patch("/experiment-runs/:id/start", (req, res) => {
  const run = store.experimentRuns.find((r) => r.id === req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  run.status = "running";

  run.startedAt = new Date().toISOString();

  run.lifecycle.previousPhase = run.lifecycle.currentPhase;

  run.lifecycle.currentPhase = "running";

  res.json(run);
});
/* ====================================================
   END RUN
==================================================== */
router.patch("/experiment-runs/:id/finish", (req, res) => {
  const run = store.experimentRuns.find((r) => r.id === req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  run.status = "finished";

  run.endedAt = new Date().toISOString();

  run.lifecycle.previousPhase = run.lifecycle.currentPhase;

  run.lifecycle.currentPhase = "finished";

  res.json(run);
});

router.post("/experiment-runs/:id/collective-intelligence", (req, res) => {
  const run = store.experimentRuns.find(
    (r) => r.id === req.params.id,
  );

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const analysis = analyzeCollectiveState(run);

  const result = {
    id: randomUUID(),

    experimentRunId: run.id,

    type: "collective-analysis",

    timestamp: new Date().toISOString(),

    collectiveIntelligence: analysis.collectiveIntelligence,

    emergentBehavior: analysis.emergentBehavior,
  };

  run.collectiveBehaviorResults.push(result);

  res.status(201).json(result);
});

export default router;
