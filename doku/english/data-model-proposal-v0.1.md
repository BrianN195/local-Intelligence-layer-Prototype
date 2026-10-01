# Local Intelligence Data Model Proposal v0.1

> **Status:** Proposal (version 0.1). This document presents a proposed data model for discussion and further development; it is not, by itself, a claim that every field or relationship is implemented in the current backend.

## Agent

### Connection to Crowds

The existing Crowds backend already manages connected performer devices, active sessions, and real-time communication through Socket.IO.

An Agent extends this runtime by representing a performer as an autonomous participant in a Local Intelligence experiment. Rather than introducing a new client type, Agent provides a logical abstraction that can maintain its own state, exchange signals, and participate in local interactions.

### Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier of the Agent |
| `deviceId` | string | Identifier of the connected Crowds device |
| `stateId` | AgentState | Current state of the Agent |
| `neighborhoodId` | string | Neighborhood to which the Agent belongs |

### Relationships

- belongs to one Neighborhood
- has one current AgentState
- can send and receive Signals
- participates in one ExperimentRun through its Neighborhood
- may be connected to multiple NeighborRelations

### Example Record

Readable example:

```json
{
  "id": "agent-17",
  "deviceId": "phone-17",
  "stateId": "state-19",
  "neighborhoodId": "7"
}
```

## AgentState

### Connection to Crowds

The Crowds backend already stores global application state through `State.js`, allowing the system to synchronize the overall runtime of a session.

AgentState introduces a separate layer for modeling the internal state of an individual Agent during a Local Intelligence experiment. While the existing backend focuses on global synchronization, AgentState enables each Agent to change its behavior independently in response to local interactions and rules.

### Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `agentId` | string | Reference to the Agent |
| `state` | string (enum) | Current state (inactive, waiting, active, …) |
| `updatedAt` | datetime | Time of the last state change |

### Relationships

- belongs to one Agent
- may be updated by one or more Rules
- may be recorded during an ExperimentRun

### Example Record

Readable example:

```json
{
  "id": "state-19",
  "agentId": "agent-17",
  "state": "active",
  "updatedAt": "2026-06-25T14:23:41Z"
}
```

## Neighborhood

### Connection to Crowds

The current Crowds backend manages sessions and connected performers but has no concept of local interaction groups.

Neighborhood introduces this additional abstraction by grouping Agents within an ExperimentRun. It defines the local interaction context in which Signals may propagate and Rules are evaluated. Neighborhood membership may be derived from existing session information, seating layouts, or experiment-specific configurations.

### Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `experimentRunId` | string | Reference to the ExperimentRun |
| `bounds` | Object | Global position of the Neighborhood (`rowStart`, `rowEnd`, `colStart`, `colEnd`), inclusive and 1-indexed. Used only to derive adjacency. |
| `agentIds` | string[] | References to Agents belonging to the Neighborhood. An Agent belongs to exactly one Neighborhood. |
| `neighbors` | Object[] | Adjacent Neighborhoods, each represented by (`neighborhoodId`, `direction`, `distance`) |

#### Possible Future Field

`name` (string) — Optional human-readable identifier for operators. This field is not required by the core model but could improve usability during experiment setup and monitoring.

### Relationships

- belongs to one ExperimentRun
- contains multiple Agents
- contains multiple NeighborRelations
- may receive Signals during an ExperimentRun

### Example Record

Readable example:

```json
{
  "id": "7",
  "experimentRunId": "12",
  "bounds": { "rowStart": 1, "rowEnd": 3, "colStart": 4, "colEnd": 6 },
  "agentIds": [
    "agent-17",
    "agent-18",
    "agent-19",
    "agent-20"
  ],
  "neighbors": [
    { "neighborhoodId": "6", "direction": "west", "distance": 3 },
    { "neighborhoodId": "8", "direction": "east", "distance": 3 }
  ]
}
```

## Signal

### Connection to Crowds

The existing Crowds backend already distributes synchronized events between the controller, performers, and visitors through Socket.IO.

Signal builds on this communication infrastructure by representing experiment-specific information exchanged within a Local Intelligence experiment. Signals may originate from an ExperimentRun or an Agent, allowing local interactions, rule evaluation, and signal propagation to be modeled independently of the underlying transport mechanism.

### Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `type` | string | Type of signal |
| `sourceId` | string | Origin of the Signal (Agent or Experiment run) |
| `targetId` | string | Target Agent or Neighborhood |
| `payload` | Object | Signal-specific data |
| `timestamp` | datetime | Time the Signal was created |

### Relationships

- may originate from an ExperimentRun
- may originate from an Agent
- may target a Neighborhood or an Agent
- may trigger one or more Rules
- may generate multiple PropagationEvents

### Example Record

Readable example:

```json
{
  "id": "501",
  "type": "pulse",
  "sourceId": "agent-17",
  "targetId": "agent-18",
  "payload": {
    "strength": 1.0,
    "color": "red"
  },
  "timestamp": "2026-06-25T19:30:00Z"
}
```

## RuleSet

### Connection to Crowds

A RuleSet defines the behavioral logic that can be applied during a Crowds session. The existing backend has no explicit rule system; instead, real-time behavior is handled through Socket.IO events (controller → performer/visitor).

RuleSets introduce a structured abstraction layer that interprets incoming Socket.IO signals and translates them into Agent-level behavior changes, such as AgentState updates and Signal propagation.

### Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `experimentRunId` | string | Reference to the ExperimentRun |
| `ruleIds` | string[] | List of behavioral rules |
| `active` | boolean | Whether the RuleSet is currently active |

#### Possible Future Field

`name` (string) — Optional human-readable identifier for operators. This field is not required by the core model but could improve usability during experiment setup and monitoring.

### Relationships

- belongs to one ExperimentRun
- references multiple Rules (via `ruleIds`)
- evaluates Signals
- can update AgentState

### Example Record

Readable example:

```json
{
  "id": "ruleset-1",
  "experimentRunId": "12",
  "active": true,
  "ruleIds": [
    "rule-1",
    "rule-2"
  ]
}
```

## Rule

### Connection to Crowds

Rules define how incoming Socket.IO events (controller/performer/visitor updates) are interpreted in a Local Intelligence context. In the Crowds backend, this logic currently lives implicitly in socket handlers (`controller.js`, `performer.js`). Rules make it explicit and configurable.

### Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `type` | string | Rule type (e.g. threshold, pattern-match) |
| `signalType` | string | Type of signal to which the Rule reacts |
| `action` | string | Action to execute (activate, propagate, sync) |
| `threshold` | number | Activation threshold |

### Relationships

- belongs to a RuleSet
- evaluates a Signal
- may update AgentState
- may generate a PropagationEvent

### Example Record

Readable example:

```json
{
  "id": "rule-1",
  "type": "threshold",
  "signalType": "pulse",
  "action": "activate",
  "threshold": 2
}
```

## ExperimentRun

### Connection to Crowds

An ExperimentRun maps almost one-to-one to a Crowds “session.” In the backend, a session is already represented by `Session.js` and coordinated through Socket.IO namespaces.

ExperimentRun extends this concept by adding:

- Agent-level modeling
- Neighborhood structure
- rule execution
- an observability layer

### Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `sessionId` | string | Reference to a Crowds Session |
| `status` | string | running/paused/finished |
| `startedAt` | datetime | Start time |
| `endedAt` | datetime | End time |

### Relationships

- uses one Crowds Session (`Session.js`)
- contains multiple Neighborhoods
- contains one RuleSet
- produces ObservationMetrics
- produces CollectiveBehaviorResults

### Example Record

Readable example:

```json
{
  "id": "exp-1",
  "sessionId": "1",
  "status": "running",
  "startedAt": "2026-06-25T19:00:00Z",
  "endedAt": null
}
```

## PropagationEvent

### Connection to Crowds

PropagationEvents represent what currently happens implicitly in Socket.IO broadcasts:

```text
controller emits event → backend forwards → performer receives
```

In Local Intelligence terms, each broadcast becomes a traceable propagation step. This is especially useful because the backend already has real-time event flows through:

- `/controller`
- `/performer`
- `/visitor`

### Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `signalId` | string | Related Signal |
| `sourceId` | string | Source of the Signal |
| `targetId` | string | Target of the Signal |
| `timestamp` | datetime | Time of propagation |
| `status` | string | success/blocked/delayed |

### Relationships

- belongs to a Signal
- connects two Agents
- may trigger Rule evaluation
- is part of ExperimentRun tracing

### Example Record

Readable example:

```json
{
  "id": "prop-88",
  "signalId": "501",
  "sourceId": "agent-17",
  "targetId": "agent-18",
  "timestamp": "2026-06-25T19:30:01Z",
  "status": "success"
}
```

## ObservationMetric

### Connection to Crowds

The Crowds backend already exposes `/metrics` (in-memory counters for connections and messages). ObservationMetrics extend this into experiment-level analytics. Instead of tracking only system health, the model measures collective behavior patterns.

### Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `experimentRunId` | string | Reference to the ExperimentRun |
| `type` | string | Metric type (sync, latency, clustering) |
| `value` | number | Measured value |
| `timestamp` | datetime | Measurement time |

### Relationships

- belongs to an ExperimentRun
- computed from PropagationEvents
- derived from AgentState changes
- used to evaluate CollectiveBehaviorResult

### Example Record

Readable example:

```json
{
  "id": "metric-1",
  "experimentRunId": "exp-1",
  "type": "synchronization-score",
  "value": 0.87,
  "timestamp": "2026-06-25T19:35:00Z"
}
```

## CollectiveBehaviorResult

### Connection to Crowds

CollectiveBehaviorResult represents the interpreted outcome of a Local Intelligence ExperimentRun. While the Crowds backend currently focuses on real-time synchronization and system health through `/metrics`, this entity introduces a semantic interpretation layer describing emergent group behavior.

It is computed from:

- ObservationMetrics (quantitative signals such as sync, latency, and clustering)
- PropagationEvents (how Signals moved through the system)
- AgentState transitions (how Agents reacted over time)

In the existing Crowds architecture, this would not be stored directly today, but could be derived after a session from MongoDB session logs and Socket.IO event traces.

### Fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `experimentRunId` | string | Reference to the ExperimentRun |
| `type` | string | Type of emergent behavior (sync, clustering, wave, consensus) |
| `score` | number | Normalized strength of the observed behavior (0–1) |
| `confidence` | number | Confidence in the measurement based on data completeness |
| `startTime` | datetime | Start time |
| `endTime` | datetime | End time |
| `summary` | string | Human-readable interpretation of the result |

### Relationships

- belongs to one ExperimentRun
- derived from ObservationMetrics
- derived from PropagationEvents
- derived from AgentState changes
- summarizes global system behavior across a Neighborhood or a full ExperimentRun

### Example Record

Readable example:

```json
{
  "id": "cbr-1",
  "experimentRunId": "exp-1",
  "type": "synchronization",
  "score": 0.91,
  "confidence": 0.84,
  "startTime": "2026-06-25T19:20:00Z",
  "endTime": "2026-06-25T19:35:00Z",
  "summary": "High synchronization emerged across all agents after repeated pulse signals propagated through the network."
}
```

## Existing Backend → Local Intelligence Mapping

| Crowds Backend | Local Intelligence Concept |
|---|---|
| `Session.js` | ExperimentRun |
| `State.js` | AgentState |
| Socket.IO events | Signal |
| controller/performer/visitor sockets | Agent interactions |
| `/metrics` endpoint | ObservationMetric (system-level baseline) |
| MongoDB session storage | ExperimentRun + Neighborhood persistence |
| real-time broadcasts | PropagationEvent |

> The identifiers and field names above are retained as proposed in v0.1. The implementation may differ; consult the corresponding workspace models, including [Agent](../../local-intelligence/models/Agent.js), [AgentState](../../local-intelligence/models/AgentState.js), [Neighborhood](../../local-intelligence/models/Neighborhood.js), [Signal](../../local-intelligence/models/Signal.js), [Rule](../../local-intelligence/models/Rule.js), [RuleSet](../../local-intelligence/models/RuleSet.js), [ExperimentRun](../../local-intelligence/models/ExperimentRun.js), [PropagationEvent](../../local-intelligence/models/PropagationEvent.js), [ObservationMetric](../../local-intelligence/models/ObservationMetric.js), and [CollectiveBehaviorResult](../../local-intelligence/models/CollectiveBehaviorResult.js).
