# Entitätenkarte von Local Intelligence (v0.1)

Dies ist eine übergeordnete konzeptionelle Karte der Domäne des Prototyps. Die Beziehungen erläutern die fachlichen Zusammenhänge; daraus folgt nicht, dass jede Verknüpfung als Fremdschlüssel erzwungen oder in einer eigenen Datenbank-Collection gespeichert wird.

## Überblick über die Entitäten

- **Experiment:** `ExperimentRun` bildet den Kontext eines Laufs; `ExperimentParticipant` ordnet ihm Teilnehmende zu.
- **Agenten und Nachbarschaften:** `Agent`, `AgentState`, `AgentStateHistory`, `Neighborhood` und `NeighborhoodRelation` beschreiben Teilnehmende, ihren aktuellen und historischen Zustand sowie lokale Verbindungen. `NeighborhoodRelation` ist der Modellname in der Implementierung; in den Ausgangsnotizen steht auch `NeighborRelation`.
- **Signale und Regeln:** `Signal` und `PropagationEvent` beschreiben Nachrichten und deren Weiterleitung; `RuleSet`, `Rule` und `Threshold` beschreiben die Verhaltenskonfiguration.
- **Beobachtungen und Ergebnisse:** `Observation`, `ObservationMetric` und `CollectiveBehaviorResult` erfassen Beobachtungen, Messwerte und Analyseergebnisse.
- **Betrieb und Diagnose:** `ProtocolEvent`, `TechnicalWarning` und `FailureState` stehen für Ereignisprotokolle, technische Warnungen und Fehlerzustände.
- **Unterstützendes Modell:** `State` definiert im Prototyp verwendete Zustandsdaten.

## Konzeptionelle Beziehungen

```text
ExperimentRun
├── ExperimentParticipant
├── Agent ── AgentState / AgentStateHistory
│   ├── Neighborhood ── NeighborhoodRelation ── Agent
│   └── Signal ── PropagationEvent
├── RuleSet ── Rule ── Threshold
├── Observation ── ObservationMetric
├── CollectiveBehaviorResult
├── ProtocolEvent
├── TechnicalWarning
└── FailureState
```

Der Zustand eines Agenten und seine Zugehörigkeit zu einer Nachbarschaft werden getrennt modelliert. Signale können von einem Agenten oder von einer experimentweiten Steuerungslogik erzeugt werden; Weiterleitung und Regelauswertung hängen von der Experimentkonfiguration ab.

## Implementierungsstatus und offene Fragen

Das Repository exportiert aus dem [Model-Index](../../local-intelligence/models/index.js) Model-Schemas für `Agent`, `AgentState`, `AgentStateHistory`, `CollectiveBehaviorResult`, `ExperimentParticipant`, `ExperimentRun`, `FailureState`, `Neighborhood`, `NeighborhoodRelation`, `Observation`, `ObservationMetric`, `PropagationEvent`, `ProtocolEvent`, `Rule`, `RuleSet`, `Signal`, `State`, `TechnicalWarning` und `Threshold`. Damit ist das Vorhandensein der Model-Definitionen belegt; es bedeutet nicht automatisch, dass jeder Ablauf oder jede Beziehung vollständig implementiert oder über diese einzelnen Modelle persistiert wird. Die Persistenz von Experimentläufen speichert außerdem einen Snapshot des Laufs.

`Session` und `Media` kommen in der umfassenderen Modellskizze vor, besitzen im aktuellen Model-Index jedoch keine entsprechenden exportierten Schemas. Sie sind daher als vorgeschlagene oder externe Konzepte zu behandeln, nicht als implementierte lokale Modelle. Insbesondere ist `ExperimentRun.sessionId` eine optionale Kennung für eine externe Session und kein Verweis auf ein lokales `Session`-Modell.

Die ursprüngliche Karte stellt die Frage, ob die Kommunikation auf Experimentebene und zwischen Agenten durch eine gemeinsame Entität `Signal` abgebildet werden soll. Diese Modellierungsfrage bleibt offen; die Karte entscheidet sie nicht.

## Beispiele für Signalflüsse

```text
Agent
  ↓
Signal
  ↓
NeighborhoodRelation
  ↓
Agent
  ↓
Rule
  ↓
AgentState
```

```text
ExperimentRun
  ↓
Signal
  ↓
Neighborhood
  ↓
Agent
  ↓
Signal
  ↓
NeighborhoodRelation
  ↓
Agent
  ↓
Rule
  ↓
AgentState
```

Siehe auch [Prototyp: Datenbank und Datenmodell](prototyp-datenbankverbindung.md) und [Beispiel: Signal, Autonomie und Folgeaktion](regel-signal-autonomie-beispiel.md).
