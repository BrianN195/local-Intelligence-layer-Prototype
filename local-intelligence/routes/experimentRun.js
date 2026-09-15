import express from "express";
import { store } from "../store.js";
import runAutonomy from "../middlewares/runAutonomy.js";
import runAutonomyTicks from "../middlewares/autonomyScheduler.js";
import { analyzeCollectiveBehavior, createExperimentrun, endRun, exportExperimentRunData, getExperimentRunLogs, getExperimentRunSummary, getMetrics, getOnlyCollectiveBehavior, postCollectiveIntelligence, runSimulationTicks, startRun } from "../controllers/experimentRunController.js";

const router = express.Router();
/* ====================================================
   CREATE EXPERIMENT RUN
==================================================== */
router.post("/experiment-runs/:id", (req, res) => {
  return createExperimentrun(req, res)
});

/* ====================================================
   SUMMARY
==================================================== */
router.get("/experiment-runs/:id/summary", (req, res) => {
  return getExperimentRunSummary(req, res)
});

/* ====================================================
Export Data
==================================================== */
router.get("/experiment-runs/:id/export", (req, res) => {
  return exportExperimentRunData(req, res)
});

/* ====================================================
got Metrics
==================================================== */
router.get("/experiment-runs/:id/metrics", (req, res) => {
  return getMetrics(req, res)
});

/* ====================================================
   EXPERIMENT LOGS
==================================================== */
router.get("/experiment-runs/:id/logs", (req, res) => {
  return getExperimentRunLogs(req, res)
});

/* ====================================================
   ANALYZE COLLECTIVE BEHAVIOR
==================================================== */
router.post("/experiment-runs/:id/analyze", (req, res) => {
  return analyzeCollectiveBehavior(req, res)
});
/* ====================================================
   GET ONLY COLLECTIVE BEHAVIOR
==================================================== */
router.get("/experiment-runs/:id/results", (req, res) => {
  return getOnlyCollectiveBehavior(req, res)
});

/* ====================================================
   START RUN
==================================================== */
router.patch("/experiment-runs/:id/start", (req, res) => {
  return startRun(req, res)
});
/* ====================================================
   END RUN
==================================================== */
router.patch("/experiment-runs/:id/finish", (req, res) => {
  return endRun(req, res)
});

router.post("/experiment-runs/:id/collective-intelligence", (req, res) => {
  return postCollectiveIntelligence(req, res)
});

/* ====================================================
   RUN AUTONOMY TICK
   only before the real automate is created
==================================================== */

router.post("/experiment-runs/:id/autonomy", (req, res) => {
  const run = store.experimentRuns.find((r) => r.id === req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const decisions = runAutonomy(run);

  res.json({
    experimentRunId: run.id,
    agentCount: run.agents.length,
    decisions,
    timestamp: new Date().toISOString(),
  });
});

/* ====================================================
   RUN AUTONOMY TICKS
==================================================== */

router.post("/experiment-runs/:id/autonomy/ticks", (req, res) => {
  const run = store.experimentRuns.find((r) => r.id === req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const tickCount = Number(req.body.tickCount ?? 1);

  if (!Number.isInteger(tickCount) || tickCount < 1 || tickCount > 100) {
    return res.status(400).json({
      error: "tickCount must be an integer between 1 and 100.",
    });
  }

  const ticks = runAutonomyTicks(run, tickCount);

  res.json({
    experimentRunId: run.id,
    tickCount: ticks.length,
    ticks,
    timestamp: new Date().toISOString(),
  });
});

/* ====================================================
   RUN SIMULATION TICKS
==================================================== */

router.post("/experiment-runs/:id/simulation/ticks", (req, res) => {
  return runSimulationTicks(req, res)
});
/* ====================================================
   Logs splitted in get Signals und get Propagation events und autonomy ticks
==================================================== */
/* ====================================================
   SIGNALS
==================================================== */

router.get("/experiment-runs/:id/signals", (req, res) => {
  const run = store.experimentRuns.find(
    (r) => r.id === req.params.id,
  );

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  res.json({
    experimentRunId: run.id,
    count: run.signals.length,
    signals: run.signals,
  });
});
/* ====================================================
   PROPAGATION EVENTS
==================================================== */

router.get(
  "/experiment-runs/:id/propagation-events",
  (req, res) => {
    const run = store.experimentRuns.find(
      (r) => r.id === req.params.id,
    );

    if (!run) {
      return res.status(404).json({
        error: "ExperimentRun not found",
      });
    }

    res.json({
      experimentRunId: run.id,
      count: run.propagationEvents.length,
      propagationEvents: run.propagationEvents,
    });
  },
);
/* ====================================================
   AUTONOMY TICKS
==================================================== */

router.get(
  "/experiment-runs/:id/autonomy-ticks",
  (req, res) => {
    const run = store.experimentRuns.find(
      (r) => r.id === req.params.id,
    );

    if (!run) {
      return res.status(404).json({
        error: "ExperimentRun not found",
      });
    }

    res.json({
      experimentRunId: run.id,
      count: run.autonomyTicks.length,
      autonomyTicks: run.autonomyTicks,
    });
  },
);
export default router;
