export function getNeighborhoods(run) {
  return run?.neighborhoods ?? [];
}

export function findNeighborhoodById(run, neighborhoodId) {
  return getNeighborhoods(run).find(
    (neighborhood) => neighborhood.id === neighborhoodId,
  );
}

export function addNeighborhood(run, neighborhood) {
  run.neighborhoods.push(neighborhood);
  return neighborhood;
}
