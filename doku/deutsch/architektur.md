# Architektur- und Ablagekonventionen

Dieses Dokument beschreibt die aktuelle Architektur des Local-Intelligence-Prototyps und legt fest, wo neue Dateien hingehören. Es führt das aktuelle MongoDB-Snapshot-Persistenzdesign und die bestehenden Architekturkonventionen zusammen.

## Grundregel

`routes/` und `controllers/` sind HTTP-nahe Schichten. Fachlogik gehört nach `domain/` oder `services/`. Der Ordner `middlewares/` ist echten Express-Middlewares vorbehalten, typischerweise Funktionen mit der Signatur `(req, res, next)`.

## Aktuelle Struktur

```text
local-intelligence/
  routes/                 Express-Routen und Handler-Zuordnungen
  controllers/            HTTP-Handler und Request-/Response-Adapter
  repositories/           In-Memory-Run-Zugriff und fachliche Suchhilfen
  constants/              Fachliche Zustands-, Aktions-, Propagations- und Statuswerte
  domain/
    rules/                Regelauswertung und Regelausführung
    signals/              Signalverarbeitung und Propagation
    behavior/             Agenten- und Schwarmverhalten ohne HTTP-Abhängigkeit
  services/
    autonomy/             Autonomieentscheidungen und Aktionen pro Agent
    simulation/           Simulationsticks und wiederholte Simulationsläufe
    analysis/             Agenten-, Signal-, Nachbarschafts- und Kollektivanalyse
    logging/              Protokollierung von Zustands-, Propagations-, Warnungs- und Fehlerereignissen
    scheduling/           Zustandsabhängige und verzögerte Aktionen
  utils/                  Kleine technische Hilfsfunktionen ohne Fachworkflow
  models/                 Mongoose-Modelldefinitionen
  config/                 Konfiguration der Datenbankverbindung
```

## Verantwortlichkeiten

### `routes/`

Routen legen HTTP-Methode, Pfad und Handler-Zuordnung fest. Sie sollen weder den Store durchsuchen noch den Fachzustand verändern oder Simulationslogik ausführen.

```js
router.post("/rules", createRule);
```

### `controllers/`

Controller lesen Request-Daten, rufen Repositories, Domain-Funktionen oder Services auf und erstellen HTTP-Antworten. Der aktuelle Simulator verändert ein prozesslokales Experiment-Run-Objekt. Persistenz-Middleware speichert den betroffenen Run-Snapshot in MongoDB, bevor sie eine JSON-Antwort sendet.

### `repositories/`

Repositories kapseln Suchvorgänge und Mutationen innerhalb der bestehenden In-Memory-Run-Strukturen. Sie verwenden den beim Start wiederhergestellten `store.js`-Cache; die MongoDB-Persistenz wird separat durch `services/runPersistence.js` verwaltet:

```text
MongoDB-Experiment-Run-Snapshots
  -> Wiederherstellung beim Start
    -> prozesslokaler store.js-Cache
      -> Controller / Domain / Services
        -> Snapshot-Schreibvorgang bei JSON-Antworten
        -> periodischer Snapshot-Flush
```

Zu den aktuellen Repository-Modulen gehören:

```text
repositories/
  experimentRunRepository.js
  agentRepository.js
  neighborhoodRepository.js
  rulesetRepository.js
  ruleRepository.js
  signalRepository.js
```

Der Persistenzadapter speichert pro MongoDB-Dokument einen serialisierten vollständigen Experiment-Run unter Verwendung der bestehenden String-ID. Das ist ein Übergabedesign für den Prototyp, keine normalisierte Persistenz separater Agent-, Neighborhood-, Signal- oder Ereignisdokumente. Der Cache ist prozesslokal; die aktuelle Konfiguration ist für einen Backend-Prozess pro Datenbank vorgesehen. Für Snapshot-Daten gilt eine Sicherheitsgrenze von 14 MiB JSON.

Repositories enthalten ausschließlich Datenzugriff. Regelentscheidungen, Signalpropagation und Simulation gehören nach `domain/` oder `services/`. Siehe die [Repository- und Persistenzhinweise](../../local-intelligence/repositories/README.md) und den [Run-Persistenzadapter](../../local-intelligence/services/runPersistence.js).

### `domain/`

Hier liegt der fachliche Kern der lokalen Intelligenz:

- `domain/rules/`: bestimmt, welche Regeln gelten und welche Aktionen sie auslösen.
- `domain/signals/`: verarbeitet Signale und legt Propagationsverhalten und -reichweite fest.
- `domain/behavior/`: implementiert Agenten- und Schwarmverhalten ohne HTTP-Bezug.

Die Domain darf technische Services wie Logging verwenden, aber keine Express-Routen importieren.

### `services/`

Services koordinieren größere Abläufe:

- `autonomy/`: Entscheidungen pro Agent und autonome Aktionen.
- `simulation/`: einzelne Ticks und wiederholte Simulationsläufe.
- `analysis/`: Messung und Interpretation von Agenten-, Signal-, Nachbarschafts- und Zustandsverteilungen.
- `logging/`: einheitliche Aufzeichnung von Laufzeitereignissen in einem Experiment-Run.
- `scheduling/`: Planung und Verarbeitung zustandsabhängiger Aktionen.

### `utils/`

Nur kleine, möglichst zustandslose Hilfsfunktionen gehören hierher, zum Beispiel geometrische Berechnungen in `utils/geometry.js`.

### `constants/`

Wiederverwendbare fachliche Werte gehören hierher, damit der Code nicht von schwer lesbaren magischen Zahlen oder wiederholten Status-Strings abhängt:

```text
constants/
  actions.js
  statuses.js
  propagation.js
```

State-IDs werden weiterhin mithilfe von `stateHelpers.js` anhand der Definitionen in `store.js` aufgelöst. Die bestehende Store-Struktur bleibt unverändert.

## Wichtige Abhängigkeiten

Der zentrale Simulations- und Signalverarbeitungsablauf ist:

```text
Simulationstick
  -> Autonomieentscheidungen und Signalauswertung
    -> Signalerstellung / Signal-Engine
      -> Nachbarschaftsanalyse
      -> Regelauswertung und -ausführung
        -> Verhalten und Zustandsänderungen
        -> Propagation
      -> Ereignisprotokollierung
```

`services/analysis/analyzeNeighborhood.js` wird sowohl von der Autonomie als auch von der Signal-Engine verwendet und gehört deshalb nach `analysis/`.

## Signalverarbeitungsablauf

Ein Signal durchläuft grundsätzlich diese Schritte:

```text
Signalerstellung
  -> processSignal
  -> Nachbarschaftsanalyse
  -> Regelauswertung
  -> Regelausführung
  -> Zustandsänderung
  -> optionale Propagation
  -> Protokollierung
```

Konkret:

1. `createSignal.js` validiert Quelle und Ziel, erstellt das Signal und fügt es dem aktuellen Run hinzu.
2. `signalEngine.js` setzt den Signalstatus auf `processing` und beginnt mit der Verarbeitung.
3. `analyzeNeighborhood.js` ermittelt lokale Agenten- und Zustandsinformationen.
4. `evaluateRules.js` prüft das aktive RuleSet, den Scope, den Threshold und Nachbarschaftsbedingungen.
5. `executeRule.js` führt eine passende Aktion aus, zum Beispiel Aktivierung, Blockierung, Synchronisierung oder Propagation.
6. Betroffene Agenten und das Signal erhalten aktualisierte Zustands- oder Statuswerte.
7. Bei der Propagation werden neue Signale mit verringertem TTL und erhöhtem HopCount erstellt.
8. `runLogger.js` protokolliert Zustands-, Propagations-, Warnungs- und Fehlerereignisse im Run.

## Zustands-Trigger und verzögerte Signale

Regeln können auf Zustandsänderungen reagieren. Die Bedingung steht unter `trigger`, die Aktion unter `action` und ein später zu sendendes Signal unter `appendedSignal`:

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

Der Ablauf:

```text
Zustandsänderung
  -> state_changed-Trigger auswerten
  -> appendedSignal als ausstehend speichern
  -> bis zu einem Simulationstick warten
  -> createSignal aufrufen, sobald executeAt erreicht ist
```

Es wird kein unkontrolliertes `setTimeout` verwendet. Ausstehende Aktionen werden in `run.scheduledActions` gespeichert und von `simulationTick.js` verarbeitet. `delayMs` misst daher verstrichene Echtzeit; die Ausführung erfolgt jedoch erst in einem Simulationstick, nachdem die Aktion fällig ist.

## Importregeln

- Routen importieren Controller.
- Controller importieren Repositories, Domain-Funktionen und Services.
- Direkte `store`-Imports gehören in Repositories oder in die ausdrücklich dafür vorgesehene Store-Schicht.
- Domain-Code darf Services und Utils importieren, aber keine Routen.
- Services dürfen Domain-Code, andere Services und Utils importieren.
- Neue zyklische Abhängigkeiten vermeiden.
- Relative Imports immer vom Speicherort der importierenden Datei aus berechnen.
- Nach dem Verschieben von Dateien alle statischen und dynamischen Imports prüfen.

## Wohin gehört eine neue Datei?

- Verarbeitet sie `req`, `res` oder `next`? Nach `routes/` oder `controllers/`.
- Entscheidet sie fachlich über Regeln, Signale oder Verhalten? Nach `domain/`.
- Koordiniert sie mehrere fachliche Schritte oder Simulationsticks? Nach `services/`.
- Führt sie eine kleine, zustandslose Berechnung aus? Nach `utils/`.
- Ist sie Express-Querschnittsinfrastruktur wie Authentifizierung oder Fehlerbehandlung? Nach `middlewares/`.

## Namenskonventionen

Dateinamen sollen beschreibendes `camelCase` verwenden, zum Beispiel `signalEngine.js`, `runLogger.js` und `geometry.js`. Abkürzungen und unklare Namen vermeiden.

## Validierung nach Strukturänderungen

Mindestens diese Prüfungen aus dem Repository-Hauptverzeichnis ausführen:

```bash
find local-intelligence -name '*.js' -print0 | xargs -0 -n1 node --check
node -e "import('./local-intelligence/app.js')"
```

Einen Startcheck nur dann ausführen, wenn der Serverprozess anschließend bewusst beendet oder separat verwaltet wird. Beim aktuellen datenbankgestützten Backend ist der Import von `app.js` vom tatsächlichen Serverstart und der MongoDB-Verbindung zu unterscheiden.

Verwandte Dokumente: [Richtlinie zum Datenlebenszyklus](datenlebenszyklus-richtlinie-v0.1.md) und [Beispiele zum Datenbankverbindungsentwurf](datenbankverbindungen.md).