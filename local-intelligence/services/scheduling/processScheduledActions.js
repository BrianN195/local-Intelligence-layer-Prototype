import createSignal from "../../createSignal.js";

export default function processScheduledActions(run, now = Date.now()) {
  if (!run?.scheduledActions) {
    return [];
  }

  const processed = [];

  for (const scheduledAction of run.scheduledActions) {
    if (scheduledAction.status !== "pending") continue;

    if (Date.parse(scheduledAction.executeAt) > now) continue;

    const signal = createSignal(run, {
      type: scheduledAction.signalType,
      sourceAgentId: scheduledAction.sourceAgentId,
      targetAgentId: scheduledAction.targetAgentId,
      payload: scheduledAction.signalPayload,
      properties: scheduledAction.signalProperties,
    });

    scheduledAction.status = signal ? "completed" : "failed";
    scheduledAction.completedAt = new Date(now).toISOString();
    processed.push(scheduledAction);
  }

  return processed;
}