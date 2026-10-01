export default function analyzeCollectiveIntelligence(run) {
  const totalAgents = run.agents.length;

  if (totalAgents === 0) {
    return {
      totalAgents: 0,
      stateCounts: {},
      dominantState: null,
      dominantCount: 0,
      dominantRatio: 0,
      consensus: false,
      neighborhoods: [],
    };
  }

  // ====================================================
  // GLOBAL AGENT STATE ANALYSIS

  const stateCounts = {};

  for (const agent of run.agents) {
    const stateId = agent.stateId;

    stateCounts[stateId] =
      (stateCounts[stateId] || 0) + 1;
  }

  let dominantState = null;
  let dominantCount = 0;

  for (const [stateId, count] of Object.entries(stateCounts)) {
    if (count > dominantCount) {
      dominantState = Number(stateId);
      dominantCount = count;
    }
  }

  const dominantRatio =
    dominantCount / totalAgents;

  const consensus = dominantRatio >= 0.8;

  // ====================================================
  // NEIGHBORHOOD ANALYSIS

  const neighborhoods = [];

  for (const neighborhood of run.neighborhoods) {
    const agents = run.agents.filter((agent) =>
      neighborhood.agentIds?.includes(agent.id),
    );

    if (agents.length === 0) {
      neighborhoods.push({
        neighborhoodId: neighborhood.id,
        totalAgents: 0,
        dominantState: null,
        dominantRatio: 0,
        consensus: false,
      });

      continue;
    }

    const neighborhoodStateCounts = {};

    for (const agent of agents) {
      const stateId = agent.stateId;

      neighborhoodStateCounts[stateId] =
        (neighborhoodStateCounts[stateId] || 0) + 1;
    }

    let neighborhoodDominantState = null;
    let neighborhoodDominantCount = 0;

    for (const [stateId, count] of Object.entries(
      neighborhoodStateCounts,
    )) {
      if (count > neighborhoodDominantCount) {
        neighborhoodDominantState = Number(stateId);
        neighborhoodDominantCount = count;
      }
    }

    const neighborhoodDominantRatio =
      neighborhoodDominantCount / agents.length;

    neighborhoods.push({
      neighborhoodId: neighborhood.id,

      totalAgents: agents.length,

      stateCounts: neighborhoodStateCounts,

      dominantState: neighborhoodDominantState,

      dominantCount: neighborhoodDominantCount,

      dominantRatio: neighborhoodDominantRatio,

      consensus: neighborhoodDominantRatio >= 0.8,
    });
  }

  return {
    totalAgents,

    stateCounts,

    dominantState,

    dominantCount,

    dominantRatio,

    consensus,

    neighborhoods,
  };
}