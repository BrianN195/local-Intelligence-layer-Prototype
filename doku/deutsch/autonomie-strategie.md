# Autonomiestrategie

Dieses Dokument beschreibt den im Prototyp vorhandenen Autonomieablauf. Es handelt sich um eine Übersicht der Implementierung, nicht um einen Vorschlag für ein künftiges Subsystem.

## Funktionsablauf

```text
agentAutonomy()          → Entscheidung treffen
executeAutonomousAction() → Entscheidung ausführen
runAutonomy()             → geeignete Agenten verarbeiten
autonomyScheduler()       → einen oder mehrere Simulationstakte ausführen
```

## Aufgaben

- `agentAutonomy()` wertet die lokale Nachbarschaft eines Agenten aus und liefert eine Entscheidung wie `activate`, `listen`, `wait`, `idle` oder `observe`. Die aktuellen Entscheidungen beruhen auf Anzahl und Zustand der lokalen Nachbarn.
- `runAutonomy()` überspringt Agenten, die offline sind, keiner Nachbarschaft angehören oder deren Autonomie ausgesetzt ist. Für jeden geeigneten Agenten analysiert die Funktion die Nachbarschaft, protokolliert eine Beobachtung und übergibt die Entscheidung an die ausführende Funktion.
- `executeAutonomousAction()` wendet unterstützte Zustandsänderungen an, protokolliert sie und wertet Regeln für Zustandsänderungen aus. Eine Aktivierung kann außerdem ein Signal des Typs `autonomous_activation` an einen inaktiven lokalen Nachbarn erzeugen.
- `autonomyScheduler()` führt die angeforderte Anzahl an Simulationstakten aus. Ein Takt analysiert auch Signale und verarbeitet fällige geplante Aktionen; der Scheduler ist selbst kein dauerhaft laufender Hintergrund-Timer.

Die Implementierung befindet sich im Projekt unter `local-intelligence/services/autonomy/` und `local-intelligence/services/simulation/`.

## Verwandte Dokumentation

- [Entitätenkarte](entitaetenkarte-v0.1.md)
- [Prototyp: Datenbank und Datenmodell](prototyp-datenbankverbindung.md)
- [Beispiel: Signal, Autonomie und Folgeaktion](regel-signal-autonomie-beispiel.md)
