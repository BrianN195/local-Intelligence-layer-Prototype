import { randomUUID } from "crypto";
import { getStateId } from "../../stateHelpers.js";
import { processSignal } from "../signals/signalEngine.js";
import { canPropagateToNeighborhood } from "../signals/propagationScope.js";
import { logState } from "../../services/logging/runLogger.js";
import { RULE_ACTIONS } from "../../constants/actions.js";
import {
  PROPAGATION_MODES,
  PROPAGATION_SCOPES,
} from "../../constants/propagation.js";
import { SIGNAL_STATUS } from "../../constants/statuses.js";
import triggerStateChangeRules from "../../services/scheduling/triggerStateChangeRules.js";
import { findAgentById } from "../../repositories/agentRepository.js";
const actions = {
  [RULE_ACTIONS.ACTIVATE]: activate,
  [RULE_ACTIONS.PROPAGATE]: propagate,
  [RULE_ACTIONS.BLOCK]: block,
  [RULE_ACTIONS.SYNC]: sync,
  [RULE_ACTIONS.INACTIVATE]: inactivate,
  [RULE_ACTIONS.UPDATE_AUTONOMY]: updateAutonomy,
  
};

export default function executeRule(rule, signal, run) {
  const strength = signal.payload?.strength ?? 0;

  if (
    rule.threshold !== undefined &&
    rule.threshold !== null &&
    strength < rule.threshold
  ) {
    return false;
  }

  const action = actions[rule.action];

  if (!action) {
    return false;
  }

  action(signal, run);

  return true;
}

// ====================================================
// ACTIVATE
// ====================================================

function activate(signal, run) {
  const agent = findAgentById(run, signal.targetAgentId)

  if (!agent) return;

  const activeStateId = getStateId("active");

  if (agent.stateId === activeStateId) {
    return;
  }

  const previousState = agent.stateId;

  agent.stateId = activeStateId;

  triggerStateChangeRules(run, agent, previousState, agent.stateId);

  logState(
    run,
    agent.id,
    previousState,
    agent.stateId,
    signal.id,
    [],
    "rule_activate",
  );
}

// ====================================================
// BLOCK
// ====================================================

function block(signal) {
  signal.blocked = true;
}

// ====================================================
// PROPAGATE
// ====================================================

function selectNeighbors(neighbors, mode, run) {
  switch (mode) {
    case PROPAGATION_MODES.RANDOM:
      return neighbors.sort(() => Math.random() - 0.5).slice(0, 1);

    case PROPAGATION_MODES.BROADCAST:
    default:
      return neighbors;

    case PROPAGATION_MODES.PRIORITY:
      return neighbors.sort((a, b) => {
        const agentA = run.agents.find((agent) => agent.id === a);
        const agentB = run.agents.find((agent) => agent.id === b);

        return (agentB?.priority ?? 0) - (agentA?.priority ?? 0);
      });
  }
}

function propagate(signal, run) {
  if (signal.blocked) return;

  // ====================================================
  // TTL CHECK

  if ((signal.properties.ttl ?? 0) <= 0) {
    run.technicalWarnings.push({
      id: randomUUID(),

      experimentRunId: run.id,

      type: "TTL_EXPIRED",

      message: "Signal propagation stopped because TTL reached zero.",

      signalId: signal.id,

      timestamp: new Date().toISOString(),
    });

    run.warningCount++;

    signal.status = SIGNAL_STATUS.COMPLETED;

    return;
  }

  // ====================================================
  // FIND CURRENT AGENT

  const sourceAgent = run.agents.find(
    (a) => a.id === signal.targetAgentId,
  );

  if (!sourceAgent) return;

  // ====================================================
  // FIND CURRENT NEIGHBORHOOD

  if (!sourceAgent.neighborhoodId) return;

  const currentNeighborhood = run.neighborhoods.find(
    (n) => n.id === sourceAgent.neighborhoodId,
  );

  if (!currentNeighborhood) return;

  // ====================================================
  // PROPAGATION SETTINGS

  const propagationMode =
    signal.properties?.propagationMode ?? PROPAGATION_MODES.BROADCAST;

  const propagationScope =
    signal.properties?.propagationScope ?? PROPAGATION_SCOPES.NEIGHBORHOOD;

  // ====================================================
  // FIND ALLOWED NEIGHBORHOODS

  const allowedNeighborhoods = run.neighborhoods.filter(
    (targetNeighborhood) =>
      canPropagateToNeighborhood(
        signal,
        currentNeighborhood,
        targetNeighborhood,
      ),
  );

  // ====================================================
  // PROPAGATE TO AGENTS

  let propagated = false;

  for (const neighborhood of allowedNeighborhoods) {
    let neighbors = [...neighborhood.agentIds];

    neighbors = selectNeighbors(
      neighbors,
      propagationMode,
      run,
    );

    for (const neighborId of neighbors) {
      // ---------------------------------------
      // SKIP INVALID TARGETS
      // ---------------------------------------

      if (neighborId === sourceAgent.id) continue;

      if (neighborId === signal.sourceAgentId) continue;

      if (signal.visitedAgents.includes(neighborId)) continue;

      // ---------------------------------------
      // PREVENT DUPLICATE SIGNALS
      // ---------------------------------------

      const alreadyQueued = run.signals.some(
        (s) =>
          s.parentSignalId ===
            (signal.parentSignalId || signal.id) &&
          s.targetAgentId === neighborId,
      );

      if (alreadyQueued) continue;

      // ---------------------------------------
      // CREATE PROPAGATED SIGNAL
      // ---------------------------------------

      const propagatedSignal = {
        id: randomUUID(),

        experimentRunId: run.id,

        type: signal.type,

        parentSignalId:
          signal.parentSignalId || signal.id,

        sourceAgentId: sourceAgent.id,

        targetAgentId: neighborId,

        payload: structuredClone(signal.payload),

        properties: {
          ...signal.properties,

          ttl: signal.properties.ttl - 1,

          hopCount:
            (signal.properties.hopCount ?? 0) + 1,
        },

        status: SIGNAL_STATUS.CREATED,

        visitedAgents: [
          ...signal.visitedAgents,
          neighborId,
        ],

        timestamp: new Date().toISOString(),

        blocked: false,
      };

      run.signals.push(propagatedSignal);

      propagated = true;

      processSignal(propagatedSignal, run);
    }
  }

  // ====================================================
  // UPDATE SIGNAL STATUS

  if (propagated) {
    signal.status = SIGNAL_STATUS.PROPAGATED;
  }
}
  // 
// ====================================================
// SYNC
// ====================================================

function sync(signal, run) {
  const targetAgent = findAgentById(run, signal.targetAgentId)

  if (!targetAgent) return;

  const neighborhood = run.neighborhoods.find(
    (n) => n.id === targetAgent.neighborhoodId,
  );

  if (!neighborhood) return;

  const synchronizedStateId =
    getStateId("synchronized");

  for (const agentId of neighborhood.agentIds) {
    const agent = run.agents.find(
      (a) => a.id === agentId,
    );

    if (!agent) continue;

    if (agent.stateId === synchronizedStateId) {
      continue;
    }

    const previousState = agent.stateId;

    agent.stateId = synchronizedStateId;

    triggerStateChangeRules(run, agent, previousState, agent.stateId);

    logState(
      run,
      agent.id,
      previousState,
      agent.stateId,
      signal.id,
      [],
      "rule_sync",
    );
  }
}
// ====================================================
// INACTIVATE
// ====================================================

function inactivate(signal, run) {
  const agent = findAgentById(run, signal.targetAgentId)

  if (!agent) return;

  const inactiveStateId = getStateId("inactive");

  if (agent.stateId === inactiveStateId) {
    return;
  }

  const previousState = agent.stateId;

  agent.stateId = inactiveStateId;

  triggerStateChangeRules(run, agent, previousState, agent.stateId);

  logState(
    run,
    agent.id,
    previousState,
    agent.stateId,
    signal.id,
    [],
    "rule_inactivate",
  );
}

function updateAutonomy(signal, run) {
  const agent = findAgentById(run, signal.targetAgentId)

  if (!agent) return;

  if (!agent.autonomy) {
    agent.autonomy = {
      enabled: true,
      suspendedUntil: null,
    };
  }

  const autonomy = signal.payload?.autonomy;

  if (!autonomy) return;

  if (autonomy.enabled === true) {
    agent.autonomy.enabled = true;
    agent.autonomy.suspendedUntil = null;
    return;
  }

  if (autonomy.enabled === false) {
    agent.autonomy.enabled = false;

    const durationMs = Number(autonomy.durationMs ?? 0);

    if (durationMs > 0) {
      agent.autonomy.suspendedUntil = new Date(
        Date.now() + durationMs,
      ).toISOString();
    } else {
      agent.autonomy.suspendedUntil = null;
    }
  }
}