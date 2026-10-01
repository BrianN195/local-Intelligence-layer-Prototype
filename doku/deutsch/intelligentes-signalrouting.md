# Vorschlag: Intelligentes Signalrouting für die Local Intelligence Layer

> **Status:** Vorschlag. Dieses Dokument beschreibt eine mögliche zukünftige Funktion und behauptet nicht, dass intelligentes Routing bereits implementiert ist.

## Motivation

Die aktuelle Architektur bietet bereits eine solide Grundlage:

- Ein Agent kann höchstens einem Neighborhood zugeordnet sein; laut aktuellem Schema ist die Zuordnung optional.
- Neighborhoods bilden durch explizite Verbindungen zwischen Neighborhoods einen Graphen.
- Signals können zwischen verbundenen Neighborhoods weitergeleitet werden.

Der nächste logische Schritt besteht darin, die Signalweiterleitung **intelligent** zu gestalten. Anstatt ein Signal einfach an jeden erreichbaren Neighbor weiterzuleiten, könnte es selbst eine effiziente Route zu seinem Ziel auswählen. Dadurch würde aus einfacher Flutung ein zielgerichtetes, verteiltes Routing.

## Aktuelle Situation

Die aktuelle Propagation-Engine leitet ein Signal von einem Agent an benachbarte Agents weiter. Erreicht ein Signal die Grenze eines Neighborhoods, kann es in eines der verbundenen Neighborhoods weitergeleitet werden.

Konzeptionell:

```text
Neighborhood A
        │
        ▼
Neighborhood B
        │
        ▼
Neighborhood C
```

Dieser Ansatz funktioniert für lokale Weiterleitung gut, kann mit zunehmender Größe eines Experiments jedoch ineffizient werden.

## Das Problem

Angenommen, ein Experiment besteht aus Dutzenden oder Hunderten von Neighborhoods. Ein Signal startet in **Neighborhood 1** und soll **Neighborhood 10** erreichen.

Ohne Routing-Intelligenz kennt das Signal sein Ziel nicht und bewegt sich Schritt für Schritt durch den Graphen. Mögliche Folgen sind:

- unnötige Weiterleitungen
- doppelte Arbeit
- zusätzliche Latenz
- erhöhter CPU-Verbrauch
- unnötiger Speicherverbrauch
- eine übermäßige Anzahl von Propagation-Events

Mit wachsendem Experiment wird dieses Vorgehen zunehmend ineffizient.

## Routingziele

Ein Signal sollte sein Ziel angeben können. Zwei Zieltypen sind sinnvoll.

### Ziel-Neighborhood

```json
{
  "targetNeighborhoodId": "NH10"
}
```

Ziel ist es, das Signal an ein bestimmtes Neighborhood zu liefern.

### Ziel-Agent

```json
{
  "targetAgentId": "agent-275"
}
```

Zunächst ermittelt das System, zu welchem Neighborhood der Agent aktuell gehört:

```text
Agent
      ↓
Neighborhood
      ↓
Routing
```

Ist ein Agent einem Neighborhood zugeordnet, lässt sich dieses über die Zuordnung ermitteln.

## Warum die Agent-Abfrage nicht aufwendig ist

Auf den ersten Blick könnte es so wirken, als sei die Suche nach einem Agent vor dem Routing ein zusätzlicher, teurer Schritt. In der Praxis ist dieser Aufwand meist vernachlässigbar:

```text
Agent-ID
      ↓
Neighborhood ermitteln
      ↓
Route berechnen
```

Mit einer Hash-Map hat die Suche nach einer Agent-ID typischerweise durchschnittlich eine Laufzeit von $O(1)$. Die Kosten der Routenberechnung hängen von der Graphgröße und dem ausgewählten Algorithmus ab; sie sind nicht zwangsläufig höher als jede Agentensuche. Bei einem Agent-Ziel kommt die Ermittlung des zugehörigen Neighborhoods hinzu.

## Intelligentes Routing

Anstatt ein Signal blind weiterzuleiten, könnte es einer Route durch den Neighborhood-Graphen folgen. Zum Beispiel:

```text
NH01
 │
 ▼
NH04
 │
 ▼
NH08
 │
 ▼
NH10
```

Die berechnete Route könnte im Signal gespeichert werden:

```json
{
  "route": [
    "NH01",
    "NH04",
    "NH08",
    "NH10"
  ]
}
```

Während der Weiterleitung würde das Signal der geplanten Route folgen.

## Mehrere Routingstrategien

Unterschiedliche Experimente können unterschiedliches Routingverhalten erfordern. Mögliche Strategien sind:

- kürzester Pfad
- niedrigste Latenz
- niedrigste Propagation-Kosten
- höchste Bandbreite
- höchste Zuverlässigkeit
- minimale Hop-Anzahl

Die Routingstrategie könnte daher Bestandteil des Signals werden:

```json
{
  "routingStrategy": "lowestLatency"
}
```

## Verbindungsmetadaten

Verbindungen zwischen Neighborhoods können zusätzliche Informationen enthalten, zum Beispiel:

```json
{
  "targetNeighborhoodId": "NH05",
  "latency": 12,
  "bandwidth": 100,
  "packetLoss": 0.01,
  "cost": 2
}
```

Routingentscheidungen könnten die Verbindungsqualität berücksichtigen, anstatt alle Verbindungen gleich zu behandeln.

## Dynamische Neuberechnung der Route

Experimente sind dynamisch. Verbindungen können sich ändern, während ein Signal unterwegs ist. Beispiele dafür sind:

- ein Neighborhood ist nicht verfügbar
- ein Server ist offline
- hohe Latenz
- Überlastung
- ein vorübergehender Verbindungsfehler

Anstatt sofort fehlzuschlagen, könnte das Signal von seiner aktuellen Position aus eine neue Route berechnen.

## Zukünftiges verteiltes Routing

Eine fortgeschrittenere Variante könnte darauf verzichten, den vollständigen Pfad bereits zu Beginn zu berechnen. Stattdessen würde jedes Neighborhood anhand lokaler Informationen nur den nächsten Hop auswählen:

```text
Signal
   │
   ▼
Neighborhood A
   │
 wählt B
   ▼
Neighborhood B
   │
 wählt D
   ▼
Neighborhood D
```

Das ähnelt dem Routing in verteilten Computernetzwerken und könnte adaptives Verhalten ermöglichen.

## Mögliche Erweiterungen für Signal

```json
{
  "targetNeighborhoodId": "...",
  "targetAgentId": "...",
  "route": [],
  "currentHop": 0,
  "routingStrategy": "shortest",
  "routeCalculated": true
}
```

## Mögliche Erweiterungen für Neighborhood

```json
{
  "neighbors": {
    "north": "...",
    "south": "...",
    "east": "...",
    "west": "..."
  },
  "connections": [
    {
      "targetNeighborhoodId": "...",
      "latency": 15,
      "cost": 2,
      "bandwidth": 100
    }
  ]
}
```

## Mögliche Routingalgorithmen

Welcher Algorithmus am besten geeignet ist, hängt von den verfügbaren Informationen ab.

| Algorithmus | Besonders geeignet für |
|------------|-------------------------|
| Breadth-First Search (BFS) | Möglichst wenige Neighborhood-Hops |
| Dijkstra | Gewichtetes Routing (Latenz, Kosten) |
| A* | Räumliche Neighborhood-Anordnungen mit Koordinaten |
| Bellman-Ford | Dynamische Kantengewichte |
| Link-State Routing | Große verteilte Experimente |
| Reinforcement Learning | Zukünftiges adaptives Schwarm-Routing |

Für den aktuellen Prototyp gilt:

- BFS genügt für Routing über den kürzesten Pfad.
- Dijkstra wird sinnvoll, sobald gewichtete Verbindungen (Latenz, Kosten, Bandbreite) eingeführt werden.

## Bezug zum bestehenden Neighborhood-Vorschlag

Dieser Vorschlag baut unmittelbar auf der bestehenden Neighborhood-Architektur auf. Der vorherige Vorschlag führte Folgendes ein:

- einen Agent pro Neighborhood
- eindeutige Neighborhood-Zugehörigkeit
- explizite Verbindungen zwischen Neighborhoods
- eine graphbasierte Neighborhood-Topologie

Dieser Vorschlag erweitert die Architektur, indem Signals diese Neighborhood-Verbindungen intelligent nutzen können. Der bestehende Graph könnte als Routing-Infrastruktur dienen. Das implementierungsbezogene [Signal-Modell](../../local-intelligence/models/Signal.js) und [Neighborhood-Modell](../../local-intelligence/models/Neighborhood.js) liefern relevanten Workspace-Kontext. Das [Modul zur Pfadsuche](../../local-intelligence/routing/pathFinder.js) ist derzeit leer; das hier beschriebene Routing ist vorgeschlagen und nicht implementiert.

## Langfristige Vision

Intelligentes Routing könnte den Weg für fortgeschrittenes Schwarmverhalten ebnen, darunter:

- adaptives Routing
- Vermeidung von Überlastung
- selbstheilende Kommunikation
- verteilte Pfadermittlung
- kooperatives Routing zwischen Neighborhoods
- dezentrale Entscheidungsfindung
- Lastverteilung
- vorausschauendes Routing
- autonome Optimierung
- emergente Kommunikationsmuster

Diese Fähigkeiten könnten die Local Intelligence Layer über deterministische Signalweiterleitung hinaus zu einem verteilten System führen, das seine Kommunikation selbst organisiert.

## Erwartete Vorteile

Im Vergleich zu einfacher Weiterleitung könnte intelligentes Routing Folgendes bieten:

- weniger Propagation-Events
- geringeren Rechenaufwand
- weniger Netzwerkverkehr
- schnellere Signalzustellung
- bessere Skalierbarkeit
- höhere Fehlertoleranz
- realistischere Schwarmkommunikation
- eine Grundlage für kollektive Intelligenz
- eine Grundlage für emergentes Verhalten
- eine Grundlage für zukünftige selbstorganisierende Algorithmen
