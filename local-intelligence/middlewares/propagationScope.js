// ====================================================
// PROPAGATION SCOPE
// ====================================================

export function canPropagateToNeighborhood(
  signal,
  currentNeighborhood,
  targetNeighborhood,
) {
  const scope = signal.properties?.propagationScope ?? "neighborhood";

  if (!targetNeighborhood) {
    return false;
  }

  // ====================================================
  // SAME NEIGHBORHOOD
  // ====================================================

  if (scope === "neighborhood") {
    return currentNeighborhood.id === targetNeighborhood.id;
  }

  // ====================================================
  // ADJACENT NEIGHBORHOODS
  // ====================================================

  if (scope === "adjacent") {
    if (currentNeighborhood.id === targetNeighborhood.id) {
      return true;
    }

    return currentNeighborhood.neighbors?.some(
      (neighbor) => neighbor.neighborhoodId === targetNeighborhood.id,
    );
  }

  // ====================================================
  // SPECIFIC NEIGHBORHOODS
  // ====================================================

  if (scope === "specific") {
    const targetNeighborhoodIds =
      signal.properties?.targetNeighborhoodIds ?? [];
    // vllt nochmal die namen überlegen wegen dopplungen
    return (
      currentNeighborhood.id === targetNeighborhood.id ||
      targetNeighborhoodIds.includes(targetNeighborhood.id)
    );
  }

// ====================================================
// DIRECTION
// ====================================================

if (scope === "direction") {
  const direction =
    signal.properties?.propagationDirection;

  if (!direction) {
    return false;
  }

  if (currentNeighborhood.id === targetNeighborhood.id) {
    return true;
  }

  return currentNeighborhood.neighbors?.some(
    (neighbor) =>
      neighbor.neighborhoodId === targetNeighborhood.id &&
      neighbor.direction === direction,
  );
}

// ====================================================
// ROUTE
// ====================================================

if (scope === "route") {
  const route =
    signal.properties?.propagationRoute ?? [];

  if (!Array.isArray(route) || route.length === 0) {
    return false;
  }

  const currentIndex =
    route.indexOf(currentNeighborhood.id);

  const targetIndex =
    route.indexOf(targetNeighborhood.id);

  if (currentIndex === -1 || targetIndex === -1) {
    return false;
  }

  // Only allow the next neighborhood in the route
  if (targetIndex !== currentIndex + 1) {
    return false;
  }

  // Make sure the two neighborhoods are actually connected
  return currentNeighborhood.neighbors?.some(
    (neighbor) =>
      neighbor.neighborhoodId === targetNeighborhood.id,
  );
}
  // ====================================================
  // GLOBAL
  // ====================================================

  if (scope === "global") {
    return true;
  }

  // ====================================================
  // UNKNOWN SCOPE
  // ====================================================

  return false;
}
