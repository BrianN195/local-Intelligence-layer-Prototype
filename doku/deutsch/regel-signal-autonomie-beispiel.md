# Beispiel: Signal, Autonomie und Folge-Propagation

> **Status:** Die hier verwendeten Autonomie- und Verzögerungsmechanismen sind im Prototyp vorhanden. Ablauf und Regelkonfiguration sind jedoch beispielhaft. Es wird weder behauptet, dass genau dieser Gesamtablauf bereits ausgeführt wurde, noch dass jedes Detail der Signalweiterleitung durch die aktuelle Auswertungslogik garantiert ist.

Dieses Beispiel beschreibt einen möglichen Ablauf in einem 3×3-Agentenfeld. Es dient ausschließlich der Dokumentation und ändert weder Laufzeitdaten noch die Rule-Konfiguration.

## Ausgangszustand

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

Agent 5 ist aktiv; alle anderen Agenten sind inaktiv.

## Beteiligte Agenten

```text
Agent 5: aktiver Sender der ersten Signale
Agent 2: Ziel eines Aktivierungssignals
Agent 4: Ziel eines Aktivierungssignals
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

Eine beispielhafte Rule-Konfiguration:

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

Wenn die Signale angenommen werden und die Rule greift, werden Agent 2 und Agent 4 aktiv:

```text
+------+------+------+
| 1 X  | 2 A  | 3 X  |
+------+------+------+
| 4 A  | 5 A  | 6 X  |
+------+------+------+
| 7 X  | 8 X  | 9 X  |
+------+------+------+
```

Konzeptioneller Ablauf:

```text
Agent 5
  -> activate-Signal an Agent 2
    -> signalEngine
      -> Neighborhood-Analyse
      -> Rule-Auswertung
      -> activate-Rule
      -> Agent 2 wird aktiv
      -> Protokollierung

Agent 5
  -> activate-Signal an Agent 4
    -> signalEngine
      -> Neighborhood-Analyse
      -> Rule-Auswertung
      -> activate-Rule
      -> Agent 4 wird aktiv
      -> Protokollierung
```

## Phase 2: Ein Autonomie-Tick aktiviert Agent 1

Im dargestellten Feld hat Agent 1 zwei aktive lokale Nachbarn (Agent 2 und Agent 4). Die aktuelle Autonomielogik kann deshalb für einen geeigneten inaktiven Agenten `activate` mit dem Grund `high_local_activity` zurückgeben.

Die Entscheidung hat folgende Form:

```js
{
  agentId: "agent-1",
  action: "activate",
  reason: "high_local_activity",
}
```

Der Tick führt die Entscheidung aus und wertet Regeln für Zustandsänderungen aus:

```text
Autonomie-Tick
  -> Die Nachbarschaft von Agent 1 wird analysiert
  -> agentAutonomy entscheidet: activate
  -> executeAutonomousAction
  -> Agent 1 wechselt von inactive zu active
  -> state_changed-Trigger werden ausgewertet
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

## Phase 3: Agent 1 löst eine Folge-Rule aus

Agent 1 besitzt eine beispielhafte Rule, die auf den Zustandswechsel `inactive -> active` reagiert:

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

Der Handler für Zustandsänderungen plant die Aktion, statt das Signal sofort zu senden:

```text
Agent 1 wird aktiv
  -> state_changed-Trigger passt
  -> appendedSignal wird als pending gespeichert
  -> 5000 ms warten
  -> ein späterer Simulationstakt prüft executeAt
  -> ein Signal an Agent 9 wird erzeugt
```

Ein interner Eintrag für die geplante Aktion kann beispielsweise so aussehen:

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

Ein Simulationstakt verarbeitet die geplante Aktion nach ihrem Fälligkeitszeitpunkt; die Verzögerung wird nicht durch einen permanenten Hintergrund-Timer umgesetzt.

## Phase 4: Agent 9 und weitere Empfänger werden inaktiv

Für das gewünschte Ergebnis benötigt das aktive RuleSet eine Rule, die den Empfänger inaktiv setzt, sowie eine Propagation-Rule, die das Signal weiterleitet. Die folgenden Beispiele beschreiben die beabsichtigte Konfiguration:

### Rule zum Inaktivieren

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

Diese Rule soll den empfangenden Agenten auf `inactive` setzen.

### Propagation-Rule

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

Diese Rule soll das Signal an weitere erreichbare Agenten weiterleiten. Beide Rules müssen im aktiven RuleSet enthalten sein. Das Beispiel setzt voraus, dass die Auswertungslogik bei jedem Empfänger zuerst das Inaktivieren und danach die Weiterleitung verarbeitet. Reihenfolge, Zielauswahl und Abbruchverhalten müssen anhand der konfigurierten Propagation-Implementierung geprüft werden.

Beabsichtigter Ablauf je Empfänger:

```text
deactivate-Signal
  -> inactivate-Rule
  -> Empfänger wird inaktiv
  -> propagate-Rule
  -> Signal wird an weitere erreichbare Agenten gesendet
```

Nachdem Agent 9 das Signal empfangen und verarbeitet hat, ist das Feld so darzustellen:

```text
+------+------+------+
| 1 A  | 2 A  | 3 X  |
+------+------+------+
| 4 A  | 5 A  | 6 X  |
+------+------+------+
| 7 X  | 8 X  | 9 X  |
+------+------+------+
```

Agent 9 bleibt in diesem dargestellten Schritt inaktiv; das Signal verursacht bei diesem Agent keine zusätzliche Zustandsänderung. Weitere Agenten ändern ihren Zustand nur, wenn die Propagation sie erreicht und die Inaktivierungs-Rule greift.

## Vollständiger beispielhafter Ablauf

```text
Ausgangszustand:
  1X 2X 3X
  4X 5A 6X
  7X 8X 9X

1. Agent 5 sendet activate an Agent 2.
2. Die activate-Rule aktiviert Agent 2.
3. Agent 5 sendet activate an Agent 4.
4. Die activate-Rule aktiviert Agent 4.
5. Ein Autonomie-Tick entscheidet activate für Agent 1.
6. Agent 1 wird aktiv.
7. Der Trigger state_changed inactive -> active passt auf die Rule von Agent 1.
8. Die Rule plant ein appendedSignal mit delayMs 5000.
9. Ein späterer Simulationstakt erzeugt deactivate von Agent 1 an Agent 9.
10. Die deactivate -> inactivate-Rule setzt Agent 9 auf inaktiv.
11. Die deactivate -> propagate-Rule leitet das Signal weiter, sofern die aktive Konfiguration dies unterstützt.
12. Jeder weitere Empfänger wird nur dann inaktiv, wenn er das Signal erhält und die Inaktivierungs-Rule greift.
```

## Technische Voraussetzungen und Hinweise

- Agent 5 benötigt zwei gültige Zielagenten; die beiden Signale werden separat gesendet.
- Agent 1 muss tatsächlich von `inactive` zu `active` wechseln, damit der Zustandsänderungs-Trigger greift.
- Agent 1 benötigt eine Neighborhood für das dargestellte Verhalten auf Basis lokaler Nachbarn.
- Agent 9 muss existieren, damit `createSignal` das Folge-Signal erzeugen kann.
- Die Agenten müssen mit dem aktiven Propagation-Modus, Geltungsbereich und der Neighborhood-Konfiguration erreichbar sein.
- Die Verhaltensweisen `deactivate -> inactivate` und `deactivate -> propagate` müssen im aktiven RuleSet unterstützt und konfiguriert sein; das Beispiel bestätigt nicht die genaue Auswertungsreihenfolge.
- Die geplante Aktion wird durch einen Simulationstakt verarbeitet, nachdem 5000 ms vergangen sind, nicht durch einen permanenten Hintergrund-Timer.

Siehe auch [Autonomiestrategie](autonomie-strategie.md) und [Entitätenkarte](entitaetenkarte-v0.1.md).
