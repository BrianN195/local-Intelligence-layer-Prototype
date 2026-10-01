# Local Intelligence entity map (v0.1)

This is a high-level conceptual map of the prototype's domain. The relationships below explain the domain; they do not imply that every association is enforced as a database foreign key or stored in a separate collection.

## Entity overview

- **Experiment:** `ExperimentRun` provides the context for a run; `ExperimentParticipant` associates participants with it.
- **Agents and neighborhoods:** `Agent`, `AgentState`, `AgentStateHistory`, `Neighborhood`, and `NeighborhoodRelation` describe participants, their current and historical state, and local connections. `NeighborhoodRelation` is the implementation's model name; the source notes also call it `NeighborRelation`.
- **Signals and rules:** `Signal` and `PropagationEvent` describe messages and their propagation; `RuleSet`, `Rule`, and `Threshold` describe behavioral configuration.
- **Observation and results:** `Observation`, `ObservationMetric`, and `CollectiveBehaviorResult` cover recorded observations, measures, and analysis outcomes.
- **Operations and diagnostics:** `ProtocolEvent`, `TechnicalWarning`, and `FailureState` represent event records, technical warnings, and failure conditions.
- **Supporting model:** `State` defines state data used by the prototype.

## Conceptual relationships

```text
ExperimentRun
├── ExperimentParticipant
├── Agent ── AgentState / AgentStateHistory
│   ├── Neighborhood ── NeighborhoodRelation ── Agent
│   └── Signal ── PropagationEvent
├── RuleSet ── Rule ── Threshold
├── Observation ── ObservationMetric
├── CollectiveBehaviorResult
├── ProtocolEvent
├── TechnicalWarning
└── FailureState
```

An agent's state and neighborhood membership are modeled separately. Signals may be created by an agent or by experiment-level control logic; propagation and rule evaluation depend on the experiment configuration.

## Implementation status and open questions

The repository exports model schemas for `Agent`, `AgentState`, `AgentStateHistory`, `CollectiveBehaviorResult`, `ExperimentParticipant`, `ExperimentRun`, `FailureState`, `Neighborhood`, `NeighborhoodRelation`, `Observation`, `ObservationMetric`, `PropagationEvent`, `ProtocolEvent`, `Rule`, `RuleSet`, `Signal`, `State`, `TechnicalWarning`, and `Threshold` from the [model index](../../local-intelligence/models/index.js). This confirms that model definitions exist; it does not by itself mean every workflow or relationship is fully implemented or persisted through those individual models. Experiment-run persistence also stores a run snapshot.

`Session` and `Media` appear in the broader source model sketch, but there are no corresponding exported model schemas in the current model index. Treat them as proposed or external concepts, not as implemented local models. In particular, `ExperimentRun.sessionId` is an optional external session identifier, not a reference to a local `Session` model.

The original map asks whether experiment-level and agent-to-agent communication should share one `Signal` entity. That remains a modeling question; this map does not settle it.

## Signal-flow examples

```text
Agent
  ↓
Signal
  ↓
NeighborhoodRelation
  ↓
Agent
  ↓
Rule
  ↓
AgentState
```

```text
ExperimentRun
  ↓
Signal
  ↓
Neighborhood
  ↓
Agent
  ↓
Signal
  ↓
NeighborhoodRelation
  ↓
Agent
  ↓
Rule
  ↓
AgentState
```

See also [Prototype database and data model](prototype-database-connection.md) and [Signal, autonomy, and follow-up example](rule-signal-autonomy-example.md).
