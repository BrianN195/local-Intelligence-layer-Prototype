# Tickbasierte Simulation

## Motivation

Die aktuelle Laufzeit verarbeitet Signals und kann während eines aktiven Experimentlaufs außerdem geplante Simulationsticks ausführen. Der vorhandene Tick-Mechanismus ist jedoch noch nicht die vollständig konfigurierbare Schleife pro Agent, die im folgenden Vorschlag beschrieben wird.

Eine Simulations-Engine, die alle Agenten regelmäßig aktualisiert, könnte kontinuierliche Anpassung und realistischeres kollektives Verhalten ermöglichen. Dies ist eine vorgeschlagene zukünftige Erweiterung und noch kein Bestandteil des aktuellen Laufzeitbetriebs.

## Aktueller Ablauf

Signal empfangen

↓

`processSignal()`

↓

Regelauswertung

↓

Schwarmverhalten

↓

Protokollierung

## Vorgeschlagener Ablauf

Experimentlauf startet

↓

Simulationsschleife

↓

Für jeden Simulationstick

↓

Für jeden Agenten

↓

Nachbarschaft analysieren

↓

Regeln auswerten

↓

Schwarmverhalten ausführen

↓

Bei Bedarf Signale erzeugen

↓

Protokollierung

↓

Nächster Tick

## Mögliche Vorteile

- Kontinuierliche Anpassung
- Realistischeres Schwarmverhalten
- Zeit für die Entwicklung emergenten Verhaltens
- Selbstorganisation ohne externe Ereignisse
- Grundlage für die Implementierung zukünftiger Algorithmen

## Signalverarbeitung

Im vorgeschlagenen Design wären Signale nicht mehr der primäre Auslöser des Systems. Stattdessen würden sie als Ereignisse während eines Simulationsticks verarbeitet.

Damit werden folgende Aspekte voneinander getrennt:

- Zeitsteuerung der Simulation
- Regelauswertung
- Signalweiterleitung

## Mögliche Konfiguration

```json
{
  "tickRate": 100,
  "maxTicks": 10000,
  "autoStop": true
}
```

## Mögliche zukünftige Erweiterungen

- Variable Tick-Rate
- Simulation pausieren und fortsetzen
- Verteilte Simulation
- Parallele Verarbeitung von Nachbarschaften
- Prioritätsplanung
- Dynamische Aktualisierung von Agenten

## Status und Hinweise

Dieses Dokument schlägt eine Erweiterung des vorhandenen Tick-Mechanismus vor. Der aktuelle Scheduler löst standardmäßig alle 1.000 ms einen Simulationstick aus, solange ein Lauf aktiv ist. Die darüber hinaus beschriebenen Tick-Raten, Verarbeitung pro Agent und Planungsoptionen sind Vorschläge und nicht vollständig im aktuellen Laufzeitverhalten enthalten. Erweiterungen sollten das bestehende Verhalten erhalten und anhand des Datenmodells sowie des Persistenzdesigns bewertet werden.
