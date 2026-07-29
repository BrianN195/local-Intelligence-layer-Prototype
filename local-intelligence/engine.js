import { randomUUID } from "crypto";
import executeRule from "./middlewares/executeRule.js";
import { getStateName } from "./stateHelpers.js";
//====================================================
// LOGGING FUNCTIONS

function logState(run, agentId, previousState, newState, signalId) {
  run.stateHistory.push({
    id: randomUUID(),
    agentId,
    previousState,
    newState,
    signalId,
    timestamp: new Date().toISOString(),
  });
}

function logPropagation(run, signal, sourceAgentId, targetAgentId, data) {
  run.propagationEvents.push({
    id: randomUUID(),

    experimentRunId: run.id,

    signalId: signal.id,

    sourceAgentId,

    targetAgentId,

    signalType: signal.type,

    signalStrength: signal.payload?.strength || 0,

    timestamp: new Date().toISOString(),

    status: data.status,

    delayMs: data.delayMs,

    localStateBefore: data.localStateBefore,

    localStateAfter: data.localStateAfter,

    ruleTriggered: data.ruleTriggered,
  });
}

//====================================================
// MAIN ENGINE

export function processSignal(signal, run) {
  const startTime = Date.now();

  const target = run.agents.find((a) => a.id === signal.targetAgentId);

  //====================================================
  // INVALID TARGET

  if (!target) {
    logPropagation(run, signal, signal.sourceAgentId, signal.targetAgentId, {
      status: "blocked",
      ruleTriggered: null,
      localStateBefore: null,
      localStateAfter: null,
      delayMs: Date.now() - startTime,
    });

    return;
  }

  const previousState = target.stateId;

  if (!signal.visitedAgents.includes(target.id)) {
    signal.visitedAgents.push(target.id);
  }

  //====================================================
  // RULESET EVALUATION

  let triggeredRule = null;

  const ruleset = run.rulesets?.find((r) => r.active);

  if (ruleset?.rules?.length) {
    for (const rule of ruleset.rules) {
      if (rule.signalType !== signal.type) continue;

      if (
        rule.threshold !== undefined &&
        (signal.payload?.strength ?? 0) < rule.threshold
      ) {
        continue;
      }

      triggeredRule = rule.id;

      executeRule(rule, signal, run);
      // const result = executeRule(rule, signal, run);
      if (signal.blocked) {
        break;
      }
    }
  }

  if (signal.blocked) {
    logPropagation(run, signal, signal.sourceAgentId, signal.targetAgentId, {
      status: "blocked",
      ruleTriggered: triggeredRule,
      localStateBefore: previousState,
      localStateAfter: previousState,
      delayMs: Date.now() - startTime,
    });

    return;
  }

  //====================================================
  // STATE CHANGE LOG

  logState(
    run,
    target.id,
    previousState,
    target.stateId,
    signal.id
);

  //====================================================
  // PROPAGATION EVENT LOG

  logPropagation(run, signal, signal.sourceAgentId, signal.targetAgentId, {
    status: "success",
    ruleTriggered: triggeredRule,
    localStateBefore: previousState,
    localStateAfter: target.stateId,
    delayMs: Date.now() - startTime,
  });

  //====================================================
  // BASIC SWARM PROPAGATION

  
}
