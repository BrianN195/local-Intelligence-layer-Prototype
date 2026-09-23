import simulationTick from "../simulation/simulationTick.js";

const runningSchedulers = new Map();

export function startExperimentScheduler(run, intervalMs = 1000) {
  if (!run) return null;

  if (runningSchedulers.has(run.id)) {
    return runningSchedulers.get(run.id);
  }

  const interval = setInterval(() => {
    if (run.status !== "running") {
      stopExperimentScheduler(run.id);
      return;
    }

    simulationTick(run);
  }, intervalMs);

  runningSchedulers.set(run.id, interval);

  return interval;
}

export function stopExperimentScheduler(runId) {
  const interval = runningSchedulers.get(runId);

  if (!interval) return false;

  clearInterval(interval);
  runningSchedulers.delete(runId);

  return true;
}

export function isExperimentSchedulerRunning(runId) {
  return runningSchedulers.has(runId);
}