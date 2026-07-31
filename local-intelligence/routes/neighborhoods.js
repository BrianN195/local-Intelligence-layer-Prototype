import express from "express";
import { store } from "../store.js";
import { randomUUID } from "crypto";

const router = express.Router();

// bounds depend on neighborhood grid size
const GRID_ROWS_BOUND = 3; 
const GRID_COLS_BOUND = 3; 

function isValidPosition(row, col) {
  return (
    Number.isInteger(row) &&
    Number.isInteger(col) &&
    row >= 1 && row <= GRID_ROWS_BOUND &&
    col >= 1 && col <= GRID_COLS_BOUND
  )
}

/* ====================================================
   CREATE NEIGHBORHOOD
==================================================== */
router.post("/neighborhoods", (req, res) => {
  const run = store.experimentRuns.find(
    (r) => r.id === req.body.experimentRunId,
  );

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const neighborhood = {
    id: randomUUID(),
    experimentRunId: run.id,
    agentIds: [],
  };

  run.neighborhoods.push(neighborhood);

  res.status(201).json(neighborhood);
});

/* ====================================================
   ADD AGENT(S) TO NEIGHBORHOOD
==================================================== */
router.post("/neighborhoods/:id/agents", (req, res) => {
  const run = store.experimentRuns.find(
    (r) => r.id === req.body.experimentRunId,
  );

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const neighborhood = run.neighborhoods.find((n) => n.id === req.params.id);

  if (!neighborhood) {
    return res.status(404).json({
      error: "Neighborhood not found",
    });
  }

  // Support both:
  // { agentId: "...", row, col}
  // { [{ agentId: "...", row, col}, {...}] }

  const assignments = req.body.assignments ||
  [{agentId: req.body.agentId, row: req.body.row, col: req.body.col}];

  const errors = [];
  const assigned = [];

  for (const {agentId, row, col} of assignments) {
    const agent = run.agents.find((a) => a.id === agentId);

    if (!agent) {
      errors.push({ agentId, error: "Agent not found." });
      continue;
    }

    // prevent agent assignment to new neighborhood if already assigned
    if (agent.neighborhoodId && agent.neighborhoodId !== neighborhood.id) {
      errors.push({
        agentId,
        error: "Agent is already in another neighborhood.",
      });
      continue;

    if (!isValidPosition(agent.position.row, agent.position.col)) {
      errors.push({
        agentId,
        error: `Agent position is out of bounds, must be within row 1-${GRID_ROWS_BOUND} and col 1-${GRID_COLS_BOUND}.`,
      });
      continue;
    }

    const occupied = run.agents.some(
      (a) =>
        a.id !== agent.id &&
        a.neighborhoodId === neighborhood.id &&
        a.position.row === row &&
        a.position.col === col,
    );
 
    if (occupied) {
      errors.push({
        agentId,
        error: `Position row ${row}, col ${col} is already occupied`,
      });
      continue;
    }

    if (!neighborhood.agentIds.includes(agent.id)) {
      neighborhood.agentIds.push(agent.id);
    }

    agent.neighborhoodId = neighborhood.id;
    agent.position = {row, col}
  }

  res.json(neighborhood);
});

export default router;
