/*
  Shortest path through the Neighborhood graph.

  Breadth-first search over the `neighbors` connections, which is enough
  for hop-count routing. Weighted routing (latency, cost) would need
  Dijkstra instead.

  Returns the full path including start and destination, or null if the
  destination cannot be reached.
*/
// weighted strategies (lowestLatency, lowestCost) need Dijkstra and
// connection weights, so only hop-count routing is supported for now
export const SUPPORTED_STRATEGIES = ["shortest"];

export function findRoute(
  run,
  fromNeighborhoodId,
  toNeighborhoodId,
  strategy = "shortest",
) {
  if (!SUPPORTED_STRATEGIES.includes(strategy)) return null;

  if (!fromNeighborhoodId || !toNeighborhoodId) return null;

  if (fromNeighborhoodId === toNeighborhoodId) return [fromNeighborhoodId];

  const queue = [[fromNeighborhoodId]];
  const seen = new Set([fromNeighborhoodId]);

  while (queue.length) {
    const path = queue.shift();

    const current = run.neighborhoods.find(
      (n) => n.id === path[path.length - 1],
    );

    for (const link of current?.neighbors ?? []) {
      if (seen.has(link.neighborhoodId)) continue;

      seen.add(link.neighborhoodId);

      const nextPath = [...path, link.neighborhoodId];

      if (link.neighborhoodId === toNeighborhoodId) return nextPath;

      queue.push(nextPath);
    }
  }

  return null;
}
