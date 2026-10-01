export function getAgents(run) {
  return run?.agents ?? [];
}

export function findAgentById(run, agentId) {
  return getAgents(run).find((agent) => agent.id === agentId);
}

export function addAgent(run, agent) {
  run.agents.push(agent);
  return agent;
}

export function findAgentByPosition(run, neighborhoodId, row, col) {
  return getAgents(run).find(
    (agent) =>
      agent.neighborhoodId === neighborhoodId &&
      agent.position?.row === row &&
      agent.position?.col === col,
  );
}
