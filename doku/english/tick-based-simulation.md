# Tick-Based Simulation

## Motivation

The current runtime processes signals and can also run scheduled simulation ticks while an experiment is active. However, the existing tick mechanism is not yet the fully configurable, per-agent loop proposed below.

A simulation engine that periodically updates all agents could enable continuous adaptation and more realistic collective behavior. This is a proposed future improvement, not behavior provided by the current runtime.

## Current flow

Signal received

↓

`processSignal()`

↓

Rule evaluation

↓

Swarm behavior

↓

Logging

## Proposed flow

Experiment run starts

↓

Simulation loop

↓

For each simulation tick

↓

For each agent

↓

Analyze neighborhood

↓

Evaluate rules

↓

Execute swarm behavior

↓

Generate signals if needed

↓

Logging

↓

Next tick

## Potential benefits

- Continuous adaptation
- More realistic swarm behavior
- Time for emergent behavior to develop
- Self-organization without external events
- A foundation for implementing future algorithms

## Signal processing

In the proposed design, signals would no longer be the system's primary trigger. Instead, they would be events processed during a simulation tick.

This separates:

- Simulation timing
- Rule evaluation
- Signal propagation

## Possible configuration

```json
{
  "tickRate": 100,
  "maxTicks": 10000,
  "autoStop": true
}
```

## Possible future extensions

- Variable tick rate
- Pause and resume
- Distributed simulation
- Parallel neighborhood processing
- Priority scheduling
- Dynamic agent updates

## Status and notes

This document proposes extending the existing tick mechanism. The current scheduler invokes a simulation tick every 1,000 ms by default while a run is active; the richer tick-rate, per-agent processing, and scheduling options described above are proposals, not all current runtime behavior. Any extension should preserve existing behavior and be evaluated against the data model and persistence design.
