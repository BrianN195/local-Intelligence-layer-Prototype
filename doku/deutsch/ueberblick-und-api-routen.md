# Übergabe zur Data Layer: Datenmodelle und API-Routen

Dieses Dokument fasst konzeptionelle Datenmodelle und vorgeschlagene Routen für die Crowds Local Intelligence / Data Layer zusammen. Die nachfolgend dargestellten Modellbeziehungen und das Routenverhalten entsprechen der dokumentierten Architektur und dem vorgesehenen Entwurf. Sie belegen nicht, dass jedes Modell, jede Route oder jede Funktion in der aktuellen Codebasis vorhanden ist. Die Implementierung muss separat überprüft werden, bevor ein Eintrag als verfügbar vorausgesetzt wird. Die ausführliche Routenspezifikation steht in der [Routenübersicht](api-routen.md).

## 1. Datenmodelle

Der Entwurf der Crowds Local Intelligence / Data Layer beschreibt Datenmodelle für Experimente, Agents, Neighborhoods, Signale, Propagation, Beobachtungen und technische Ereignisse.

### Zentrale Modelle

- **`ExperimentRun`** — Repräsentiert einen einzelnen Experimentlauf. Dazu gehören unter anderem Status, Umgebung und Laufzeitinformationen. Das Modell dient als übergeordnete Verbindung zu vielen weiteren Datensätzen.
- **`ExperimentParticipant`** — Verknüpft Agents bzw. andere Teilnehmende mit einem `ExperimentRun`.
- **`Agent`** — Repräsentiert ein Gerät oder einen Teilnehmenden im System. Ein Agent kann unter anderem Status, Position und eine `neighborhoodId` besitzen.
- **`AgentState` / `AgentStateHistory`** — Speichern den aktuellen Zustand eines Agents sowie dessen historische Zustandsänderungen.
- **`Neighborhood`** — Beschreibt einen lokalen Bereich innerhalb eines Experiments und kann zugehörige Agents enthalten. Im vorgesehenen Architekturmodell wird ein Agent einem Neighborhood zugeordnet; im aktuellen Schema ist diese Zuordnung optional.
- **`NeighborRelation`** — Beschreibt Beziehungen zwischen Agents innerhalb oder zwischen lokalen Bereichen. Der Bezeichner ist wie im Quelldokument angegeben übernommen.
- **`Signal`** — Speichert ein Signal, das von einem Agent erzeugt und gegebenenfalls an einen anderen Agent weitergegeben wird. Gespeichert werden unter anderem Quelle, Ziel, Status und `correlationId`.
- **`PropagationEvent`** — Dokumentiert die Weiterleitung bzw. Verarbeitung eines Signals zwischen Agents und macht so dessen Ablauf nachvollziehbar.
- **`Observation` / `ObservationMetric`** — Speichern Beobachtungen und die zugehörigen Messwerte während eines Experiments.
- **`Rule` / `RuleSet` / `Threshold`** — Bilden Regeln und Konfigurationen ab, die für die Verarbeitung und das Verhalten innerhalb eines Experiments verwendet werden.
- **`ProtocolEvent`** — Dient der zentralen Ereignisprotokollierung. Wichtige Aktionen, etwa das Erstellen eines Signals, eine Änderung seines Status oder das Erstellen einer Neighborhood, sollen als Ereignisse dokumentiert werden.
- **`TechnicalWarning` / `FailureState`** — Dienen der Dokumentation technischer Probleme, Warnungen und Fehlerzustände, beispielsweise eines Agent-Timeouts oder eines Ausfalls.
- **`Session`** — Ein vorgeschlagenes oder externes Konzept für eine technische Verbindung bzw. Sitzung. Der aktuelle Local-Intelligence-Model-Index exportiert kein lokales Session-Modell.

### Beziehungen zwischen den Modellen

Der zentrale Zusammenhang lässt sich vereinfacht so darstellen:

`ExperimentRun → Neighborhood → Agent`

Die Kommunikation kann wie folgt dargestellt werden:

`Agent → Signal → PropagationEvent → Agent`

Wichtige Vorgänge werden zusätzlich über `ProtocolEvent` dokumentiert. Technische Probleme werden über `TechnicalWarning` oder `FailureState` erfasst.

Diese Beziehungen beschreiben eine nachvollziehbare Datenstruktur zur Speicherung des Systemzustands, der Kommunikation und der Ereignisse eines Experiments. Sie beschreiben das vorgesehene Datenmodell und bestätigen nicht, dass die aktuelle Implementierung alle Beziehungen durchsetzt.

## 2. API-Routen

Die nachfolgend aufgeführten Routen beschreiben die vorgesehene Schnittstelle zwischen Frontend bzw. Simulator und Datenbank. Sie decken das Erstellen, Aktualisieren und Abrufen sowie teilweise das Löschen von Daten ab. Dieser Abschnitt ist als Routen- und Verhaltensspezifikation zu verstehen, nicht als verifizierte Liste implementierter Endpunkte.

### Experiment- und Lifecycle-Routen

Die Experiment-Routen sollen Experimentläufe und deren Lebenszyklus verwalten.

Als Cleanup-Route ist dokumentiert:

`POST /lifecycle/cleanup/test-experiments`

Sie soll alte Test-Experimente und zugehörige Daten bereinigen, darunter Participants, Signals, PropagationEvents, Observations und technische Ereignisse. Ob sie aktuell implementiert ist, wird hier nicht bestätigt.

### Neighborhood-Routen

- `POST /neighborhoods` — Erstellt eine Neighborhood und kann Agents direkt zuordnen.
- `PATCH /neighborhoods/:id` — Aktualisiert beispielsweise Name, Konfiguration oder Agent-Zuordnung.

Das beschriebene Verhalten prüft, ob Agents existieren und ob sie bereits einer anderen Neighborhood zugeordnet sind.

### Signal-Routen

- `POST /signals` — Erstellt ein Signal und überprüft unter anderem, ob der Quell-Agent und ein optionaler Ziel-Agent existieren.
- `PATCH /signals/:id/status` — Ändert den Status eines Signals, beispielsweise:

  `created → sent → received → processed`

  Die Statusänderung soll zusätzlich als `ProtocolEvent` dokumentiert werden.

### Propagation-Routen

- `POST /propagation` — Erstellt ein `PropagationEvent` für die Weiterleitung eines Signals.
- `PATCH /propagation/:id/status` — Aktualisiert den Verarbeitungsstatus der Propagation und kann beispielsweise Zeitpunkte für `received` und `processed` speichern.

Auch diese Änderungen sollen über `ProtocolEvent` protokolliert werden.

### Session-Routen

- `POST /sessions` — Erstellt eine Session.
- `GET /sessions/:id` — Ruft eine bestimmte Session ab.
- `PATCH /sessions/:id/connect` — Setzt eine Session auf verbunden.
- `PATCH /sessions/:id/disconnect` — Setzt eine Session auf getrennt und speichert den Grund.

Die wesentlichen Änderungen im Session-Lebenszyklus sollen ebenfalls als `ProtocolEvent` gespeichert werden.

### RuleSet-Routen

- `POST /rulesets` — Erstellt ein `RuleSet` für ein Experiment.
- `PATCH /rulesets/:id/assign` — Ordnet ein `RuleSet` einem Experiment zu und setzt es als aktives `RuleSet`.

### Media-Routen

Die Media-Routen sollen dem System verfügbare Medien bereitstellen:

- `GET /visuals`
- `GET /sounds`
- `GET /mp3s`

Der beschriebene Entwurf bevorzugt Daten aus MongoDB. Wenn dort keine Liste verfügbar ist, wird auf Dateien im Verzeichnis `public` zurückgegriffen. Eine Implementierung dieses Verhaltens ist hiermit nicht bestätigt.

### Recovery- und Simulator-Funktionen

Zu den beschriebenen Recovery-Funktionen gehören die Überwachung der MongoDB-Auslastung und das Löschen getrennter Sessions.

Die beschriebenen Simulator-Funktionen umfassen:

- Verfügbare Testszenarien auflisten.
- Simulator-Runs starten.
- Laufende Runs abrufen.
- Reports anzeigen.
- Alte Simulator-Reports löschen.

Das Quelldokument nennt für diese Recovery- und Simulator-Funktionen keine Routenpfade. Daher werden hier keine ergänzt.

## Zusammenfassung

Der dokumentierte API-Entwurf deckt folgenden Lebenszyklus ab:

`Create → Update → Read → Lifecycle → Logging → Cleanup`

Ein wichtiges Entwurfsprinzip ist, dass relevante Systemaktionen nicht nur die zugrunde liegenden Daten verändern, sondern zusätzlich über `ProtocolEvent` nachvollziehbar sein sollen. Dies soll spätere Analysen, Monitoring, Debugging und KPI-Auswertungen unterstützen. Daraus folgt nicht, dass diese Funktionen derzeit implementiert sind.

## 3. Priorität 8 — Interactive / Taiwan Observability Support

Laut der ursprünglichen Übergabenotiz wurde nur „Rehearsal/test-run grouping“ abgeschlossen. Die übrigen Punkte sind noch nicht fertig und müssen überarbeitet werden. Diese Statusangabe wurde nicht unabhängig überprüft.

## Weiterführende Dokumentation

- [Ereignistaxonomie und Schema-Governance](ereignistaxonomie-und-schema-governance-v0.1.md)
- [API-Routen](api-routen.md)
