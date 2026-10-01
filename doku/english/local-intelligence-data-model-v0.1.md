# Local Intelligence Data Model v0.1

> **Status:** Descriptive data-model overview (version 0.1). This document describes the model concepts and relationships as presented in the source; the overview is not a guarantee that every described relationship is implemented exactly as shown.

## 1. Overall Structure

The data model can be divided into the following layers:

1. **Experiment layer**
   - `ExperimentRun`
   - `ExperimentParticipant`
2. **Agent and Neighborhood layer**
   - `Agent`
   - `AgentState`
   - `AgentStateHistory`
   - `Neighborhood`
   - `NeighborRelation`
3. **Signal and propagation layer**
   - `Signal`
   - `PropagationEvent`
   - `Rule`
   - `RuleSet`
   - `Threshold`
4. **Observation and results layer**
   - `Observation`
   - `ObservationMetric`
   - `CollectiveBehaviorResult`
5. **Operations, failure, and logging layer**
   - `ProtocolEvent`
   - `TechnicalWarning`
   - `FailureState`
6. **Session and media layer**
   - `Session`
   - `Media`
   - `State`

## 2. Core Relationship

The central chain is:

```text
ExperimentRun
   │
   ├── ExperimentParticipant
   │
   ├── Agent
   │      │
   │      ├── AgentState
   │      ├── AgentStateHistory
   │      ├── Neighborhood
   │      │      └── NeighborRelation
   │      └── Signal
   │              └── PropagationEvent
   │
   ├── Observation
   │      └── ObservationMetric
   │
   ├── CollectiveBehaviorResult
   │
   ├── ProtocolEvent
   ├── TechnicalWarning
   └── FailureState
```

## 3. ExperimentRun

`ExperimentRun` is the central entity for a specific experiment run.

It includes, among other things:

- `sessionId` → association with a `Session`
- `status` → for example, `created`, `running`, `paused`, `finished`, `failed`, or `cancelled`
- lifecycle and statistics data
- `activeRuleSetId` → active `RuleSet`
- environment or experiment context

Many other models use `experimentRunId` to associate their data with a particular experiment run.

## 4. ExperimentParticipant

`ExperimentParticipant` connects participants to an `ExperimentRun`, allowing one experiment run to include multiple participants.

Relationship:

```text
ExperimentRun 1 ───── N ExperimentParticipant
```

## 5. Agent

`Agent` represents an individual device or participant within the crowd/simulation logic.

Important relationships and attributes:

- `stateId` → `AgentState`
- `neighborhoodId` → `Neighborhood`
- the Agent has position data
- `lastSeen` and `status` support online/offline monitoring
- `deviceId` identifies the Agent

In the proposed architecture, an Agent belongs to exactly **one** Neighborhood.

```text
ExperimentRun
      │
      ▼
    Agent
      │
      ├── AgentState
      └── Neighborhood
```

## 6. AgentState and AgentStateHistory

```text
Agent
 │
 ├── current state ──> AgentState
 │
 └── state changes ──> AgentStateHistory
```

This makes it possible to track both an Agent’s current state and its historical development.

## 7. Neighborhood

`Neighborhood` represents a local area within an experiment.

It includes, among other things:

- `experimentRunId`
- `name`
- `agentIds`
- `configuration`
- global bounds or spatial information

An Agent’s position can be interpreted locally within its Neighborhood.

Example: Neighborhood N01

```text
1 2 3
4 5 6
7 8 9
```

An Agent might have local coordinates such as:

```json
{
  "position": {
    "row": 2,
    "col": 3
  }
}
```

## 8. NeighborRelation

`NeighborRelation` describes a direct relationship between two Agents. A relationship can typically be understood as:

```text
Agent A ───── NeighborRelation ───── Agent B
```

In the current architecture concept, an Agent belongs to only one Neighborhood. Relationships between Agents can nevertheless exist within a Neighborhood.

When a failed Agent is replaced, its existing relationships are transferred to the replacement Agent.

## 9. Signal

`Signal` represents a message or signal originating from one Agent and potentially addressed to another.

Important relationships:

- `sourceAgentId` → source Agent
- `targetAgentId` → target Agent
- `experimentRunId` → experiment run
- `neighborhoodId` → local area
- `correlationId` → correlation of related operations

```text
Agent A
   │
   │ Signal
   ▼
Agent B
```

## 10. PropagationEvent

`PropagationEvent` records what happens to a Signal during forwarding. In particular, it links:

- `signalId`
- `experimentRunId`
- `neighborhoodId`
- `sourceAgentId`
- `targetAgentId`
- `triggeredRuleIds`
- `status`
- `correlationId`

Relationship:

```text
Signal
  │
  ▼
PropagationEvent
  │
  ├── sourceAgent
  ├── targetAgent
  └── triggered rules
```

Thus, `Signal` describes the message, while `PropagationEvent` describes its forwarding or processing.

## 11. Rule, RuleSet, and Threshold

`Rule` describes an individual rule.

`RuleSet` groups multiple rules into a configuration.

`Threshold` can represent thresholds for decision-making or behavioral logic.

Simplified relationship:

```text
Rule
 │
 └────┐
      ▼
   RuleSet
      │
      ▼
ExperimentRun
```

The `ExperimentRun` can refer to the currently active rule set through `activeRuleSetId`.

## 12. Observation and ObservationMetric

`Observation` stores an observed situation or event. `ObservationMetric` stores measurements or metrics associated with an observation.

```text
Observation
     │
     └── ObservationMetric
```

This allows the raw observation and its stored measurements to be handled separately.

## 13. CollectiveBehaviorResult

`CollectiveBehaviorResult` stores the results of an analysis of collective behavior. It belongs primarily to the results/analytics layer rather than the level of an individual technical event.

```text
Agents
  │
  ▼
Observations / Metrics
  │
  ▼
CollectiveBehaviorResult
```

## 14. ProtocolEvent

`ProtocolEvent` is the central log of important domain and technical processes.

Examples from the existing routes:

- `SESSION_CREATED`
- `SESSION_CONNECTED`
- `SESSION_DISCONNECTED`
- `SIGNAL_CREATED`
- `SIGNAL_STATUS_CHANGED`
- `PROPAGATION_CREATED`
- `PROPAGATION_STATUS_CHANGED`
- `NEIGHBORHOOD_CREATED`
- `NEIGHBORHOOD_UPDATED`
- `RULESET_CREATED`
- `RULESET_ASSIGNED`
- `AGENT_REPLACED`

Depending on the event, a `ProtocolEvent` can reference, for example:

- `experimentRunId`
- `agentId`
- `sessionId`
- `signalId`
- `propagationEventId`

## 15. TechnicalWarning

`TechnicalWarning` describes technical problems or warnings.

Example:

```text
Agent heartbeat timeout
        │
        ▼
TechnicalWarning
        │
        └── AGENT_TIMEOUT
```

This model is intended for technical warnings and should not replace normal domain-event logging.

## 16. FailureState

`FailureState` represents an actual error or failure state.

Example:

```text
Agent timeout
     │
     ▼
Failure detected
     │
     ▼
FailureState
     │
     ▼
Replacement
```

A `TechnicalWarning` can indicate a problem, whereas `FailureState` represents the actual failure condition.

## 17. Session

`Session` is a proposed concept for a technical connection or session; it is not a local model in the current Local Intelligence runtime.

The broader Crowds model sketch proposes storing, among other things:

- `type`
- `socketId`
- `performerId`
- `isConnected`
- `lastSeen`
- `disconnectReason`

Lifecycle:

```text
Session created
      │
      ▼
Connected
      │
      ▼
Disconnected
      │
      ▼
Reconnected
```

The proposed design also logs corresponding state changes through `ProtocolEvent`; this Session lifecycle is not implemented by the current Local Intelligence API.

## 18. Example of an End-to-End Flow

One possible flow is:

```text
ExperimentRun
      │
      ▼
Neighborhood
      │
      ▼
Agent A
      │
      │ creates
      ▼
Signal
      │
      │ propagates
      ▼
PropagationEvent
      │
      ├── Rule / RuleSet
      │
      └── Agent B
              │
              ▼
        Observation
              │
              ▼
     ObservationMetric
              │
              ▼
 CollectiveBehaviorResult
```

Important system events are logged in parallel:

```text
Signal created
      │
      ▼
ProtocolEvent

Signal failed / technical problem
      │
      ├── TechnicalWarning
      └── FailureState
```

## 19. The Three Most Important Event Concepts

| Concept | Question it answers |
|---|---|
| `ProtocolEvent` | What happened in the system? |
| `TechnicalWarning` | What technical problem or warning signal was detected? |
| `FailureState` | What actual error or failure condition exists? |

Example:

```text
Agent does not respond
        │
        ├── TechnicalWarning
        │      "AGENT_TIMEOUT"
        │
        ├── FailureState
        │      "Agent failed"
        │
        └── ProtocolEvent
               "AGENT_REPLACED"
```

## Summary

The models are interconnected and form a cohesive data structure:

- `ExperimentRun` defines the experiment context.
- `ExperimentParticipant` connects participants to the experiment.
- `Agent` represents devices/participants.
- `Neighborhood` organizes Agents into local areas.
- `NeighborRelation` describes Agent-to-Agent relationships.
- `AgentState` and `AgentStateHistory` manage current state and history.
- `Signal` represents communication.
- `PropagationEvent` represents the processing/forwarding of a Signal.
- `Rule`, `RuleSet`, and `Threshold` support behavioral logic.
- `Observation` and `ObservationMetric` store observations and measurements.
- `CollectiveBehaviorResult` stores analysis results.
- `ProtocolEvent` logs important system events.
- `TechnicalWarning` logs technical warnings.
- `FailureState` describes actual failure conditions.
- `Session` manages technical connections.
- `State` and `Media` support media and state data.

The workspace implementations of these concepts include [ExperimentRun](../../local-intelligence/models/ExperimentRun.js), [ExperimentParticipant](../../local-intelligence/models/ExperimentParticipant.js), [Agent](../../local-intelligence/models/Agent.js), [AgentState](../../local-intelligence/models/AgentState.js), [AgentStateHistory](../../local-intelligence/models/AgentStateHistory.js), [Neighborhood](../../local-intelligence/models/Neighborhood.js), [NeighborRelation](../../local-intelligence/models/NeighborhoodRelation.js), [Signal](../../local-intelligence/models/Signal.js), [PropagationEvent](../../local-intelligence/models/PropagationEvent.js), [Rule](../../local-intelligence/models/Rule.js), [RuleSet](../../local-intelligence/models/RuleSet.js), [Threshold](../../local-intelligence/models/Threshold.js), [Observation](../../local-intelligence/models/Observation.js), [ObservationMetric](../../local-intelligence/models/ObservationMetric.js), [CollectiveBehaviorResult](../../local-intelligence/models/CollectiveBehaviorResult.js), [ProtocolEvent](../../local-intelligence/models/ProtocolEvent.js), [TechnicalWarning](../../local-intelligence/models/TechnicalWarning.js), [FailureState](../../local-intelligence/models/FailureState.js), and [State](../../local-intelligence/models/State.js).
