# Example: Signal, autonomy, and follow-up propagation

> **Status:** The autonomy and delayed-action mechanisms used here exist in the prototype. The sequence and rule configuration below are illustrative; they are not a claim that this exact end-to-end scenario has been run or that every propagation detail is guaranteed by the current evaluator.

This example describes a possible flow in a 3×3 agent field. It is documentation only and does not modify runtime data or Rule configuration.

## Initial state

`X` means inactive and `A` means active.

```text
+------+------+------+
| 1 X  | 2 X  | 3 X  |
+------+------+------+
| 4 X  | 5 A  | 6 X  |
+------+------+------+
| 7 X  | 8 X  | 9 X  |
+------+------+------+
```

Agent 5 is active; all other agents are inactive.

## Participating agents

```text
Agent 5: active sender of the first signals
Agent 2: target of an activation signal
Agent 4: target of an activation signal
Agent 1: becomes active through an autonomy tick
Agent 9: target of Agent 1's follow-up signal
```

## Phase 1: Agent 5 sends activation signals

Agent 5 sends two `activate` signals:

```js
{
  type: "activate",
  sourceAgentId: "agent-5",
  targetAgentId: "agent-2",
  payload: {
    strength: 1,
  },
  properties: {
    ttl: 10,
    propagationMode: "unicast",
    propagationScope: "neighborhood",
  },
}
```

```js
{
  type: "activate",
  sourceAgentId: "agent-5",
  targetAgentId: "agent-4",
  payload: {
    strength: 1,
  },
  properties: {
    ttl: 10,
    propagationMode: "unicast",
    propagationScope: "neighborhood",
  },
}
```

An illustrative Rule configuration is:

```js
{
  id: "rule-activate-agent",
  enabled: true,
  signalType: "activate",
  scope: "global",
  action: "activate",
  threshold: 1,
}
```

If those signals are accepted and the Rule matches, Agents 2 and 4 become active:

```text
+------+------+------+
| 1 X  | 2 A  | 3 X  |
+------+------+------+
| 4 A  | 5 A  | 6 X  |
+------+------+------+
| 7 X  | 8 X  | 9 X  |
+------+------+------+
```

Conceptual flow:

```text
Agent 5
  -> activate signal to Agent 2
    -> signalEngine
      -> neighborhood analysis
      -> Rule evaluation
      -> activate Rule
      -> Agent 2 becomes active
      -> logging

Agent 5
  -> activate signal to Agent 4
    -> signalEngine
      -> neighborhood analysis
      -> Rule evaluation
      -> activate Rule
      -> Agent 4 becomes active
      -> logging
```

## Phase 2: An autonomy tick activates Agent 1

In the illustrated grid, Agent 1 has two active local neighbors (Agents 2 and 4). The current autonomy logic can therefore return `activate` with reason `high_local_activity` for an eligible inactive agent.

The decision has this shape:

```js
{
  agentId: "agent-1",
  action: "activate",
  reason: "high_local_activity",
}
```

The tick applies the decision and evaluates state-change Rules:

```text
Autonomy tick
  -> Agent 1's neighborhood is analyzed
  -> agentAutonomy decides: activate
  -> executeAutonomousAction
  -> Agent 1 changes from inactive to active
  -> state_changed triggers are evaluated
```

The resulting field is:

```text
+------+------+------+
| 1 A  | 2 A  | 3 X  |
+------+------+------+
| 4 A  | 5 A  | 6 X  |
+------+------+------+
| 7 X  | 8 X  | 9 X  |
+------+------+------+
```

## Phase 3: Agent 1 triggers a follow-up Rule

Agent 1 has an illustrative Rule that reacts to the `inactive -> active` state change:

```js
{
  id: "rule-agent-1-follow-up",
  enabled: true,
  scope: "agent",
  agentId: "agent-1",
  trigger: {
    type: "state_changed",
    fromState: "inactive",
    toState: "active",
  },
  action: "send_signal",
  appendedSignal: {
    delayMs: 5000,
    targetAgentId: "agent-9",
    signalType: "deactivate",
    signalPayload: {
      strength: 1,
      reason: "agent-1-became-active",
    },
    signalProperties: {
      ttl: 10,
      propagationMode: "broadcast",
      propagationScope: "all",
    },
  },
}
```

The state-change handler schedules this action rather than sending the signal immediately:

```text
Agent 1 becomes active
  -> state_changed trigger matches
  -> appendedSignal is stored as pending
  -> wait 5000 ms
  -> a later simulation tick checks executeAt
  -> a signal to Agent 9 is created
```

An internal scheduled-action record may look like this:

```js
{
  action: "send_signal",
  sourceAgentId: "agent-1",
  targetAgentId: "agent-9",
  signalType: "deactivate",
  signalPayload: {
    strength: 1,
    reason: "agent-1-became-active",
  },
  signalProperties: {
    ttl: 10,
    propagationMode: "broadcast",
    propagationScope: "all",
  },
  status: "pending",
  executeAt: "2026-09-22T12:00:05.000Z",
}
```

The scheduled action is processed by a simulation tick after its due time; the delay is not implemented as a permanent background timer.

## Phase 4: Agent 9 and further receivers become inactive

For the desired result, the active RuleSet needs a Rule that inactivates the receiver and a propagation Rule that forwards the signal. The following examples describe the intended configuration:

### Inactivation Rule

```js
{
  id: "rule-deactivate-agent",
  enabled: true,
  signalType: "deactivate",
  scope: "global",
  action: "inactivate",
  threshold: 1,
}
```

This Rule is intended to set the receiving agent to `inactive`.

### Propagation Rule

```js
{
  id: "rule-propagate-deactivate",
  enabled: true,
  signalType: "deactivate",
  scope: "global",
  action: "propagate",
  threshold: 1,
}
```

This Rule is intended to forward the signal to additional eligible agents. Both Rules must be in the active RuleSet. The example assumes that the evaluator processes the inactivation before forwarding at each receiver; confirm ordering, target selection, and termination behavior against the configured propagation implementation.

Intended per-receiver flow:

```text
Deactivate signal
  -> inactivate Rule
  -> receiver becomes inactive
  -> propagate Rule
  -> signal is sent to further eligible agents
```

After Agent 9 receives and processes the signal, the field should be shown as:

```text
+------+------+------+
| 1 A  | 2 A  | 3 X  |
+------+------+------+
| 4 A  | 5 A  | 6 X  |
+------+------+------+
| 7 X  | 8 X  | 9 X  |
+------+------+------+
```

Agent 9 remains inactive in this displayed step; the signal does not cause an additional state change for that agent. Further agents change state only if propagation reaches them and the inactivation Rule applies.

## Complete illustrative flow

```text
Initial state:
  1X 2X 3X
  4X 5A 6X
  7X 8X 9X

1. Agent 5 sends activate to Agent 2.
2. The activate Rule makes Agent 2 active.
3. Agent 5 sends activate to Agent 4.
4. The activate Rule makes Agent 4 active.
5. An autonomy tick decides activate for Agent 1.
6. Agent 1 becomes active.
7. The state_changed inactive -> active trigger matches Agent 1's Rule.
8. The Rule schedules an appendedSignal with delayMs 5000.
9. A later simulation tick creates deactivate from Agent 1 to Agent 9.
10. The deactivate -> inactivate Rule makes Agent 9 inactive.
11. The deactivate -> propagate Rule forwards the signal, if supported by the active configuration.
12. Each further receiver becomes inactive only if it receives the signal and the inactivation Rule matches.
```

## Technical prerequisites and caveats

- Agent 5 must have two valid target agents, and the two signals are separate.
- Agent 1 must actually transition from `inactive` to `active` for the state-change trigger to match.
- Agent 1 needs a neighborhood for the illustrated local-neighborhood behavior.
- Agent 9 must exist for `createSignal` to create the follow-up signal.
- Agents must be reachable under the active propagation mode, scope, and neighborhood configuration.
- The `deactivate -> inactivate` and `deactivate -> propagate` behaviors must be supported and configured in the active RuleSet; the example does not certify their exact evaluator order.
- The delayed action is processed by a simulation tick after 5000 ms have elapsed, not by a permanent background timer.

See [Autonomy strategy](autonomy-strategy.md) and [Entity map](entity-map-v0.1.md).
