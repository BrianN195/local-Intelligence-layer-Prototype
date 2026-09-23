import { randomUUID } from "crypto";
import { calculateMetrics } from "../metrics.js";
import {
  addExperimentRun,
  findExperimentRunById,
} from "../repositories/experimentRunRepository.js";
import runAutonomy from "../services/autonomy/runAutonomy.js";
import runAutonomyTicks from "../services/autonomy/autonomyScheduler.js";
import { analyzeCollectiveState } from "../services/analysis/analyzeCollectiveState.js";
import runSimulation from "../services/simulation/runSimulation.js";
import {
  startExperimentScheduler,
  stopExperimentScheduler,
} from "../services/scheduling/experimentScheduler.js";

export function createExperimentrun(req, res) {
  const { id } = req.params;

  const existingRun = findExperimentRunById(id);

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
    autonomyTicks: [],
    scheduledActions: [],

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

  addExperimentRun(run);

  res.status(201).json(run);
}
export function getExperimentRunSummary(req, res) {
  const run = findExperimentRunById(req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  res.json(run);
}
export function exportExperimentRunData(req, res) {
  const run = findExperimentRunById(req.params.id);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  res.json({
    experimentRun: run,
    exportedAt: new Date().toISOString(),
    version: "prototype",
  });
}
export function getMetrics(req, res) {
  const run = findExperimentRunById(req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const metrics = calculateMetrics(run);

  run.observationMetrics = metrics;

  run.statistics.observationCount = metrics.length;

  res.json(metrics);
}
export function getExperimentRunLogs(req, res) {
  const run = findExperimentRunById(req.params.id);

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

    autonomyTicks: run.autonomyTicks,
    scheduledActions: run.scheduledActions ?? [],
  });
}
export function analyzeCollectiveBehavior(req, res) {
  const run = findExperimentRunById(req.params.id);

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
}
export function getOnlyCollectiveBehavior(req, res) {
  const run = findExperimentRunById(req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  res.json(run.collectiveBehaviorResults);
}
export function startRun(req, res) {
  const run = findExperimentRunById(req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  if (run.status === "finished") {
    return res.status(400).json({
      error: "ExperimentRun is already finished",
    });
  }

  run.status = "running";

  if (!run.startedAt) {
    run.startedAt = new Date().toISOString();
  }

  run.lifecycle.previousPhase = run.lifecycle.currentPhase;
  run.lifecycle.currentPhase = "running";

  startExperimentScheduler(run);

  res.json(run);
}
export function endRun(req, res) {
  const run = findExperimentRunById(req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  stopExperimentScheduler(run.id);

  run.status = "finished";

  run.endedAt = new Date().toISOString();

  run.lifecycle.previousPhase = run.lifecycle.currentPhase;
  run.lifecycle.currentPhase = "finished";

  res.json(run);
}
export function postCollectiveIntelligence(req, res) {
  const run = findExperimentRunById(req.params.id);

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

    ruleAdaptation: analysis.ruleAdaptation,
  };

  run.collectiveBehaviorResults.push(result);

  res.status(201).json(result);
}
export function runSimulationTicks(req, res) {
  const run = findExperimentRunById(req.params.id);

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

  const ticks = runSimulation(run, tickCount);

  res.json({
    experimentRunId: run.id,

    tickCount: ticks.length,

    ticks,

    timestamp: new Date().toISOString(),
  });
}

export function runAutonomyOnce(req, res) {
  const run = findExperimentRunById(req.params.id);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  const decisions = runAutonomy(run);

  res.json({
    experimentRunId: run.id,
    agentCount: run.agents.length,
    decisions,
    timestamp: new Date().toISOString(),
  });
}

export function runAutonomyTickBatch(req, res) {
  const run = findExperimentRunById(req.params.id);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
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
}

export function getSignals(req, res) {
  const run = findExperimentRunById(req.params.id);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  res.json({
    experimentRunId: run.id,
    count: run.signals.length,
    signals: run.signals,
  });
}

export function getPropagationEvents(req, res) {
  const run = findExperimentRunById(req.params.id);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  res.json({
    experimentRunId: run.id,
    count: run.propagationEvents.length,
    propagationEvents: run.propagationEvents,
  });
}

export function getAutonomyTicks(req, res) {
  const run = findExperimentRunById(req.params.id);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  res.json({
    experimentRunId: run.id,
    count: run.autonomyTicks.length,
    autonomyTicks: run.autonomyTicks,
    scheduledActions: run.scheduledActions ?? [],
  });
}

export function pauseRun(req, res) {
  const run = findExperimentRunById(req.params.id);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  if (run.status !== "running") {
    return res.status(400).json({
      error: "ExperimentRun is not running",
    });
  }

  stopExperimentScheduler(run.id);

  run.status = "paused";

  run.lifecycle.previousPhase = run.lifecycle.currentPhase;
  run.lifecycle.currentPhase = "paused";

  res.json(run);
}