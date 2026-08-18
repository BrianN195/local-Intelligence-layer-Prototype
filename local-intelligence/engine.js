import evaluateRules from "./middlewares/evaluateRules.js";
import analyzeNeighborhood from "./middlewares/analyzeNeighborhood.js";
import {
  logPropagation,
  logState,
  logTechnicalWarning,
  logFailure,
} from "./middlewares/loggingFunc.js";
import swarmBehavior from "./middlewares/swarmBehavior.js";
import analyzeCollectiveIntelligence from "./middlewares/collectiveIntelligence.js";
import detectEmergentBehavior from "./middlewares/detectEmergentBehavior.js";
import analyzeRuleAdaptation from "./middlewares/selfOrganizingRules.js";
//====================================================
// MAIN ENGINE

export function processSignal(signal, run) {
  const startTime = Date.now();

  signal.status = "processing";

  run.statistics.processedSignals = (run.statistics.processedSignals ?? 0) + 1;

  const target = run.agents.find((a) => a.id === signal.targetAgentId);

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
      targetState: null,
      delayMs: Date.now() - startTime,
    });

    return;
  }

  const neighborhoodData = analyzeNeighborhood(run, signal.targetAgentId);

  const previousState = target.stateId;

  if (!signal.visitedAgents.includes(target.id)) {
    signal.visitedAgents.push(target.id);
  }

  //====================================================
  // RULESET EVALUATION

  const { triggeredRules, blocked } = evaluateRules(
  signal,
  run,
  neighborhoodData,
);

  let swarmStateChanged = false;

  if (previousState === target.stateId && !triggeredRule) {
    swarmBehavior(target, neighborhoodData);

    swarmStateChanged = previousState !== target.stateId;
  }

  if (triggeredRules.length === 0) {
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
      ruleTriggered: triggeredRules,
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
      triggeredRules,
      swarmStateChanged ? "swarm_behavior" : "rule_activate",
    );
  }
  // logState noch anpassen!!!! --TODO-- //finished, noch prüfen

  //====================================================
  // PROPAGATION EVENT LOG

  logPropagation(run, signal, signal.sourceAgentId, signal.targetAgentId, {
    status: "success",
    sourceState,
    targetState: target.stateId,
    ruleTriggered: triggeredRules,
    localStateBefore: previousState,
    localStateAfter: target.stateId,
    delayMs: Date.now() - startTime,
  });

  run.statistics.successfulSignals =
    (run.statistics.successfulSignals ?? 0) + 1;

  signal.status = "completed";
}
