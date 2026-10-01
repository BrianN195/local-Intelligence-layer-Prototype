# Prototype database connection and data model

> **Source note:** The source file named `prototypDatabaseConnectionExplain.md` contains a data-model overview rather than an explanation of the database connection. This document corrects that mismatch and separates verified prototype behavior from conceptual or proposed entities.

## 1. Current database connection and persistence

The prototype uses Mongoose to connect to MongoDB. [database.js](../../local-intelligence/config/database.js) reads `MONGODB_URI` from the environment and fails with a configuration error if it is missing. The optional `MONGODB_SERVER_SELECTION_TIMEOUT_MS` setting defaults to `10000` milliseconds.

At startup, [app.js](../../local-intelligence/app.js) loads `local-intelligence/.env`, connects to MongoDB, restores experiment-run snapshots, and then starts the HTTP server. The in-memory `store.experimentRuns` array is the working store for runs. The persistence service writes each run as a `data` snapshot in the `experimentruns` collection and also copies selected fields into the document for querying. API responses associated with a run trigger persistence, and a periodic flush runs every 3000 ms by default (configurable with `PERSISTENCE_FLUSH_INTERVAL_MS`). Graceful shutdown saves all runs and disconnects from MongoDB.

This is snapshot-based persistence for experiment runs. The existence of other Mongoose model schemas does not mean that all runtime data is currently written to separate collections through those models.

## 2. Data-model layers

The source sketch groups the model concepts as follows:

1. **Experiment:** `ExperimentRun`, `ExperimentParticipant`.
2. **Agents and neighborhoods:** `Agent`, `AgentState`, `AgentStateHistory`, `Neighborhood`, `NeighborhoodRelation`.
3. **Signals and propagation:** `Signal`, `PropagationEvent`, `Rule`, `RuleSet`, `Threshold`.
4. **Observations and results:** `Observation`, `ObservationMetric`, `CollectiveBehaviorResult`.
5. **Operations and diagnostics:** `ProtocolEvent`, `TechnicalWarning`, `FailureState`.
6. **Supporting or proposed concepts:** `State`, `Session`, `Media`.

The implementation names the relationship model `NeighborhoodRelation`; the source sometimes calls it `NeighborRelation`.

## 3. Central conceptual relationship

```text
ExperimentRun
├── ExperimentParticipant
├── Agent ── AgentState / AgentStateHistory
│   ├── Neighborhood ── NeighborhoodRelation ── Agent
│   └── Signal ── PropagationEvent
├── Observation ── ObservationMetric
├── CollectiveBehaviorResult
├── ProtocolEvent
├── TechnicalWarning
└── FailureState
```

This is a domain-level diagram, not a guarantee that every line is a persisted database reference or a one-to-many constraint.

## 4. ExperimentRun and participants

`ExperimentRun` represents one experiment execution. Its schema includes run status (`created`, `running`, `paused`, `finished`, `failed`, or `cancelled`), lifecycle information, environment (`test`, `rehearsal`, `research`, or `production`), `activeRuleSetId`, statistics, diagnostics, and an optional `sessionId`. That `sessionId` is an external session identifier; it is not a reference to a local `Session` model. At runtime, the complete run is stored as a snapshot in the MongoDB collection `experimentruns`. `ExperimentParticipant` is a separate model definition, but the snapshot persistence path does not write it separately.

## 5. Agents, states, and neighborhoods

`Agent` represents a device or participant in the simulation. Its schema includes `experimentRunId`, `deviceId`, `stateId`, `neighborhoodId`, position, autonomy settings, status (`offline`, `online`, or `busy`), and `lastSeen`. An agent's state is represented by `AgentState`; `AgentStateHistory` is intended to record changes over time. The agent schema has one `neighborhoodId` field, but the broader domain rule and relationship behavior should still be checked against the relevant workflows.

`Neighborhood` represents a local interaction context. `NeighborhoodRelation` represents a direct connection between agents. The source describes an agent as belonging to one neighborhood in the proposed architecture; treat that as a domain rule to validate against the relevant workflow, rather than a universal database constraint established by this diagram.

Example local position:

```json
{
  "position": {
    "row": 2,
    "col": 3
  }
}
```

## 6. Signals, propagation, and rules

`Signal` represents a message associated with a run and potentially with source and target agents. The source sketch names `sourceAgentId`, `targetAgentId`, `experimentRunId`, `neighborhoodId`, and `correlationId` as relevant relationships. `PropagationEvent` records a propagation or processing step and can refer to the signal, participating agents, triggered rules, status, and correlation identifier. Treat this list as a domain description; verify individual fields against each schema before relying on them.

`Rule` represents one behavioral rule, `RuleSet` groups rules, and `Threshold` can hold an activation boundary. `ExperimentRun.activeRuleSetId` identifies the active rule-set reference. Whether experiment-level control messages and agent-to-agent messages should share the same `Signal` model remains an open design question.

## 7. Observations, results, and diagnostics

`Observation` captures an observed event or situation; `ObservationMetric` stores associated measurements. `CollectiveBehaviorResult` holds an analysis outcome, such as synchronization, propagation, clustering, or consensus.

`ProtocolEvent` records significant domain or technical events. The source notes list names such as `SESSION_CREATED`, `SESSION_CONNECTED`, `SESSION_DISCONNECTED`, `SIGNAL_CREATED`, `SIGNAL_STATUS_CHANGED`, `PROPAGATION_CREATED`, `PROPAGATION_STATUS_CHANGED`, `NEIGHBORHOOD_CREATED`, `NEIGHBORHOOD_UPDATED`, `RULESET_CREATED`, `RULESET_ASSIGNED`, and `AGENT_REPLACED` as examples. These names are not all confirmed by the current route implementation; `AGENT_REPLACED`, for example, appears in the neighborhood service. `TechnicalWarning` represents a technical warning, while `FailureState` represents a failure condition. These concepts have different purposes and should not be treated as interchangeable.

| Concept | Meaning |
| --- | --- |
| `ProtocolEvent` | What happened in the system? |
| `TechnicalWarning` | What technical warning or symptom was detected? |
| `FailureState` | What confirmed failure condition is present? |

For example, an agent heartbeat timeout may generate a `TechnicalWarning`; a confirmed outage may be represented by a `FailureState`; and a replacement operation may be recorded as a `ProtocolEvent`. The exact events emitted depend on the implemented workflow.

## 8. Implemented models versus proposals

The current [model index](../../local-intelligence/models/index.js) exports schemas for `Agent`, `AgentState`, `AgentStateHistory`, `CollectiveBehaviorResult`, `ExperimentParticipant`, `ExperimentRun`, `FailureState`, `Neighborhood`, `NeighborhoodRelation`, `Observation`, `ObservationMetric`, `PropagationEvent`, `ProtocolEvent`, `Rule`, `RuleSet`, `Signal`, `State`, `TechnicalWarning`, and `Threshold`. This confirms that those model definitions exist; it does not establish that every proposed association or workflow is complete.

The source also lists `Session` and `Media`, but neither appears as a dedicated exported model in the current model index. The source's proposed Session fields include `type`, `socketId`, `performerId`, `isConnected`, `lastSeen`, and `disconnectReason`, with a lifecycle of created, connected, disconnected, and reconnected. These are design notes, not verified fields or lifecycle records in a local Session model. Consider `Session` and `Media` proposals or external concepts unless and until local model definitions and workflows are added. Likewise, replacement-agent relation transfer and other lifecycle behaviors should be treated as design statements unless verified in their implementation.

## 9. Example end-to-end domain flow

```text
ExperimentRun
  ↓
Neighborhood
  ↓
Agent A
  ↓ creates
Signal
  ↓ propagates
PropagationEvent
  ├── Rule / RuleSet
  └── Agent B
        ↓
Observation
  ↓
ObservationMetric
  ↓
CollectiveBehaviorResult
```

Important system events may also be recorded as `ProtocolEvent` entries. A technical problem may produce a `TechnicalWarning` and, if a failure is confirmed, a `FailureState`.

For a concise entity overview, see [Entity map](entity-map-v0.1.md). For a concrete, explicitly illustrative signal/autonomy scenario, see [Signal, autonomy, and follow-up example](rule-signal-autonomy-example.md).
