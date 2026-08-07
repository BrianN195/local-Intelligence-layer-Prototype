import { randomUUID } from "crypto";

export function logState(
  run,
  agentId,
  previousState,
  newState,
  signalId,
  triggeredRule,
  reason = "rule_activate",
) {
  run.stateHistory.push({
    id: randomUUID(),

    experimentRunId: run.id,

    agentId,

    signalId,

    triggeredRule,

    previousState,

    newState,

    changed: previousState !== newState,

    reason,

    timestamp: new Date().toISOString(),
  });
}

export function logPropagation(run, signal, sourceAgentId, targetAgentId, data) {
  run.propagationEvents.push({
    id: randomUUID(),

    experimentRunId: run.id,

    signalId: signal.id,

    sourceAgentId,

    targetAgentId,

    signalType: signal.type,

    parentSignalId: signal.parentSignalId ?? null,

    signalStrength: signal.payload?.strength ?? 0,

    hopCount: signal.properties?.hopCount ?? 0,

    ttlRemaining: signal.properties?.ttl ?? 0,

    timestamp: new Date().toISOString(),

    status: data.status,

    delayMs: data.delayMs,

    localStateBefore: data.localStateBefore,

    localStateAfter: data.localStateAfter,

    sourceState: data.sourceState,

    targetState: data.targetState,

    ruleTriggered: data.ruleTriggered,
  });
  run.statistics.propagationCount++;
}
export function logTechnicalWarning(run, type, message, data = {}) {
  run.technicalWarnings.push({
    id: randomUUID(),

    experimentRunId: run.id,

    type,

    message,

    timestamp: new Date().toISOString(),

    ...data,
  });

  run.warningCount++;
}
export function logFailure(run, type, message, data = {}) {
  run.failureStates.push({
    id: randomUUID(),

    experimentRunId: run.id,

    type,

    message,

    timestamp: new Date().toISOString(),

    ...data,
  });

  run.failureCount++;
}
