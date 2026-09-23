import { randomUUID } from "crypto";
import createSignal from "../createSignal.js";
import { findExperimentRunById } from "../repositories/experimentRunRepository.js";
import { STATE_NAMES } from "../constants/statuses.js";
import { getStateId } from "../stateHelpers.js";
import {
  addAgent,
  findAgentById,
  findAgentByPosition,
  getAgents as getStoredAgents,
} from "../repositories/agentRepository.js";

export function createAgent(req, res) {
  const run = findExperimentRunById(req.body.experimentRunId);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const agent = {
    id: randomUUID(),

    deviceId: req.body.deviceId,

    stateId: getStateId(STATE_NAMES.INACTIVE),

    autonomy: {
      enabled: true,
      suspendedUntil: null,
    },

    neighborhoodId: null,

    position: { row: null, col: null },

    priority: req.body.priority ?? 1,

    status: "online",

    lastSeen: new Date().toISOString(),

    metadata: {},
  };

  addAgent(run, agent);

  run.stateHistory.push({
    id: randomUUID(),

    agentId: agent.id,

    previousState: null,

    newState: 1,

    timestamp: new Date().toISOString(),

    reason: "agent_registered",
  });

  res.status(201).json(agent);
}
export function updateAgentState(req, res) {
  const run = findExperimentRunById(req.body.experimentRunId);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const agent = findAgentById(run, req.params.id);

  if (!agent) {
    return res.status(404).json({
      error: "Agent not found",
    });
  }
  const previousState = agent.stateId;
  agent.stateId = req.body.stateId;
  agent.lastSeen = new Date().toISOString();
  run.stateHistory.push({
    id: randomUUID(),

    agentId: agent.id,

    previousState,

    newState: req.body.stateId,

    timestamp: new Date().toISOString(),

    reason: req.body.reason || "manual_update",
  });

  res.json(agent);
}
export function getAgents(req, res) {
  const run = findExperimentRunById(req.query.experimentRunId);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  res.json(getStoredAgents(run));
}

function findActionTarget(run, agent, action) {
  const directions = {
    raise: {
      row: -1,
      col: 0,
    },

    shake: {
      row: 0,
      col: 1,
    },

    tap: {
      row: 1,
      col: 0,
    },
  };

  const direction = directions[action];

  if (!direction) {
    return null;
  }

  const targetRow = agent.position.row + direction.row;

  const targetCol = agent.position.col + direction.col;

  return findAgentByPosition(run, agent.neighborhoodId, targetRow, targetCol);
}

export function agentAction(req, res) {
  const run = findExperimentRunById(req.body.experimentRunId);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const agent = findAgentById(run, req.params.id);

  if (!agent) {
    return res.status(404).json({
      error: "Agent not found",
    });
  }

  const action = req.body.action;

  const allowedActions = ["shake", "raise", "tap"];

  if (!allowedActions.includes(action)) {
    return res.status(400).json({
      error: "Unknown action",
    });
  }

  const target = findActionTarget(run, agent, action);

  if (!target) {
    return res.status(400).json({
      error: "No valid target for this action.",
    });
  }

  const strength = Number(req.body.strength ?? 1);

  if (!Number.isFinite(strength) || strength < 0) {
    return res.status(400).json({
      error: "Strength must be a number between 0 and 1.",
    });
  }

  const signal = createSignal(run, {
    type: action,

    sourceAgentId: agent.id,

    targetAgentId: target.id,

    payload: {
      action,
      strength,
    },

    properties: {
      ttl: req.body.ttl,
      propagationMode: req.body.propagationMode ?? "unicast",
      propagationScope: req.body.propagationScope ?? "neighborhood",
    },
  });

  if (!signal) {
    return res.status(400).json({
      error: "Failed to create signal.",
    });
  }

  return res.status(201).json(signal);
}
