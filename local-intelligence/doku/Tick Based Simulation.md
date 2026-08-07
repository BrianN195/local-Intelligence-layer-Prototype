# Proposal: Tick-Based Simulation Engine for Local Intelligence

## Motivation

Currently, swarm behavior is only evaluated when a signal is processed.

This means that agents stop adapting to their environment if no new signals are generated.

To enable continuous adaptation and more realistic collective behavior, the simulation engine could periodically update all agents.

---

## Current Flow

Signal received

↓

processSignal()

↓

Rule Evaluation

↓

Swarm Behavior

↓

Logging

---

## Proposed Flow

Experiment Run starts

↓

Simulation Loop

↓

For every simulation tick

↓

For every Agent

↓

Analyze Neighborhood

↓

Evaluate Rules

↓

Execute Swarm Behavior

↓

Generate new Signals if necessary

↓

Logging

↓

Next Tick

---

## Benefits

- Continuous adaptation
- More realistic swarm behavior
- Emergent behavior can develop over time
- Self-organization without external events
- Easier implementation of future algorithms

---

## Signal Processing

Signals would no longer be the primary trigger of the system.

Instead, signals become events that are processed during a simulation tick.

This separates:

- Simulation timing
- Rule evaluation
- Signal propagation

---

## Possible Configuration

```json
{
  "tickRate": 100,
  "maxTicks": 10000,
  "autoStop": true
}
```

---

## Future Extensions

- Variable tick rate
- Pause / Resume simulation
- Distributed simulation
- Parallel neighborhood processing
- Priority scheduling
- Dynamic agent updates

---

## Notes

This proposal is intended as a future architectural improvement.

The current event-driven implementation remains valid for the prototype and can later be migrated without changing the overall data model.