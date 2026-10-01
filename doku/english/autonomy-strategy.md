# Autonomy strategy

This document describes the autonomy flow present in the prototype. It is an implementation overview, not a proposal for a future subsystem.

## Function flow

```text
agentAutonomy()          → decide
executeAutonomousAction() → apply a decision
runAutonomy()             → process eligible agents
autonomyScheduler()       → run one or more simulation ticks
```

## Responsibilities

- `agentAutonomy()` evaluates an agent's local neighborhood and returns a decision such as `activate`, `listen`, `wait`, `idle`, or `observe`. Its current decisions are based on the counts and states of local neighbors.
- `runAutonomy()` skips agents that are offline, lack a neighborhood, or have autonomy suspended; it analyzes each eligible agent, records an observation, and passes the decision to the executor.
- `executeAutonomousAction()` applies supported state changes, logs them, and evaluates state-change rules. An activation can also create an `autonomous_activation` signal for an inactive local neighbor.
- `autonomyScheduler()` runs the requested number of simulation ticks. A tick also analyzes signals and processes due scheduled actions; it is not itself a permanent background timer.

The implementation can be explored in the project under `local-intelligence/services/autonomy/` and `local-intelligence/services/simulation/`.

## Related documentation

- [Entity map](entity-map-v0.1.md)
- [Prototype database and data model](prototype-database-connection.md)
- [Signal, autonomy, and follow-up example](rule-signal-autonomy-example.md)
