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

- Schlicht, Ästhetik einer architektonischen Zeichnung; feine Linien, klare Typografie.

**Stil-Prompt (UI-Design-Kurs, 17.11.):**
> Swiss-inspiriert: strenges Raster, linksbündig, große Überschrift, viel Weißraum. Nur Schwarz, Weiß und ein Signalrot. Keine Schatten, keine runden Ecken. Schrift: Bitter für Überschriften, Nunito für Text.

**Bewusste Gestaltungsentscheidungen:**
1. **Schrift aus der Kursvorlage** (Bitter Bold für Überschriften, Nunito Regular/Bold für Text), damit Tool und Poster eine Einheit bilden. Die Dateien liegen lokal in `fonts/` (SIL Open Font License, `OFL-Bitter.txt`, `OFL-Nunito.txt`) – kein Laden von Google-Servern. Maßzahlen und Beschriftungen in den Zeichnungen (Bildschirm, SVG, DXF) bleiben in einer schlichten technischen Schrift.
2. **Rot bedeutet immer „Problem“:** Signalrot nur für Fehler, nicht erfüllte Prüfungen und Fehlmaße. „Erfüllt“ ist schwarz (✓), nicht grün – eindeutig auch bei Rot-Grün-Sehschwäche.
3. **Laptop: links Eingabe, rechts Ergebnis und Zeichnungen.** Zuerst Empfehlung und Vergleich, dann die Zeichnung der gewählten Variante (Reihenfolge rechts: Empfehlung → Variantenkarten (kompakt, ca. 250 px hoch) → Urteil → Kennwerte → Zeichnungen → Normprüfung → Export). Handy: untereinander. Druck: einspaltig, Seite 1 Ergebnis, Kurzvergleich und Tabellen, Seite 2 Zeichnungen der gewählten Variante.
4. **Ein Hauptbutton „Berechnen“** (schwarz gefüllt); Export-Schaltflächen leiser.

## Sprache

- **Mit dem Nutzer auf Türkisch kommunizieren.**
- **Alle Texte in der Anwendung auf Deutsch** (Beschriftungen, Meldungen, Fehlertexte).
- README auf Deutsch.

## Arbeitsweise

- In **kleinen Schritten** vorgehen.
- Vor größeren Änderungen den **Plan erklären und auf Zustimmung warten**.
- Nach jedem funktionierenden Schritt einen **Commit vorschlagen**.
- Nach jedem fertigen Feature in `PLAN.md` die Abschnitte **MVP**, **Stand** und **Nächste Schritte** aktualisieren.
- Wichtige Design- oder Technikentscheidungen kurz in `notlar.md` festhalten (unter „Benim kararlarım“ bzw. „Yapay zekânın kararları“).

## Abgabe

- **Freitag, 20.11., 16:00 Uhr.**
- README (Deutsch) mit: Was das Tool macht, Bedienung, Screenshot, Quellen, Einsatz von KI.
