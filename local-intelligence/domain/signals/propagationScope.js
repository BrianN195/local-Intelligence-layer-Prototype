// ====================================================
// PROPAGATION SCOPE
// ====================================================

import { PROPAGATION_SCOPES } from "../../constants/propagation.js";

export function canPropagateToNeighborhood(
  signal,
  currentNeighborhood,
  targetNeighborhood,
) {
  const scope =
    signal.properties?.propagationScope ?? PROPAGATION_SCOPES.NEIGHBORHOOD;

  if (!targetNeighborhood) {
    return false;
  }

  // ====================================================
  // SAME NEIGHBORHOOD
  // ====================================================

  if (scope === PROPAGATION_SCOPES.NEIGHBORHOOD) {
    return currentNeighborhood.id === targetNeighborhood.id;
  }

  // ====================================================
  // ADJACENT NEIGHBORHOODS
  // ====================================================

  if (scope === PROPAGATION_SCOPES.ADJACENT) {
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

  if (scope === PROPAGATION_SCOPES.SPECIFIC) {
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
  //unbedingt noch direction auf lowercase prüfen bzw setzen
  if (scope === PROPAGATION_SCOPES.DIRECTION) {
    const direction = signal.properties?.propagationDirection;

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

  if (scope === PROPAGATION_SCOPES.ROUTE) {
    const route = signal.properties?.propagationRoute ?? [];

    if (!Array.isArray(route) || route.length === 0) {
      return false;
    }

    const currentIndex = route.indexOf(currentNeighborhood.id);

    const targetIndex = route.indexOf(targetNeighborhood.id);

    if (currentIndex === -1 || targetIndex === -1) {
      return false;
    }

    // Only allow the next neighborhood in the route
    if (targetIndex !== currentIndex + 1) {
      return false;
    }

    // Make sure the two neighborhoods are actually connected
    return currentNeighborhood.neighbors?.some(
      (neighbor) => neighbor.neighborhoodId === targetNeighborhood.id,
    );
  }

  // ====================================================
  // ALL NEIGHBORHOODS
  // ====================================================

  if (scope === PROPAGATION_SCOPES.ALL) {
    return true;
  }
  // ====================================================
  // GLOBAL
  // ====================================================

  if (scope === PROPAGATION_SCOPES.GLOBAL) {
    return true;
  }

  // ====================================================
  // UNKNOWN SCOPE
  // ====================================================

  return false;
}
