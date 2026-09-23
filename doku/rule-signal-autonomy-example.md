# Beispiel: Signal, Autonomie und Folge-Propagation

Dieses Szenario beschreibt einen moeglichen Ablauf im 3x3-Agentenfeld. Es ist eine fachliche Dokumentation und aendert keine Laufzeitdaten oder Rule-Konfigurationen.

## Ausgangslage

`X` bedeutet inaktiv, `A` bedeutet aktiv.

```text
+------+------+------+
| 1 X  | 2 X  | 3 X  |
+------+------+------+
| 4 X  | 5 A  | 6 X  |
+------+------+------+
| 7 X  | 8 X  | 9 X  |
+------+------+------+
```

Agent 5 ist aktiv. Alle anderen Agenten sind inaktiv.

## Beteiligte Agenten

```text
Agent 5: aktiver Sender der ersten Signale
Agent 2: Ziel einer Aktivierungsnachricht
Agent 4: Ziel einer Aktivierungsnachricht
Agent 1: wird durch einen Autonomie-Tick aktiv
Agent 9: Ziel des Folge-Signals von Agent 1
```

## Phase 1: Agent 5 sendet Aktivierungssignale

Agent 5 sendet zwei Signale des Typs `activate`:

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

Die dazu passende Rule kann global gelten:

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

Nach der Verarbeitung sind Agent 2 und Agent 4 aktiv:

```text
+------+------+------+
| 1 X  | 2 A  | 3 X  |
+------+------+------+
| 4 A  | 5 A  | 6 X  |
+------+------+------+
| 7 X  | 8 X  | 9 X  |
+------+------+------+
```

Der fachliche Signalablauf ist:

```text
Agent 5
  -> Signal activate an Agent 2
    -> signalEngine
      -> Neighborhood-Analyse
      -> Rule-Evaluation
      -> Rule activate
      -> Agent 2 wird aktiv
      -> Logging

Agent 5
  -> Signal activate an Agent 4
    -> signalEngine
      -> Neighborhood-Analyse
      -> Rule-Evaluation
      -> Rule activate
      -> Agent 4 wird aktiv
      -> Logging
```

## Phase 2: Autonomie-Tick aktiviert Agent 1

Ein Autonomie-Tick wertet die lokale Umgebung von Agent 1 aus. Die konkrete Autonomie-Rule entscheidet, dass Agent 1 aktiv werden soll.

Die Entscheidung kann fachlich so aussehen:

```js
{
  agentId: "agent-1",
  action: "activate",
  reason: "high_local_activity",
}
```

Der Tick fuehrt die Entscheidung aus:

```text
Autonomie-Tick
  -> Agent 1 analysiert seine Nachbarschaft
  -> agentAutonomy entscheidet: activate
  -> executeAutonomousAction
  -> Agent 1 wechselt von inactive zu active
  -> state_changed-Trigger werden geprueft
```

Danach sieht das Feld so aus:

```text
+------+------+------+
| 1 A  | 2 A  | 3 X  |
+------+------+------+
| 4 A  | 5 A  | 6 X  |
+------+------+------+
| 7 X  | 8 X  | 9 X  |
+------+------+------+
```

## Phase 3: Agent 1 loest eine Folge-Rule aus

Agent 1 besitzt eine Rule, die auf den Zustandswechsel `inactive -> active` reagiert:

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

Wichtig: Diese Rule sendet nicht unmittelbar innerhalb des Zustandswechsels. Sie legt zuerst eine geplante Aktion ab:

```text
Agent 1 wird aktiv
  -> state_changed-Trigger passt
  -> appendedSignal wird als pending gespeichert
  -> 5000 ms warten
  -> naechster Simulationstakt prueft executeAt
  -> Signal an Agent 9 wird erzeugt
```

Die geplante Aktion kann intern ungefaehr so aussehen:

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

## Phase 4: Agent 9 und weitere Empfaenger werden inaktiv

Damit Agent 9 und alle weiteren Empfaenger inaktiv werden, benoetigt das Folge-Signal mindestens zwei Rules.

### Rule fuer das Inaktivieren

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

Diese Rule setzt den Zielagenten des `deactivate`-Signals auf `inactive`.

### Rule fuer die Propagation

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

Diese Rule sorgt dafuer, dass das Signal weitere erreichbare Agenten bekommt. Die beiden Rules gehoeren in dasselbe aktive RuleSet.

Die Reihenfolge im aktiven RuleSet sollte fuer diesen Ablauf bevorzugt so aussehen:

```text
1. deactivate -> inactivate
2. deactivate -> propagate
```

So wird Agent 9 beim ersten Empfang inaktiv, danach kann dasselbe Signal weiterlaufen. Jeder weitere Empfaenger verarbeitet ebenfalls:

```text
Signal deactivate
  -> Rule inactivate
  -> Empfaenger wird inactive
  -> Rule propagate
  -> Signal wird an weitere erreichbare Agenten weitergegeben
```

Nach der ersten Verarbeitung an Agent 9 kann das Feld beispielsweise so aussehen:

```text
+------+------+------+
| 1 A  | 2 A  | 3 X  |
+------+------+------+
| 4 A  | 5 A  | 6 X  |
+------+------+------+
| 7 X  | 8 X  | 9 X  |
+------+------+------+
```

Wenn die Propagation weitere Agenten erreicht, werden diese ebenfalls durch die `deactivate -> inactivate`-Rule inaktiv.

## Gesamtablauf

```text
Ausgangslage:
  1X 2X 3X
  4X 5A 6X
  7X 8X 9X

1. Agent 5 sendet activate an Agent 2.
2. Rule activate macht Agent 2 aktiv.
3. Agent 5 sendet activate an Agent 4.
4. Rule activate macht Agent 4 aktiv.
5. Ein Autonomie-Tick entscheidet activate fuer Agent 1.
6. Agent 1 wird aktiv.
7. state_changed inactive -> active passt auf Agent-1-Rule.
8. Die Rule plant ein appendedSignal mit delayMs 5000.
9. Ein spaeterer Simulationstakt erzeugt deactivate von Agent 1 an Agent 9.
10. Rule deactivate -> inactivate macht Agent 9 inaktiv.
11. Rule deactivate -> propagate leitet das Signal weiter.
12. Jeder weitere Empfaenger wird ebenfalls inaktiv.
```

## Wichtige technische Voraussetzungen

- Agent 5 benoetigt zwei gueltige Zielagenten und sendet zwei separate Signale.
- Agent 1 muss tatsaechlich von `inactive` zu `active` wechseln, damit der Trigger ausloest.
- Agent 1 benoetigt eine Neighborhood, wenn das Folge-Signal mit dem aktuellen Propagationsmodell verarbeitet werden soll.
- Agent 9 muss als Agent existieren, damit `createSignal` das Signal erzeugen kann.
- Die beteiligten Agenten muessen fuer die globale Propagation in kompatiblen Neighborhood-Strukturen liegen.
- `deactivate -> inactivate` und `deactivate -> propagate` muessen im aktiven RuleSet vorhanden sein.
- Die Ausfuehrung der 5000 ms verzoegerten Aktion erfolgt beim naechsten Simulationstakt, nicht durch einen permanenten Hintergrundtimer.
