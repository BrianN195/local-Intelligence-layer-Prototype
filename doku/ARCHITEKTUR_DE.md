# Architektur- und Ablagekonventionen

Dieses Dokument beschreibt, wo neue Dateien im Local-Intelligence-Prototyp abgelegt werden sollen.

## Grundregel

`routes/` und `controllers/` sind HTTP-nahe Schichten. Die eigentliche Fachlogik gehoert in `domain/` oder `services/`. Der Ordner `middlewares/` ist fuer echte Express-Middleware reserviert, also Funktionen mit typischerweise `(req, res, next)`.

## Aktuelle Struktur

```text
local-intelligence/
  routes/                 Express-Routen, keine Fachlogik
  controllers/            HTTP-Handler und Request/Response-Adapter
  repositories/           Datenzugriff, aktuell ueber den In-Memory-Store
  constants/              Fachliche Zustands-, Aktions- und Statuswerte
  domain/
    rules/                Regelpruefung und Regelausfuehrung
    signals/              Signalverarbeitung und Propagationsregeln
    behavior/             Verhalten ohne HTTP-Bezug
  services/
    autonomy/             Autonomieentscheidungen und deren Ausfuehrung
    simulation/           Simulationsticks und Simulationsablaeufe
    analysis/             Auswertungen von Agenten, Signalen und kollektivem Verhalten
    logging/              Schreiben von Zustands-, Propagations- und Fehlerereignissen
  utils/                  Kleine technische Hilfsfunktionen ohne Fachworkflow
  models/                 Datenmodell-Definitionen
```

## Verantwortlichkeiten

### `routes/`

Enthaelt nur HTTP-Methode, Pfad und Handler-Zuordnung.

```js
router.post("/rules", createRule);
```

Keine Suche in `store`, keine Zustandsmutation und keine Simulationslogik.

### `controllers/`

Controller lesen Request-Daten, rufen Repositories, Domain- oder Service-Funktionen auf und erstellen HTTP-Antworten. Sie sollen nicht direkt auf `store.experimentRuns` zugreifen und keine langen Simulationsablaeufe enthalten.

### `repositories/`

Repositories kapseln den Zugriff auf die Datenhaltung. Aktuell verwenden sie weiterhin `store.js`:

```text
controllers
  -> repositories
    -> store.js
```

Die aktuellen Repository-Implementierungen sind:

```text
repositories/
  experimentRunRepository.js
  agentRepository.js
  neighborhoodRepository.js
  rulesetRepository.js
  ruleRepository.js
  signalRepository.js
```

Sie kapseln Suchen und Mutationen innerhalb der bestehenden Store-Strukturen. Die Domain- und Simulationslogik arbeitet weiterhin mit dem gefundenen `run`-Objekt und wurde nicht an MongoDB gekoppelt.

Beim spaeteren Datenbankwechsel wird die Implementierung des Repositories angepasst. Controller und Domainlogik sollen dabei moeglichst unveraendert bleiben:

```text
controllers
  -> repositories
    -> MongoDB/Mongoose
```

Repositories enthalten nur Datenzugriff. Regelentscheidungen, Signalpropagation und Simulation gehoeren weiterhin nach `domain/` oder `services/`.

### `domain/`

Hier liegt die fachliche Kernlogik der lokalen Intelligenz:

- `domain/rules/`: Welche Regeln gelten und welche Aktion eine Regel ausloest.
- `domain/signals/`: Verarbeitung, Weiterleitung und Reichweite von Signalen.
- `domain/behavior/`: Agenten- und Schwarmverhalten ohne HTTP-Abhaengigkeit.

Die Domain darf technische Services wie Logging verwenden, aber keine Express-Router importieren.

### `services/`

Services koordinieren groessere Ablaeufe:

- `autonomy/`: Entscheidungen pro Agent und automatische Aktionen.
- `simulation/`: Einzelschritte und wiederholte Simulationstakte.
- `analysis/`: Messung und Interpretation von Zustandsverteilungen.
- `logging/`: Einheitliches Schreiben von Laufzeitereignissen in den Experiment-Run.

### `utils/`

Nur kleine, moeglichst zustandslose Hilfsfunktionen. Beispiel: geometrische Berechnungen in `utils/geometry.js`.

### `constants/`

Enthaelt wiederverwendete fachliche Werte, damit keine schwer lesbaren magischen Zahlen oder wiederholten Status-Strings im Code stehen:

```text
constants/
  actions.js
  statuses.js
  propagation.js
```

State-IDs werden weiterhin ueber `stateHelpers.js` aus den Definitionen in `store.js` aufgeloest. Dadurch bleibt die bestehende Store-Struktur unveraendert.

## Wichtige Abhaengigkeiten

Der zentrale Ablauf ist:

```text
simulation
  -> autonomy
    -> createSignal
      -> domain/signals/signalEngine
        -> domain/rules
        -> domain/behavior
        -> logging
```

`services/analysis/analyzeNeighborhood.js` wird sowohl von Autonomie als auch von der Signal-Engine verwendet und bleibt deshalb in `analysis/`.

## Signalverarbeitungsablauf

Ein Signal durchlaeuft grundsaetzlich diese Kette:

```text
Signal-Erstellung
  -> processSignal
  -> Neighborhood-Analyse
  -> Rule-Evaluation
  -> Rule-Ausfuehrung
  -> Zustandsaenderung
  -> Propagation
  -> Logging
```

Konkret bedeutet das:

1. `createSignal.js` validiert Quelle und Ziel, erstellt das Signal und legt es im aktuellen Run ab.
2. `signalEngine.js` setzt den Signalstatus auf `processing` und startet die Verarbeitung.
3. `analyzeNeighborhood.js` ermittelt lokale Agenten- und Zustandsinformationen.
4. `evaluateRules.js` prueft aktives RuleSet, Scope, Threshold und Nachbarschaftsbedingungen.
5. `executeRule.js` fuehrt die passende Aktion aus, zum Beispiel Aktivierung, Blockierung, Synchronisierung oder Propagation.
6. Die betroffenen Agenten und das Signal erhalten ihre neuen Zustandswerte.
7. Bei Propagation werden neue Signale mit aktualisiertem TTL und HopCount erstellt.
8. `runLogger.js` schreibt Zustands-, Propagations-, Warnungs- und Fehlerereignisse.

## Zustands-Trigger und verzoegerte Signale

Rules koennen auf eine Zustandsaenderung reagieren. Die Bedingung liegt unter `trigger`, die auszufuehrende Aktion unter `action` und ein spaeter zu sendendes Signal unter `appendedSignal`:

```js
{
  enabled: true,
  scope: "agent",
  agentId: "agent-a",
  trigger: {
    type: "state_changed",
    fromState: "inactive",
    toState: "active",
  },
  action: "send_signal",
  appendedSignal: {
    delayMs: 5000,
    targetAgentId: "agent-x",
    signalType: "follow_up",
    signalPayload: {
      strength: 1,
    },
    signalProperties: {
      propagationMode: "unicast",
      propagationScope: "neighborhood",
    },
  },
}
```

Der Ablauf ist:

```text
Zustandsaenderung
  -> state_changed-Trigger pruefen
  -> appendedSignal als pending speichern
  -> naechsten Simulationstakt abwarten
  -> bei faelligem executeAt createSignal ausfuehren
```

Die Aktion verwendet keinen unkontrollierten `setTimeout`. Die geplanten Aktionen liegen in `run.scheduledActions` und werden durch `simulationTick.js` verarbeitet. Die Zeitangabe `delayMs` ist daher an die reale Uhrzeit gekoppelt, waehrend die Ausfuehrung erst beim naechsten Simulationstakt stattfindet.

## Importregeln

- Routen importieren Controller.
- Controller importieren Repositories, Domain und Services.
- Direkte `store`-Imports gehoeren in Repositories oder in die ausdruecklich dafuer zustaendige Store-Schicht.
- Domain importiert Services und Utils, aber keine Routen.
- Services importieren Domain, Services und Utils.
- Neue zyklische Abhaengigkeiten vermeiden.
- Relative Imports immer vom Speicherort der Datei aus berechnen.
- Nach Verschiebungen alle Imports und dynamischen Imports pruefen.

## Wohin gehoert eine neue Datei?

- Verarbeitet sie `req`, `res` oder `next`? Nach `routes/` oder `controllers/`.
- Entscheidet sie fachlich ueber Regeln, Signale oder Verhalten? Nach `domain/`.
- Koordiniert sie mehrere fachliche Schritte oder Ticks? Nach `services/`.
- Fuehrt sie nur eine kleine Berechnung ohne Zustand aus? Nach `utils/`.
- Ist sie eine Express-Querschnittsfunktion wie Authentifizierung oder Fehlerbehandlung? Nach `middlewares/`.

## Namenskonventionen

Dateien verwenden beschreibende Namen im `camelCase`, zum Beispiel `signalEngine.js`, `runLogger.js` und `geometry.js`. Abkuerzungen und unklare Namen vermeiden.

## Validierung nach Strukturänderungen

Mindestens diese Checks ausfuehren:

```bash
find local-intelligence -name '*.js' -print0 | xargs -0 -n1 node --check
node -e "import('./local-intelligence/app.js')"
```

Ein Startcheck darf nur ausgefuehrt werden, wenn der Serverprozess anschliessend bewusst beendet oder separat verwaltet wird.
