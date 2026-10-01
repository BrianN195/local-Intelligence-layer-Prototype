# Local Intelligence starten

Diese Anleitung beschreibt den lokalen Betrieb des Prototyps mit MongoDB.

## Voraussetzungen

- Node.js 20.19.0 oder neuer und npm
- Docker mit dem dedizierten MongoDB-Container `mon-mongo` oder eine eigene MongoDB-Instanz auf Port 27017
- Die lokalen Ports 27017 und 3000 müssen frei sein

Der vorhandene Container `crowds-mongodb` gehört zum Crowds-System. Diese Anleitung startet, stoppt oder verändert ihn **nicht**. Local Intelligence verwendet `mon-mongo` und eine eigene MongoDB-Datenbank namens `local_intelligence`.

## Backend installieren und starten

Im Repository-Hauptordner:

```bash
cd local-intelligence
npm install
```

Die lokale Datei `.env` enthält die Verbindungszeichenfolge `mongodb://127.0.0.1:27017/local_intelligence`. Kopiere bei einer neuen Arbeitskopie `.env.example` nach `.env` und passe die Werte bei Bedarf an. `.env` enthält lokale Konfiguration und ist von Git ausgeschlossen.

Starte ausschließlich den dedizierten MongoDB-Container:

```bash
docker start mon-mongo
```

Falls `mon-mongo` nicht existiert, kann stattdessen ein neuer Container mit eigenem persistentem Volume gestartet werden:

```bash
docker run -d --name local-intelligence-mongo --restart unless-stopped -p 27017:27017 -v local-intelligence-mongo-data:/data/db mongo:7
```

Danach im Verzeichnis `local-intelligence`:

```bash
npm start
```

Der Server wartet zunächst auf die Datenbank und stellt anschließend gespeicherte Runs wieder her. Bei erfolgreichem Start erscheinen in der Konsole `MongoDB connected` und `Local Intelligence running on port 3000`. Ist MongoDB nicht erreichbar, startet der API-Server nicht. Beende den Server mit **Ctrl+C**; vor dem Herunterfahren werden die Runs erneut gespeichert.

Alternativ lässt sich der Server vom Repository-Hauptordner aus starten:

```bash
node local-intelligence/app.js
```

## Beispieldaten

In der mitgelieferten lokalen `.env` ist `SEED_DEMO=true` gesetzt. Der Server prüft beim Start, ob der Beispielexperimentlauf `experiment-9x9-test` vorhanden ist. Nur wenn er fehlt, wird er über die lokale API angelegt. Wiederholte Starts legen den Beispieldatensatz daher nicht erneut an. Für einen Betrieb ohne Beispieldaten setze `SEED_DEMO=false`. `seedScript2.js` wird nicht automatisch ausgeführt.

Beispielabfragen an die API:

```text
GET http://localhost:3000/experiment-runs/experiment-9x9-test/summary
GET http://localhost:3000/agents?experimentRunId=experiment-9x9-test
GET http://localhost:3000/neighborhoods?experimentRunId=experiment-9x9-test
```

Die Oberflächen `script1.html` und `script2.html` im Repository-Hauptordner erwarten die API unter `http://localhost:3000`.

Integrationstest bei erreichbarer MongoDB:

```bash
npm test
```

Der Test verwendet eine separate Datenbank mit dem Suffix `_test` und löscht sein Testdokument nach Abschluss.

## Persistenzumfang und Grenzen

Die vorhandene Simulationslogik verarbeitet einen `ExperimentRun` synchron als Objekt. Um diesen Prototyp mit möglichst geringem Risiko datenbankgestützt zu machen, speichert Local Intelligence jeden vollständigen Run als Snapshot in einem MongoDB-Dokument der Collection `experimentruns` und verwendet dafür die bestehende String-ID. Beim Start werden die Snapshots wieder in den Laufzeit-Cache geladen. API-Änderungen werden vor JSON-Antworten und zusätzlich periodisch gespeichert.

Im aktuellen Laufzeitbetrieb werden Agenten, Nachbarschaften, Signale, Historien, PropagationEvents und Metriken noch nicht in normalisierten Collections persistiert. Vorgesehen ist **ein Backend-Serverprozess pro Datenbank**. Ein Run-Snapshot ist auf ungefähr 14 MiB JSON begrenzt; größere Läufe führen beim Speichern zu einem Fehler. Für den Produktiveinsatz oder größere Experimente sollten wachsende Signale, Historien, PropagationEvents und Metriken in eigene Collections ausgelagert und der Mehrprozessbetrieb abgesichert werden. Das sind zukünftige Architekturarbeiten und keine Voraussetzung für den lokalen Übergabebetrieb.

## Fehlerbehebung

- **MongoDB-Verbindung fehlgeschlagen:** Prüfe `docker ps`, die Erreichbarkeit von Port 27017 und `MONGODB_URI` in `.env`. Verwende nicht `crowds-mongodb` als Ersatz.
- **Port 3000 belegt:** Beende den konkurrierenden Prozess oder passe `PORT` in `.env` an.
- **Port 27017 belegt:** Prüfe mit `docker ps`, ob ein anderer MongoDB-Container den Host-Port belegt. Verändere nicht den Crowds-Container; konfiguriere stattdessen einen eigenen freien MongoDB-Port und passe `MONGODB_URI` an.
- **Abhängigkeiten fehlen:** Führe `npm install` im Verzeichnis `local-intelligence` aus.
- **Seed fehlgeschlagen:** Prüfe die Serverkonsole und ob Port 3000 frei ist. Der Beispielexperimentlauf wird nur angelegt, wenn er noch nicht existiert.

Details zum aktuellen Persistenzdesign stehen in [MongoDB-Persistenz: Übergabestand](mongodb-persistenz-uebergabe.md) und in der [Repository-Dokumentation](../../local-intelligence/repositories/README.md).
