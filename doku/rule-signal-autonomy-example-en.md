# Example: Signal, Autonomy, and Follow-up Propagation

This scenario describes a possible flow in a 3x3 agent field. It is documentation only and does not modify runtime data or Rule configuration.

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

Agent 5 is active. All other agents are inactive.

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

The corresponding Rule can be global:

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

After processing, Agents 2 and 4 are active:

```text
+------+------+------+
| 1 X  | 2 A  | 3 X  |
+------+------+------+
| 4 A  | 5 A  | 6 X  |
+------+------+------+
| 7 X  | 8 X  | 9 X  |
+------+------+------+
```

The signal flow is:

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

An autonomy tick analyzes Agent 1's local environment. The autonomy logic decides that Agent 1 should become active.

The decision can look like this:

```js
{
  agentId: "agent-1",
  action: "activate",
  reason: "high_local_activity",
}
```

The tick executes the decision:

```text
Autonomy tick
  -> Agent 1's neighborhood is analyzed
  -> agentAutonomy decides: activate
  -> executeAutonomousAction
  -> Agent 1 changes from inactive to active
  -> state_changed triggers are evaluated
```

The field then looks like this:

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

Agent 1 has a Rule that reacts to the `inactive -> active` state change:

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

This Rule does not send the signal immediately. It first stores a scheduled action:

```text
Agent 1 becomes active
  -> state_changed trigger matches
  -> appendedSignal is stored as pending
  -> wait 5000 ms
  -> the next simulation tick checks executeAt
  -> a signal to Agent 9 is created
```

The scheduled action may look like this internally:

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

## Phase 4: Agent 9 and further receivers become inactive

To make Agent 9 and further receivers inactive, the active RuleSet needs at least two Rules.

### Rule for inactivation

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

This Rule changes the target agent of the `deactivate` signal to `inactive`.

### Rule for propagation

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

This Rule allows the signal to reach further eligible agents. Both Rules must belong to the same active RuleSet.

For this scenario, the preferred order in the active RuleSet is:

```text
1. deactivate -> inactivate
2. deactivate -> propagate
```

This means Agent 9 becomes inactive when it first receives the signal, after which the same signal can continue propagating. Each further receiver processes:

```text
Deactivate signal
  -> inactivate Rule
  -> receiver becomes inactive
  -> propagate Rule
  -> signal is sent to further eligible agents
```

After the first processing at Agent 9, the field may look like this:

```text
+------+------+------+
| 1 A  | 2 A  | 3 X  |
+------+------+------+
| 4 A  | 5 A  | 6 X  |
+------+------+------+
| 7 X  | 8 X  | 9 X  |
+------+------+------+
```

If propagation reaches additional agents, they are also made inactive by the `deactivate -> inactivate` Rule.

## Complete flow

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
11. The deactivate -> propagate Rule forwards the signal.
12. Each further receiver also becomes inactive.
```

## Technical prerequisites

- Agent 5 needs two valid target agents and sends two separate signals.
- Agent 1 must actually change from `inactive` to `active` for the trigger to fire.
- Agent 1 needs a neighborhood if the follow-up signal is to use the current propagation model.
- Agent 9 must exist as an agent so `createSignal` can create the signal.
- Agents involved in global propagation must be located in compatible neighborhood structures.
- Both `deactivate -> inactivate` and `deactivate -> propagate` must exist in the active RuleSet.
- The 5000 ms delayed action is processed by the next simulation tick after it becomes due, not by a permanent background timer.
