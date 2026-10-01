# Proposal: Intelligent Signal Routing for the Local Intelligence Layer

> **Status:** Proposal. This document describes a possible future capability; it does not claim that intelligent routing is already implemented.

## Motivation

The current architecture provides a strong foundation:

- Each Agent can be assigned to at most one Neighborhood; assignment is optional in the current schema.
- Neighborhoods form an explicit graph through Neighborhood-to-Neighborhood connections.
- Signals can propagate between connected Neighborhoods.

The next logical step is to make signal propagation **intelligent**. Rather than simply forwarding a Signal to every reachable Neighbor, a Signal could select an efficient route to its destination. This would transform propagation from simple flooding into goal-oriented distributed routing.

## Current Situation

The current propagation engine forwards a Signal from one Agent to neighboring Agents. When a Signal reaches a Neighborhood boundary, it may continue into one of the connected Neighborhoods.

Conceptually:

```text
Neighborhood A
        │
        ▼
Neighborhood B
        │
        ▼
Neighborhood C
```

This approach works well for local propagation but can become inefficient as an experiment grows.

## The Problem

Imagine an experiment consisting of dozens or hundreds of Neighborhoods. A Signal starts inside **Neighborhood 1** and is intended for **Neighborhood 10**.

Without routing intelligence, the Signal has no knowledge of the destination and propagates step by step through the graph. This can lead to:

- unnecessary propagation
- duplicated work
- additional latency
- increased CPU usage
- unnecessary memory consumption
- excessive propagation events

As the experiment scales, this approach becomes increasingly inefficient.

## Routing Targets

A Signal should be able to specify its destination. Two destination types are useful.

### Target Neighborhood

```json
{
  "targetNeighborhoodId": "NH10"
}
```

The objective is to deliver the Signal to a specific Neighborhood.

### Target Agent

```json
{
  "targetAgentId": "agent-275"
}
```

The system first determines which Neighborhood currently owns the Agent:

```text
Agent
      ↓
Neighborhood
      ↓
Routing
```

When an Agent is assigned to a Neighborhood, its neighborhood can be looked up from that assignment.

## Why Agent Lookup Is Not Expensive

At first glance, searching for an Agent before routing may seem like an expensive extra operation. In practice, it is usually negligible:

```text
Agent ID
      ↓
Lookup Neighborhood
      ↓
Calculate Route
```

With a hash map, Agent-ID lookup is typically $O(1)$ on average. Route-computation cost depends on graph size and the selected algorithm; it is not necessarily more expensive than every Agent lookup. Supporting both destination types adds an Agent-to-Neighborhood lookup when the target is an Agent.

## Intelligent Routing

Instead of forwarding blindly, the Signal could use a route through the Neighborhood graph. For example:

```text
NH01
 │
 ▼
NH04
 │
 ▼
NH08
 │
 ▼
NH10
```

The calculated route could be stored inside the Signal:

```json
{
  "route": [
    "NH01",
    "NH04",
    "NH08",
    "NH10"
  ]
}
```

During propagation, the Signal would follow the planned route.

## Multiple Routing Strategies

Different experiments may require different routing behavior. Possible strategies include:

- shortest path
- lowest latency
- lowest propagation cost
- highest bandwidth
- highest reliability
- minimum hop count

The routing strategy could therefore become part of the Signal:

```json
{
  "routingStrategy": "lowestLatency"
}
```

## Connection Metadata

Neighborhood connections can contain additional information, for example:

```json
{
  "targetNeighborhoodId": "NH05",
  "latency": 12,
  "bandwidth": 100,
  "packetLoss": 0.01,
  "cost": 2
}
```

Routing decisions could use this connection quality instead of treating every connection equally.

## Dynamic Route Recalculation

Experiments are dynamic, and connections may change while a Signal is travelling. Examples include:

- a Neighborhood becoming unavailable
- a server going offline
- high latency
- congestion
- a temporary connection failure

Rather than failing immediately, the Signal could calculate a new route from its current position.

## Future Distributed Routing

A more advanced version could avoid calculating the complete path at the beginning. Instead, each Neighborhood would choose only the next hop based on local information:

```text
Signal
   │
   ▼
Neighborhood A
   │
 chooses B
   ▼
Neighborhood B
   │
 chooses D
   ▼
Neighborhood D
```

This resembles routing in distributed computer networks and could enable adaptive behavior.

## Possible Signal Extensions

```json
{
  "targetNeighborhoodId": "...",
  "targetAgentId": "...",
  "route": [],
  "currentHop": 0,
  "routingStrategy": "shortest",
  "routeCalculated": true
}
```

## Possible Neighborhood Extensions

```json
{
  "neighbors": {
    "north": "...",
    "south": "...",
    "east": "...",
    "west": "..."
  },
  "connections": [
    {
      "targetNeighborhoodId": "...",
      "latency": 15,
      "cost": 2,
      "bandwidth": 100
    }
  ]
}
```

## Possible Routing Algorithms

The most appropriate algorithm depends on the available information.

| Algorithm | Best suited for |
|------------|-----------------|
| Breadth-First Search (BFS) | Fewest Neighborhood hops |
| Dijkstra | Weighted routing (latency, cost) |
| A* | Spatial Neighborhood layouts with coordinates |
| Bellman-Ford | Dynamic edge costs |
| Link-State Routing | Large distributed experiments |
| Reinforcement Learning | Future adaptive swarm routing |

For the current prototype:

- BFS is sufficient for shortest-path routing.
- Dijkstra becomes useful once weighted connections (latency, cost, bandwidth) are introduced.

## Relationship to the Existing Neighborhood Proposal

This proposal builds directly on the existing Neighborhood architecture, which introduced:

- one Agent per Neighborhood
- explicit Neighborhood ownership
- explicit Neighborhood connections
- graph-based Neighborhood topology

This proposal extends that architecture by enabling Signals to use those Neighborhood connections intelligently. The existing graph could serve as routing infrastructure. The implementation-level [Signal model](../../local-intelligence/models/Signal.js) and [Neighborhood model](../../local-intelligence/models/Neighborhood.js) provide workspace context. The [path-finding module](../../local-intelligence/routing/pathFinder.js) is currently empty; the routing behavior described here is proposed, not implemented.

## Long-Term Vision

Intelligent routing could open the door to advanced swarm behavior, including:

- adaptive routing
- congestion avoidance
- self-healing communication
- distributed path discovery
- collaborative routing between Neighborhoods
- decentralized decision making
- load balancing
- predictive routing
- autonomous optimization
- emergent communication patterns

These capabilities could move the Local Intelligence Layer beyond deterministic signal propagation toward a distributed system capable of self-organizing communication.

## Expected Benefits

Compared with simple propagation, intelligent routing could offer:

- fewer propagation events
- reduced computational overhead
- lower network traffic
- faster signal delivery
- better scalability
- improved fault tolerance
- more realistic swarm communication
- a foundation for collective intelligence
- a foundation for emergent behavior
- a foundation for future self-organizing algorithms
