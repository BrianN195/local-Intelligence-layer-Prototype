# Local-Intelligence-Datenmodell v0.1

> **Status:** Beschreibender Überblick über das Datenmodell (Version 0.1). Dieses Dokument beschreibt die im Ausgangstext dargestellten Modellkonzepte und Beziehungen. Der Überblick garantiert nicht, dass jede beschriebene Beziehung exakt wie dargestellt implementiert ist.

## 1. Gesamtübersicht

Das Datenmodell lässt sich vereinfacht in folgende Ebenen einteilen:

1. **Experiment-Ebene**
   - `ExperimentRun`
   - `ExperimentParticipant`
2. **Agent- und Neighborhood-Ebene**
   - `Agent`
   - `AgentState`
   - `AgentStateHistory`
   - `Neighborhood`
   - `NeighborRelation`
3. **Signal- und Propagation-Ebene**
   - `Signal`
   - `PropagationEvent`
   - `Rule`
   - `RuleSet`
   - `Threshold`
4. **Beobachtungs- und Ergebnisebene**
   - `Observation`
   - `ObservationMetric`
   - `CollectiveBehaviorResult`
5. **Betriebs-, Fehler- und Protokollebene**
   - `ProtocolEvent`
   - `TechnicalWarning`
   - `FailureState`
6. **Session- und Medienebene**
   - `Session`
   - `Media`
   - `State`

## 2. Zentrale Beziehung

Die wichtigste Kette ist:

```text
ExperimentRun
   │
   ├── ExperimentParticipant
   │
   ├── Agent
   │      │
   │      ├── AgentState
   │      ├── AgentStateHistory
   │      ├── Neighborhood
   │      │      └── NeighborRelation
   │      └── Signal
   │              └── PropagationEvent
   │
   ├── Observation
   │      └── ObservationMetric
   │
   ├── CollectiveBehaviorResult
   │
   ├── ProtocolEvent
   ├── TechnicalWarning
   └── FailureState
```

## 3. ExperimentRun

`ExperimentRun` ist die zentrale Entität für einen konkreten Experimentlauf.

Das Modell enthält unter anderem:

- `sessionId` → Verknüpfung mit einer `Session`
- `status` → zum Beispiel `created`, `running`, `paused`, `finished`, `failed` oder `cancelled`
- Lifecycle- und Statistikdaten
- `activeRuleSetId` → aktives `RuleSet`
- Umgebung bzw. Experimentkontext

Viele andere Modelle verwenden `experimentRunId`, um ihre Daten einem bestimmten Experimentlauf zuzuordnen.

## 4. ExperimentParticipant

`ExperimentParticipant` verknüpft Teilnehmer mit einem `ExperimentRun`. Dadurch kann ein Experimentlauf mehrere Teilnehmer umfassen.

Beziehung:

```text
ExperimentRun 1 ───── N ExperimentParticipant
```

## 5. Agent

`Agent` repräsentiert ein einzelnes Gerät bzw. einen Teilnehmer innerhalb der Crowd-/Simulationslogik.

Wichtige Beziehungen und Attribute:

- `stateId` → `AgentState`
- `neighborhoodId` → `Neighborhood`
- der Agent besitzt Positionsdaten
- `lastSeen` und `status` unterstützen die Online-/Offline-Überwachung
- `deviceId` identifiziert den Agent

In der vorgeschlagenen Architektur gehört ein Agent genau zu **einem** Neighborhood.

```text
ExperimentRun
      │
      ▼
    Agent
      │
      ├── AgentState
      └── Neighborhood
```

## 6. AgentState und AgentStateHistory

```text
Agent
 │
 ├── aktueller Zustand ──> AgentState
 │
 └── Zustandsänderungen ──> AgentStateHistory
```

Damit lassen sich sowohl der aktuelle Zustand als auch die historische Entwicklung eines Agents nachvollziehen.

## 7. Neighborhood

`Neighborhood` repräsentiert einen lokalen Bereich innerhalb eines Experiments.

Es enthält unter anderem:

- `experimentRunId`
- `name`
- `agentIds`
- `configuration`
- globale Bounds bzw. räumliche Informationen

Die Position eines Agents kann innerhalb seines Neighborhoods lokal interpretiert werden.

Beispiel: Neighborhood N01

```text
1 2 3
4 5 6
7 8 9
```

Ein Agent kann beispielsweise folgende lokale Koordinaten besitzen:

```json
{
  "position": {
    "row": 2,
    "col": 3
  }
}
```

## 8. NeighborRelation

`NeighborRelation` beschreibt eine direkte Beziehung zwischen zwei Agents. Typischerweise lässt sich die Beziehung so darstellen:

```text
Agent A ───── NeighborRelation ───── Agent B
```

Im aktuellen Architekturkonzept gehört ein Agent nur zu einem Neighborhood. Beziehungen zwischen Agents können dennoch innerhalb eines Neighborhoods bestehen.

Wird ein ausgefallener Agent ersetzt, werden seine bestehenden Beziehungen auf den Ersatz-Agent übertragen.

## 9. Signal

`Signal` repräsentiert eine Nachricht bzw. ein Signal, das von einem Agent ausgeht und möglicherweise an einen anderen Agent adressiert ist.

Wichtige Beziehungen:

- `sourceAgentId` → Quell-Agent
- `targetAgentId` → Ziel-Agent
- `experimentRunId` → Experimentlauf
- `neighborhoodId` → lokaler Bereich
- `correlationId` → Korrelation zusammengehöriger Vorgänge

```text
Agent A
   │
   │ Signal
   ▼
Agent B
```

## 10. PropagationEvent

`PropagationEvent` dokumentiert, was während der Weiterleitung mit einem Signal geschieht. Insbesondere verknüpft es:

- `signalId`
- `experimentRunId`
- `neighborhoodId`
- `sourceAgentId`
- `targetAgentId`
- `triggeredRuleIds`
- `status`
- `correlationId`

Beziehung:

```text
Signal
  │
  ▼
PropagationEvent
  │
  ├── sourceAgent
  ├── targetAgent
  └── ausgelöste Rules
```

`Signal` beschreibt somit die Nachricht; `PropagationEvent` beschreibt ihre Weiterleitung bzw. Verarbeitung.

## 11. Rule, RuleSet und Threshold

`Rule` beschreibt eine einzelne Regel.

`RuleSet` fasst mehrere Regeln zu einer Konfiguration zusammen.

`Threshold` kann Schwellenwerte für Entscheidungs- oder Verhaltenslogik repräsentieren.

Vereinfachte Beziehung:

```text
Rule
 │
 └────┐
      ▼
   RuleSet
      │
      ▼
ExperimentRun
```

Über `activeRuleSetId` kann der `ExperimentRun` auf das aktuell aktive Regelset verweisen.

## 12. Observation und ObservationMetric

`Observation` dient zur Speicherung einer beobachteten Situation bzw. eines beobachteten Vorgangs. `ObservationMetric` speichert Messwerte bzw. Kennzahlen, die zu einer Beobachtung gehören.

```text
Observation
     │
     └── ObservationMetric
```

Dadurch können die Rohbeobachtung und die dazu gespeicherten Messwerte getrennt behandelt werden.

## 13. CollectiveBehaviorResult

`CollectiveBehaviorResult` speichert die Ergebnisse einer Analyse des kollektiven Verhaltens. Es gehört damit eher zur Ergebnis-/Analytics-Ebene als zur Ebene eines einzelnen technischen Ereignisses.

```text
Agents
  │
  ▼
Observations / Metrics
  │
  ▼
CollectiveBehaviorResult
```

## 14. ProtocolEvent

`ProtocolEvent` ist das zentrale Protokoll wichtiger fachlicher und technischer Abläufe.

Beispiele aus den vorhandenen Routes:

- `SESSION_CREATED`
- `SESSION_CONNECTED`
- `SESSION_DISCONNECTED`
- `SIGNAL_CREATED`
- `SIGNAL_STATUS_CHANGED`
- `PROPAGATION_CREATED`
- `PROPAGATION_STATUS_CHANGED`
- `NEIGHBORHOOD_CREATED`
- `NEIGHBORHOOD_UPDATED`
- `RULESET_CREATED`
- `RULESET_ASSIGNED`
- `AGENT_REPLACED`

Je nach Ereignis referenziert ein `ProtocolEvent` beispielsweise:

- `experimentRunId`
- `agentId`
- `sessionId`
- `signalId`
- `propagationEventId`

## 15. TechnicalWarning

`TechnicalWarning` beschreibt technische Probleme oder Warnungen.

Beispiel:

```text
Agent heartbeat timeout
        │
        ▼
TechnicalWarning
        │
        └── AGENT_TIMEOUT
```

Dieses Modell ist für technische Warnungen vorgesehen und sollte nicht die normale fachliche Ereignisprotokollierung ersetzen.

## 16. FailureState

`FailureState` repräsentiert einen tatsächlichen Fehler- bzw. Ausfallzustand.

Beispiel:

```text
Agent timeout
     │
     ▼
Fehler erkannt
     │
     ▼
FailureState
     │
     ▼
Ersatz
```

Ein `TechnicalWarning` kann auf ein Problem hinweisen, während `FailureState` den tatsächlichen Fehlerzustand repräsentiert.

## 17. Session

`Session` ist ein vorgeschlagenes Konzept für eine technische Verbindung bzw. Sitzung und kein lokales Modell der aktuellen Local-Intelligence-Laufzeit.

Die umfassendere Crowds-Modellskizze sieht unter anderem folgende Werte vor:

- `type`
- `socketId`
- `performerId`
- `isConnected`
- `lastSeen`
- `disconnectReason`

Lifecycle:

```text
Session erstellt
      │
      ▼
Verbunden
      │
      ▼
Getrennt
      │
      ▼
Erneut verbunden
```

Im vorgeschlagenen Design werden die jeweiligen Zustandsänderungen zusätzlich über `ProtocolEvent` protokolliert; dieser Session-Lifecycle ist in der aktuellen Local-Intelligence-API nicht implementiert.

## 18. Beispiel eines vollständigen Ablaufs

Ein möglicher Ablauf sieht so aus:

```text
ExperimentRun
      │
      ▼
Neighborhood
      │
      ▼
Agent A
      │
      │ erstellt
      ▼
Signal
      │
      │ wird weitergeleitet
      ▼
PropagationEvent
      │
      ├── Rule / RuleSet
      │
      └── Agent B
              │
              ▼
        Observation
              │
              ▼
     ObservationMetric
              │
              ▼
 CollectiveBehaviorResult
```

Wichtige Systemereignisse werden parallel protokolliert:

```text
Signal erstellt
      │
      ▼
ProtocolEvent

Signal fehlgeschlagen / technisches Problem
      │
      ├── TechnicalWarning
      └── FailureState
```

## 19. Die drei wichtigsten Event-Konzepte

| Konzept | Beantwortete Frage |
|---|---|
| `ProtocolEvent` | Was ist im System passiert? |
| `TechnicalWarning` | Welches technische Problem bzw. Warnsignal wurde erkannt? |
| `FailureState` | Welcher tatsächliche Fehler- bzw. Ausfallzustand liegt vor? |

Beispiel:

```text
Agent antwortet nicht
        │
        ├── TechnicalWarning
        │      "AGENT_TIMEOUT"
        │
        ├── FailureState
        │      "Agent failed"
        │
        └── ProtocolEvent
               "AGENT_REPLACED"
```

## Zusammenfassung

Die Modelle sind miteinander verknüpft und bilden eine zusammenhängende Datenstruktur:

- `ExperimentRun` definiert den Experimentkontext.
- `ExperimentParticipant` verknüpft Teilnehmer mit dem Experiment.
- `Agent` repräsentiert Geräte bzw. Teilnehmer.
- `Neighborhood` organisiert Agents in lokalen Bereichen.
- `NeighborRelation` beschreibt Beziehungen zwischen Agents.
- `AgentState` und `AgentStateHistory` verwalten den aktuellen Zustand und dessen Historie.
- `Signal` beschreibt die Kommunikation.
- `PropagationEvent` beschreibt die Verarbeitung bzw. Weiterleitung eines Signals.
- `Rule`, `RuleSet` und `Threshold` unterstützen die Verhaltenslogik.
- `Observation` und `ObservationMetric` speichern Beobachtungen und Messwerte.
- `CollectiveBehaviorResult` speichert Analyseergebnisse.
- `ProtocolEvent` protokolliert wichtige Systemereignisse.
- `TechnicalWarning` protokolliert technische Warnungen.
- `FailureState` beschreibt tatsächliche Fehlerzustände.
- `Session` verwaltet technische Verbindungen.
- `State` und `Media` unterstützen Medien- und Zustandsdaten.

Die Workspace-Implementierungen dieser Konzepte umfassen [ExperimentRun](../../local-intelligence/models/ExperimentRun.js), [ExperimentParticipant](../../local-intelligence/models/ExperimentParticipant.js), [Agent](../../local-intelligence/models/Agent.js), [AgentState](../../local-intelligence/models/AgentState.js), [AgentStateHistory](../../local-intelligence/models/AgentStateHistory.js), [Neighborhood](../../local-intelligence/models/Neighborhood.js), [NeighborRelation](../../local-intelligence/models/NeighborhoodRelation.js), [Signal](../../local-intelligence/models/Signal.js), [PropagationEvent](../../local-intelligence/models/PropagationEvent.js), [Rule](../../local-intelligence/models/Rule.js), [RuleSet](../../local-intelligence/models/RuleSet.js), [Threshold](../../local-intelligence/models/Threshold.js), [Observation](../../local-intelligence/models/Observation.js), [ObservationMetric](../../local-intelligence/models/ObservationMetric.js), [CollectiveBehaviorResult](../../local-intelligence/models/CollectiveBehaviorResult.js), [ProtocolEvent](../../local-intelligence/models/ProtocolEvent.js), [TechnicalWarning](../../local-intelligence/models/TechnicalWarning.js), [FailureState](../../local-intelligence/models/FailureState.js) und [State](../../local-intelligence/models/State.js).
