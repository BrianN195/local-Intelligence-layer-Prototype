# Proposal: Local Neighborhood Model without Overlapping Neighborhoods

## Motivation

I think that allowing agents to belong to multiple overlapping Neighborhoods is not the best approach.

Instead, every Agent should belong to exactly one Neighborhood. This makes ownership clear, avoids duplicate processing, and simplifies state management.

Communication between Neighborhoods should happen through explicit Neighborhood-to-Neighborhood connections instead of shared Agents.

---

## Neighborhood Structure

Each Neighborhood represents a local area containing its own Agents.

For example, every Neighborhood could contain a local **3×3 grid**:

```
1 2 3
4 5 6
7 8 9
```

The Agent positions are **local coordinates** inside the Neighborhood only.

For example:

```json
{
  "position": {
    "row": 2,
    "col": 3
  }
}
```

These coordinates have no meaning outside the Neighborhood.

---

## Global Neighborhood Layout

Although Agent positions remain local, Neighborhoods themselves still exist inside a larger global layout.

Each Neighborhood therefore stores global bounds that describe where it is located in the overall experiment.

Example:

```
+-----+-----+-----+
| N00 | N01 | N02 |
+-----+-----+-----+
| N10 | N11 | N12 |
+-----+-----+-----+
| N20 | N21 | N22 |
+-----+-----+-----+
```

Example bounds:

```
N00
rows 1-3
cols 1-3

N01
rows 1-3
cols 4-6

N10
rows 4-6
cols 1-3
```

These bounds are used only to determine which Neighborhoods are adjacent.

Agents themselves still only know their local coordinates.

---

## Explicit Neighborhood Connections

Neighborhoods should explicitly know their neighboring Neighborhoods.

Example:

```json
{
  "neighbors": {
    "north": "...",
    "south": "...",
    "east": "...",
    "west": "..."
  }
}
```

Connections can be generated automatically by comparing the global bounds of two Neighborhoods.

For example:

* same rows + adjacent columns → east / west
* same columns + adjacent rows → north / south

This creates a graph of directly connected Neighborhoods.

---

## Advantages

Compared to overlapping Neighborhoods, this approach offers several benefits:

* Every Agent belongs to exactly one Neighborhood.
* No duplicated Agent membership.
* Simpler synchronization.
* Clear ownership of Agent state.
* Explicit communication paths between Neighborhoods.
* Easier scaling to larger environments.
* More predictable propagation algorithms.

---

## Future Possibilities

Since every Neighborhood knows its adjacent Neighborhoods, future propagation algorithms can move information between Neighborhoods without requiring overlapping Agent memberships.

For example:

```
Neighborhood A
      │
      ▼
Neighborhood B
      │
      ▼
Neighborhood C
```

Signals, events, or aggregated state could be forwarded only to directly connected Neighborhoods.

This creates a clean graph-based structure that is easier to extend while keeping each Neighborhood internally independent.

# Olivia – Agent Layer

Most of the Agent functionality already exists and should only require minor adjustments.

### Existing functionality

* Register Agent endpoint
* Update Agent State endpoint
* Agent State History

### Required changes

* Ensure an Agent can belong to **only one** Neighborhood.
* Store the assigned `neighborhoodId`.
* Keep Agent positions local to the Neighborhood (e.g. row 1–3, col 1–3).
* Prevent assigning an Agent to multiple Neighborhoods.
* Adapt the existing Agent endpoints where necessary to support the revised Neighborhood architecture.

---

# William – Neighborhood Layer

Most Neighborhood functionality already exists and should be extended rather than redesigned.

### Existing functionality

* Create Neighborhood endpoint
* Add Agent(s) to Neighborhood endpoint

### Required changes

* Keep Agent membership exclusive.
* Store the list of Agents belonging to each Neighborhood.
* Add an endpoint for connecting Neighborhoods.
* Store neighboring Neighborhood references.
* Store metadata about neighboring Neighborhoods (e.g. direction and distance).
* Use global Neighborhood bounds to determine adjacency and establish Neighborhood connections.
* Adapt the existing Neighborhood endpoints to support the revised architecture.
