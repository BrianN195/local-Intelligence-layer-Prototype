# Data-Layer Handover: Models and API Routes

This document summarizes conceptual data models and proposed route capabilities for the Crowds Local Intelligence / Data Layer. Model relationships and route behavior below reflect the documented architecture and intended design; they are not evidence that every model, route, or feature exists in the current codebase. Verify implementation separately before relying on any item as available. See the [route specification](api-routes.md) for the detailed proposal.

## 1. Data models

The Crowds Local Intelligence / Data Layer design describes data models for experiments, agents, neighborhoods, signals, propagation, observations, and technical events.

### Central models

- **`ExperimentRun`** — Represents one experiment run. It includes information such as status, environment, and runtime details, and serves as an overarching link for many other records.
- **`ExperimentParticipant`** — Links agents or other participants to an `ExperimentRun`.
- **`Agent`** — Represents a device or participant in the system. An agent may have status, position, and a `neighborhoodId`, among other properties.
- **`AgentState` / `AgentStateHistory`** — Store an agent's current state and its historical state changes.
- **`Neighborhood`** — Describes a local area within an experiment and may contain associated agents. The intended architecture assigns an agent to one neighborhood, but assignment is optional in the current schema.
- **`NeighborRelation`** — Describes relationships between agents within or across local areas. The identifier is retained as written in the source document.
- **`Signal`** — Stores a signal created by one agent and potentially passed to another. The record includes properties such as source, target, status, and `correlationId`.
- **`PropagationEvent`** — Documents the forwarding or processing of a signal between agents, making the signal's path traceable.
- **`Observation` / `ObservationMetric`** — Store observations and their associated measurements during an experiment.
- **`Rule` / `RuleSet` / `Threshold`** — Represent rules and configurations used for processing and behavior within an experiment.
- **`ProtocolEvent`** — Provides central event logging. Important actions, such as creating a signal, changing its status, or creating a neighborhood, are intended to be recorded as events.
- **`TechnicalWarning` / `FailureState`** — Document technical problems, warnings, and failure states, for example an agent timeout or outage.
- **`Session`** — A proposed or external concept for a technical connection. The current Local Intelligence model index does not export a local Session model.

### Model relationships

The central relationship can be simplified as:

`ExperimentRun → Neighborhood → Agent`

Communication can be represented as:

`Agent → Signal → PropagationEvent → Agent`

Important processes are additionally documented through `ProtocolEvent`; technical problems are recorded through `TechnicalWarning` or `FailureState`.

Together, these relationships describe a traceable data structure for storing system state, communication, and experiment events. They describe the intended data model and do not certify that every relationship is enforced by the current implementation.

## 2. API routes

The routes below describe the interface envisioned between the frontend or simulator and the database. They cover creating, updating, retrieving, and, in some cases, deleting data. Treat this section as a route and behavior specification, not as a verified inventory of implemented endpoints.

### Experiment and lifecycle routes

The experiment-related routes are intended to manage experiment runs and their lifecycle.

The documented cleanup route is:

`POST /lifecycle/cleanup/test-experiments`

It is intended to clean up old test experiments and associated data, including participants, signals, propagation events, observations, and technical events. Its current implementation is not confirmed here.

### Neighborhood routes

- `POST /neighborhoods` — Creates a neighborhood and may assign agents to it directly.
- `PATCH /neighborhoods/:id` — Updates properties such as the name, configuration, or agent assignment.

The described behavior checks whether agents exist and whether they are already assigned to another neighborhood.

### Signal routes

- `POST /signals` — Creates a signal and checks, among other things, that the source agent and any optional target agent exist.
- `PATCH /signals/:id/status` — Changes a signal's status, for example:

  `created → sent → received → processed`

  The status change is also intended to be documented as a `ProtocolEvent`.

### Propagation routes

- `POST /propagation` — Creates a `PropagationEvent` for forwarding a signal.
- `PATCH /propagation/:id/status` — Updates the propagation's processing status and may store timestamps for `received` and `processed`.

These changes are also intended to be logged through `ProtocolEvent`.

### Session routes

- `POST /sessions` — Creates a session.
- `GET /sessions/:id` — Retrieves a specific session.
- `PATCH /sessions/:id/connect` — Marks a session as connected.
- `PATCH /sessions/:id/disconnect` — Marks a session as disconnected and stores the reason.

The major session-lifecycle changes are also intended to be recorded as `ProtocolEvent` entries.

### RuleSet routes

- `POST /rulesets` — Creates a `RuleSet` for an experiment.
- `PATCH /rulesets/:id/assign` — Assigns a `RuleSet` to an experiment and makes it the active `RuleSet`.

### Media routes

The media routes are intended to provide media available to the system:

- `GET /visuals`
- `GET /sounds`
- `GET /mp3s`

The described design prefers data from MongoDB. If no list is available there, it falls back to files in the `public` directory. This behavior is not confirmed as implemented.

### Recovery and simulator capabilities

The described recovery capabilities include monitoring MongoDB load and deleting disconnected sessions.

The described simulator capabilities include:

- Listing available test scenarios.
- Starting simulator runs.
- Retrieving running runs.
- Displaying reports.
- Deleting old simulator reports.

The source document does not specify route paths for these recovery and simulator capabilities; none are inferred here.

## Summary

The documented API design covers the following lifecycle:

`Create → Update → Read → Lifecycle → Logging → Cleanup`

A key design principle is that relevant system actions should not only change the underlying data but also be traceable through `ProtocolEvent`. This is intended to support later analysis, monitoring, debugging, and KPI evaluation; it should not be read as confirmation that those capabilities are currently implemented.

## 3. Priority 8 — Interactive / Taiwan Observability Support

According to the source handover note, only “Rehearsal/test-run grouping” was completed. The other items are unfinished and need revision. This status statement has not been independently verified.

## Related documentation

- [Event Taxonomy and Schema Governance](event-taxonomy-and-schema-governance-v0.1.md)
- [API Routes](api-routes.md)
