import { randomUUID } from "crypto";
import { stateDefinitions } from "./store.js";

//====================================================
// STATE HELPERS
function getStateId(name) {
  return stateDefinitions.find((s) => s.name === name)?.id || 1;
}

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

function logPropagation(run, signal, sourceId, targetId, data) {
  run.propagationEvents.push({
    id: randomUUID(),

    experimentRunId: run.id,

    signalId: signal.id,

    sourceId,

    targetId,

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

  const target = run.agents.find((a) => a.id === signal.targetId);

  //====================================================
  // INVALID TARGET
  
  if (!target) {
    logPropagation(run, signal, signal.sourceId, signal.targetId, {
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
  // BASE STATE LOGIC

  let newStateName = "inactive";

  switch (signal.type) {
    case "pulse":
      newStateName = "active";
      break;

    case "weak":
      newStateName = "waiting";
      break;

    case "listen":
      newStateName = "listening";
      break;

    default:
      newStateName = "inactive";
  }

  //====================================================
  // RULESET EVALUATION

  let triggeredRule = null;

  const ruleset = run.rulesets?.find((r) => r.active);

  if (ruleset?.rules?.length) {
    for (const rule of ruleset.rules) {
      if (rule.signalType === signal.type) {
        triggeredRule = rule.id;

        if (rule.action === "boost") {
          newStateName = "active";
        }

        if (rule.action === "suppress") {
          newStateName = "inactive";
        }
      }
    }
  }

  const newState = getStateId(newStateName);

  //====================================================
  // APPLY STATE

  target.stateId = newState;

  //====================================================
  // STATE CHANGE LOG

  logState(run, target.id, previousState, newState, signal.id);

  //====================================================
  // PROPAGATION EVENT LOG

  logPropagation(run, signal, signal.sourceId, signal.targetId, {
    status: "success",
    ruleTriggered: triggeredRule,
    localStateBefore: previousState,
    localStateAfter: newState,
    delayMs: Date.now() - startTime,
  });

  //====================================================
  // BASIC SWARM PROPAGATION

  if (newStateName === "active" && target.neighborhoodIds?.length) {
    for (const neighborhoodId of target.neighborhoodIds) {
      const neighborhood = run.neighborhoods.find(
        (n) => n.id === neighborhoodId,
      );

      if (!neighborhood) continue;

      for (const neighborId of neighborhood.agentIds) {
        // prüfung ob signal weiter geht
        if (neighborId === target.id) continue;
        if (neighborId === signal.sourceId) continue;
        if (signal.visitedAgents.includes(neighborId)) continue;

        const alreadyQueued = run.signals.some(
          (s) =>
            s.parentSignalId === (signal.parentSignalId || signal.id) &&
            s.targetId === neighborId,
        );

        if (alreadyQueued) continue;
        //prüfung zuende
        const propagatedSignal = {
          id: randomUUID(),

          experimentRunId: run.id,

          type: signal.type,

          parentSignalId: signal.parentSignalId || signal.id,

          sourceId: target.id,

          targetId: neighborId,
          
          payload: {
            strength: signal.payload?.strength ?? 1,
          },

          properties: signal.properties,

          status: signal.status,

          visitedAgents: [...signal.visitedAgents, neighborId],

          timestamp: new Date().toISOString(),

          blocked: signal.blocked
        };

        run.signals.push(propagatedSignal);
        processSignal(propagatedSignal, run);
      }
    }
  }
}
