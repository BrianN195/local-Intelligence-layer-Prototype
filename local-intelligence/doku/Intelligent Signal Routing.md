# Proposal: Intelligent Signal Routing for the Local Intelligence Layer

## Motivation

The current architecture already provides a strong foundation:

- Every Agent belongs to exactly one Neighborhood.
- Neighborhoods form an explicit graph through Neighborhood-to-Neighborhood connections.
- Signals can propagate between connected Neighborhoods.

The next logical step is to make signal propagation **intelligent**.

Instead of simply forwarding signals to every reachable Neighbor, a Signal should be capable of selecting an efficient route to its destination.

This transforms propagation from simple flooding into goal-oriented distributed routing.

---

# Current Situation

The current propagation engine forwards a Signal from one Agent to neighboring Agents.

When a Signal reaches a Neighborhood boundary, it may continue into one of the connected Neighborhoods.

Conceptually this looks like:

```text
Neighborhood A
        │
        ▼
Neighborhood B
        │
        ▼
Neighborhood C
```

This approach works well for local propagation but becomes inefficient as the experiment grows.

---

# The Problem

Imagine an experiment consisting of dozens or hundreds of Neighborhoods.

A Signal starts inside **Neighborhood 1**.

Its destination is **Neighborhood 10**.

Without routing intelligence the Signal has no knowledge of where the destination is.

Instead, it propagates step by step through the graph.

Possible consequences:

- unnecessary propagation
- duplicated work
- additional latency
- increased CPU usage
- unnecessary memory consumption
- excessive propagation events

As the experiment scales, this becomes increasingly inefficient.

---

# Routing Targets

A Signal should be able to specify its destination.

Two destination types are useful.

## Target Neighborhood

```json
{
  "targetNeighborhoodId": "NH10"
}
```

The objective is to deliver the Signal into a specific Neighborhood.

---

## Target Agent

```json
{
  "targetAgentId": "agent-275"
}
```

The system first determines which Neighborhood currently owns the Agent.

```text
Agent
      ↓
Neighborhood
      ↓
Routing
```

Because every Agent belongs to exactly one Neighborhood, this lookup is straightforward.

---

# Why Agent Lookup Is Not Expensive

At first glance it may seem that searching for an Agent before routing adds another expensive operation.

However, in practice this is usually negligible.

The process becomes:

```text
Agent ID
      ↓
Lookup Neighborhood
      ↓
Calculate Route
```

If Agents are stored in a hash map or indexed structure, the lookup is effectively constant time.

The expensive operation is not locating the Agent.

The expensive part is searching through the Neighborhood graph.

Therefore supporting both destination types introduces very little additional overhead.

---

# Intelligent Routing

Instead of forwarding blindly, the Signal should calculate a route through the Neighborhood graph.

Example:

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

The calculated route is stored inside the Signal.

Example:

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

During propagation the Signal simply follows the planned route.

---

# Multiple Routing Strategies

Different experiments may require different routing behavior.

Possible strategies include:

- shortest path
- lowest latency
- lowest propagation cost
- highest bandwidth
- highest reliability
- minimum hop count

The routing strategy could therefore become part of the Signal itself.

Example:

```json
{
  "routingStrategy": "lowestLatency"
}
```

---

# Connection Metadata

Neighborhood connections can contain additional information.

Example:

```json
{
  "targetNeighborhoodId": "NH05",
  "latency": 12,
  "bandwidth": 100,
  "packetLoss": 0.01,
  "cost": 2
}
```

Instead of treating every connection equally, routing decisions can consider real connection quality.

---

# Dynamic Route Recalculation

Experiments are dynamic.

Connections may change while a Signal is travelling.

Examples include:

- Neighborhood unavailable
- Server offline
- High latency
- Congestion
- Temporary connection failure

Instead of failing immediately, the Signal can calculate a new route from its current position.

---

# Future Distributed Routing

A more advanced version would avoid calculating the complete path at the beginning.

Instead, each Neighborhood only decides the next hop based on local information.

Example:

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

This resembles routing in distributed computer networks and enables adaptive behavior.

---

# Possible Signal Extensions

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

---

# Possible Neighborhood Extensions

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

---

# Possible Routing Algorithms

Different algorithms become useful depending on the available information.

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

---

# Relationship to the Existing Neighborhood Proposal

This proposal builds directly upon the existing Neighborhood architecture.

The previous proposal introduced:

- one Agent per Neighborhood
- explicit Neighborhood ownership
- explicit Neighborhood connections
- graph-based Neighborhood topology

This proposal extends that architecture by enabling Signals to use those Neighborhood connections intelligently.

No redesign of the Neighborhood model is required.

Instead, the existing graph becomes the routing infrastructure.

---

# Long-Term Vision

Introducing intelligent routing opens the door to advanced swarm behavior.

Possible future developments include:

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

These capabilities move the Local Intelligence Layer beyond deterministic signal propagation toward a distributed system capable of self-organizing communication.

---

# Expected Benefits

Compared to simple propagation, intelligent routing offers:

- fewer propagation events
- reduced computational overhead
- lower network traffic
- faster signal delivery
- better scalability
- improved fault tolerance
- more realistic swarm communication
- foundation for collective intelligence
- foundation for emergent behavior
- foundation for future self-organizing algorithms