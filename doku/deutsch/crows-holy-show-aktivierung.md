# Beispiel: Crows und Holy – interaktive Show-Aktivierung

> **Status:** Anwendungsidee. Dieses Beispiel beschreibt ein mögliches Erlebnis mit dem Local Intelligence Layer. Es ist kein Nachweis dafür, dass die beschriebene Smartphone-Erkennung, Signalorchestrierung oder Show-Visualisierung bereits implementiert ist.

## Ziel

Crows könnte den Local Intelligence Layer bei einer Live-Show und für kommerzielle Markenaktivierungen einsetzen. Als Beispiel dient Holy, ein Anbieter von Getränkepulver, das in Wasser gemischt und geschüttelt wird, um ein Getränk herzustellen.

Die Bewegung, die zum Produkt passt – das Schütteln eines Shakers – wird dabei zur gemeinsamen Publikums-Choreografie. Das Publikum löst die Aktion selbst aus; die Software koordiniert die Weitergabe und macht den Fortschritt für die Show sichtbar.

## Aufbau: 3 × 3 Neighborhoods mit je 3 × 3 Agents

Die Bühne oder die Publikumsanzeige zeigt ein Raster aus neun Neighborhoods. Jedes Neighborhood enthält neun Agents. Die drei Geschmacksgruppen **Kirsche**, **Waldmeister** und **Wassermelone** belegen jeweils eine Spalte. Die drei Neighborhoods einer Spalte bilden die drei Ebenen der Flasche – von unten nach oben.

```text
                       SHOW-DISPLAY
              Kirsche    Waldmeister   Wassermelone
Oben             [NH]        [NH]          [NH]
Mitte            [NH]        [NH]          [NH]
Unten            [NH]        [NH]          [NH]
                   ↑           ↑              ↑
              Füllstand steigt von unten nach oben
```

Jedes `[NH]` enthält ein 3 × 3-Agent-Raster. Die Zuordnung von Agents zu Personen, Geräten oder virtuellen Teilnehmern hängt von der konkreten Show-Implementierung ab.

## Ablauf der Aktivierung

1. **Startsignal:** Die untersten Neighborhoods werden aktiviert. Die Agents dort fordern die zugehörigen Teilnehmenden auf, ihr Smartphone wie einen Shaker zu schütteln.
2. **Bewegung erkennen:** Eine App oder ein angeschlossener Erkennungsdienst prüft ein vereinbartes Kriterium, zum Beispiel eine Mindestanzahl von Schüttelbewegungen oder eine erkannte Bewegungsintensität innerhalb eines Zeitfensters.
3. **Schwelle erreicht:** Sobald der Grenzwert erreicht ist, streckt die teilnehmende Person ihr Smartphone nach oben. Diese Geste bestätigt den Abschluss und löst ein Signal des Agents aus.
4. **Signal weitergeben:** Das Signal aktiviert den passend verbundenen Agent im Neighborhood darüber. Dieser beginnt den nächsten Abschnitt der Choreografie und fordert die dortigen Teilnehmenden zum Schütteln auf.
5. **Füllstand darstellen:** Die Aktivierung steigt Ebene für Ebene nach oben. Auf dem Show-Display leuchten die Agents oder Neighborhoods entsprechend auf; aus der Vogelperspektive sieht es aus, als würde sich eine Holy-Flasche füllen.
6. **Abschluss:** Wenn die oberste Ebene erreicht ist, kann eine gemeinsame Animation, ein Jingle oder ein Call-to-action ausgelöst werden.

Die drei Geschmacksspalten können unabhängig oder synchron laufen. So lässt sich beispielsweise beobachten, welche Gruppe zuerst die Flasche füllt, oder die Show kann alle Gruppen auf ein gemeinsames Finale hin synchronisieren.

## Was der Local Intelligence Layer beiträgt

- **Lokale Reaktionen:** Jeder Agent reagiert auf ein lokales Ereignis, statt dass ein zentraler Ablauf jede einzelne Person direkt steuern muss.
- **Signalpropagation:** Ein bestätigter Fortschritt kann gezielt an die nächste Ebene weitergereicht werden.
- **Konfigurierbare Regeln:** Schüttel-Schwelle, Zeitfenster, Wiederholungen und Übergangsbedingungen können als Regeln für ein Experiment festgelegt werden.
- **Live-Visualisierung:** Aggregierte Zustände der Agents und Neighborhoods können den Füllstand und den Fortschritt der Gruppen darstellen.
- **Wiederverwendbarkeit:** Das gleiche Muster kann für andere Produkte, Marken, Bühnenbilder und Publikumsaktionen angepasst werden.

## Kommerzielle Nutzung und Erfolgsmessung

Als Markenaktivierung kann das Erlebnis eine Produktbotschaft in eine gemeinschaftliche Aktion übersetzen. Mögliche, aggregierte Kennzahlen sind zum Beispiel:

- Anteil der aktivierten Teilnehmenden, die die Aufgabe abschließen
- Zeit bis zum Erreichen jeder Ebene und der gesamten Flasche
- Abschlussrate je Geschmacksgruppe
- Anzahl der ausgelösten Signale und wiederholte Teilnahme
- Reaktion auf unterschiedliche Schwellen oder Show-Abläufe

Diese Kennzahlen können Crows und dem Markenpartner helfen, verschiedene Choreografien oder Aktivierungsvarianten zu vergleichen. Sie sollten nur erhoben werden, wenn die Erhebung transparent erklärt und für den Zweck erforderlich ist.

## Datenschutz, Sicherheit und Zugänglichkeit

- Die Teilnahme sollte freiwillig sein und vor der Aktivierung verständlich erklärt werden.
- Wenn die Bewegungserkennung über Smartphones erfolgt, sollte die App nur die für die Schwelle nötigen Bewegungsdaten verarbeiten. Eine Speicherung von Rohdaten oder eine Zuordnung zu einer identifizierbaren Person ist für die aggregierte Show-Visualisierung nicht erforderlich.
- Grenzwerte und Zeitfenster sollten so gewählt werden, dass die Bewegung sicher und für unterschiedliche Fähigkeiten anpassbar ist. Eine alternative Geste oder manuelle Bestätigung kann Teilnahme ohne Schütteln ermöglichen.
- Die Smartphone-Geste sollte mit ausreichend Abstand und ohne Werfen oder gefährliches Schwingen ausgeführt werden.
- Die Show sollte auch dann fortgesetzt werden können, wenn einzelne Geräte offline sind oder Teilnehmende nicht mitmachen.

## Umsetzungsgrenze

Der Local Intelligence Layer könnte die Agent- und Neighborhood-Zustände, Regeln sowie die Signalweitergabe orchestrieren. Die Erkennung von Smartphone-Bewegungen, die Verbindung zu einem Show-Display und die Echtzeitdarstellung benötigen passende App-, Hardware- oder Integrationskomponenten. Diese Schnittstellen und die tatsächliche Performance müssten vor einem Live-Einsatz separat validiert werden.
