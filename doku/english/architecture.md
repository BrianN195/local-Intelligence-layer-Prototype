# Architecture and placement conventions

This document describes the current architecture of the Local Intelligence prototype and where new files belong. It combines the current MongoDB snapshot-persistence design with the existing architectural conventions.

## Core rule

`routes/` and `controllers/` are HTTP-facing layers. Business logic belongs in `domain/` or `services/`. The `middlewares/` directory is reserved for genuine Express middleware, typically functions with a `(req, res, next)` signature.

## Current structure

```text
local-intelligence/
  routes/                 Express routes and handler mappings
  controllers/            HTTP handlers and request/response adapters
  repositories/           In-memory run access and domain lookup helpers
  constants/              Domain state, action, propagation, and status values
  domain/
    rules/                Rule evaluation and execution
    signals/              Signal processing and propagation
    behavior/             Agent and swarm behavior without HTTP dependencies
  services/
    autonomy/             Per-agent autonomy decisions and actions
    simulation/           Simulation ticks and repeated simulation runs
    analysis/             Agent, signal, neighborhood, and collective analysis
    logging/              State, propagation, warning, and failure event logging
    scheduling/            State-triggered and delayed actions
  utils/                  Small technical helpers without business workflows
  models/                 Mongoose model definitions
  config/                 Database connection configuration
```

## Responsibilities

### `routes/`

Routes define the HTTP method, path, and handler mapping. They should not look up the store, mutate domain state, or execute simulation logic.

```js
router.post("/rules", createRule);
```

### `controllers/`

Controllers read request data, call repositories, domain functions, or services, and build HTTP responses. The current simulator mutates a process-local experiment-run object. Persistence middleware saves the affected run snapshot to MongoDB before sending a JSON response.

### `repositories/`

Repositories encapsulate lookups and mutations within the existing in-memory run structures. They use the restored `store.js` cache; MongoDB persistence is handled separately by `services/runPersistence.js`:

```text
MongoDB experiment-run snapshots
  -> restore on startup
    -> store.js process-local cache
      -> controllers / domain / services
        -> snapshot write-through on JSON responses
        -> periodic snapshot flush
```

Current repository modules include:

```text
repositories/
  experimentRunRepository.js
  agentRepository.js
  neighborhoodRepository.js
  rulesetRepository.js
  ruleRepository.js
  signalRepository.js
```

The persistence adapter stores one serialized experiment run per MongoDB document, using the existing string run ID. This is a prototype handover design, not normalized persistence of separate Agent, Neighborhood, Signal, or event documents. The cache is process-local; the current setup is intended for one backend process per database. Snapshot data is subject to a 14 MiB JSON-size safety limit.

Repositories contain data access only. Rule decisions, signal propagation, and simulation belong in `domain/` or `services/`. See [the repository and persistence notes](../../local-intelligence/repositories/README.md) and [the run-persistence adapter](../../local-intelligence/services/runPersistence.js).

### `domain/`

This is the business core of the local intelligence system:

- `domain/rules/`: determines which rules apply and which actions they trigger.
- `domain/signals/`: processes signals and determines propagation behavior and scope.
- `domain/behavior/`: implements agent and swarm behavior without HTTP concerns.

The domain may use technical services such as logging, but it must not import Express routes.

### `services/`

Services coordinate larger workflows:

- `autonomy/`: per-agent decisions and autonomous actions.
- `simulation/`: individual ticks and repeated simulation runs.
- `analysis/`: measurement and interpretation of agent, signal, neighborhood, and state distributions.
- `logging/`: consistent recording of runtime events on an experiment run.
- `scheduling/`: scheduling and processing state-triggered actions.

### `utils/`

Only small, preferably stateless helper functions belong here, for example geometric calculations in `utils/geometry.js`.

### `constants/`

Reusable domain values belong here so code does not depend on hard-to-read magic numbers or repeated status strings:

```text
constants/
  actions.js
  statuses.js
  propagation.js
```

State IDs are still resolved through `stateHelpers.js` using definitions in `store.js`. The existing store structure remains unchanged.

## Important dependencies

The main simulation and signal-processing flow is:

```text
simulation tick
  -> autonomy decisions and signal analysis
    -> signal creation / signal engine
      -> neighborhood analysis
      -> rule evaluation and execution
        -> behavior and state changes
        -> propagation
      -> event logging
```

`services/analysis/analyzeNeighborhood.js` is used by both autonomy and the signal engine, so it belongs in `analysis/`.

## Signal-processing flow

A signal generally follows this sequence:

```text
Signal creation
  -> processSignal
  -> neighborhood analysis
  -> rule evaluation
  -> rule execution
  -> state change
  -> optional propagation
  -> logging
```

Specifically:

1. `createSignal.js` validates the source and target, creates the signal, and adds it to the current run.
2. `signalEngine.js` sets the signal status to `processing` and begins processing it.
3. `analyzeNeighborhood.js` calculates local agent and state information.
4. `evaluateRules.js` checks the active RuleSet, scope, threshold, and neighborhood conditions.
5. `executeRule.js` runs a matching action, such as activation, blocking, synchronization, or propagation.
6. Affected agents and the signal receive updated state or status values.
7. During propagation, new signals are created with a decremented TTL and an incremented hop count.
8. `runLogger.js` records state, propagation, warning, and failure events on the run.

## State triggers and delayed signals

Rules can react to state changes. The condition is stored under `trigger`, the action under `action`, and a signal to send later under `appendedSignal`:

```js
{
  enabled: true,
  scope: "agent",
  agentId: "agent-a",
  trigger: {
    type: "state_changed",
    fromState: "inactive",
    toState: "active",
  },
  action: "send_signal",
  appendedSignal: {
    delayMs: 5000,
    targetAgentId: "agent-x",
    signalType: "follow_up",
    signalPayload: {
      strength: 1,
    },
    signalProperties: {
      propagationMode: "unicast",
      propagationScope: "neighborhood",
    },
  },
}
```

The flow is:

```text
State change
  -> evaluate the state_changed trigger
  -> store appendedSignal as pending
  -> wait until a simulation tick
  -> call createSignal when executeAt is due
```

This does not use an uncontrolled `setTimeout`. Pending actions are stored in `run.scheduledActions` and processed by `simulationTick.js`. Therefore, `delayMs` measures real elapsed time, but execution occurs on a simulation tick after the action is due.

## Import rules

- Routes import controllers.
- Controllers import repositories, domain functions, and services.
- Direct `store` imports belong in repositories or in the explicitly designated store layer.
- Domain code may import services and utilities, but never routes.
- Services may import domain code, other services, and utilities.
- Avoid introducing circular dependencies.
- Calculate relative imports from the importing file's location.
- After moving files, check every static and dynamic import.

## Where should a new file go?

- Does it process `req`, `res`, or `next`? Use `routes/` or `controllers/`.
- Does it make a business decision about rules, signals, or behavior? Use `domain/`.
- Does it coordinate multiple business steps or simulation ticks? Use `services/`.
- Is it a small, stateless calculation? Use `utils/`.
- Is it cross-cutting Express infrastructure such as authentication or error handling? Use `middlewares/`.

## Naming conventions

Use descriptive `camelCase` filenames such as `signalEngine.js`, `runLogger.js`, and `geometry.js`. Avoid abbreviations and unclear names.

## Validation after structural changes

From the repository root, run at least these checks:

```bash
find local-intelligence -name '*.js' -print0 | xargs -0 -n1 node --check
node -e "import('./local-intelligence/app.js')"
```

Only run a startup check when the server process will be intentionally stopped or managed separately afterward. For the current database-backed application, importing `app.js` is distinct from starting the server and connecting to MongoDB.

Related documents: [data lifecycle policy](data-lifecycle-policy-v0.1.md) and [database connection design examples](database-connections.md).