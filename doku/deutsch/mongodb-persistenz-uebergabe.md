# MongoDB-Persistenz: Übergabestand

## Umgesetzter Umfang

- Mongoose verbindet das Backend beim Start über `MONGODB_URI` mit MongoDB. Ist MongoDB nicht erreichbar, startet der HTTP-Server nicht.
- Vorhandene Experimentläufe werden beim Start aus der Collection `experimentruns` in den bestehenden In-Memory-Cache des Simulators geladen.
- Bevor JSON-Antworten der API gesendet werden, werden betroffene Experimentläufe als Snapshots gespeichert. Ein periodischer Flush sichert alle Läufe, die sich aktuell im prozesslokalen Cache befinden; bei regulärem Herunterfahren mit `SIGINT` oder `SIGTERM` werden sie erneut gespeichert.
- Jeder Snapshot verwendet die vorhandene String-ID des Experimentlaufs als MongoDB-`_id`. Dadurch bleiben API- und Seed-IDs erhalten.
- Der Demo-Seed ist optional konfigurierbar und prüft vor dem Anlegen, ob der festgelegte Beispielexperimentlauf bereits existiert.
- `.env` enthält lokale Konfiguration und ist von Git ausgeschlossen. `.env.example` dokumentiert die Konfiguration ohne Geheimnisse.

## Bewusste Übergabeentscheidung

Die Simulationslogik wurde in diesem Abschlussdurchgang nicht so umgeschrieben, dass sie asynchrone Änderungen in mehreren Collections vornimmt. Stattdessen wird das vollständige Laufzeitobjekt jedes Laufs im Feld `data` eines MongoDB-Dokuments in `experimentruns` gespeichert. So bleiben die bestehenden synchronen Controller, Regeln und Simulationsticks erhalten; nach einem Neustart werden sie aus MongoDB wiederhergestellt.

Dies ist eine MongoDB-gestützte Persistenz für den aktuellen Prototyp, **keine normalisierte Produktionsarchitektur**. Im aktuellen Laufzeitbetrieb werden Agenten, Nachbarschaften, Signale und Ereignisse noch nicht in normalisierten Collections persistiert. MongoDB begrenzt ein einzelnes BSON-Dokument auf 16 MiB; die Implementierung setzt daher vorsorglich eine Obergrenze von ungefähr 14 MiB JSON pro Run-Snapshot. Vorgesehen ist ein einzelner Backend-Serverprozess pro Datenbank. Da Snapshots periodisch gespeichert werden, können bei einem abrupten Prozess- oder Host-Ausfall die letzten Sekunden an Änderungen verloren gehen.

## Nicht Teil des aktuellen Übergabeumfangs

- Mehrere API-Instanzen oder ein koordinierter gemeinsamer Cache
- Große Läufe mit unbegrenzt wachsenden Signal-, History- oder Event-Arrays
- Separat persistierte Agenten-, Neighborhood-, Signal- und Event-Dokumente
- Verteilte Transaktionen, Archivierung und Lifecycle-Aufbewahrung
- Session-, Media-, Simulator-, Recovery- und Analytics-Routen aus Entwurfsdokumenten

## Empfehlungen für die nächste technische Übergabe

1. Bei wachsenden Datenmengen Historien sowie Propagation- und Protocol-Events in eigene Collections auslagern und den Datenzugriff asynchron gestalten.
2. Schema-Migrationen für Snapshots einführen, bevor sich das Format von `data` inkompatibel ändert; `snapshotVersion` ist dafür reserviert.
3. Vor dem Betrieb mehrerer Backend-Instanzen den In-Memory-Cache entfernen oder durch ein explizites Konsistenz- und Sperrmodell ersetzen.
4. Die Lifecycle-Bereinigung an den tatsächlichen Snapshot-Daten ausrichten und einschließlich abhängiger Daten testen.
5. Vor einem Produktiveinsatz Authentifizierung, Zugriffsschutz, Backups, Monitoring und angemessene MongoDB-Benutzerrechte ergänzen.

## Lokaler Betrieb und Prüfung

Siehe [Projektstart](projektstart.md) für die lokale Einrichtung. Bei laufender MongoDB führt `npm test` im Verzeichnis `local-intelligence` einen Integrationstest in einer separaten Datenbank mit dem Suffix `_test` aus.
