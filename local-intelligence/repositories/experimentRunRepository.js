import { store } from "../store.js";

export function findExperimentRunById(id) {
  return store.experimentRuns.find((run) => run.id === id);
}

export function getExperimentRuns() {
  return store.experimentRuns;
}

export function addExperimentRun(run) {
  store.experimentRuns.push(run);
  return run;
}
