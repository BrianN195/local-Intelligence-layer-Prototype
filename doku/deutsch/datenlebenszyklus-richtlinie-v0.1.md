# Richtlinie zum Datenlebenszyklus v0.1

## 1. Zweck und Implementierungsstatus

Dieses Dokument beschreibt eine vorgeschlagene Aufbewahrungs- und Lebenszyklusstrategie für Betriebs-, Experiment-, Forschungs-, Proben-, Test- und Produktionsdaten von Crowds. Ziel ist, Daten nur so lange wie nötig aufzubewahren und zugleich wichtige Forschungs- und Betriebsinformationen zu erhalten.

Die Richtlinie beschreibt das angestrebte Verhalten. Sie wird **für den aktuellen MongoDB-Snapshot-Speicher von Local Intelligence nicht automatisch durchgesetzt**. Die aktuelle Anwendung speichert vollständige Experiment-Run-Snapshots in der Collection `experimentruns`. Es gibt Bereinigungshelfer, diese arbeiten jedoch mit separaten Mongoose-Collections und sind weder an den Snapshot-Speicher angebunden noch über die aktuelle API erreichbar. Auch die vorgeschlagene Session-TTL ist nicht aktiv. Siehe den [aktuellen Run-Persistenzadapter](../../local-intelligence/services/runPersistence.js), die [Konfiguration der Lebenszyklusrichtlinie](../../local-intelligence/services/dataLifecyclePolicy.js) und die [Architekturübersicht](architektur.md).

Die Richtlinie umfasst:

- Protokollereignisse
- Session-Daten
- Geräte- und Agentendaten
- Experiment-Runs
- Propagationsereignisse
- Signale
- Beobachtungen
- Analytics-Zusammenfassungen
- Simulatorausgaben
- Testdaten
- Probendaten
- Operative Produktionsdaten

## 2. Experimentumgebungen

Jeder Experiment-Run sollte seine Umgebung angeben. Unterstützte Werte:

- `test`
- `rehearsal`
- `research`
- `production`

Die Umgebung bestimmt die vorgesehene Aufbewahrungs- und Bereinigungsrichtlinie.

## 3. Richtlinie zum Datenlebenszyklus

| Umgebung | Vorgesehene Aufbewahrung | Rohdaten | Zusammenfassung | Vorgesehene Maßnahme |
| --- | ---: | --- | --- | --- |
| Test | 7 Tage | Löschen | Nicht erforderlich | Experiment und abhängige Daten löschen |
| Probe | 30 Tage | Löschen | Wichtige Zusammenfassungen behalten | Rohdaten löschen, Zusammenfassungen behalten |
| Forschung | Langfristig; die Richtlinienkonfiguration legt derzeit 3.650 Tage fest | Archivieren | Langfristig aufbewahren | Für Analysen archivieren |
| Produktion | Betriebliche Richtlinie | Nach Bedarf aufbewahren | Aufbewahren | Gemäß betrieblichen Anforderungen aufbewahren |

Diese Werte sind Richtlinienziele. Sie bedeuten nicht, dass Local Intelligence diese Fristen derzeit auf seine Snapshots anwendet.

## 4. Testdaten

Testdaten sind temporär. Laut Richtlinie dürfen abgeschlossene, fehlgeschlagene oder abgebrochene Testexperimente nach sieben Tagen gelöscht werden. Zu den abhängigen Rohdaten gehören:

- `ExperimentParticipant`
- `Signal`
- `PropagationEvent`
- `Observation`
- `ProtocolEvent`
- `TechnicalWarning`
- `FailureState`

Anschließend wird der zugehörige `ExperimentRun` gelöscht. Laufende Experimente dürfen niemals automatisch gelöscht werden. Die Testbereinigung darf keine Forschungs- oder Produktionsexperimente löschen.

## 5. Probendaten

Probendaten entstehen bei Vorbereitung und Systemvalidierung vor echten Betriebsereignissen. Rohe Probendaten dürfen nach 30 Tagen gelöscht werden. Wichtige Experimentzusammenfassungen, Ergebnisse und Kennzahlen sollten für betriebliche Prüfungen und spätere Vergleiche erhalten bleiben.

## 6. Forschungsdaten

Forschungsexperimente haben langfristigen Wert. Aufzubewahren sind:

- Experimentmetadaten
- Experimentzusammenfassungen und -ergebnisse
- Experimentstatistiken
- Wichtige Analytics-Zusammenfassungen
- Relevante Protokollereignisse
- Relevante Propagationsdaten

Rohe Forschungsdaten sollten nach Möglichkeit archiviert und nicht dauerhaft gelöscht werden. Die aktuelle Richtlinienkonfiguration legt eine nominelle Aufbewahrungsdauer von 3.650 Tagen und die Aktion `archive` fest. Diese Konfiguration ist für sich genommen kein aktiver Archivierungsjob.

## 7. Operative Produktionsdaten

Produktionsdaten werden entsprechend betrieblichen und kommerziellen Anforderungen aufbewahrt. Die Testbereinigung darf keine Produktionsdaten löschen. Geräteinformationen sind auf die für Systembetrieb, Experimentzuordnung und Diagnose erforderlichen Felder zu beschränken.

## 8. Session-Daten

Die Richtlinie sieht vor, getrennte Sessions als temporäre Betriebsdaten zu behandeln und nach sieben Tagen zu entfernen; aktive Sessions sollen bestehen bleiben. **Diese Session-TTL ist in der aktuellen Local-Intelligence-API nicht implementiert:** Es gibt weder ein lokales Session-Modell noch einen TTL-Index. Ein optionales externes Feld `sessionId` an einem Experiment-Run bedeutet nicht, dass lokale Session-Datensätze oder eine TTL-Bereinigung existieren.

## 9. Protokollereignisse

Protokollereignisse sind nach ihrem Zweck zu klassifizieren. Für Laufzeitereignisse können kürzere Aufbewahrungsfristen gelten. Ereignisse zu Forschungs- oder Produktionsexperimenten sind aufzubewahren oder zu archivieren, wenn sie benötigt werden für:

- Rekonstruktion von Experimenten
- Debugging
- Analytics
- Audits
- Forschung

## 10. Propagationsereignisse

Propagationsereignisse bilden die Signalweitergabe zwischen Agenten ab und gelten als rohe Betriebs- oder Experimentdaten. Ihr vorgesehener Lebenszyklus hängt von der Experimentumgebung ab:

- Test: nach Ablauf der Testaufbewahrungsfrist löschen
- Probe: nach Ablauf der Aufbewahrungsfrist für Proben löschen
- Forschung: für langfristige Analysen archivieren
- Produktion: gemäß betrieblichen Anforderungen aufbewahren

## 11. Minimierung von Gerätedaten

Agenten- und Gerätedaten sind zu minimieren. Es dürfen nur Informationen gespeichert werden, die erforderlich sind für:

- Agentenidentifikation
- Kommunikation
- Positionsverfolgung
- Richtungsbehandlung
- Experimentzuordnung
- Betriebsdiagnose

Nicht benötigte Gerätemetadaten dürfen nicht erhoben werden.

## 12. Bereinigungsverfahren und aktuelle Einschränkungen

Die Richtlinie beschreibt die folgenden Endpunktformen:

### Manuelle Testbereinigung (vorgeschlagen)

```http
DELETE /experiments/:id/test-run
```

Dieser vorgeschlagene Endpunkt würde ein abgeschlossenes Testexperiment samt abhängigen Rohdaten löschen.

### Automatische Testbereinigung (vorgeschlagen)

```http
POST /lifecycle/cleanup/test-experiments
```

Dieser vorgeschlagene Prozess würde Testexperimente entfernen, deren Aufbewahrungsfrist abgelaufen ist. Er wäre beschränkt auf:

```text
environment = test
status = finished | failed | cancelled
```

Laufende Experimente sind ausgeschlossen. Diese Lebenszyklus-Routen gehören nicht zur aktuellen API. Die Bereinigungshelfer im Repository fragen normalisierte Mongoose-Modelle und -Collections ab; sie bereinigen nicht die vollständigen Run-Snapshots der aktuellen Anwendung. Außerdem weist der manuelle Helfer nur den Status `running` zurück, statt die vollständige obige Liste abgeschlossener Statuswerte durchzusetzen. Diese Helfer dürfen daher nicht als Durchsetzung der Richtlinie für aktuelle Local-Intelligence-Daten betrachtet werden.

## 13. Datensicherheitsregeln

1. Die Testbereinigung darf niemals Forschungsexperimente löschen.
2. Die Testbereinigung darf niemals Produktionsexperimente löschen.
3. Laufende Experimente dürfen niemals automatisch gelöscht werden.
4. Forschungszusammenfassungen sollen langfristig erhalten bleiben.
5. Wichtige Zusammenfassungen von Proben sollen auch nach dem Löschen der Rohdaten verfügbar bleiben.
6. Gerätedaten sind zu minimieren.
7. Daten mit langfristigem Forschungswert sind nach Möglichkeit zu archivieren statt zu löschen.
8. Bereinigungsvorgänge sollen in Produktionsumgebungen protokolliert werden.

## 14. Ablauf des Datenlebenszyklus

```text
Experiment erstellt
        │
        ▼
Umgebung festgelegt
        │
        ├── test
        │     └── 7 Tage → Löschen
        │
        ├── rehearsal
        │     └── 30 Tage → Rohdaten löschen / Zusammenfassung behalten
        │
        ├── research
        │     └── Langfristig → Archivieren
        │
        └── production
              └── Betriebliche Aufbewahrung
```

## 15. Aktuelle Implementierung

Das Repository enthält folgende Bausteine für Richtlinie und Services:

- `ExperimentRun.environment` kennzeichnet die Datenumgebung im Mongoose-Modell und in den Metadaten des persistierten Snapshots.
- `dataLifecyclePolicy.js` definiert Richtlinienwerte, darunter 3.650 Tage für Forschung.
- `dataLifecycleService.js` enthält einen manuellen Bereinigungshelfer für normalisierte Mongoose-Collections.
- `cleanupTestExperiments.js` enthält einen Helfer zur automatischen Bereinigung abgelaufener Testexperimente.
- Eine MongoDB-TTL-Richtlinie für getrennte Session-Datensätze ist lediglich vorgeschlagen; in der aktuellen Local-Intelligence-API gibt es kein lokales Session-Modell und keinen aktiven TTL-Index.

**Implementierungsstatus von Local Intelligence:** Die Anwendung speichert vollständige Experiment-Run-Snapshots in `experimentruns`. Die genannten Bereinigungshelfer sind nicht mit diesem Snapshot-Speicher verbunden; die vorgeschlagenen Lebenszyklus-Routen sind in der aktuellen API nicht eingebunden. Die Richtlinie darf für Local-Intelligence-Daten nicht als automatisch durchgesetzt gelten. Der [Run-Persistenzadapter](../../local-intelligence/services/runPersistence.js) zeigt den aktuellen Persistenzpfad.

Das angestrebte Design trennt die Lebenszyklusrichtlinie von einzelnen Fachrouten, damit zukünftige Aufbewahrungsregeln ergänzt werden können, ohne jedes Datenmodell ändern zu müssen.

## 16. Zukünftige Verbesserungen

Für zukünftige Versionen sind folgende Verbesserungen vorgesehen:

- Geplante automatische Bereinigungsjobs
- Separate Bereinigung für Probendaten
- Datenarchivierung
- Export vor dem Löschen
- Datenanonymisierung
- Audit-Protokolle für Bereinigungen
- Konfigurierbare Aufbewahrungsfristen
- Aufbewahrungsrichtlinien für Produktionsdaten
- Speicherung archivierter Forschungsdatensätze
- Lebenszyklusüberwachung und -metriken

## 17. Zusammenfassung

Die vorgeschlagene Crowds-Datenlebenszyklusstrategie unterscheidet zwischen temporären Betriebsdaten und langfristigen Forschungs- beziehungsweise Produktionsdaten. Testdaten sollen nach einer festgelegten Frist gelöscht werden. Rohe Probendaten können gelöscht werden, während wichtige Zusammenfassungen erhalten bleiben. Forschungsdaten sollen langfristig archiviert werden. Produktionsdaten werden gemäß betrieblichen Anforderungen aufbewahrt.

Die Strategie verwendet `ExperimentRun.environment`, um jedem Run eine einheitliche Richtlinie zuzuordnen. Für Local Intelligence handelt es sich weiterhin um eine Richtlinie und um Bereinigungsbausteine, nicht um eine aktive Aufbewahrungsdurchsetzung für MongoDB-Run-Snapshots.

Verwandte Dokumente: [Architektur- und Ablagekonventionen](architektur.md) und [Beispiele zum Datenbankverbindungsentwurf](datenbankverbindungen.md).