 
# 1. Gesamtübersicht

Das Datenmodell kann vereinfacht in folgende Ebenen eingeteilt werden:

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

4. **Beobachtungs- und Ergebnis-Ebene**
   - `Observation`
   - `ObservationMetric`
   - `CollectiveBehaviorResult`

5. **Betriebs-, Fehler- und Protokoll-Ebene**
   - `ProtocolEvent`
   - `TechnicalWarning`
   - `FailureState`

6. **Session- und Medien-Ebene**
   - `Session`
   - `Media`
   - `State`

---

# 2. Zentrale Beziehung

Die wichtigste Kette ist:

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

 # 3. ExperimentRun

`ExperimentRun` ist die zentrale Entität für einen konkreten Experimentlauf.

Das Modell enthält unter anderem:

- `sessionId` → Bezug zu einer `Session`
- `status` → z. B. `created`, `running`, `paused`, `finished`, `failed`, `cancelled`
- Lifecycle-/Statistikdaten
- `activeRuleSetId` → aktives `RuleSet`
- Umgebung bzw. Experiment-Kontext

Viele andere Modelle verwenden `experimentRunId`, um ihre Daten einem bestimmten Experimentlauf zuzuordnen.

# 4. ExperimentParticipant

`ExperimentParticipant` verbindet Teilnehmer mit einem `ExperimentRun`.

Damit kann ein Experimentlauf mehrere Teilnehmer enthalten.

Beziehung:

ExperimentRun 1 ───── N ExperimentParticipant


# 5. Agent

`Agent` repräsentiert ein einzelnes Gerät bzw. einen Teilnehmer innerhalb der Crowd-/Simulation-Logik.

Wichtige Beziehungen:

- `stateId` → `AgentState`
- `neighborhoodId` → `Neighborhood`
- Agent besitzt Positionsdaten
- `lastSeen` und `status` unterstützen die Online-/Offline-Überwachung
- `deviceId` identifiziert den Agenten

In der vorgeschlagenen Architektur gehört ein Agent genau zu **einem** Neighborhood.

ExperimentRun
      │
      ▼
    Agent
      │
      ├── AgentState
      └── Neighborhood

# 6. AgentState und AgentStateHistory

Agent
 │
 ├── current state ──> AgentState
 │
 └── state changes ──> AgentStateHistory

Damit kann sowohl der aktuelle Zustand als auch die historische Entwicklung eines Agenten nachvollzogen werden.

# 7. Neighborhood

`Neighborhood` repräsentiert einen lokalen Bereich innerhalb eines Experiments.

Es enthält unter anderem:

- `experimentRunId`
- `name`
- `agentIds`
- `configuration`
- globale Bounds bzw. räumliche Informationen

Die Agent-Position kann lokal innerhalb des Neighborhoods interpretiert werden.

Beispiel:
Neighborhood N01

1 2 3
4 5 6
7 8 9

Ein Agent kann z. B. lokale Koordinaten besitzen:

{
  "position": {
    "row": 2,
    "col": 3
  }
}

# 8. NeighborRelation

`NeighborRelation` beschreibt die direkte Beziehung zwischen zwei Agents.

Typischerweise kann die Beziehung so verstanden werden:

Agent A ───── NeighborRelation ───── Agent B

Im aktuellen Architecture-Konzept ist wichtig, dass ein Agent nur einem Neighborhood gehört. Beziehungen zwischen Agents können trotzdem innerhalb eines Neighborhoods existieren.

Für den Ersatz eines ausgefallenen Agents werden bestehende Beziehungen auf den Replacement-Agent übertragen.


# 9. Signal

`Signal` repräsentiert eine Nachricht bzw. ein Signal, das von einem Agenten ausgeht und möglicherweise an einen anderen Agenten gerichtet ist.

Wichtige Beziehungen:

- `sourceAgentId` → Quell-Agent
- `targetAgentId` → Ziel-Agent
- `experimentRunId` → Experimentlauf
- `neighborhoodId` → lokaler Bereich
- `correlationId` → Korrelation zusammengehöriger Vorgänge

Agent A
   │
   │ Signal
   ▼
Agent B

# 10. PropagationEvent

`PropagationEvent` dokumentiert, was mit einem Signal während der Weiterleitung passiert.

Es verbindet insbesondere:

- `signalId`
- `experimentRunId`
- `neighborhoodId`
- `sourceAgentId`
- `targetAgentId`
- `triggeredRuleIds`
- `status`
- `correlationId`

Die Beziehung ist:

Signal
  │
  ▼
PropagationEvent
  │
  ├── sourceAgent
  ├── targetAgent
  └── triggered rules

`Signal` beschreibt also die Nachricht; `PropagationEvent` beschreibt den Vorgang ihrer Weiterleitung bzw. Verarbeitung.

# 11. Rule, RuleSet und Threshold

`Rule` beschreibt eine einzelne Regel.

`RuleSet` fasst mehrere Regeln zu einer Konfiguration zusammen.

`Threshold` kann Schwellenwerte für Entscheidungs- oder Verhaltenslogik repräsentieren.

Vereinfacht:

Rule
 │
 └────┐
      ▼
   RuleSet
      │
      ▼
ExperimentRun

Der `ExperimentRun` kann über `activeRuleSetId` auf das aktuell aktive Regelset verweisen.

# 12. Observation und ObservationMetric

`Observation` dient zur Speicherung einer beobachteten Situation bzw. eines beobachteten Vorgangs.

`ObservationMetric` speichert Messwerte bzw. Kennzahlen, die zu einer Beobachtung gehören.

Observation
     │
     └── ObservationMetric


Damit können Rohbeobachtung und daraus gespeicherte Messwerte getrennt behandelt werden.

# 13. CollectiveBehaviorResult


`CollectiveBehaviorResult` speichert Ergebnisse einer Analyse des kollektiven Verhaltens.

Es befindet sich damit eher auf der Ergebnis-/Analytics-Ebene und nicht auf der Ebene eines einzelnen technischen Ereignisses.

Agents
  │
  ▼
Observations / Metrics
  │
  ▼
CollectiveBehaviorResult

# 14. ProtocolEvent

`ProtocolEvent` ist das zentrale Protokoll für wichtige fachliche und technische Abläufe.

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

Ein `ProtocolEvent` referenziert je nach Ereignis z. B.:

- `experimentRunId`
- `agentId`
- `sessionId`
- `signalId`
- `propagationEventId`

---

# 15. TechnicalWarning

`TechnicalWarning` beschreibt technische Probleme oder Warnungen.

Beispiel:

Agent heartbeat timeout
        │
        ▼
TechnicalWarning
        │
        └── AGENT_TIMEOUT

Das Modell ist für technische Warnungen gedacht und sollte nicht die normale fachliche Ereignisprotokollierung ersetzen.

# 16. FailureState

`FailureState` repräsentiert einen tatsächlichen Fehler-/Ausfallzustand.

Beispiel:

Agent timeout
     │
     ▼
Failure detected
     │
     ▼
FailureState
     │
     ▼
Replacement

Ein `TechnicalWarning` kann auf ein Problem hinweisen, während `FailureState` den tatsächlichen Failure-Zustand repräsentiert.

# 17. Session

`Session` beschreibt eine technische Verbindung bzw. Sitzung.

Im vorhandenen Code werden unter anderem gespeichert:

- `type`
- `socketId`
- `performerId`
- `isConnected`
- `lastSeen`
- `disconnectReason`

Lifecycle:

Session created
      │
      ▼
Connected
      │
      ▼
Disconnected
      │
      ▼
Reconnected


Die jeweiligen Zustandsänderungen werden zusätzlich über `ProtocolEvent` protokolliert.

# 18. Beispiel eines vollständigen Ablaufs

Ein möglicher Ablauf sieht so aus:

ExperimentRun
      │
      ▼
Neighborhood
      │
      ▼
Agent A
      │
      │ creates
      ▼
Signal
      │
      │ propagates
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

Parallel werden wichtige Systemereignisse protokolliert:

Signal created
      │
      ▼
ProtocolEvent

Signal failed / technical problem
      │
      ├── TechnicalWarning
      │
      └── FailureState


# 19. Die drei wichtigsten Event-Konzepte

| `ProtocolEvent` | Was ist im System passiert? |
| `TechnicalWarning` | Welches technische Problem/Warnsignal wurde erkannt? |
| `FailureState` | Welcher tatsächliche Fehler-/Ausfallzustand besteht? |

Beispiel:

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

# Zusammenfassung

Die Modelle sind nicht voneinander isoliert. Sie bilden eine zusammenhängende Datenstruktur:

- `ExperimentRun` definiert den Experimentkontext.
- `ExperimentParticipant` verbindet Teilnehmer mit dem Experiment.
- `Agent` repräsentiert Geräte/Teilnehmer.
- `Neighborhood` organisiert Agents in lokalen Bereichen.
- `NeighborRelation` beschreibt Agent-zu-Agent-Beziehungen.
- `AgentState` und `AgentStateHistory` verwalten aktuellen Zustand und Historie.
- `Signal` beschreibt Kommunikation.
- `PropagationEvent` beschreibt die Verarbeitung/Weiterleitung eines Signals.
- `Rule`, `RuleSet` und `Threshold` unterstützen die Verhaltenslogik.
- `Observation` und `ObservationMetric` speichern Beobachtungen und Messwerte.
- `CollectiveBehaviorResult` speichert Analyseergebnisse.
- `ProtocolEvent` protokolliert wichtige Systemereignisse.
- `TechnicalWarning` protokolliert technische Warnungen.
- `FailureState` beschreibt tatsächliche Fehlerzustände.
- `Session` verwaltet technische Verbindungen.
- `State` und `Media` unterstützen Medien- und Zustandsdaten.
                  
                