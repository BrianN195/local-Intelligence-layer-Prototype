# Datenbankverbindung und Datenmodell des Prototyps

> **Hinweis zur Quelle:** Die Quelldatei `prototypDatabaseConnectionExplain.md` enthält eine Übersicht des Datenmodells, aber keine Erklärung der Datenbankverbindung. Dieses Dokument korrigiert diese Abweichung und trennt belegtes Prototypverhalten von konzeptionellen oder vorgeschlagenen Entitäten.

## 1. Aktuelle Datenbankverbindung und Persistenz

Der Prototyp verwendet Mongoose für die Verbindung zu MongoDB. [database.js](../../local-intelligence/config/database.js) liest `MONGODB_URI` aus der Umgebung und gibt einen Konfigurationsfehler aus, wenn der Wert fehlt. Die optionale Einstellung `MONGODB_SERVER_SELECTION_TIMEOUT_MS` hat standardmäßig den Wert `10000` Millisekunden.

Beim Start lädt [app.js](../../local-intelligence/app.js) `local-intelligence/.env`, verbindet sich mit MongoDB, stellt Snapshots der Experimentläufe wieder her und startet anschließend den HTTP-Server. Das In-Memory-Array `store.experimentRuns` dient als Arbeitsspeicher für die Läufe. Der Persistenzdienst speichert jeden Lauf als `data`-Snapshot in der Collection `experimentruns` und übernimmt ausgewählte Felder zusätzlich in das Dokument, damit sie abgefragt werden können. API-Antworten, die einem Lauf zugeordnet sind, lösen eine Persistierung aus. Standardmäßig erfolgt außerdem alle 3000 ms ein periodischer Flush; das Intervall lässt sich mit `PERSISTENCE_FLUSH_INTERVAL_MS` konfigurieren. Beim geordneten Herunterfahren werden alle Läufe gespeichert und die Verbindung zu MongoDB geschlossen.

Die Persistenz der Experimentläufe basiert somit auf Snapshots. Dass weitere Mongoose-Model-Schemas existieren, bedeutet nicht, dass aktuell sämtliche Laufzeitdaten über diese Modelle in getrennte Collections geschrieben werden.

## 2. Ebenen des Datenmodells

Die Quellskizze gruppiert die Modellkonzepte wie folgt:

1. **Experiment:** `ExperimentRun`, `ExperimentParticipant`.
2. **Agenten und Nachbarschaften:** `Agent`, `AgentState`, `AgentStateHistory`, `Neighborhood`, `NeighborhoodRelation`.
3. **Signale und Weiterleitung:** `Signal`, `PropagationEvent`, `Rule`, `RuleSet`, `Threshold`.
4. **Beobachtungen und Ergebnisse:** `Observation`, `ObservationMetric`, `CollectiveBehaviorResult`.
5. **Betrieb und Diagnose:** `ProtocolEvent`, `TechnicalWarning`, `FailureState`.
6. **Unterstützende oder vorgeschlagene Konzepte:** `State`, `Session`, `Media`.

Das Modell der Beziehung heißt in der Implementierung `NeighborhoodRelation`; in der Quelle wird es teilweise `NeighborRelation` genannt.

## 3. Zentrale konzeptionelle Beziehung

```text
ExperimentRun
├── ExperimentParticipant
├── Agent ── AgentState / AgentStateHistory
│   ├── Neighborhood ── NeighborhoodRelation ── Agent
│   └── Signal ── PropagationEvent
├── Observation ── ObservationMetric
├── CollectiveBehaviorResult
├── ProtocolEvent
├── TechnicalWarning
└── FailureState
```

Dies ist ein fachliches Diagramm. Es garantiert nicht, dass jede Verbindung als persistierte Datenbankreferenz oder als 1:n-Beschränkung umgesetzt ist.

## 4. ExperimentRun und Teilnehmende

`ExperimentRun` repräsentiert die Ausführung eines Experiments. Sein Schema umfasst den Laufstatus (`created`, `running`, `paused`, `finished`, `failed` oder `cancelled`), Lifecycle-Informationen, die Umgebung (`test`, `rehearsal`, `research` oder `production`), `activeRuleSetId`, Statistiken, Diagnosedaten und eine optionale `sessionId`. Diese `sessionId` ist eine Kennung für eine externe Session und kein Verweis auf ein lokales `Session`-Modell. Zur Laufzeit wird der vollständige Experimentlauf als Snapshot in der MongoDB-Collection `experimentruns` gespeichert. `ExperimentParticipant` ist als separates Modell definiert, wird vom Snapshot-Persistenzpfad jedoch nicht separat gespeichert.

## 5. Agenten, Zustände und Nachbarschaften

`Agent` repräsentiert ein Gerät oder einen Teilnehmenden in der Simulation. Sein Schema umfasst `experimentRunId`, `deviceId`, `stateId`, `neighborhoodId`, Position, Autonomieeinstellungen, Status (`offline`, `online` oder `busy`) und `lastSeen`. Der Zustand eines Agenten wird durch `AgentState` repräsentiert; `AgentStateHistory` ist für die zeitliche Aufzeichnung von Änderungen vorgesehen. Das Agent-Schema besitzt ein Feld `neighborhoodId`; die übergreifende Fachregel und das Verhalten der Beziehungen sollten dennoch anhand der jeweiligen Abläufe geprüft werden.

`Neighborhood` repräsentiert einen lokalen Interaktionskontext. `NeighborhoodRelation` steht für eine direkte Verbindung zwischen Agenten. Die Quelle beschreibt in der vorgeschlagenen Architektur, dass ein Agent genau einer Nachbarschaft angehört. Diese Aussage ist als fachliche Regel zu prüfen und nicht als durch dieses Diagramm belegte, allgemeine Datenbankbeschränkung zu verstehen.

Beispiel einer lokalen Position:

```json
{
  "position": {
    "row": 2,
    "col": 3
  }
}
```

## 6. Signale, Weiterleitung und Regeln

`Signal` repräsentiert eine Nachricht, die einem Lauf und gegebenenfalls Quell- und Zielagenten zugeordnet ist. Die Quellskizze nennt `sourceAgentId`, `targetAgentId`, `experimentRunId`, `neighborhoodId` und `correlationId` als relevante Beziehungen. `PropagationEvent` dokumentiert einen Weiterleitungs- oder Verarbeitungsschritt und kann auf das Signal, beteiligte Agenten, ausgelöste Regeln, einen Status und eine Korrelationskennung verweisen. Diese Liste ist als fachliche Beschreibung zu verstehen; einzelne Felder sollten vor ihrer Verwendung anhand des jeweiligen Schemas geprüft werden.

`Rule` beschreibt eine Verhaltensregel, `RuleSet` fasst Regeln zusammen, und `Threshold` kann eine Aktivierungsschwelle enthalten. `ExperimentRun.activeRuleSetId` kennzeichnet die Referenz auf das aktive Regelset. Ob experimentweite Steuernachrichten und Nachrichten zwischen Agenten dasselbe `Signal`-Modell verwenden sollen, ist weiterhin eine offene Entwurfsfrage.

## 7. Beobachtungen, Ergebnisse und Diagnosen

`Observation` erfasst ein beobachtetes Ereignis oder eine Situation; `ObservationMetric` speichert zugehörige Messwerte. `CollectiveBehaviorResult` enthält ein Analyseergebnis, etwa Synchronisierung, Weiterleitung, Clusterbildung oder Konsens.

`ProtocolEvent` protokolliert wichtige fachliche oder technische Ereignisse. Die Quellnotizen führen Namen wie `SESSION_CREATED`, `SESSION_CONNECTED`, `SESSION_DISCONNECTED`, `SIGNAL_CREATED`, `SIGNAL_STATUS_CHANGED`, `PROPAGATION_CREATED`, `PROPAGATION_STATUS_CHANGED`, `NEIGHBORHOOD_CREATED`, `NEIGHBORHOOD_UPDATED`, `RULESET_CREATED`, `RULESET_ASSIGNED` und `AGENT_REPLACED` als Beispiele auf. Diese Namen sind nicht alle durch die aktuellen Route-Abläufe bestätigt; `AGENT_REPLACED` kommt beispielsweise im Neighborhood-Service vor. `TechnicalWarning` steht für eine technische Warnung, während `FailureState` einen Fehlerzustand repräsentiert. Diese Konzepte erfüllen unterschiedliche Aufgaben und sollten nicht gleichgesetzt werden.

| Konzept | Bedeutung |
| --- | --- |
| `ProtocolEvent` | Was ist im System passiert? |
| `TechnicalWarning` | Welche technische Warnung oder welches Symptom wurde erkannt? |
| `FailureState` | Welcher bestätigte Fehlerzustand liegt vor? |

Ein Timeout beim Heartbeat eines Agenten kann beispielsweise eine `TechnicalWarning` erzeugen; ein bestätigter Ausfall kann durch `FailureState` repräsentiert werden; und ein Ersatzvorgang kann als `ProtocolEvent` protokolliert werden. Welche Ereignisse tatsächlich ausgegeben werden, hängt vom implementierten Ablauf ab.

## 8. Implementierte Modelle und Vorschläge

Der aktuelle [Model-Index](../../local-intelligence/models/index.js) exportiert Schemas für `Agent`, `AgentState`, `AgentStateHistory`, `CollectiveBehaviorResult`, `ExperimentParticipant`, `ExperimentRun`, `FailureState`, `Neighborhood`, `NeighborhoodRelation`, `Observation`, `ObservationMetric`, `PropagationEvent`, `ProtocolEvent`, `Rule`, `RuleSet`, `Signal`, `State`, `TechnicalWarning` und `Threshold`. Damit ist belegt, dass diese Model-Definitionen existieren; daraus folgt nicht, dass jede vorgeschlagene Beziehung oder jeder Ablauf vollständig umgesetzt ist.

Die Quelle führt außerdem `Session` und `Media` auf. Keines der beiden Konzepte erscheint im aktuellen Model-Index als eigenes exportiertes Modell. Als vorgeschlagene Session-Felder nennt die Quelle `type`, `socketId`, `performerId`, `isConnected`, `lastSeen` und `disconnectReason` sowie einen Lifecycle aus erstellt, verbunden, getrennt und erneut verbunden. Dies sind Entwurfsnotizen und keine bestätigten Felder oder Lifecycle-Einträge eines lokalen Session-Modells. `Session` und `Media` sind daher als Vorschläge oder externe Konzepte zu behandeln, bis lokale Model-Definitionen und Abläufe ergänzt werden. Auch die Übertragung von Beziehungen auf Ersatzagenten und andere Lifecycle-Abläufe sind als Entwurfsaussagen zu verstehen, sofern ihre Implementierung nicht gesondert belegt ist.

## 9. Beispiel eines fachlichen Gesamtablaufs

```text
ExperimentRun
  ↓
Neighborhood
  ↓
Agent A
  ↓ erzeugt
Signal
  ↓ wird weitergeleitet
PropagationEvent
  ├── Rule / RuleSet
  └── Agent B
        ↓
Observation
  ↓
ObservationMetric
  ↓
CollectiveBehaviorResult
```

Wichtige Systemereignisse können zusätzlich als `ProtocolEvent`-Einträge protokolliert werden. Ein technisches Problem kann eine `TechnicalWarning` auslösen; wird ein Ausfall bestätigt, kann außerdem ein `FailureState` erfasst werden.

Eine kompakte Übersicht bietet die [Entitätenkarte](entitaetenkarte-v0.1.md). Ein konkretes, ausdrücklich beispielhaftes Signal-/Autonomieszenario steht unter [Beispiel: Signal, Autonomie und Folgeaktion](regel-signal-autonomie-beispiel.md).
