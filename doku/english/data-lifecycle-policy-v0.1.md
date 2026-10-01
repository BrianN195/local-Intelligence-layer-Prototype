# Data lifecycle policy v0.1

## 1. Purpose and implementation status

This document defines a proposed retention and lifecycle strategy for Crowds operational, experiment, research, rehearsal, test, and production data. Its purpose is to retain data only as long as necessary while preserving information with research or operational value.

The policy describes intended behavior; it is **not automatically enforced for Local Intelligence's current MongoDB snapshot store**. The current application persists complete experiment-run snapshots in the `experimentruns` collection. Lifecycle cleanup helpers exist, but they operate on separate Mongoose collections and are not wired to snapshot storage or exposed by the current API. The proposed Session TTL is also not active. See [the current run-persistence adapter](../../local-intelligence/services/runPersistence.js), [the lifecycle policy configuration](../../local-intelligence/services/dataLifecyclePolicy.js), and [the architecture overview](architecture.md).

The policy covers:

- Protocol events
- Session data
- Device and agent data
- Experiment runs
- Propagation events
- Signals
- Observations
- Analytics summaries
- Simulator outputs
- Test data
- Rehearsal data
- Production operational data

## 2. Experiment environments

Each experiment run should identify its environment. The supported values are:

- `test`
- `rehearsal`
- `research`
- `production`

The environment determines the intended retention and cleanup policy.

## 3. Lifecycle policy

| Environment | Intended retention | Raw data | Summary | Intended action |
| --- | ---: | --- | --- | --- |
| Test | 7 days | Delete | Not required | Delete the experiment and its dependent data |
| Rehearsal | 30 days | Delete | Keep important summaries | Delete raw data; retain summaries |
| Research | Long-term; policy configuration currently specifies 3,650 days | Archive | Retain long-term | Archive for analysis |
| Production | Operational policy | Retain as required | Retain | Retain according to operational requirements |

These are policy targets, not a statement that Local Intelligence currently applies those periods to its snapshots.

## 4. Test data

Test data is temporary. The policy allows completed, failed, or cancelled test experiments to be deleted after seven days. Dependent raw data includes:

- `ExperimentParticipant`
- `Signal`
- `PropagationEvent`
- `Observation`
- `ProtocolEvent`
- `TechnicalWarning`
- `FailureState`

The associated `ExperimentRun` is deleted after its dependent records. Running experiments must never be deleted automatically. The test cleanup process must not delete research or production experiments.

## 5. Rehearsal data

Rehearsal data is generated during preparation and system validation before real operational events. Raw rehearsal data may be deleted after 30 days. Important experiment summaries, results, and metrics should be retained for operational review and future comparison.

## 6. Research experiment data

Research experiments have long-term value. Retain:

- Experiment metadata
- Experiment summaries and results
- Experiment statistics
- Important analytics summaries
- Relevant protocol events
- Relevant propagation data

When possible, archive raw research data rather than permanently deleting it. The current policy configuration sets a nominal retention period of 3,650 days and an `archive` action; that configuration is not, by itself, an active archival job.

## 7. Production operational data

Production data is retained according to operational and commercial requirements. The test cleanup process must not delete production data. Minimize device information to fields required for system operation, experiment correlation, and diagnostics.

## 8. Session data

The policy proposes that disconnected sessions be treated as temporary operational data and removed after seven days, while active sessions remain. **This Session TTL is not implemented in the current Local Intelligence API:** there is no local Session model or TTL index. An optional external `sessionId` field on an experiment run does not mean that local session records or TTL cleanup exist.

## 9. Protocol events

Classify protocol events according to their purpose. Runtime events may need shorter retention. Retain or archive events associated with research or production experiments when they are needed for:

- Experiment reconstruction
- Debugging
- Analytics
- Auditing
- Research

## 10. Propagation events

Propagation events represent signal propagation between agents and are treated as raw operational or experiment data. Their intended lifecycle depends on the experiment environment:

- Test: delete after the test retention period
- Rehearsal: delete after the rehearsal retention period
- Research: archive for long-term analysis
- Production: retain according to operational requirements

## 11. Device data minimization

Minimize agent and device data. Store only information required for:

- Agent identification
- Communication
- Position tracking
- Direction handling
- Experiment correlation
- Operational diagnostics

Do not collect unnecessary device metadata.

## 12. Cleanup procedures and current limitations

The policy describes these endpoint shapes:

### Manual test cleanup (proposed)

```http
DELETE /experiments/:id/test-run
```

This proposed endpoint would delete a completed test experiment and its dependent raw data.

### Automatic test cleanup (proposed)

```http
POST /lifecycle/cleanup/test-experiments
```

This proposed process would remove test experiments older than the configured retention period, limited to:

```text
environment = test
status = finished | failed | cancelled
```

Running experiments are excluded. These lifecycle routes are not part of the current API. Repository cleanup helpers query normalized Mongoose models and collections; they do not clean the complete-run snapshots used by the current application. In addition, the manual helper only rejects `running` runs rather than enforcing the full terminal-status list above. Do not rely on these helpers as enforcement of the policy for current Local Intelligence data.

## 13. Data safety rules

1. Test cleanup must never delete research experiments.
2. Test cleanup must never delete production experiments.
3. Running experiments must never be deleted automatically.
4. Research summaries should be retained long-term.
5. Important rehearsal summaries should remain available after raw-data cleanup.
6. Minimize device data.
7. Archive data with long-term research value instead of deleting it where possible.
8. Log cleanup operations in production environments.

## 14. Lifecycle flow

```text
Experiment created
        │
        ▼
Environment identified
        │
        ├── test
        │     └── 7 days → Delete
        │
        ├── rehearsal
        │     └── 30 days → Delete raw data / keep summary
        │
        ├── research
        │     └── Long-term → Archive
        │
        └── production
              └── Operational retention
```

## 15. Current implementation

The repository contains these policy and service building blocks:

- `ExperimentRun.environment` identifies the data environment in the Mongoose model and the persisted snapshot metadata.
- `dataLifecyclePolicy.js` defines retention-policy values, including 3,650 days for research.
- `dataLifecycleService.js` contains a manual cleanup helper for normalized Mongoose collections.
- `cleanupTestExperiments.js` contains an automatic-cleanup helper for expired test experiments.
- A MongoDB TTL policy for disconnected Session records is only a proposal; there is no local Session model or active TTL index in the current Local Intelligence API.

**Local Intelligence implementation status:** The application persists complete experiment-run snapshots in `experimentruns`. The cleanup helpers above are not connected to that snapshot storage, and the proposed lifecycle routes are not mounted in the current API. The policy must not be treated as automatically enforced for Local Intelligence data. The [run-persistence adapter](../../local-intelligence/services/runPersistence.js) shows the current persistence path.

The intended design separates lifecycle policy from individual business routes so future retention rules can be extended without changing every data model.

## 16. Future improvements

Future versions should consider:

- Scheduled cleanup jobs
- Rehearsal-specific cleanup
- Data archiving
- Export before deletion
- Data anonymization
- Cleanup audit logs
- Configurable retention periods
- Production data-retention policies
- Storage for archived research datasets
- Lifecycle monitoring and metrics

## 17. Summary

The proposed Crowds data-lifecycle strategy distinguishes temporary operational data from long-term research and production data. Test data is intended for deletion after a defined retention period. Rehearsal raw data may be deleted while important summaries are retained. Research data should be archived for long-term use. Production data is retained according to operational requirements.

The strategy uses `ExperimentRun.environment` to associate a consistent policy with each run. For Local Intelligence, this remains a policy and set of cleanup building blocks, not active retention enforcement over MongoDB run snapshots.

Related documents: [architecture and placement conventions](architecture.md) and [database connection design examples](database-connections.md).