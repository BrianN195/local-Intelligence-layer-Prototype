# Ereignistaxonomie und Schema-Governance v0.1

Dieses Dokument definiert eine einheitliche Ereignistaxonomie und eine Strategie zur Schema-Governance für das Crowds-Ökosystem.

## Namenskonvention für Ereignisse

Ereignisnamen verwenden das Format `DOMAIN_ACTION`: Großbuchstaben, durch Unterstriche getrennt, wobei das Verb am Ende steht.

Beispiele:

- `SIGNAL_CREATED`
- `SIGNAL_STATUS_CHANGED`
- `PROPAGATION_CREATED`
- `AGENT_STATE_CHANGED`
- `EXPERIMENT_COMPLETED`

## Governance-Regeln

Alle neuen Ereignisse in diesem Projekt müssen folgende Regeln erfüllen:

1. **Das standardisierte Namensformat verwenden.** Ereignisnamen müssen dem Format `DOMAIN_ACTION` entsprechen.
2. **Jedem Ereignis genau eine Kategorie zuweisen.** Zulässige Kategorien sind:
   - `runtime`
   - `protocol`
   - `experiment`
   - `analytics`
3. **Jedes `ProtocolEvent`-Dokument muss die folgenden Pflichtfelder enthalten:**
   - `type`
   - `category`
   - `schemaVersion`
   - `timestamp`
   - `experimentRunId`
   - `agentId`
   - `signalId`
   - `propagationEventId`
   - `correlationId`
   - `detail`
4. **`schemaVersion` erhöhen**, wenn sich die Ereignisnutzdaten inkompatibel ändern.
5. **Vor dem Hinzufügen eines Ereignisses:**
   - Alle referenzierten IDs validieren.
   - Standardisierte Ereignisnamen verwenden.
   - Die Dokumentation aktualisieren, wenn ein neuer Ereignistyp hinzukommt.

Diese Spezifikation soll die Kompatibilität zwischen Crowds, Grid, Interactive, Local Intelligence und zukünftigen Forschungssystemen gewährleisten. Sie beschreibt Governance-Anforderungen und bestätigt nicht, dass jedes Ereignis oder Feld in der aktuellen Codebasis implementiert ist.

## Weiterführende Dokumentation

- [Überblick und API-Routen](ueberblick-und-api-routen.md)
- [API-Routen](api-routen.md)
