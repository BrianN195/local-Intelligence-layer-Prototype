# Architecture and Placement Conventions

This document explains where new files belong in the Local Intelligence prototype.

## Core rule

`routes/` and `controllers/` are HTTP-facing layers. Business logic belongs in `domain/` or `services/`. The `middlewares/` directory is reserved for real Express middleware, typically functions with a `(req, res, next)` signature.

## Current structure

```text
local-intelligence/
  routes/                 Express routes, no business logic
  controllers/            HTTP handlers and request/response adapters
  repositories/           Data access, currently backed by the in-memory store
  constants/              Domain state, action, and status values
  domain/
    rules/                Rule evaluation and execution
    signals/              Signal processing and propagation rules
    behavior/             Behavior without an HTTP dependency
  services/
    autonomy/             Autonomy decisions and their execution
    simulation/           Simulation ticks and simulation workflows
    analysis/             Agent, signal, and collective behavior analysis
    logging/              State, propagation, and failure event logging
  utils/                  Small technical helpers without business workflows
  models/                 Data model definitions
```

## Responsibilities

### `routes/`

Contains only the HTTP method, path, and handler mapping.

```js
router.post("/rules", createRule);
```

Routes must not search the store, mutate domain state, or run simulation logic.

### `controllers/`

Controllers read request data, call repositories, domain, or service functions, and create HTTP responses. They should not access `store.experimentRuns` directly and should not contain long simulation workflows.

### `repositories/`

Repositories encapsulate data access. They currently continue to use `store.js`:

```text
controllers
  -> repositories
    -> store.js
```

The current repository implementations are:

```text
repositories/
  experimentRunRepository.js
  agentRepository.js
  neighborhoodRepository.js
  rulesetRepository.js
  ruleRepository.js
  signalRepository.js
```

They encapsulate lookups and mutations within the existing store structures. Domain and simulation logic still work with the resolved `run` object and are not coupled to MongoDB.

When the database is introduced later, the repository implementation can change while controllers and domain logic remain mostly unchanged:

```text
controllers
  -> repositories
    -> MongoDB/Mongoose
```

Repositories contain data access only. Rule decisions, signal propagation, and simulation belong in `domain/` or `services/`.

### `domain/`

This is the business core of the local intelligence system:

- `domain/rules/`: Which rules apply and which action a rule triggers.
- `domain/signals/`: Signal processing, propagation, and propagation scope.
- `domain/behavior/`: Agent and swarm behavior without HTTP concerns.

The domain may use technical services such as logging, but must not import Express routes.

### `services/`

Services coordinate larger workflows:

- `autonomy/`: Per-agent decisions and autonomous actions.
- `simulation/`: Single ticks and repeated simulation runs.
- `analysis/`: Measurement and interpretation of state distributions.
- `logging/`: Consistent recording of runtime events on an experiment run.

### `utils/`

Only small, preferably stateless helper functions belong here. Example: geometric calculations in `utils/geometry.js`.

### `constants/`

Contains reusable domain values so the code does not depend on hard-to-read magic numbers or repeated status strings:

```text
constants/
  actions.js
  statuses.js
  propagation.js
```

State IDs are still resolved through `stateHelpers.js` from the definitions in `store.js`. The existing store structure remains unchanged.

## Important dependencies

The main execution flow is:

```text
simulation
  -> autonomy
    -> createSignal
      -> domain/signals/signalEngine
        -> domain/rules
        -> domain/behavior
        -> logging
```

`services/analysis/analyzeNeighborhood.js` is used by both autonomy and the signal engine, so it remains in `analysis/`.

## Signal processing flow

A signal generally passes through this sequence:

```text
Signal creation
  -> processSignal
  -> Neighborhood analysis
  -> Rule evaluation
  -> Rule execution
  -> State change
  -> Propagation
  -> Logging
```

Specifically:

1. `createSignal.js` validates source and target, creates the signal, and stores it on the current run.
2. `signalEngine.js` sets the signal status to `processing` and starts processing.
3. `analyzeNeighborhood.js` calculates local agent and state information.
4. `evaluateRules.js` checks the active RuleSet, scope, threshold, and neighborhood conditions.
5. `executeRule.js` runs the matching action, such as activation, blocking, synchronization, or propagation.
6. Affected agents and the signal receive their new state values.
7. During propagation, new signals are created with updated TTL and hop count.
8. `runLogger.js` records state, propagation, warning, and failure events.

## State triggers and delayed signals

Rules can react to a state change. The condition is stored under `trigger`, the action under `action`, and a later signal under `appendedSignal`:

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
  -> wait for the next simulation tick
  -> call createSignal when executeAt is due
```

The action does not use an uncontrolled `setTimeout`. Pending actions are stored in `run.scheduledActions` and processed by `simulationTick.js`. Therefore `delayMs` uses real elapsed time, while execution takes place on the next simulation tick.

## Import rules

- Routes import controllers.
- Controllers import repositories, domain, and services.
- Direct `store` imports belong in repositories or in the explicitly designated store layer.
- Domain imports services and utilities, but never routes.
- Services import domain, services, and utilities.
- Avoid introducing new circular dependencies.
- Always calculate relative imports from the importing file's location.
- After moving files, check every import and dynamic import.

## Where should a new file go?

- Does it process `req`, `res`, or `next`? Use `routes/` or `controllers/`.
- Does it make a business decision about rules, signals, or behavior? Use `domain/`.
- Does it coordinate multiple business steps or ticks? Use `services/`.
- Is it a small stateless calculation? Use `utils/`.
- Is it Express cross-cutting infrastructure such as authentication or error handling? Use `middlewares/`.

## Naming conventions

Use descriptive `camelCase` filenames such as `signalEngine.js`, `runLogger.js`, and `geometry.js`. Avoid abbreviations and unclear names.

## Validation after structural changes

Run at least these checks:

```bash
find local-intelligence -name '*.js' -print0 | xargs -0 -n1 node --check
node -e "import('./local-intelligence/app.js')"
```

Only run a startup check when the server process will be intentionally stopped or managed separately afterward.
