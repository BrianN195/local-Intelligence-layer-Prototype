

// direction of b relative to a, or null if they are not adjacent
export function directionOf(a, b) {
  const sameRows = a.rowStart === b.rowStart && a.rowEnd === b.rowEnd;
  const sameCols = a.colStart === b.colStart && a.colEnd === b.colEnd;

  if (sameRows && a.colEnd + 1 === b.colStart) return "east";
  if (sameRows && b.colEnd + 1 === a.colStart) return "west";
  if (sameCols && a.rowEnd + 1 === b.rowStart) return "south";
  if (sameCols && b.rowEnd + 1 === a.rowStart) return "north";

  return null;
}

// manhattan distance between the centers of both bounds, in global cells
export function distanceBetween(a, b) {
  const center = (bounds) => ({
    row: (bounds.rowStart + bounds.rowEnd) / 2,
    col: (bounds.colStart + bounds.colEnd) / 2,
  });

  const ca = center(a);
  const cb = center(b);

  return Math.abs(ca.row - cb.row) + Math.abs(ca.col - cb.col);
}