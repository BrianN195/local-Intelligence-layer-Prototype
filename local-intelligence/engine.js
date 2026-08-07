import { randomUUID } from "crypto";
import evaluateRules from "./middlewares/evaluateRules.js";
import analyzeNeighborhood from "./middlewares/analyzeNeighborhood.js";
import {
  logPropagation,
  logState,
  logTechnicalWarning,
  logFailure,
} from "./middlewares/loggingFunc.js";
import swarmBehavior from "./middlewares/swarmBehavior.js";
//====================================================
// MAIN ENGINE

export function processSignal(signal, run) {
  const startTime = Date.now();

  signal.status = "processing";

  run.statistics.processedSignals = (run.statistics.processedSignals ?? 0) + 1;

  const target = run.agents.find((a) => a.id === signal.targetAgentId);

  const neighborhoodData = analyzeNeighborhood(run, signal.targetAgentId);

  //====================================================
  // INVALID TARGET
  const sourceAgent = run.agents.find((a) => a.id === signal.sourceAgentId);

  const sourceState = sourceAgent?.stateId ?? null;

  if (!target) {
    logFailure(run, "INVALID_TARGET", "Signal target agent not found.", {
      signalId: signal.id,
      targetAgentId: signal.targetAgentId,
    });
    logPropagation(run, signal, signal.sourceAgentId, signal.targetAgentId, {
      status: "blocked",
      ruleTriggered: null,
      localStateBefore: null,
      localStateAfter: null,
      sourceState,
      targetState,
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

  const { triggeredRule, blocked } = evaluateRules(
    signal,
    run,
    neighborhoodData,
  );

  swarmBehavior(target, neighborhoodData);

  if (triggeredRule === null) {
    logFailure(
      run,
      "NO_RULE_TRIGGERED",
      "No matching rule was found for the signal.",
      {
        signalId: signal.id,
        signalType: signal.type,
      },
    );
  }

  if (blocked) {
    signal.status = "blocked";
    logPropagation(run, signal, signal.sourceAgentId, signal.targetAgentId, {
      status: "blocked",
      ruleTriggered: triggeredRule,
      localStateBefore: previousState,
      localStateAfter: previousState,
      sourceState,
      targetState: previousState,
      delayMs: Date.now() - startTime,
    });

    run.statistics.blockedSignals = (run.statistics.blockedSignals ?? 0) + 1;

    return;
  }

  //====================================================
  // STATE CHANGE LOG

  //====================================================
  // STATE CHANGE LOG

  if (previousState !== target.stateId) {
    logState(
      run,
      target.id,
      previousState,
      target.stateId,
      signal.id,
      triggeredRule,
    );
    run.statistics.stateChanges = (run.statistics.stateChanges ?? 0) + 1;
  }

  //====================================================
  // PROPAGATION EVENT LOG

  logPropagation(run, signal, signal.sourceAgentId, signal.targetAgentId, {
    status: "success",
    sourceState,
    targetState: target.stateId,
    ruleTriggered: triggeredRule,
    localStateBefore: previousState,
    localStateAfter: target.stateId,
    delayMs: Date.now() - startTime,
  });
  run.statistics.successfulSignals =
    (run.statistics.successfulSignals ?? 0) + 1;
  signal.status = "completed";
}
