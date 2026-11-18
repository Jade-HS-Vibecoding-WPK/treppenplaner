# PLAN – Treppenplaner

## Ziel

Treppenplaner – Web-App, die Treppen nach DIN 18065 berechnet, prüft, Varianten vergleicht und die passendste empfiehlt.

## MVP

### Must
- ✅ Gerade Treppe: Berechnung + Prüfung nach DIN 18065
- ✅ Schnittzeichnung

### Should
- ✅ Grundrisszeichnung (Stufennummern + Lauflinie)
- ✅ Eingabe und Prüfung der nutzbaren Laufbreite
- ✅ Schnitt und Grundriss vergrößern (breitere Seite, Mindestmaßstab, gemeinsames Scrollen)
- [ ] Kopfhöhe 2,00 m im Schnitt prüfen
- ✅ Eingabe der verfügbaren Fläche (Länge × Breite) – gerade Treppe
- ✅ Raumprüfung für L- und U-Treppe (gleiche Funktion `pruefeRaum`)
- ✅ L-Treppe mit Viertelpodest, links und rechts (Podestregeln siehe `notlar.md`)
- ✅ U-Treppe mit Halbpodest (Treppenauge 10 cm, Annahme)
- ✅ Variantenvergleich + Bewertung + Empfehlung
- ✅ Mehrsprachigkeit: Deutsch, Englisch, Französisch (Umschalter auf der Seite) – Wunsch der Betreuung
- ✅ Gestaltung nach dem UI-Design-Kurs (Stil-Prompt und bewusste Entscheidungen in `CLAUDE.md`)
- ✅ Export von Schnitt und Grundriss als DXF (für ArchiCAD, Revit, AutoCAD), zusätzlich SVG und PDF – Wunsch der Betreuung (in AutoCAD 2027 getestet; ArchiCAD/Revit offen)
- ✅ Materialwahl Stahlbeton / Holz / Stahl (Wunsch der Betreuung, 17.11.): ändert die Konstruktion in Schnitt/Abwicklung (Laufplatte bzw. Wangen + Trittstufen) und die Schraffur, Materialangabe im Grundriss, in DXF/SVG/PDF und in der Druckzeile; Normprüfung unverändert; Maße als Annahmen in `js/material.js`; DE/EN/FR
- [ ] Spindeltreppe als 4. Variante (Wunsch der Betreuung, 17.11.; Plan abgestimmt 18.11., 5 Schritte): ✅ 1 Berechnung + Normprüfung · ✅ 2 Karte + Punkte · [ ] 3 Grundriss · [ ] 4 Abwicklung · [ ] 5 DXF, Texte, README
- [ ] Veröffentlichung auf GitHub Pages
- ✅ README auf Deutsch (mit Screenshot `docs/screenshot.png`)

### Could
- [ ] Maßstabsfigur (menschliche Silhouette)
- [ ] Gewichtung der Kriterien durch den Nutzer
- [ ] Materialvergleich (mit externen Daten)
- [ ] IFC-/3D-Export (PDF-Export ist nach „Should“ gewandert)
- [ ] Maßstäbliches Drucken (A4 quer, 1:50; bisher auf Seitenbreite verkleinert, ohne Maßstab)
- ✅ Hinweis „sehr steil“ auf den Karten und in den Kennwerten (s ≥ 19 cm oder a ≤ 24 cm; eigene Annahme, kein Normwert)

## Etappen

| Tag | Inhalt |
|---|---|
| Mo 16.11. | Berechnung, Schnitt, Grundriss, Raumeingabe, Mehrsprachigkeit ✅ + Export (DXF, SVG, PDF) ✅ (vorgezogen) |
| Di 17.11. | Gestaltung (nach dem UI-Design-Kurs am Vormittag) + DXF-Test in ArchiCAD/Revit |
| Mi 18.11. | L/U + Empfehlung |
| Do 19.11. | 12:00 Freeze, Veröffentlichung, README |
| Fr 20.11. | Poster + Präsentation (Abgabe 16:00) |

## Stand

- ✅ Projekt-Setup: `CLAUDE.md`, `notlar.md`, `.gitignore`
- ✅ Grenzwerte DIN 18065:2020-08 zentral in `js/norm.js`, mit Quellenangabe
- ✅ Gerade Treppe: Stufenzahl, Steigung, Auftritt, Schrittmaßregel, Prüfung grün/rot
- ✅ Schnitt als SVG: Decken, Laufplatte (18 cm angenommen), Schraffur, Höhenkoten, Maßketten (s, a, Lauflänge, Geschosshöhe), automatischer Maßstab
- ✅ Podestregeln recherchiert (sekundär, siehe `notlar.md`) und in `js/norm.js` übernommen (17.11.)
- ✅ Nutzbare Laufbreite als Eingabe: Vorschlag = Mindestmaß der Gebäudeart (80 / 100 cm), eigene Eingabe bleibt erhalten, rot unter dem Mindestmaß, eigene Zeile in der Normprüfung
- ✅ Grundriss als SVG (`js/grundriss.js`): gleicher Maßstab, genau unter dem Schnitt (Projektion); Stufennummern 1 … n (Steigungen), Lauflinie mit Kreis und Pfeil, Schnittlinie bei ca. 1 m (Darstellungskonvention, Quelle offen), darüber gestrichelt; Maßketten Lauflänge und Laufbreite

- ✅ Größere Zeichnungen: Seite 64rem breit, Schrift 13 px (Stufennummern 12 px), Mindestmaßstab (Grundriss ≥ 90 px hoch, Auftritt ≥ 28 px); 250–350 cm passen auf einem Laptop ohne Scrollen; nur auf schmalen Bildschirmen oder bei sehr hohen Geschossen scrollen Schnitt und Grundriss gemeinsam horizontal und bleiben übereinander
- ✅ Rundung korrigiert: Berechnung, Lauflänge, Zeichnungen und Normprüfung mit exakten Werten (z. B. 300 cm → Lauflänge 504,3 cm); gerundet wird nur bei der Anzeige; Normprüfung zeigt bis zu 2 Nachkommastellen (z. B. 19,04 cm ✗)
- ✅ Schnittlinie im Grundriss liegt an der Setzstufe, die die Schnittebene trifft – zwischen zwei Stufennummern
- ✅ Raumeingabe (gerade Treppe): verfügbare Länge (in Laufrichtung) und Breite, beide optional; allgemeine Prüfung `pruefeRaum(footprint, vorgabe)` in `js/raum.js` für jeden rechteckigen Footprint; Zeile „Passt in den Raum“ (Raumvorgabe, keine Normprüfung) mit Fehlmaß („Es fehlen 20 cm Länge“) und eigenem Raumurteil; Grundriss mit feinem Raumrechteck (Treppe links unten an der Wand), schraffiertem Überstand und roten Fehlmaßen; vereinfacht: benötigte Breite = Laufbreite, ohne Antritts-/Austrittsfläche
- ✅ Mehrsprachigkeit DE / EN / FR: alle Texte in `js/i18n.js` (Wörterbuch + `t()`), Umschalter DE | EN | FR rechts oben, Wahl im Browser gespeichert (`localStorage`), Standard Deutsch; Formular, Ergebnis, Normprüfung, Fehlermeldungen, Zeichnungsbeschriftungen und Legenden übersetzt; Zahlenformat je Sprache (de-DE / en-GB / fr-FR); Symbole s, a, 2s + a und Einheit cm in allen Sprachen; EN/FR nennen DIN 18065 als deutsche Norm und zeigen „Übersetzung zur Orientierung“; Berechnung liefert nur Schlüssel und Zahlen (`kriterium`, `grenze`), keine Texte; Fachbegriffe in `notlar.md`
- ✅ Export: Schnitt und Grundriss werden zuerst als Geometrieliste berechnet (`js/elemente.js`: Linie, Polylinie, Fläche, Kreis, Schraffur, Text; in cm, y nach oben, Ursprung = Antritt; jedes Element mit Ebene), daraus zeichnet `js/svg-ausgabe.js` das SVG (Bildschirm unverändert, per Pixelvergleich geprüft). Beschriftungsgrößen in px, umgerechnet über `cmProPx`
- ✅ DXF (`js/dxf.js`): R12 / AC1009 ASCII, zwei Dateien `treppe_<H>_schnitt.dxf` / `_grundriss.dxf`, mm, 1:1, Ebenen TREPPE, DECKE, SCHRAFFUR, MASS, TEXT, LAUFLINIE, RAUM; Schraffur als Einzellinien (kein HATCH in R12), Bemaßung als Linien + Texte, Fehlmaße rot (Farbe 1), Kanten über der Schnittebene Linientyp GESTRICHELT; Beschriftung für 1:50 (2,5 mm Versalhöhe); Texte Windows-1252 (`$DWGCODEPAGE` ANSI_1252); kein `$INSUNITS`, stattdessen Hinweis „DXF: Einheit mm, Maßstab 1:1“ (übersetzt)
- ✅ SVG-Export wie am Bildschirm (eigenständige Datei), Drucken / PDF über den Druckdialog (Print-Stylesheet, ohne Maßstab); Seite 1 Ergebnis und Tabellen und Fußzeile (beim Drucken unter die Normprüfung verschoben), Seite 2 Schnitt und Grundriss; Schaltflächen unter den Zeichnungen, Texte in der gewählten Sprache

- ✅ Gestaltung (17.11., UI-Design-Kurs): Swiss-inspiriert, Stil-Prompt und vier bewusste Entscheidungen in `CLAUDE.md`; Bitter Bold (Überschriften) und Nunito Regular/Bold (Text) lokal aus `fonts/` (OFL), Zeichnungen und SVG-Export in technischer Schrift; nur Schwarz, Weiß, Signalrot (#e2001a, nur für Probleme), „erfüllt“ schwarz; Abstände im 0,5-rem-Raster; „Berechnen“ als einziger Hauptbutton, Export leiser; ab 64rem zwei Spalten (links Eingabe 18rem, rechts Urteil → Kennwerte-Leiste → Zeichnungen → Normprüfung → Export), bei 1366 px 250–350 cm ohne Scrollen; Handy und Druck einspaltig, beim Drucken Normprüfung und Fußzeile auf Seite 1
- ✅ Gestaltungsnotizen erledigt: Raumbreiten-Maßkette im Grundriss erst hinter der Stufennummer n (keine Überschneidung mehr); Formularabstände im Raster; Maßtexte mit Bezeichnung nur, wenn sie zwischen die Hilfslinien passen, sonst nur die Zahl (betrifft v. a. EN/FR und das DXF bei kurzen Treppen); in DE/EN/FR bei 1366 px und 375 px ohne Überschneidungen geprüft

- ✅ Treppenformen (17.11., Teil A „L“): `js/treppenformen.js` mit `berechneTreppe(form, richtung, eingabe)` für gerade, L (und vorbereitet U); Steigung/Auftritt unabhängig von der Form, die Form teilt nur auf Läufe auf (Lauf i: nᵢ Steigungen, nᵢ − 1 Auftritte, Podest ersetzt einen Auftritt); L probiert alle Aufteilungen (Läufe normgerecht → passt in den Raum bzw. kleinstes Fehlmaß → ausgewogen); Normprüfung neu: ≥ 3 Steigungen je Lauf, ≤ 18 Steigungen je Lauf (nur Gebäude im Allgemeinen – gerade Treppe mit 19+ Steigungen dort jetzt ✗ „Podest nötig“), Podestlänge ≥ Laufbreite
- ✅ L-Treppe gezeichnet: Grundriss mit Läufen und Viertelpodest (links/rechts gespiegelt), Stufennummern fortlaufend, Lauflinie über das Podest, Schnittlinie und gestrichelte Teile über die Läufe hinweg, Raumüberstand je Lauf/Podest, Maßketten Lauf 1 | Podest und Breite in Abschnitten; Schnitt als Abwicklung entlang der Lauflinie mit Podestplatte (18 cm angenommen), Kette Lauf | Podest | Lauf, Höhenkote auf dem Podest; Grundriss bei L in eigener Lage (gleicher Maßstab, nicht mehr unter dem Schnitt)
- ✅ Vorläufige Formwahl im Ergebnis „Gerade Treppe | L-Treppe (links | rechts)“ – wird im Variantenvergleich zu Karten; Kennwerte mit Aufteilung („16 (8 + 8)“) und Platzbedarf Länge × Breite; Export-Dateiname mit Form (`treppe_275_L-links_grundriss.dxf`); Druckzeile nennt die Treppenform; alle Texte DE/EN/FR
- ✅ Gerade Treppe nach dem Umbau unverändert: Elementlisten (Bildschirm und Export) in 6 Fällen und das SVG im Browser identisch geprüft (Konsole, ohne Node)

- ✅ U-Treppe (17.11., Teil B): Knopf „U-Treppe“ in der Formwahl (ohne links/rechts); Grundriss mit zwei parallelen Läufen, Halbpodest B × (2B + 10 cm) und Treppenauge 10 cm (Annahme), Lauf 2 läuft zurück, letzte Stufennummer auf der oberen Decke neben dem Antritt; Maßketten Lauf 1 | Podest und Breite B | Auge | B; Abwicklung mit Podest 2B + Auge und Höhenkote; Normprüfung, Raumprüfung (Überstand je Lauf/Podest), DE/EN/FR, Druckzeile und Export (`treppe_275_U_grundriss.dxf`)
- ✅ Konsolentests U: 275 cm, Gebäude im Allgemeinen, 100 cm → 16 (8 + 8), Platzbedarf 300,4 × 210,0 cm, normgerecht; 320 cm → gerade 19 Steigungen ✗ „Podest nötig“, U 19 (10 + 9) ✓; Raum 400 × 300 → gerade: es fehlen 29,4 cm Länge, U passt; gerade und L nach den Änderungen unverändert (Elementlisten in 18 Fällen identisch)
- ✅ Notizen aus der Sichtprüfung der L-Treppe erledigt: Untertitel der Seite je nach Form (DE/EN/FR); Kennwerte: Zahl und „cm“ mit geschütztem Leerzeichen, Spalten wachsen am Laptop mit dem Wert (1366 px: „300,4 × 210,0 cm“ einzeilig, schmaler: Umbruch nur nach „×“); Scrollbalken: Zeichnung war durch Rundung 1 px breiter als der Scrollbereich (959 statt 958 px) – behoben
- Beobachtung: Bei schmalen Läufen (B = 80) und hohen Geschossen (U ab ca. 300 cm, L ab ca. 350 cm) ist die Abwicklung beim Mindestmaßstab breiter als 958 px und scrollt (gewollt, wie bei der geraden Treppe)

- ✅ Variantenvergleich (17.11., Teil C): `js/bewertung.js` – Stufung je Form (bequemste normgerechte, die passt; sonst steilere/andere), Ausschluss vor der Bewertung (Norm nicht erfüllt oder passt nicht), Punkte Komfort / Platz / Sicherheit / Nutzung mit Gewichten an einer Stelle (`GEWICHTE`), Empfehlung = höchste Punktzahl mit Begründungssatz (Kriterium mit dem größten Vorsprung); keine Variante geeignet → „Keine Variante passt“ und die Variante, der am wenigsten fehlt
- ✅ Drei Karten (`js/variantenkarten.js`) statt der vorläufigen Formwahl: Mini-Grundriss ohne Maße (Raumrechteck rot, wenn es nicht passt), Steigungen je Lauf, s / a, Platzbedarf, Punkte; L mit Drehsinn links | rechts; Ausgeschlossene blass und gestrichelt, Gründe rot; Klick auf eine Karte wechselt Urteil, Kennwerte, Zeichnungen, Normprüfung und Export; Standard = Empfehlung; Druck Seite 1 mit Kurztabelle (Variante, Punkte, Ergebnis); DE/EN/FR
- ✅ Konsolentests: vier Szenarien (Tabelle im Chat, Bewertung steht aus), 4440 Eingabekombinationen ohne Fehler/NaN; Karten bei 1366, 1024 und 375 px ohne Überlauf (DE/EN/FR)

- ✅ Nach der gemeinsamen Bewertung: Platz-Punkte mit belegter Fläche (`belegteFlaeche()`), Karten auf 250 px (1366 px) verdichtet, Gestaltungsentscheidung 3 in `CLAUDE.md` angepasst („Zuerst Empfehlung und Vergleich, dann die Zeichnung der gewählten Variante“); fünf Szenarien neu gerechnet (Empfehlung: L, L, L, keine – U am nächsten, gerade)

- ✅ Druck korrigiert (Test des Nutzers: 280 cm, Wohngebäude, 100 cm, Raum 320 × 220 ergab 3 Seiten): Karten im Druck jetzt wirklich ausgeblendet (die Kartenregel stand nach dem Druckblock und überschrieb ihn), Kennwerte-Leiste und Tabellenzeilen nie geteilt, Seite 1 kompakter (halbes Raster, Tabellen 9 pt, Titel 18 pt); simulierter Druck in 219 Fällen (DE/EN/FR): Seite 1 passt in 218, Ausnahme FR, 600 cm, Raum 450 × 120 (44 px zu lang)
- ✅ Hinweis „sehr steil“ / „very steep“ / „très raide“ (Could): Grenzen `SEHR_STEIL` in `js/bewertung.js` (s ≥ 19 cm oder a ≤ 24 cm, eigene Annahme, kein Normwert), Funktion `steilheit()`; auf der Karte schwarz umrandete Marke im Kopf, in den Kennwerten unter dem auslösenden Wert (s und/oder a); schwarz, nicht rot (Hinweis, kein Normverstoß); kein Einfluss auf Ausschluss, Punkte oder Normprüfung; Sweep: 918 Karten korrekt markiert

- ✅ Materialwahl (17.11., Wunsch der Betreuung): `js/material.js` (Konstruktion, Bauteilmaße als Annahmen, Schraffur; Zugriff nur über `materialVon()`, `bauteil()`, `materialSchraffur()`, `geschnittenesBauteil()` – für die Spindeltreppe wiederverwendbar); Schalter „Material: Stahlbeton | Holz | Stahl“ über den Zeichnungen (Standard Stahlbeton, im Druck ausgeblendet); Holz/Stahl als Wangentreppe: offene Trittstufen 5 / 4 cm geschnitten (Holz Linien längs, Stahl voll), Wange 6 × 30 / 1,5 × 25 cm in Ansicht als Band, Podestbelag wie Trittstufen, obere Decke Stahlbeton; Grundriss: Wangen außerhalb der Laufbreite (Gehrung, U: am Auge aneinanderstoßend bei Holz); Legenden aus `material.js` (DE/EN/FR) mit „Annahmen“, „Schraffur vereinfacht“, „Prüfung offener Stufen nicht enthalten“; DXF-Ebenen WANGE, TRITTSTUFE, SCHRAFFUR_HOLZ, SCHRAFFUR_STAHL (nur wenn benutzt), Materialzeile in DXF/SVG, Druckzeile mit Material; Normprüfung, Raumprüfung und Bewertung unverändert
- ✅ Konsolentests Material: Stahlbeton-Elementlisten in 96 Fällen identisch; 2592 Schnitte und 5616 Grundrisse (Holz/Stahl) ohne NaN, alle Trittstufen innerhalb der Wange; DXF in 18 Fällen (Ebenen, SOLID, Materialzeile); Schalter bei 375 px in DE/EN/FR ohne Überlauf. Nebenbei korrigiert: SVG-Schraffurwinkel (bisher nur 45° richtig)

- ✅ Nach der Sichtprüfung (Nutzer, U 275 / Wohngebäude / 80): Holz-Trittstufen deutlicher (Schraffur 2 px / 0,6 px, Kontur 1,5 px, auch DXF SCHRAFFUR_HOLZ); Wangen im Grundriss über der Schnittebene überall gestrichelt (überlagerte Kanten am Treppenauge entfernt, Innenecke L/U korrigiert). Treppenauge 10 cm bei Holz bewusst nicht geändert (Hinweis in Legende und README-Ausblick).

- ✅ Spindeltreppe, Schritt 1 (18.11.): `js/spindeltreppe.js` – Teilung t (ganzzahlig) aus lichter Durchgangshöhe (t · s − Stufendicke ≥ 200 cm) und Gehbereich (Auftritt innen ≥ 10 cm, Lauflinie 0,5–0,7 B von innen, bevorzugt 0,6 B), kleinstes t = kleinster Durchmesser; Auftritt als Sehne; Normprüfung mit vier neuen Zeilen (Laufbreite ≤ 130 cm für die Gehbereichsregel, Auftritt innen, Lauflinie im Gehbereich, Durchgangshöhe) und der 18er-Regel; Material geht in die Berechnung ein (Spindel-Ø 20/12/10 cm, Stufendicke 8/5/4 cm, Geländer 5 cm, Annahmen in `material.js`); Quellen in `norm.js` (Baunetz Wissen, Original nicht eingesehen), Durchgangshöhe und Schrittmaß jetzt mit Quelle; DE/EN/FR. Noch nicht im Variantenvergleich (Schritt 2).
- ✅ Konsolentest Schritt 1: 275 cm / Wohngebäude / 80 → n = 16, t = 14, Lauflinie 0,52 B, D = 214,9 cm, Drehung 386°, Durchgangshöhe 232,6–236,6 cm; 25 308 Kombinationen (50–600 cm, beide Gebäudearten, B 30–400, drei Materialien) ohne Fehler/NaN; bei B ≤ 130 und normgerechten Stufen immer eine zulässige Teilung gefunden.

- ✅ Spindeltreppe, Schritt 2 (18.11.): vierte Karte im Vergleich (`TREPPENFORMEN`); Mini-Grundriss (Außenkreis D, Laufbreite, Spindel, Setzstufen einer Umdrehung, Lauflinie mit Antrittskreis), Drehsinn links | rechts wie bei L, Wert „Durchmesser D“, schwarzer Hinweis „Als notwendige Treppe ggf. nicht zulässig – Landesbauordnung prüfen.“ (Karte und unter den Kennwerten); Punkte: Komfort mit Auftrittspunkten gemittelt über die nutzbare Laufbreite (Variante C), Platz mit der Kreisfläche, Nutzung ohne gerade Läufe (Gebäude im Allgemeinen 0), Sicherheit unverändert; Kennwerte „Durchmesser D“ und „Teilung (Stufen je 360°)“, a = Auftritt auf der Lauflinie; Materialwechsel rechnet den Vergleich neu; Ausschlussgründe „Laufbreite über 130 cm“ und „Geometrie“; vorläufig „Zeichnungen folgen“ statt Schnitt/Grundriss, DXF/SVG gesperrt; DE/EN/FR.
- ✅ Szenarien Schritt 2 (Konsole, alle drei Materialien gleich): a) 275/Wohn/80 → L 94, Spindel 65; b) 280/Wohn/80/450 × 120 → gerade 59; c) 280/Wohn/100/320 × 220 → U 68 (unverändert), Spindel passt nicht; d) 275/Wohn/80/230 × 230 → L 48 (steilere Stufung), Spindel 46, U 44 – erwartet war „nur Spindel passt“; e) 300/Allgemein/100 → L 90, Spindel 49 (D 261,3 cm, t = 16). Sweep 1152 Fälle: Spindel nur in 14 Fällen empfohlen, immer als einzige passende Variante. Karten bei 1366 px nebeneinander 318 px hoch (vorher ca. 250), 375 px ohne Überlauf (DE/EN/FR). Druck Seite 1 (simuliert, 42 Fälle DE/EN/FR): passt bis auf die bekannte Ausnahme FR 600 cm / 450 × 120 (jetzt 107 px statt 44 px zu lang).

**Stand 17.11., Materialwahl abgeschlossen und gepusht.** Offen: DXF mit Holz/Stahl in AutoCAD öffnen.

**Stand 17.11., Teil C (Variantenvergleich) fertig, bewertet, Druck korrigiert und gepusht** – echter PDF-Test des Nutzers nach der Korrektur steht aus.

**Stand 17.11., Teil B (U-Treppe) fertig** – Sichtprüfung im Browser durch den Nutzer steht aus. Nächster Teil: Variantenvergleich.

**Stand 17.11., Teil A (L-Treppe) fertig.**

**Stand 16.11. abends:** Gerade Treppe vollständig (Berechnung, Normprüfung, Raumprüfung, Schnitt, Grundriss, DE/EN/FR, Export DXF/SVG/PDF). DXF in AutoCAD 2027 erfolgreich getestet; PDF mit zwei Seiten in zwei Fällen (600 cm, Raum 1000 × 1000 und 600 × 600) geprüft. Alles committet und gepusht.

## Nächste Schritte

**Di 17.11.**
1. ✅ Gestaltung (siehe Stand) – vom Nutzer im Browser prüfen lassen, dann pushen.
2. DXF in ArchiCAD und Revit (Uni) öffnen: Einheit (mm wählen), Ebenen, Umlaute (ä, ö, ü, ß, é), ± prüfen (AutoCAD 2027 ✅).

**Mi 18.11.**
3. ✅ Teil A: L-Treppe (Berechnung, Grundriss, Abwicklung, Export, Texte).
4. ✅ Teil B: U-Treppe (Knopf, Grundriss, Abwicklung, Normprüfung, Texte, Export) und die drei Notizen aus der Sichtprüfung der L-Treppe (Untertitel je Form, „cm“-Umbruch, Scrollbalken).
   **Offen:** Sichtprüfung der U-Treppe im Browser durch den Nutzer (z. B. 275 cm, Gebäude im Allgemeinen, 100 cm, mit und ohne Raum 400 × 300 bzw. 250 × 180; DE/EN/FR), danach pushen.
5. ✅ Teil C: Variantenvergleich – `js/bewertung.js` (Gewichte an einer Stelle: Komfort 40 %, Platz 30 %, Sicherheit 20 %, Nutzung 10 %; Formeln siehe `notlar.md`), Ausschluss (passt nicht / Norm nicht erfüllt), Stufenzahl je Form (steilere normgerechte Stufung, wenn die bequemste nicht passt), drei Karten (gerade, L mit links/rechts, U) mit Mini-Grundriss, Werten und Punkten, Empfehlung mit Begründungssatz, Ausgeschlossene blass und gestrichelt; danach Szenarien gemeinsam prüfen und Gewichte ggf. anpassen.
   ✅ Szenarien gemeinsam bewertet (siehe `notlar.md`): Gewichte bleiben; Platz-Punkte mit der belegten Fläche (Läufe + Podest), Raumprüfung weiter mit dem Rechteck; steilere Stufung für die 18er-Regel bleibt; Karten kompakt (ca. 250 px); Kontrollszenario „schmaler Flur“ (280 cm, Wohngebäude, 80 cm, 450 × 120) → gerade Treppe empfohlen.
   ✅ Druck/PDF: Karten ausgeblendet, Kennwerte ungeteilt, Seite 1 kompakt (gepusht).
   **Offen:** PDF nach der Korrektur erneut prüfen (280 cm, Wohngebäude, 100, 320 × 220 → 2 Seiten erwartet). Bekannt: bei 600 cm passen Abwicklung und Grundriss zusammen nicht auf Seite 2 (Grundriss auf Seite 3).

**Do 18.11.**
- Spindeltreppe als 4. Variante – Plan abgestimmt (siehe `notlar.md`), fünf Schritte mit je einem Commit, kein Push:
  1. ✅ Berechnung + Normprüfung (`js/spindeltreppe.js`, `norm.js`, `material.js`)
  2. ✅ Karte + Punkte (Komfort C), Szenarien a–e, Hinweis „notwendige Treppe“, Druck Seite 1 geprüft – offen: Szenario d (L statt Spindel) und Druck-Ausnahme FR 600 cm mit dem Nutzer besprechen
  3. Grundriss (Bogen-Element, DXF ARC)
  4. Abwicklung (kann entfallen)
  5. DXF-Dateiname, Fachbegriffe DE/EN/FR, README (Eigene Annahmen: Kragstufen bei Stahlbeton vereinfacht, Deckenöffnung = Kreis D, Kopfhöhe am Rand nicht geprüft)
- ✅ Sichtprüfung Materialwahl (Nutzer)
- DXF mit Holz/Stahl in AutoCAD prüfen (Ebenen WANGE, TRITTSTUFE, SCHRAFFUR_HOLZ/STAHL, SOLID)

**Später / offen**
5. Französische Texte von einer Muttersprachlerin / einem Muttersprachler prüfen lassen (Fachbegriffe in `notlar.md`).
6. Kopfhöhe 2,00 m im Schnitt prüfen und darstellen. Dafür muss die Lage bzw. Länge der Deckenöffnung festgelegt werden – vorher Plan abstimmen.
7. Wände und Treppenloch im Grundriss (bisher nur Raumrechteck).
8. Antritts-/Austrittsfläche: in DIN 18065 bisher keine Regel gefunden (siehe `notlar.md`) – Original prüfen, falls zugänglich.
9. Quelle für die Schnitthöhe ca. 1 m prüfen (vermutlich DIN 1356-1).
10. ✅ README: Hinweis „DXF: beim Import Einheit mm wählen“ aufgenommen. Offen: README nach Freigabe durch den Nutzer pushen.

## Gestaltung (Di) – erledigt 17.11.

- ✅ Grundriss, rechter Rand: Maßtexte („fehlt 20,0“, „60,0“, „100,0“) überschneiden sich mit der Stufennummer „16“ oder stehen zu gedrängt.
- ✅ Formular: Zwischen dem Hinweis „Mindestens 80 cm …“ und dem Kasten „Verfügbarer Raum“ fehlt der Abstand.
- ✅ Maßtexte in EN/FR sind etwas länger („Total going 99.0“ / „Reculement 99,0“: 92 / 98 px statt 86 px im Deutschen) – bei sehr kurzen Treppen prüfen, ob sie noch zwischen die Maßlinien passen.
