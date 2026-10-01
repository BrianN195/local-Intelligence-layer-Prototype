# Repositories and persistence

The HTTP and simulation code currently works with mutable in-memory `ExperimentRun` objects. On startup, those objects are restored from MongoDB; changes are saved before JSON responses and flushed periodically while simulations run.

- `experimentRunRepository.js`: synchronous lookups in the restored run cache
- `agentRepository.js`: Agent lookup/mutation helpers within a run
- `neighborhoodRepository.js`: Neighborhood lookup/mutation helpers within a run
- `rulesetRepository.js`: RuleSet lookup/mutation helpers within a run
- `ruleRepository.js`: Rule lookup/mutation helpers within a RuleSet
- `signalRepository.js`: Signal lookup/mutation helpers within a run
- `../services/runPersistence.js`: MongoDB snapshot restore, write-through and periodic flush
- `../config/database.js`: MongoDB connection lifecycle

For the current prototype, one MongoDB document stores each complete run snapshot in the `data` field, keyed by the existing string run ID. This avoids rewriting the simulator's synchronous domain API as part of the database handover. The run document is guarded by a 14 MiB JSON-size limit; growing event histories should move to separate collections before production or large experiments. Run one application process per database: the cache is process-local and is not coordinated across multiple API instances.
