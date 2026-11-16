# CLAUDE.md – Treppenplaner

## Projekt

**Treppenplaner** ist eine Webanwendung für Architekturstudierende.

- Eingaben: Geschosshöhe, verfügbare Grundfläche, Gebäudenutzung (z. B. Wohngebäude / sonstige Gebäude).
- Berechnet verschiedene Treppenformen: **gerade**, **L-förmig (viertelgewendelt/Podest)**, **U-förmig (halbgewendelt/Podest)**.
- Prüft jede Variante gegen **DIN 18065**.
- Schlägt die am besten geeignete Variante vor.
- Zeichnet die Treppe als **Grundriss** und **Schnitt**.

## Technik

- Nur **HTML, CSS und JavaScript** (Vanilla). Keine Frameworks, kein Build-Schritt, keine Installation.
- Muss direkt über **GitHub Pages** laufen (statische Dateien, relative Pfade).
- Kein API-Schlüssel, keine externen Dienste mit Authentifizierung.
- Code sauber, gut strukturiert und verständlich halten (sprechende Namen, kleine Funktionen, Trennung von Berechnung / Normprüfung / Zeichnung / UI).

## Normwerte (DIN 18065)

- Alle Grenzwerte (Steigung, Auftritt, Schrittmaßregel, nutzbare Laufbreite, Kopfhöhe/Durchgangshöhe usw.) stehen an **genau einer Stelle** im Code (z. B. `js/norm.js`).
- Neben **jedem** Wert steht als Kommentar die **Quelle** (Norm, Abschnitt/Tabelle, Ausgabe).
- **Nichts erfinden:** Wenn ein Wert nicht sicher belegt ist, dem Nutzer das ausdrücklich sagen und nachfragen, statt eine Zahl anzunehmen. Unsichere Werte im Code mit `// TODO: Quelle prüfen` markieren.

## Gestaltung

- Schlicht, Ästhetik einer architektonischen Zeichnung.
- Überwiegend schwarz-weiß, feine Linien, klare Typografie.

## Sprache

- **Mit dem Nutzer auf Türkisch kommunizieren.**
- **Alle Texte in der Anwendung auf Deutsch** (Beschriftungen, Meldungen, Fehlertexte).
- README auf Deutsch.

## Arbeitsweise

- In **kleinen Schritten** vorgehen.
- Vor größeren Änderungen den **Plan erklären und auf Zustimmung warten**.
- Nach jedem funktionierenden Schritt einen **Commit vorschlagen**.
- Wichtige Design- oder Technikentscheidungen kurz in `notlar.md` festhalten (unter „Benim kararlarım“ bzw. „Yapay zekânın kararları“).

## Abgabe

- **Freitag, 20.11., 16:00 Uhr.**
- README (Deutsch) mit: Was das Tool macht, Bedienung, Screenshot, Quellen, Einsatz von KI.
