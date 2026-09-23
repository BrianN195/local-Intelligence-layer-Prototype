import express from "express";
import {
  analyzeCollectiveBehavior,
  createExperimentrun,
  endRun,
  exportExperimentRunData,
  getAutonomyTicks,
  getExperimentRunLogs,
  getExperimentRunSummary,
  getMetrics,
  getOnlyCollectiveBehavior,
  getPropagationEvents,
  getSignals,
  pauseRun,
  postCollectiveIntelligence,
  runAutonomyOnce,
  runAutonomyTickBatch,
  runSimulationTicks,
  startRun,
} from "../controllers/experimentRunController.js";

const router = express.Router();

router.post("/experiment-runs/:id", createExperimentrun);
router.get("/experiment-runs/:id/summary", getExperimentRunSummary);
router.get("/experiment-runs/:id/export", exportExperimentRunData);
router.get("/experiment-runs/:id/metrics", getMetrics);
router.get("/experiment-runs/:id/logs", getExperimentRunLogs);
router.post("/experiment-runs/:id/analyze", analyzeCollectiveBehavior);
router.get("/experiment-runs/:id/results", getOnlyCollectiveBehavior);
router.patch("/experiment-runs/:id/start", startRun);
router.post("/experiment-runs/:id/pause", pauseRun);
router.patch("/experiment-runs/:id/finish", endRun);
router.post(
  "/experiment-runs/:id/collective-intelligence",
  postCollectiveIntelligence,
);
router.post("/experiment-runs/:id/autonomy", runAutonomyOnce);
router.post("/experiment-runs/:id/autonomy/ticks", runAutonomyTickBatch);
router.post("/experiment-runs/:id/simulation/ticks", runSimulationTicks);
router.get("/experiment-runs/:id/signals", getSignals);
router.get("/experiment-runs/:id/propagation-events", getPropagationEvents);
router.get("/experiment-runs/:id/autonomy-ticks", getAutonomyTicks);

export default router;