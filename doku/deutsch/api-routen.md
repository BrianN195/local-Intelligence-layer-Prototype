# API-Routen

Dieses Dokument enthält eine vorgeschlagene Routenübersicht und das jeweils zugehörige Verhalten. Es handelt sich um eine Spezifikation und nicht um eine Bestätigung, dass diese Endpunkte oder Funktionen in der aktuellen Codebasis implementiert sind. Vor der Annahme, dass eine Route verfügbar ist, muss sie anhand der laufenden Anwendung und des Quellcodes überprüft werden.

> **Hinweis zum aktuellen Implementierungsstand:** Die Routen dieses Vorschlags sind in der aktuellen Local-Intelligence-Anwendung nicht eingebunden, sofern dies nicht separat anhand des Quellcodes verifiziert wurde. Die nachfolgend beschriebenen Session-, Media-, Simulator-, Analytics- und Recovery-Routen sind Entwürfe; ihre MongoDB-Persistenz ist nicht durch den aktuellen Run-Snapshot-Persistenzpfad implementiert.

> Die Endpunktzeichenfolgen sind exakt wie in der Vorlage übernommen. Insbesondere enthalten `PATCH//experiments/:id/complete` und `GET//experiments/:id/export` dort doppelte Schrägstriche. Ob diese beabsichtigt sind, ist unklar und sollte überprüft werden.

## Experimente

- `POST /experiments` — Erstellt einen Experimentlauf, initialisiert dessen Lebenszyklus, verknüpft ihn mit einer Session und setzt den Experimentstatus auf `running`.
- `PATCH//experiments/:id/complete` — Schließt einen Experimentlauf ab, speichert die Endzeit, aktualisiert den endgültigen Status, die Zusammenfassung und das Ergebnis und protokolliert ein ProtocolEvent.
- `GET /experiments/:id/summary` — Gibt eine statistische Zusammenfassung eines Experiments zurück, einschließlich Participants, Signals, PropagationEvents, Observations, Warnungen, Fehlerzuständen und Ergebnissen zum kollektiven Verhalten.
- `GET//experiments/:id/export` — Exportiert die experimentbezogenen Daten, einschließlich Agents, Participants, Signals, PropagationEvents, Observations, ProtocolEvents, Warnungen, Fehlerzuständen und Analyseergebnissen.
- `GET /experiments/:id/timeline` — Gibt die chronologische Abfolge der während eines Experiments gespeicherten ProtocolEvents zurück.

## Agents und Neighborhoods

- `POST /agents` — Registriert ein mobiles Gerät als Agent, erstellt dessen Anfangszustand und setzt den Agent auf online.
- `PATCH /agents/:id/state` — Aktualisiert den aktuellen Zustand eines Agents, speichert den Zustandsübergang in der Historie und protokolliert die Änderung als ProtocolEvent.
- `POST /neighborhoods` — Erstellt eine Neighborhood für ein Experiment und ordnet ihr die ausgewählten Agents zu.

## Signals und Propagation

- `POST /signals` — Erstellt ein von einem Agent erzeugtes Signal, weist ihm eine Correlation ID zu und protokolliert die Erstellung.
- `PATCH /signals/:id/status` — Aktualisiert den Verarbeitungsstatus eines Signals und protokolliert die Statusänderung.
- `POST /propagation` — Erstellt ein PropagationEvent, das die Übertragung eines Signals zwischen zwei Agents darstellt, und protokolliert dieses Ereignis.
- `PATCH /propagation/:id/status` — Aktualisiert den Status eines PropagationEvents (zum Beispiel `sent`, `received`, `processed` oder `failed`) und protokolliert den Übergang.

## Diagnose und Authentifizierung

- `GET /diagnostics` — Gibt einen Überblick über den aktuellen Systemzustand zurück, einschließlich Agent-Status, laufender Experimente und Aktivitäten der letzten 30 Minuten.
- `GET /experiments/:id/diagnostics` — Gibt detaillierte Diagnoseinformationen für ein bestimmtes Experiment zurück, einschließlich Statistiken, Warnungen, Fehlerzuständen, aktuellen ProtocolEvents und Ergebnissen der Verhaltensanalyse.
- `POST /auth` — Authentifiziert den Controller mit einem Passwort, begrenzt fehlgeschlagene Anmeldeversuche und gibt ein 24 Stunden gültiges JWT zurück.

## Analytics

- `GET /analytics/events` — Gibt die neuesten dauerhaft gespeicherten ProtocolEvents aus der Datenbank zurück. Mit dem optionalen Parameter `limit` lässt sich die Anzahl der zurückgegebenen Ereignisse steuern.
- `GET /analytics/summary` — Gibt eine Analytics-Zusammenfassung für einen angegebenen Zeitraum zurück, einschließlich der Gesamtzahl der ProtocolEvents und ihrer Verteilung nach Ereignistyp und Namespace.

## RuleSets

- `POST /rulesets` — Erstellt ein `RuleSet` für ein vorhandenes Experiment, speichert dessen Regeln und Konfiguration und protokolliert die Erstellung als ProtocolEvent.
- `PATCH /rulesets/:id/assign` — Weist einem Experiment ein vorhandenes `RuleSet` zu, setzt es als aktives `RuleSet`, aktiviert es und protokolliert die Zuweisung als ProtocolEvent.

## Sessions

- `POST /sessions` — Erstellt eine Session für einen verbundenen Client oder Performer, speichert Socket- und Performer-Informationen und protokolliert die Erstellung als ProtocolEvent.
- `GET /sessions/:id` — Gibt eine Session anhand ihrer ID zurück, einschließlich Verbindungsstatus und zugehöriger Informationen.
- `PATCH /sessions/:id/disconnect` — Trennt eine Session, speichert den Trennungsgrund und den Zeitpunkt der letzten Aktivität und protokolliert die Trennung als ProtocolEvent.
- `PATCH /sessions/:id/connect` — Verbindet eine Session erneut, löscht den vorherigen Trennungsgrund, aktualisiert den Zeitpunkt der letzten Aktivität und protokolliert die erneute Verbindung als ProtocolEvent.

## Simulator

- `GET /simulator/scenarios` — Gibt die verfügbaren Simulator-Szenarien zurück, die für einen Lauf ausgewählt werden können.
- `GET /simulator/runs` — Gibt eine Liste der erstellten oder ausgeführten Simulator-Runs zurück.
- `DELETE /simulator/reports` — Löscht bzw. bereinigt erstellte Simulator-Reports und gibt das Ergebnis der Bereinigung zurück.
- `POST /simulator/runs` — Startet einen Simulator-Run für ein ausgewähltes Szenario und gibt den neu erstellten Run zurück.
- `GET /simulator/runs/:runId` — Gibt die aktuellen Informationen und den Status eines bestimmten Simulator-Runs zurück.
- `GET /simulator/runs/:runId/report` — Gibt den Report eines abgeschlossenen Simulator-Runs zurück, indem der Markdown-Report gelesen und als HTML-Dokument dargestellt wird.

## Medien

- `GET /visuals` — Gibt die verfügbaren visuellen Mediendateien und geparsten Metadaten zurück. Wenn möglich, werden Daten aus MongoDB verwendet; andernfalls werden Dateien aus dem Verzeichnis `public/visuals` gelesen.
- `GET /sounds` — Gibt die verfügbaren Audiodateien und geparsten Metadaten zurück. Wenn möglich, werden Daten aus MongoDB verwendet; andernfalls werden Dateien aus dem Verzeichnis `public/sounds` gelesen.
- `GET /mp3s` — Gibt die verfügbaren MP3-Dateien und geparsten Metadaten zurück. Wenn möglich, werden Daten aus MongoDB verwendet; andernfalls werden Dateien aus dem Verzeichnis `public/mp3s` gelesen.

## Recovery

- `GET /recovery/database` — Gibt die aktuelle MongoDB-Auslastung zurück, einschließlich Datenbankstatistiken, Anzahl der Collections, Speicherbelegung und Dokumentanzahlen für Sessions, States und Medien.
- `DELETE /recovery/database/sessions` — Löscht getrennte Sessions aus der Datenbank und gibt die Anzahl der gelöschten Sessions sowie die aktualisierte Datenbankauslastung zurück.

## Weiterführende Dokumentation

- [Überblick und API-Routen](ueberblick-und-api-routen.md)
- [Ereignistaxonomie und Schema-Governance](ereignistaxonomie-und-schema-governance-v0.1.md)
