import createSignal from "../createSignal.js";
import { findExperimentRunById } from "../repositories/experimentRunRepository.js";
import { findAgentById } from "../repositories/agentRepository.js";

export function createSignalFromRequest(req, res) {
  const run = findExperimentRunById(req.body.experimentRunId);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const sourceExists = Boolean(findAgentById(run, req.body.sourceAgentId));
  const targetExists = Boolean(findAgentById(run, req.body.targetAgentId));

  if (!sourceExists || !targetExists) {
    return res.status(400).json({
      error: "Invalid agent reference",
      sourceExists,
      targetExists,
    });
  }

  const signal = createSignal(run, {
    type: req.body.type,
    sourceAgentId: req.body.sourceAgentId,
    targetAgentId: req.body.targetAgentId,
    payload: req.body.payload || {},
    properties: req.body.properties || {},
  });

  if (!signal) {
    return res.status(400).json({
      error: "Signal could not be created",
    });
  }

  res.status(201).json(signal);
}