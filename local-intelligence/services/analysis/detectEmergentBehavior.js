export default function detectEmergentBehavior(run) {
  const totalAgents = run.agents.length;

  if (totalAgents === 0) {
    return {
      detected: false,
      type: "none",
      confidence: 0,
      description: "No agents available for analysis.",
    };
  }

  // ====================================================
  // GLOBAL STATE DISTRIBUTION

  const stateCounts = {};

  for (const agent of run.agents) {
    stateCounts[agent.stateId] =
      (stateCounts[agent.stateId] || 0) + 1;
  }

  const dominantEntry = Object.entries(stateCounts).sort(
    ([, a], [, b]) => b - a,
  )[0];

  const dominantState = Number(dominantEntry[0]);
  const dominantCount = dominantEntry[1];

  const dominantRatio =
    dominantCount / totalAgents;

  // ====================================================
  // NEIGHBORHOOD PATTERNS

  const neighborhoodStates = [];

  for (const neighborhood of run.neighborhoods) {
    const agents = run.agents.filter((agent) =>
      neighborhood.agentIds?.includes(agent.id),
    );

    if (agents.length === 0) continue;

    const counts = {};

    for (const agent of agents) {
      counts[agent.stateId] =
        (counts[agent.stateId] || 0) + 1;
    }

    const dominant = Object.entries(counts).sort(
      ([, a], [, b]) => b - a,
    )[0];

    neighborhoodStates.push({
      neighborhoodId: neighborhood.id,
      dominantState: Number(dominant[0]),
      dominantRatio: dominant[1] / agents.length,
    });
  }

  // ====================================================
  // PATTERN 1: GLOBAL CONSENSUS

  if (dominantRatio >= 0.8) {
    return {
      detected: true,

      type: "global_consensus",

      confidence: dominantRatio,

      description:
        "A dominant state emerged across most agents.",

      dominantState,

      dominantRatio,

      neighborhoods: neighborhoodStates,
    };
  }

  // ====================================================
  // PATTERN 2: LOCAL CONSENSUS / GLOBAL DIVERGENCE

  const strongNeighborhoods =
    neighborhoodStates.filter(
      (n) => n.dominantRatio >= 0.8,
    );

  const distinctStates = new Set(
    strongNeighborhoods.map(
      (n) => n.dominantState,
    ),
  );

  if (
    strongNeighborhoods.length >= 2 &&
    distinctStates.size > 1
  ) {
    return {
      detected: true,

      type: "localized_divergence",

      confidence:
        strongNeighborhoods.length /
        neighborhoodStates.length,

      description:
        "Different neighborhoods developed distinct dominant states.",

      dominantState,

      dominantRatio,

      neighborhoods: neighborhoodStates,
    };
  }

  // ====================================================
  // NO EMERGENT PATTERN

  return {
    detected: false,

    type: "none",

    confidence: 0,

    description:
      "No significant emergent collective pattern detected.",

    dominantState,

    dominantRatio,

    neighborhoods: neighborhoodStates,
  };
}