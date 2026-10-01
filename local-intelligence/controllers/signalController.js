import createSignal from "../createSignal.js";
import { findExperimentRunById } from "../repositories/experimentRunRepository.js";
import { findAgentById } from "../repositories/agentRepository.js";
import { findRoute, SUPPORTED_STRATEGIES } from "../routing.js";
import { PROPAGATION_SCOPES } from "../constants/propagation.js";

export function createSignalFromRequest(req, res) {
  const run = findExperimentRunById(req.body.experimentRunId);

  if (!run) {
    return res.status(404).json({
      error: "ExperimentRun not found",
    });
  }

  const sourceAgentId = req.body.sourceAgentId ?? req.body.sourceId;
  const targetNeighborhoodId = req.body.targetNeighborhoodId ?? null;
  const requestedTargetAgentId = req.body.targetAgentId ?? null;
  const targetAgentId = requestedTargetAgentId ?? req.body.targetId;

  if (requestedTargetAgentId && targetNeighborhoodId) {
    return res.status(400).json({
      error: "Provide either targetAgentId or targetNeighborhoodId, not both",
    });
  }

  const sourceAgent = findAgentById(run, sourceAgentId);
  const targetAgent = findAgentById(run, targetAgentId);

  if (!sourceAgent || !targetAgent) {
    return res.status(400).json({
      error: "Invalid agent reference",
      sourceExists: Boolean(sourceAgent),
      targetExists: Boolean(targetAgent),
    });
  }

  const destinationNeighborhoodId =
    targetNeighborhoodId ?? targetAgent.neighborhoodId ?? null;

  if (
    destinationNeighborhoodId &&
    !run.neighborhoods.some(
      (neighborhood) => neighborhood.id === destinationNeighborhoodId,
    )
  ) {
    return res.status(404).json({ error: "Target Neighborhood not found" });
  }

  const routingStrategy = req.body.routingStrategy ?? "shortest";

  if (!SUPPORTED_STRATEGIES.includes(routingStrategy)) {
    return res.status(400).json({
      error: `Unsupported routingStrategy. Supported: ${SUPPORTED_STRATEGIES.join(", ")}`,
    });
  }

  const route = destinationNeighborhoodId
    ? findRoute(
        run,
        sourceAgent.neighborhoodId,
        destinationNeighborhoodId,
        routingStrategy,
      )
    : null;
  const properties = { ...(req.body.properties ?? {}) };

  if (targetNeighborhoodId && route?.length > 1) {
    properties.propagationScope = PROPAGATION_SCOPES.ROUTE;
    properties.propagationRoute = route;
  }

  const signal = createSignal(run, {
    type: req.body.type,
    sourceAgentId,
    targetAgentId,
    payload: req.body.payload || {},
    properties,
    targetNeighborhoodId: destinationNeighborhoodId,
    route: route ?? [],
    routingStrategy,
    routeCalculated: Boolean(route),
  });

  if (!signal) {
    return res.status(400).json({
      error: "Signal could not be created",
    });
  }

  res.status(201).json(signal);
}