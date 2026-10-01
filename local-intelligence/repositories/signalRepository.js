export function getSignals(run) {
  return run?.signals ?? [];
}

export function addSignal(run, signal) {
  run.signals.push(signal);
  run.statistics.signalCount++;
  return signal;
}
