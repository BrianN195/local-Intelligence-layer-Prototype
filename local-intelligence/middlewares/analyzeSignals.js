export default function analyzeSignals(run) {
  if (!run) return null;

  const signals = run.signals ?? [];

  const created = signals.filter(
    signal => signal.status === "created"
  ).length;

  const processing = signals.filter(
    signal => signal.status === "processing"
  ).length;

  const propagated = signals.filter(
    signal => signal.status === "propagated"
  ).length;

  const completed = signals.filter(
    signal => signal.status === "completed"
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