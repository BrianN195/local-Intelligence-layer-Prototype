/*
  Route planning through the Neighborhood graph.

  Dijkstra over the `neighbors` connections. Every strategy uses the same
  search and only differs in which connection field is used as the weight,
  so "shortest" is simply every connection weighted as one hop.

  Returns the full path including start and destination, or null if the
  destination cannot be reached.
*/

const WEIGHT_FIELDS = {
  shortest: null,
  lowestLatency: "latency",
  lowestCost: "cost",
};

export const SUPPORTED_STRATEGIES = Object.keys(WEIGHT_FIELDS);

function weightOf(link, strategy) {
  const field = WEIGHT_FIELDS[strategy];

  if (!field) return 1;

  // connections without a usable weight fall back to one hop
  return typeof link[field] === "number" && link[field] >= 0
    ? link[field]
    : 1;
}

export function findRoute(
  run,
  fromNeighborhoodId,
  toNeighborhoodId,
  strategy = "shortest",
) {
  if (!SUPPORTED_STRATEGIES.includes(strategy)) return null;

  if (!fromNeighborhoodId || !toNeighborhoodId) return null;

  if (fromNeighborhoodId === toNeighborhoodId) return [fromNeighborhoodId];

  const distance = new Map([[fromNeighborhoodId, 0]]);
  const previous = new Map();
  const settled = new Set();

  while (true) {
    // cheapest neighborhood not settled yet
    let current = null;
    let currentDistance = Infinity;

    for (const [id, d] of distance) {
      if (!settled.has(id) && d < currentDistance) {
        current = id;
        currentDistance = d;
      }
    }

    if (current === null) return null;

    if (current === toNeighborhoodId) break;

    settled.add(current);

    const neighborhood = run.neighborhoods.find((n) => n.id === current);

    for (const link of neighborhood?.neighbors ?? []) {
      if (settled.has(link.neighborhoodId)) continue;

      const candidate = currentDistance + weightOf(link, strategy);

      if (candidate < (distance.get(link.neighborhoodId) ?? Infinity)) {
        distance.set(link.neighborhoodId, candidate);
        previous.set(link.neighborhoodId, current);
      }
    }
  }

  const path = [toNeighborhoodId];

  while (path[0] !== fromNeighborhoodId) {
    path.unshift(previous.get(path[0]));
  }

  return path;
}
