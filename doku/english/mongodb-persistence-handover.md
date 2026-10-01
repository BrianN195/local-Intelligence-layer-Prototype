# MongoDB Persistence Handover

## Implemented scope

- At startup, Mongoose connects to MongoDB through `MONGODB_URI`. If MongoDB is unavailable, the HTTP server does not start.
- Existing experiment runs are loaded from the `experimentruns` collection into the simulator's existing in-memory cache.
- Before JSON API responses are sent, affected experiment runs are saved as snapshots. A periodic flush saves all runs currently held in the process-local cache, and runs are saved again on a normal `SIGINT` or `SIGTERM` shutdown.
- Each snapshot uses the experiment run's existing string ID as MongoDB `_id`, preserving API and seed IDs.
- The demo seed is optional and configurable; it checks whether the fixed example run already exists before creating it.
- `.env` is local and excluded from Git. `.env.example` documents the configuration without secrets.

## Deliberate handover decision

The simulation logic was not rewritten in this finalization pass to perform asynchronous updates across multiple collections. Instead, each run's complete runtime object is stored in the `data` field of a MongoDB document in `experimentruns`. This preserves the existing synchronous controllers, rules, and simulation ticks, and restores them from MongoDB after a restart.

This is MongoDB-backed persistence for the current prototype, **not a normalized production architecture**. The current runtime does not yet persist agents, neighborhoods, signals, or events in normalized collections. MongoDB limits a single BSON document to 16 MiB, so the implementation applies a precautionary cap of approximately 14 MiB of JSON per run snapshot. The design supports one backend server process per database. Because snapshots are periodically flushed, an abrupt process or host failure may lose the most recent few seconds of changes.

## Outside the current handover scope

- Multiple API instances or a coordinated shared cache
- Large runs with unbounded signal, history, or event arrays
- Separately persisted agent, neighborhood, signal, and event documents
- Distributed transactions, archiving, and lifecycle retention
- Session, media, simulator, recovery, and analytics routes described in design documents

## Recommendations for the next technical handover

1. As data grows, move histories and propagation/protocol events into separate collections and make data access asynchronous.
2. Introduce snapshot-schema version migrations before making incompatible changes to the `data` format; `snapshotVersion` is reserved for this purpose.
3. Before running multiple backend instances, remove the in-memory cache or replace it with an explicit consistency and locking model.
4. Align lifecycle cleanup with the actual snapshot data and test it, including dependent data.
5. Before production use, add authentication, access controls, backups, monitoring, and appropriate MongoDB user permissions.

## Local operation and verification

See [Project Start](project-start.md) for local setup instructions. With MongoDB running, `npm test` in `local-intelligence` runs an integration test against a separate database with the `_test` suffix.
