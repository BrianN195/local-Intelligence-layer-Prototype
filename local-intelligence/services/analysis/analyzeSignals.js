import { SIGNAL_STATUS } from "../../constants/statuses.js";

export default function analyzeSignals(run) {
  if (!run) return null;

  const signals = run.signals ?? [];

  const created = signals.filter(
    (signal) => signal.status === SIGNAL_STATUS.CREATED,
  ).length;

  const processing = signals.filter(
    (signal) => signal.status === SIGNAL_STATUS.PROCESSING,
  ).length;

  const propagated = signals.filter(
    (signal) => signal.status === SIGNAL_STATUS.PROPAGATED,
  ).length;

  const completed = signals.filter(
    (signal) => signal.status === SIGNAL_STATUS.COMPLETED,
  ).length;

  const blocked = signals.filter(
    signal => signal.blocked === true
  ).length;

  return {
    total: signals.length,
    created,
    processing,
    propagated,
    completed,
    blocked,
  };
}