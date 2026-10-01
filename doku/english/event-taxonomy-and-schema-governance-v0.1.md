# Event Taxonomy and Schema Governance v0.1

This document defines a unified event taxonomy and schema-governance strategy for the Crowds ecosystem.

## Event naming convention

Event names use the `DOMAIN_ACTION` format: uppercase words separated by underscores, with the verb at the end.

Examples:

- `SIGNAL_CREATED`
- `SIGNAL_STATUS_CHANGED`
- `PROPAGATION_CREATED`
- `AGENT_STATE_CHANGED`
- `EXPERIMENT_COMPLETED`

## Governance rules

All new events in this project must follow these rules:

1. **Use the standard event-name format.** Event names must follow `DOMAIN_ACTION`.
2. **Assign exactly one category to each event.** The permitted categories are:
   - `runtime`
   - `protocol`
   - `experiment`
   - `analytics`
3. **Include the required fields in every `ProtocolEvent` document:**
   - `type`
   - `category`
   - `schemaVersion`
   - `timestamp`
   - `experimentRunId`
   - `agentId`
   - `signalId`
   - `propagationEventId`
   - `correlationId`
   - `detail`
4. **Increment `schemaVersion`** whenever the event payload changes incompatibly.
5. **Before adding an event:**
   - Validate all referenced IDs.
   - Use standardized event names.
   - Update the documentation whenever a new event type is added.

This specification is intended to keep Crowds, Grid, Interactive, Local Intelligence, and future research systems compatible. It describes the governance requirements; it does not by itself confirm that every event or field is implemented in the current codebase.

## Related documentation

- [Overview and API Routes](overview-and-api-routes.md)
- [API Routes](api-routes.md)
