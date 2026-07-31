import { randomUUID } from "crypto";

export function calculateMetrics(run) {
  const metrics = [];
  const timestamp = new Date().toISOString();

  // =========================================
  // Activation Density
  // =========================================

  const totalAgents = run.agents.length;

  const activeAgents = run.agents.filter(
    (agent) => agent.stateId === 3
  ).length;

  const activationDensity =
    totalAgents > 0 ? activeAgents / totalAgents : 0;

  metrics.push({
    id: randomUUID(),

    experimentRunId: run.id,

    type: "activation-density",

    value: activationDensity,

    timestamp,
  });

  // =========================================
  // Propagation Count
  // =========================================

  metrics.push({
    id: randomUUID(),

    experimentRunId: run.id,

    type: "signal-propagation",

    value: run.propagationEvents.length,

    timestamp,
  });

  // =========================================
  // Synchronization Score
  // =========================================

  const states = run.agents.map((agent) => agent.stateId);

  const mostCommonState = states.sort(
    (a, b) =>
      states.filter((x) => x === b).length -
      states.filter((x) => x === a).length,
  )[0];

  const sameStateCount = states.filter(
    (s) => s === mostCommonState
  ).length;

  const syncScore =
    totalAgents > 0 ? sameStateCount / totalAgents : 0;

  metrics.push({
    id: randomUUID(),

    experimentRunId: run.id,

    type: "synchronization",

    value: syncScore,

    timestamp,
  });

  // =========================================
  // Clustering
  // =========================================

  let clustering = 0;

  if (run.neighborhoods.length > 0) {
    let clusteringSum = 0;

    for (const neighborhood of run.neighborhoods) {
      const neighborhoodAgents = run.agents.filter((agent) =>
        neighborhood.agentIds.includes(agent.id),
      );

      if (neighborhoodAgents.length === 0) continue;

      const activeNeighborhoodAgents = neighborhoodAgents.filter(
        (agent) => agent.stateId === 2,
      ).length;

      clusteringSum +=
        activeNeighborhoodAgents / neighborhoodAgents.length;
    }

    clustering =
      clusteringSum / run.neighborhoods.length;
  }

  metrics.push({
    id: randomUUID(),

    experimentRunId: run.id,

    type: "clustering",

    value: clustering,

    timestamp,
  });

  // =========================================
  // Consensus
  // =========================================

  const stateCounter = {};

  for (const agent of run.agents) {
    stateCounter[agent.stateId] =
      (stateCounter[agent.stateId] || 0) + 1;
  }

  const highestCount = Math.max(
    ...Object.values(stateCounter),
    0
  );

  const consensus =
    totalAgents > 0 ? highestCount / totalAgents : 0;

  metrics.push({
    id: randomUUID(),

    experimentRunId: run.id,

    type: "consensus",

    value: consensus,

    timestamp,
  });

  return metrics;
}