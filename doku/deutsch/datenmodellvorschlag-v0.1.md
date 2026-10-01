# Vorschlag für das Local-Intelligence-Datenmodell v0.1

> **Status:** Vorschlag (Version 0.1). Dieses Dokument stellt ein vorgeschlagenes Datenmodell zur Diskussion und Weiterentwicklung vor. Es behauptet nicht, dass jedes Feld und jede Beziehung bereits im aktuellen Backend implementiert ist.

## Agent

### Bezug zu Crowds

Das bestehende Crowds-Backend verwaltet bereits verbundene Performer-Geräte, aktive Sessions und Echtzeitkommunikation über Socket.IO.

Ein Agent erweitert diese Laufzeitumgebung, indem er einen Performer als autonomen Teilnehmer eines Local-Intelligence-Experiments repräsentiert. Statt einen neuen Client-Typ einzuführen, bietet Agent eine logische Abstraktion, die einen eigenen Zustand verwalten, Signals austauschen und an lokalen Interaktionen teilnehmen kann.

### Felder

| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | string | Eindeutige Kennung des Agents |
| `deviceId` | string | Kennung des verbundenen Crowds-Geräts |
| `stateId` | AgentState | Aktueller Zustand des Agents |
| `neighborhoodId` | string | Neighborhood, zu dem der Agent gehört |

### Beziehungen

- gehört zu genau einem Neighborhood
- besitzt einen aktuellen AgentState
- kann Signals senden und empfangen
- nimmt über sein Neighborhood an einem ExperimentRun teil
- kann mit mehreren NeighborRelations verbunden sein

### Beispieldatensatz

Lesbares Beispiel:

```json
{
  "id": "agent-17",
  "deviceId": "phone-17",
  "stateId": "state-19",
  "neighborhoodId": "7"
}
```

## AgentState

### Bezug zu Crowds

Das Crowds-Backend speichert den globalen Anwendungszustand bereits über `State.js`. Dadurch kann das System die Gesamtlaufzeit einer Session synchronisieren.

AgentState führt eine separate Ebene ein, um den internen Zustand eines einzelnen Agents während eines Local-Intelligence-Experiments abzubilden. Während sich das bestehende Backend auf globale Synchronisierung konzentriert, kann jeder Agent mit AgentState sein Verhalten als Reaktion auf lokale Interaktionen und Regeln unabhängig ändern.

### Felder

| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | string | Eindeutige Kennung |
| `agentId` | string | Referenz auf den Agent |
| `state` | string (enum) | Aktueller Zustand (inactive, waiting, active, …) |
| `updatedAt` | datetime | Zeitpunkt der letzten Zustandsänderung |

### Beziehungen

- gehört zu genau einem Agent
- kann von einer oder mehreren Rules aktualisiert werden
- kann während eines ExperimentRun aufgezeichnet werden

### Beispieldatensatz

Lesbares Beispiel:

```json
{
  "id": "state-19",
  "agentId": "agent-17",
  "state": "active",
  "updatedAt": "2026-06-25T14:23:41Z"
}
```

## Neighborhood

### Bezug zu Crowds

Das aktuelle Crowds-Backend verwaltet Sessions und verbundene Performer, kennt jedoch keine lokalen Interaktionsgruppen.

Neighborhood führt diese zusätzliche Abstraktion ein, indem es Agents innerhalb eines ExperimentRun gruppiert. Es definiert den lokalen Interaktionskontext, in dem Signals weitergeleitet und Rules ausgewertet werden können. Die Zuordnung zu einem Neighborhood kann aus bestehenden Session-Informationen, Sitzplänen oder experimentspezifischen Konfigurationen abgeleitet werden.

### Felder

| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | string | Eindeutige Kennung |
| `experimentRunId` | string | Referenz auf den ExperimentRun |
| `bounds` | Object | Globale Position des Neighborhoods (`rowStart`, `rowEnd`, `colStart`, `colEnd`), einschließlich der Grenzen und 1-basiert. Wird ausschließlich zur Ableitung der Nachbarschaft verwendet. |
| `agentIds` | string[] | Referenzen auf die Agents des Neighborhoods. Ein Agent gehört genau zu einem Neighborhood. |
| `neighbors` | Object[] | Angrenzende Neighborhoods, jeweils dargestellt als (`neighborhoodId`, `direction`, `distance`) |

#### Mögliches zukünftiges Feld

`name` (string) — Optionale, für Betreiber lesbare Kennung. Dieses Feld ist für das Kernmodell nicht erforderlich, könnte jedoch die Bedienbarkeit bei Einrichtung und Überwachung von Experimenten verbessern.

### Beziehungen

- gehört zu genau einem ExperimentRun
- enthält mehrere Agents
- enthält mehrere NeighborRelations
- kann während eines ExperimentRun Signals empfangen

### Beispieldatensatz

Lesbares Beispiel:

```json
{
  "id": "7",
  "experimentRunId": "12",
  "bounds": { "rowStart": 1, "rowEnd": 3, "colStart": 4, "colEnd": 6 },
  "agentIds": [
    "agent-17",
    "agent-18",
    "agent-19",
    "agent-20"
  ],
  "neighbors": [
    { "neighborhoodId": "6", "direction": "west", "distance": 3 },
    { "neighborhoodId": "8", "direction": "east", "distance": 3 }
  ]
}
```

## Signal

### Bezug zu Crowds

Das bestehende Crowds-Backend verteilt bereits synchronisierte Ereignisse zwischen Controller, Performern und Besuchern über Socket.IO.

Signal baut auf dieser Kommunikationsinfrastruktur auf und repräsentiert experimentspezifische Informationen, die innerhalb eines Local-Intelligence-Experiments ausgetauscht werden. Signals können von einem ExperimentRun oder einem Agent ausgehen. So lassen sich lokale Interaktionen, Regelauswertung und Signalweiterleitung unabhängig vom zugrunde liegenden Transportmechanismus modellieren.

### Felder

| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | string | Eindeutige Kennung |
| `type` | string | Signaltyp |
| `sourceId` | string | Ursprung des Signals (Agent oder ExperimentRun) |
| `targetId` | string | Ziel-Agent oder Ziel-Neighborhood |
| `payload` | Object | Signalspezifische Daten |
| `timestamp` | datetime | Zeitpunkt der Signalerstellung |

### Beziehungen

- kann von einem ExperimentRun ausgehen
- kann von einem Agent ausgehen
- kann an ein Neighborhood oder einen Agent adressiert sein
- kann eine oder mehrere Rules auslösen
- kann mehrere PropagationEvents erzeugen

### Beispieldatensatz

Lesbares Beispiel:

```json
{
  "id": "501",
  "type": "pulse",
  "sourceId": "agent-17",
  "targetId": "agent-18",
  "payload": {
    "strength": 1.0,
    "color": "red"
  },
  "timestamp": "2026-06-25T19:30:00Z"
}
```

## RuleSet

### Bezug zu Crowds

Ein RuleSet definiert die Verhaltenslogik, die während einer Crowds-Session angewendet werden kann. Im bestehenden Backend gibt es kein explizites Regelsystem; das Echtzeitverhalten wird stattdessen über Socket.IO-Events verarbeitet (controller → performer/visitor).

RuleSets führen eine strukturierte Abstraktionsebene ein, die eingehende Socket.IO-Signale interpretiert und in Verhaltensänderungen auf Agent-Ebene übersetzt, zum Beispiel in AgentState-Aktualisierungen und Signalweiterleitung.

### Felder

| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | string | Eindeutige Kennung |
| `experimentRunId` | string | Referenz auf den ExperimentRun |
| `ruleIds` | string[] | Liste der Verhaltensregeln |
| `active` | boolean | Gibt an, ob das RuleSet derzeit aktiv ist |

#### Mögliches zukünftiges Feld

`name` (string) — Optionale, für Betreiber lesbare Kennung. Dieses Feld ist für das Kernmodell nicht erforderlich, könnte jedoch die Bedienbarkeit bei Einrichtung und Überwachung von Experimenten verbessern.

### Beziehungen

- gehört zu genau einem ExperimentRun
- referenziert mehrere Rules (über `ruleIds`)
- wertet Signals aus
- kann AgentState aktualisieren

### Beispieldatensatz

Lesbares Beispiel:

```json
{
  "id": "ruleset-1",
  "experimentRunId": "12",
  "active": true,
  "ruleIds": [
    "rule-1",
    "rule-2"
  ]
}
```

## Rule

### Bezug zu Crowds

Rules definieren, wie eingehende Socket.IO-Events (Aktualisierungen von Controller/Performer/Visitor) im Kontext von Local Intelligence interpretiert werden. Im Crowds-Backend ist diese Logik derzeit implizit in Socket-Handlern (`controller.js`, `performer.js`) enthalten. Rules machen sie explizit und konfigurierbar.

### Felder

| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | string | Eindeutige Kennung |
| `type` | string | Regeltyp (z. B. threshold, pattern-match) |
| `signalType` | string | Signaltyp, auf den die Rule reagiert |
| `action` | string | Auszuführende Aktion (activate, propagate, sync) |
| `threshold` | number | Aktivierungsschwelle |

### Beziehungen

- gehört zu einem RuleSet
- wertet ein Signal aus
- kann AgentState aktualisieren
- kann ein PropagationEvent erzeugen

### Beispieldatensatz

Lesbares Beispiel:

```json
{
  "id": "rule-1",
  "type": "threshold",
  "signalType": "pulse",
  "action": "activate",
  "threshold": 2
}
```

## ExperimentRun

### Bezug zu Crowds

Ein ExperimentRun entspricht annähernd einer Crowds-„Session“. Im Backend wird eine Session bereits durch `Session.js` repräsentiert und über Socket.IO-Namespaces koordiniert.

ExperimentRun erweitert dieses Konzept um:

- Modellierung auf Agent-Ebene
- Neighborhood-Struktur
- Regelausführung
- eine Observability-Ebene

### Felder

| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | string | Eindeutige Kennung |
| `sessionId` | string | Referenz auf eine Crowds-Session |
| `status` | string | running/paused/finished |
| `startedAt` | datetime | Startzeitpunkt |
| `endedAt` | datetime | Endzeitpunkt |

### Beziehungen

- verwendet eine Crowds-Session (`Session.js`)
- enthält mehrere Neighborhoods
- enthält ein RuleSet
- erzeugt ObservationMetrics
- erzeugt CollectiveBehaviorResults

### Beispieldatensatz

Lesbares Beispiel:

```json
{
  "id": "exp-1",
  "sessionId": "1",
  "status": "running",
  "startedAt": "2026-06-25T19:00:00Z",
  "endedAt": null
}
```

## PropagationEvent

### Bezug zu Crowds

PropagationEvents repräsentieren Vorgänge, die bei Socket.IO-Broadcasts derzeit implizit ablaufen:

```text
Controller sendet Event → Backend leitet es weiter → Performer empfängt es
```

Im Local-Intelligence-Kontext wird jeder Broadcast zu einem nachvollziehbaren Weiterleitungsschritt. Das ist besonders nützlich, weil das Backend bereits Echtzeit-Eventflüsse über folgende Endpunkte bereitstellt:

- `/controller`
- `/performer`
- `/visitor`

### Felder

| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | string | Eindeutige Kennung |
| `signalId` | string | Zugehöriges Signal |
| `sourceId` | string | Quelle des Signals |
| `targetId` | string | Ziel des Signals |
| `timestamp` | datetime | Zeitpunkt der Weiterleitung |
| `status` | string | success/blocked/delayed |

### Beziehungen

- gehört zu einem Signal
- verbindet zwei Agents
- kann eine Regelauswertung auslösen
- ist Teil der Nachverfolgung eines ExperimentRun

### Beispieldatensatz

Lesbares Beispiel:

```json
{
  "id": "prop-88",
  "signalId": "501",
  "sourceId": "agent-17",
  "targetId": "agent-18",
  "timestamp": "2026-06-25T19:30:01Z",
  "status": "success"
}
```

## ObservationMetric

### Bezug zu Crowds

Das Crowds-Backend stellt `/metrics` bereits bereit (In-Memory-Zähler für Verbindungen und Nachrichten). ObservationMetrics erweitern dies um Analysen auf Experiment-Ebene. Statt ausschließlich den Systemzustand zu erfassen, misst das Modell nun auch Muster kollektiven Verhaltens.

### Felder

| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | string | Eindeutige Kennung |
| `experimentRunId` | string | Referenz auf den ExperimentRun |
| `type` | string | Metriktyp (sync, latency, clustering) |
| `value` | number | Gemessener Wert |
| `timestamp` | datetime | Messzeitpunkt |

### Beziehungen

- gehört zu einem ExperimentRun
- wird aus PropagationEvents berechnet
- wird aus AgentState-Änderungen abgeleitet
- wird zur Auswertung von CollectiveBehaviorResult verwendet

### Beispieldatensatz

Lesbares Beispiel:

```json
{
  "id": "metric-1",
  "experimentRunId": "exp-1",
  "type": "synchronization-score",
  "value": 0.87,
  "timestamp": "2026-06-25T19:35:00Z"
}
```

## CollectiveBehaviorResult

### Bezug zu Crowds

CollectiveBehaviorResult repräsentiert das interpretierte Ergebnis eines Local-Intelligence-ExperimentRun. Während sich das Crowds-Backend derzeit über `/metrics` auf Echtzeitsynchronisierung und Systemzustand konzentriert, führt diese Entität eine semantische Interpretationsebene für emergentes Gruppenverhalten ein.

Das Ergebnis wird berechnet aus:

- ObservationMetrics (quantitative Signale wie Synchronisierung, Latenz und Clustering)
- PropagationEvents (Weiterleitungswege der Signals durch das System)
- AgentState-Übergängen (Reaktionen der Agents im Zeitverlauf)

In der bestehenden Crowds-Architektur würde dieses Ergebnis derzeit nicht direkt gespeichert. Es könnte jedoch nach einer Session aus MongoDB-Session-Logs und Socket.IO-Event-Traces abgeleitet werden.

### Felder

| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | string | Eindeutige Kennung |
| `experimentRunId` | string | Referenz auf den ExperimentRun |
| `type` | string | Typ des emergenten Verhaltens (sync, clustering, wave, consensus) |
| `score` | number | Normalisierte Stärke des beobachteten Verhaltens (0–1) |
| `confidence` | number | Messsicherheit auf Grundlage der Datenvollständigkeit |
| `startTime` | datetime | Startzeitpunkt |
| `endTime` | datetime | Endzeitpunkt |
| `summary` | string | Für Menschen lesbare Interpretation des Ergebnisses |

### Beziehungen

- gehört zu genau einem ExperimentRun
- wird aus ObservationMetrics abgeleitet
- wird aus PropagationEvents abgeleitet
- wird aus AgentState-Änderungen abgeleitet
- fasst das Systemverhalten innerhalb eines Neighborhoods oder des gesamten ExperimentRun zusammen

### Beispieldatensatz

Lesbares Beispiel:

```json
{
  "id": "cbr-1",
  "experimentRunId": "exp-1",
  "type": "synchronization",
  "score": 0.91,
  "confidence": 0.84,
  "startTime": "2026-06-25T19:20:00Z",
  "endTime": "2026-06-25T19:35:00Z",
  "summary": "Nach wiederholter Weiterleitung von Pulse-Signalen durch das Netzwerk entstand eine hohe Synchronisierung über alle Agents hinweg."
}
```

## Zuordnung: bestehendes Backend → Local Intelligence

| Crowds-Backend | Local-Intelligence-Konzept |
|---|---|
| `Session.js` | ExperimentRun |
| `State.js` | AgentState |
| Socket.IO-Events | Signal |
| Controller-/Performer-/Visitor-Sockets | Agent-Interaktionen |
| `/metrics`-Endpunkt | ObservationMetric (System-Basiswerte) |
| MongoDB-Session-Speicherung | Persistenz von ExperimentRun + Neighborhood |
| Echtzeit-Broadcasts | PropagationEvent |

> Die Bezeichner und Feldnamen oben bleiben wie im Vorschlag v0.1 erhalten. Die Implementierung kann davon abweichen; siehe die entsprechenden Workspace-Modelle: [Agent](../../local-intelligence/models/Agent.js), [AgentState](../../local-intelligence/models/AgentState.js), [Neighborhood](../../local-intelligence/models/Neighborhood.js), [Signal](../../local-intelligence/models/Signal.js), [Rule](../../local-intelligence/models/Rule.js), [RuleSet](../../local-intelligence/models/RuleSet.js), [ExperimentRun](../../local-intelligence/models/ExperimentRun.js), [PropagationEvent](../../local-intelligence/models/PropagationEvent.js), [ObservationMetric](../../local-intelligence/models/ObservationMetric.js) und [CollectiveBehaviorResult](../../local-intelligence/models/CollectiveBehaviorResult.js).
