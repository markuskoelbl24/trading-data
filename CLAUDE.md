# Trading-Data — Projektleitfaden

## Was das ist
Einzeldatei-Web-App (`trading-data.html`) zum Verfolgen eines Aktien-Depots nach FIFO.
Läuft als statische Seite über GitHub Pages, wird v. a. am Handy (iOS Safari) genutzt.
Positionen werden optional über ein privates GitHub-Repo zwischen Geräten synchronisiert
(nur Daten + Ansichtseinstellungen, **niemals** Token/API-Keys).

## Arbeitsweise: immer aus Nutzersicht mitdenken
Nicht nur die gestellte Aufgabe abarbeiten, sondern bei jeder Änderung einen Schritt
zurücktreten und aktiv aus der Perspektive der Person denken, die das Tool täglich
benutzt. Vor und nach jeder Änderung durchgehen:

- **Bedürfnisse antizipieren:** Welche Funktion würde sich der Nutzer als Nächstes
  wünschen? Was ist der wahrscheinliche nächste Handgriff — und lässt er sich schon
  jetzt mit erledigen?
- **Bedien-Kniffe:** Wo lässt sich ein Arbeitsschritt sparen (sinnvolle Defaults,
  Feld-Fokus, „speichern & weiter", Auto-Sync, Antippen statt Tippen)?
- **Intuitiv & übersichtlich:** Versteht man ohne Erklärung, was zu tun ist? Ist die
  wichtigste Info sofort sichtbar, Sekundäres ruhig im Hintergrund?
- **Ballast entfernen:** Steht etwas doppelt da oder wird kaum gebraucht? Redundantes
  und Verwirrendes weglassen (z. B. ein zweites Eingabefeld für denselben Wert).
- **Logischer Aufbau:** Ist die Reihenfolge/Gruppierung nachvollziehbar? Gehört
  Zusammengehöriges auch optisch zusammen?
- **Konsequenzen abwägen:** Verbessert die Änderung eine Sache, ohne eine andere zu
  verschlechtern? (Beispiel: Umbruchschutz darf die Zeilenzahl nicht erhöhen.)

Vorschläge, die sinnvoll erscheinen, aktiv ansprechen — aber Umfang/Geschmack der
nutzenden Person überlassen, nicht ungefragt große Umbauten vornehmen.

## Technische Leitplanken (dieses Projekt)
- **Mobile-first:** An echter Handy-Breite denken (≈360–393px). Beträge können
  groß werden — auf Umbrüche, Überlappungen und feste Mindestbreiten (z. B. native
  Date-Inputs → `min-width:0`) achten.
- **Vor dem Commit visuell prüfen:** Layout-Änderungen mit Playwright/Chromium bei
  Handy-Breite rendern und anschauen, statt nur zu vermuten
  (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, Import via
  `/opt/node22/lib/node_modules/playwright/index.mjs`).
- **Sync:** Nur Positionen, Tombstones und Ansichtseinstellungen in die Nutzdaten —
  keine Geheimnisse. Konflikte klar auflösen (neuere Änderung / Tombstone gewinnt).
- **Große Datenmengen:** Auf Grenzen mobiler Engines achten (z. B. Base64 in Blöcken
  kodieren statt `fromCharCode.apply` über das ganze Array).
