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

  const activeAgents = agents.filter(
    (a) => a.stateId === 2,
  ).length;

  const inactiveAgents = agents.filter(
    (a) => a.stateId === 1,
  ).length;

  const synchronizedAgents = agents.filter(
    (a) => a.stateId === 3,
  ).length;

  //===================================
  // AGENTS RATIO
  //===================================

  const inactiveRatio =
    totalAgents > 0
      ? inactiveAgents / totalAgents
      : 0;

  const synchronizedRatio =
    totalAgents > 0
      ? synchronizedAgents / totalAgents
      : 0;

  //===================================
  // DOMINANT STATE
  //===================================

  let dominantState = "none";

  if (
    activeAgents >= inactiveAgents &&
    activeAgents >= synchronizedAgents
  ) {
    dominantState = "active";
  } else if (inactiveAgents >= synchronizedAgents) {
    dominantState = "inactive";
  } else {
    dominantState = "synchronized";
  }

  //===================================
  // LOCAL NEIGHBORS
  //===================================

  const localNeighbors = agents.filter((otherAgent) => {
    if (otherAgent.id === agent.id) {
      return false;
    }

    if (
      !otherAgent.position ||
      otherAgent.position.row === null ||
      otherAgent.position.col === null
    ) {
      return false;
    }

    const rowDistance = Math.abs(
      otherAgent.position.row - agent.position.row,
    );

    const colDistance = Math.abs(
      otherAgent.position.col - agent.position.col,
    );

    // Direct orthogonal neighbors only
    return (
      rowDistance + colDistance === 1
    );
  });

  const activeLocalNeighbors =
    localNeighbors.filter(
      (a) => a.stateId === 2,
    ).length;

  const inactiveLocalNeighbors =
    localNeighbors.filter(
      (a) => a.stateId === 1,
    ).length;

  const synchronizedLocalNeighbors =
    localNeighbors.filter(
      (a) => a.stateId === 3,
    ).length;

  return {
    neighborhoodId: neighborhood.id,

    //===================================
    // WHOLE NEIGHBORHOOD
    //===================================

    totalAgents,

    activeAgents,
    inactiveAgents,
    synchronizedAgents,

    inactiveRatio,
    synchronizedRatio,

    dominantState,

    //===================================
    // LOCAL AGENT NEIGHBORS
    //===================================

    localNeighbors: localNeighbors.map(
      (a) => a.id,
    ),

    localNeighborCount:
      localNeighbors.length,

    activeLocalNeighbors,

    inactiveLocalNeighbors,

    synchronizedLocalNeighbors,
  };
}