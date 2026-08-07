# Local Intelligence Prototype - Nächste Verbesserungen (Priorität)

Basierend auf den aktuellen Logs funktioniert bereits:

- ✅ Agent Activation
- ✅ Rule Triggering
- ✅ Signal Propagation
- ✅ Blocking
- ✅ Synchronization
- ✅ Metrics
- ✅ Propagation Events
- ✅ State History

Es gibt jedoch noch einige Inkonsistenzen, die vor dem nächsten Meilenstein behoben werden sollten.

---

# 1. Signal Strength vereinheitlichen (Höchste Priorität)

## Problem

Aktuell existieren zwei verschiedene Strength-Werte.

```json
"payload": {
    "strength": 5
}

"properties": {
    "strength": 1
}
```

Dadurch ist unklar, welcher Wert tatsächlich verwendet wird.

Außerdem wird bei einem Signal mit

```json
payload.strength = 0
```

immer noch

```json
properties.strength = 1
```

gespeichert.

Das bedeutet, dass die vom Client gesendete Stärke momentan ignoriert wird.

---

## Ziel

Es soll nur **eine** Signal Strength existieren.

Empfehlung:

```javascript
signal.payload.strength
```

als einzige Quelle verwenden.

---

## Zu ändern

### POST /signals

Beim Erstellen des Signals:

statt

```javascript
properties: {
    strength: 1,
    ...
}
```

lieber

```javascript
payload: {
    strength: req.body.payload.strength
}
```

oder

```javascript
properties.strength = req.body.payload.strength;
```

aber nicht beides.

---

# 2. Threshold-Logik prüfen

## Problem

Rule Threshold scheint momentan nicht den eigentlichen Signalwert auszuwerten.

Der Vergleich sollte ungefähr so aussehen:

```javascript
if (signal.payload.strength >= rule.threshold)
```

Nicht:

```javascript
signal.properties.strength
```

falls dort immer 1 gespeichert wird.

---

## Prüfen

In

```
processSignal()
```

oder

```
evaluateRules()
```

nachsehen, welche Variable tatsächlich verwendet wird.

---

# 3. Signal Model vereinfachen

Aktuell besitzt jedes Signal

```javascript
payload
```

und

```javascript
properties
```

mit teilweise identischen Informationen.

Das erschwert spätere Erweiterungen.

Empfehlung:

```javascript
payload:
{
    strength
    data
}
```

```javascript
properties:
{
    ttl
    priority
    hopCount
}
```

Strength gehört ausschließlich ins Payload.

---

# 4. Rule Evaluation zentralisieren

Momentan wird an mehreren Stellen geprüft, welche Rule aktiv ist.

Besser wäre:

```text
Signal kommt an

↓

Alle Rules prüfen

↓

Threshold erfüllt?

↓

Rule ausführen
```

Dadurch liegt sämtliche Logik an einer Stelle.

Empfehlung:

```
evaluateRules(signal, run)
```

liefert

```
rule
```

zurück.

Danach:

```
executeRule(rule)
```

---

# 5. Signal Status erweitern

Momentan besitzen Signale fast immer

```json
"status": "created"
```

auch wenn sie bereits propagiert oder blockiert wurden.

Besser:

```text
created
↓

received
↓

evaluated
↓

executed
↓

propagated
```

oder

```text
blocked
```

Dadurch lassen sich spätere Analysen wesentlich einfacher durchführen.

---

# 6. State History verbessern

Zurzeit werden teilweise Einträge erzeugt wie:

```text
State 1
↓

State 1
```

Das erzeugt unnötige History-Einträge.

Besser:

```javascript
if (oldState !== newState)
```

erst dann einen History-Eintrag erzeugen.

---

# 7. Propagation Events erweitern

Aktuell:

```json
signalStrength
ruleTriggered
status
```

Fehlt noch:

```json
threshold
ruleAction
ttlBefore
ttlAfter
hopBefore
hopAfter
```

Dadurch können komplette Signalpfade später nachvollzogen werden.

---

# 8. Metrics robuster machen

Momentan:

- activation-density
- synchronization
- clustering
- consensus
- signal-propagation

Später sinnvoll:

## Average Hop Count

Wie weit wandern Signale durchschnittlich?

---

## Average TTL Remaining

Wie viel Lebensdauer besitzen Signale beim Ende?

---

## Block Rate

Wie viele Signale wurden blockiert?

---

## Rule Usage

Wie oft wurde

- activate
- propagate
- sync
- block

verwendet?

---

## Neighborhood Coverage

Wie viele Neighborhoods wurden erreicht?

---

# 9. Propagation verbessern

Momentan wird lediglich rekursiv weitergeleitet.

Später sollte berücksichtigt werden:

- bereits besuchte Agents
- Loop Detection
- maximale Reichweite
- Neighborhood-Grenzen
- Prioritäten
- parallele Signale

---

# 10. Rule Engine modularisieren

Aktuell dürfte ungefähr folgendes passieren:

```
if activate

if propagate

if sync

if block
```

Besser:

```javascript
const actions = {
    activate,
    propagate,
    sync,
    block
};

actions[rule.action](...);
```

Dann lassen sich neue Actions jederzeit ergänzen.

---

# 11. Logging verbessern

Zusätzlich loggen:

```text
Incoming Signal

↓

Matched Rule

↓

Threshold

↓

Decision

↓

State Change

↓

Propagation
```

Das erleichtert später das Debugging erheblich.

---

# 12. Collective Behavior vorbereiten

Momentan existieren bereits:

- Observation Metrics
- Propagation Events
- State History
- Collective Behavior Results

Als nächster Schritt sollte daraus tatsächliches Schwarmverhalten entstehen.

Beispiele:

- Majority Decision
- Consensus Detection
- Leader Election
- Cluster Formation
- Local Synchronization
- Information Cascades
- Emergent Patterns

Dann entwickelt sich das Projekt von einer reinen Signal-Simulation zu einer echten Local Intelligence Engine.

---

# Empfohlene Reihenfolge

## Phase 1 (Jetzt)

- Signal Strength vereinheitlichen
- Threshold korrigieren
- Signal Model bereinigen

---

## Phase 2

- Rule Evaluation zentralisieren
- Signal Status erweitern
- State History verbessern

---

## Phase 3

- Propagation Events erweitern
- Metrics ausbauen
- Logging verbessern

---

## Phase 4

- Erweiterte Propagation
- Schwarmverhalten
- Collective Intelligence
- Emergent Behavior
- Selbstorganisierende Regeln

---

## Phase 5

- Pathfinder.js füllen
- Wege finden
- kürzesten und schnellsten (über ms delay) weg zum Ziel 
- Emergent Behavior
- Selbstorganisierende Regeln

---

# Erwartetes Ergebnis

Nach Abschluss dieser Punkte besitzt der Prototype:

- saubere Signalverarbeitung
- konsistente Threshold-Logik
- robuste Rule Engine
- nachvollziehbare Propagation
- aussagekräftige Metrics
- vollständige Logs
- solide Grundlage für echte Local Intelligence und Swarm Behavior