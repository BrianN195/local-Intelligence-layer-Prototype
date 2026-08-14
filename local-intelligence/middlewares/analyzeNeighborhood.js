export default function analyzeNeighborhood(run, agentId) {
  const agent = run.agents.find((a) => a.id === agentId);

  if (!agent) {
    return null;
  }

  const neighborhood = run.neighborhoods.find(
    (n) => n.id === agent.neighborhoodId,
  );

  if (!neighborhood) {
    return null;
  }

  const agents = neighborhood.agentIds
    .map((id) => run.agents.find((a) => a.id === id))
    .filter(Boolean);

  const totalAgents = agents.length;
  //===================================
  // AGENTS FILTER OF STATE
  //===================================
  const activeAgents = agents.filter((a) => a.stateId === 2).length;

  const inactiveAgents = agents.filter((a) => a.stateId === 1).length;

  const synchronizedAgents = agents.filter((a) => a.stateId === 3).length;

  //===================================
  // AGENTS RATIO
  //===================================

  const inactiveRatio = totalAgents > 0 ? inactiveAgents / totalAgents : 0;

  const synchronizedRatio =
    totalAgents > 0 ? synchronizedAgents / totalAgents : 0;

  let dominantState = "none";

  if (activeAgents >= inactiveAgents && activeAgents >= synchronizedAgents) {
    dominantState = "active";
  } else if (inactiveAgents >= synchronizedAgents) {
    dominantState = "inactive";
  } else {
    dominantState = "synchronized";
  }

  return {
    neighborhoodId: neighborhood.id,

    totalAgents,

    activeAgents,
    inactiveAgents,
    synchronizedAgents,

    // activeRatio,
    inactiveRatio,
    synchronizedRatio,

    dominantState,
  };
}
