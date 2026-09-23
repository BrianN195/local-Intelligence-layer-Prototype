import { randomUUID } from "crypto";
import { directionOf, distanceBetween } from "../utils/geometry.js";
import { findExperimentRunById } from "../repositories/experimentRunRepository.js";
import {
  addNeighborhood,
  findNeighborhoodById,
  getNeighborhoods as getStoredNeighborhoods,
} from "../repositories/neighborhoodRepository.js";
import {
  addAgent,
  findAgentById,
  getAgents,
} from "../repositories/agentRepository.js";
import { STATE_NAMES } from "../constants/statuses.js";
import { getStateId } from "../stateHelpers.js";

const GRID_ROWS_BOUND = 3;
const GRID_COLS_BOUND = 3;

function isValidPosition(
  row,
  col,
  maxRows = GRID_ROWS_BOUND,
  maxCols = GRID_COLS_BOUND,
) {
  return (
    Number.isInteger(row) &&
    Number.isInteger(col) &&
    row >= 1 &&
    row <= maxRows &&
    col >= 1 &&
    col <= maxCols
  );
}

function isValidBounds(bounds) {
  return (
    bounds &&
    [bounds.rowStart, bounds.rowEnd, bounds.colStart, bounds.colEnd].every(
      (value) => Number.isInteger(value) && value >= 1,
    ) &&
    bounds.rowStart <= bounds.rowEnd &&
    bounds.colStart <= bounds.colEnd
  );
}

export function getNeighborhoods(req, res) {
  const run = findExperimentRunById(req.query.experimentRunId);

  if (!run) {
    return res.status(404).json({
      error: `ExperimentRun ${req.query.experimentRunId} not found`,
    });
  }

  res.json(getStoredNeighborhoods(run));
}

export function getNeighborhoodLayout(req, res) {
  const run = findExperimentRunById(req.params.id);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  res.json(
    run.layout ?? {
      globalRows: 9,
      globalCols: 9,
      localRows: 3,
      localCols: 3,
    },
  );
}

export function createNeighborhood(req, res) {
  const run = findExperimentRunById(req.body.experimentRunId);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  const bounds = req.body.bounds ?? null;

  if (bounds && !isValidBounds(bounds)) {
    return res.status(400).json({
      error:
        "bounds must have integer rowStart <= rowEnd and colStart <= colEnd, all >= 1.",
    });
  }

  const neighborhood = {
    id: randomUUID(),
    experimentRunId: run.id,
    name: req.body.name || `Neighborhood ${run.neighborhoods.length + 1}`,
    bounds,
    agentIds: [],
    neighbors: [],
    configuration: {
      topology: req.body.topology || "dynamic",
      maxNeighbors: req.body.maxNeighbors ?? null,
      algorithm: req.body.algorithm ?? null,
      communicationRange: req.body.communicationRange ?? null,
    },
    status: "active",
    metadata: {},
  };

  addNeighborhood(run, neighborhood);
  res.status(201).json(neighborhood);
}

export function updateNeighborhoodLayout(req, res) {
  const run = findExperimentRunById(req.params.id);
  const globalRows = Number(req.body.globalRows);
  const globalCols = Number(req.body.globalCols);
  const localRows = Number(req.body.localRows);
  const localCols = Number(req.body.localCols);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  if (
    ![globalRows, globalCols, localRows, localCols].every(
      (value) => Number.isInteger(value) && value >= 1,
    )
  ) {
    return res.status(400).json({
      error: "Grid dimensions must be positive integers.",
    });
  }

  const neighborhoodColumns = Math.ceil(
    Math.sqrt(run.neighborhoods.length || 1),
  );
  const neighborhoodRows = Math.ceil(
    (run.neighborhoods.length || 1) / neighborhoodColumns,
  );

  if (
    globalRows < neighborhoodRows * localRows ||
    globalCols < neighborhoodColumns * localCols
  ) {
    return res.status(400).json({
      error: `Global grid must contain at least ${neighborhoodRows * localRows} rows and ${neighborhoodColumns * localCols} columns for the current neighborhoods.`,
    });
  }

  for (const neighborhood of run.neighborhoods) {
    const assignedAgents = neighborhood.agentIds
      .map((agentId) => findAgentById(run, agentId))
      .filter(Boolean);

    if (
      assignedAgents.some(
        (agent) =>
          agent.position?.row > localRows || agent.position?.col > localCols,
      )
    ) {
      return res.status(400).json({
        error: "Local grid is too small for the current agent positions.",
      });
    }
  }

  run.neighborhoods.forEach((neighborhood, index) => {
    const neighborhoodRow = Math.floor(index / neighborhoodColumns);
    const neighborhoodCol = index % neighborhoodColumns;

    neighborhood.bounds = {
      rowStart: neighborhoodRow * localRows + 1,
      rowEnd: neighborhoodRow * localRows + localRows,
      colStart: neighborhoodCol * localCols + 1,
      colEnd: neighborhoodCol * localCols + localCols,
    };
  });

    const boundedNeighborhoods = run.neighborhoods.filter(
      (neighborhood) => neighborhood.bounds,
    );

    for (const neighborhood of run.neighborhoods) {
      neighborhood.neighbors = [];
    }

    for (const source of boundedNeighborhoods) {
      for (const target of boundedNeighborhoods) {
        if (source === target) continue;

        const direction = directionOf(source.bounds, target.bounds);

        if (!direction) continue;

        source.neighbors.push({
          neighborhoodId: target.id,
          direction,
          distance: distanceBetween(source.bounds, target.bounds),
        });
      }
    }

  run.layout = {
    globalRows,
    globalCols,
    localRows,
    localCols,
    neighborhoodRows,
    neighborhoodColumns,
  };

  res.json({ layout: run.layout, neighborhoods: run.neighborhoods });
}

export function fillNeighborhoodSlots(req, res) {
  const run = findExperimentRunById(req.params.id);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  const unassignedAgents = getAgents(run).filter(
    (agent) => !agent.neighborhoodId,
  );
  let createdCount = 0;
  let assignedCount = 0;
  let slotCount = 0;

  for (const neighborhood of run.neighborhoods) {
    if (!neighborhood.bounds) continue;

    const localRows =
      neighborhood.bounds.rowEnd - neighborhood.bounds.rowStart + 1;
    const localCols =
      neighborhood.bounds.colEnd - neighborhood.bounds.colStart + 1;

    for (let row = 1; row <= localRows; row++) {
      for (let col = 1; col <= localCols; col++) {
        slotCount++;

        const occupied = getAgents(run).some(
          (agent) =>
            agent.neighborhoodId === neighborhood.id &&
            agent.position?.row === row &&
            agent.position?.col === col,
        );

        if (occupied) continue;

        let agent = unassignedAgents.shift();

        if (!agent) {
          agent = {
            id: randomUUID(),
            deviceId: `generated-${run.id}-${getAgents(run).length + 1}`,
            stateId: getStateId(STATE_NAMES.INACTIVE),
            neighborhoodId: null,
            position: { row: null, col: null },
            priority: 1,
            status: "online",
            lastSeen: new Date().toISOString(),
            metadata: { generatedBy: "fill_layout" },
          };
          addAgent(run, agent);
          createdCount++;
        }

        agent.neighborhoodId = neighborhood.id;
        agent.position = { row, col };

        if (!neighborhood.agentIds.includes(agent.id)) {
          neighborhood.agentIds.push(agent.id);
        }

        assignedCount++;
      }
    }
  }

  res.json({
    slotCount,
    assignedCount,
    createdCount,
    agentCount: getAgents(run).length,
    neighborhoods: run.neighborhoods,
  });
}

export function addAgentsToNeighborhood(req, res) {
  const run = findExperimentRunById(req.body.experimentRunId);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  const neighborhood = findNeighborhoodById(run, req.params.id);

  if (!neighborhood) {
    return res.status(404).json({ error: "Neighborhood not found" });
  }

  const assignments =
    req.body.assignments ||
    (Array.isArray(req.body.agentIds)
      ? req.body.agentIds.map((agentId) => ({
          agentId,
          row: req.body.row,
          col: req.body.col,
        }))
      : [{ agentId: req.body.agentId, row: req.body.row, col: req.body.col }]);

  const errors = [];
  const assigned = [];

  for (const { agentId, row, col } of assignments) {
    const agent = findAgentById(run, agentId);

    if (!agent) {
      errors.push({ agentId, error: "Agent not found." });
      continue;
    }

    if (agent.neighborhoodId && agent.neighborhoodId !== neighborhood.id) {
      errors.push({
        agentId,
        error: "Agent is already in another neighborhood.",
      });
      continue;
    }

    const localRows = neighborhood.bounds
      ? neighborhood.bounds.rowEnd - neighborhood.bounds.rowStart + 1
      : GRID_ROWS_BOUND;
    const localCols = neighborhood.bounds
      ? neighborhood.bounds.colEnd - neighborhood.bounds.colStart + 1
      : GRID_COLS_BOUND;

    if (!isValidPosition(row, col, localRows, localCols)) {
      errors.push({
        agentId,
        error: `Agent position is out of bounds, must be within row 1-${localRows} and col 1-${localCols}.`,
      });
      continue;
    }

    const occupied = Boolean(
      getAgents(run).find(
      (item) =>
        item.id !== agent.id &&
        item.neighborhoodId === neighborhood.id &&
        item.position.row === row &&
        item.position.col === col,
      ),
    );

    if (occupied) {
      errors.push({
        agentId,
        error: `Position row ${row}, col ${col} is already occupied`,
      });
      continue;
    }

    if (agent.stateId === getStateId(STATE_NAMES.OFFLINE)) continue;

    if (!neighborhood.agentIds.includes(agent.id)) {
      neighborhood.agentIds.push(agent.id);
    }

    agent.neighborhoodId = neighborhood.id;
    agent.position = { row, col };
    assigned.push(agent.id);
  }

  res.json({ neighborhood, assigned, errors });
}

export function connectNeighborhoods(req, res) {
  const run = findExperimentRunById(req.body.experimentRunId);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  const withBounds = getStoredNeighborhoods(run).filter(
    (neighborhood) => neighborhood.bounds,
  );

  for (const neighborhood of getStoredNeighborhoods(run)) {
    neighborhood.neighbors = [];
  }

  for (const source of withBounds) {
    for (const target of withBounds) {
      if (source === target) continue;

      const direction = directionOf(source.bounds, target.bounds);

      if (!direction) continue;

      source.neighbors.push({
        neighborhoodId: target.id,
        direction,
        distance: distanceBetween(source.bounds, target.bounds),
      });
    }
  }

  res.json({
    connected: withBounds.length,
    skipped: getStoredNeighborhoods(run).length - withBounds.length,
    neighborhoods: getStoredNeighborhoods(run),
  });
}

export function removeAgentFromNeighborhood(req, res) {
  const run = findExperimentRunById(req.body.experimentRunId);

  if (!run) {
    return res.status(404).json({ error: "ExperimentRun not found" });
  }

  const neighborhood = findNeighborhoodById(run, req.params.id);

  if (!neighborhood) {
    return res.status(404).json({ error: "Neighborhood not found" });
  }

  const agent = findAgentById(run, req.params.agentId);

  if (!agent || agent.neighborhoodId !== neighborhood.id) {
    return res.status(404).json({ error: "Agent is not in this neighborhood" });
  }

  neighborhood.agentIds = neighborhood.agentIds.filter((id) => id !== agent.id);
  agent.neighborhoodId = null;
  agent.position = { row: null, col: null };

  res.json(neighborhood);
}