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
- ✅ Raumprüfung für die L-Treppe (gleiche Funktion `pruefeRaum`) – U folgt
- ✅ L-Treppe mit Viertelpodest, links und rechts (Podestregeln siehe `notlar.md`)
- [ ] U-Treppe mit Halbpodest
- [ ] Variantenvergleich + Bewertung + Empfehlung
- ✅ Mehrsprachigkeit: Deutsch, Englisch, Französisch (Umschalter auf der Seite) – Wunsch der Betreuung
- ✅ Gestaltung nach dem UI-Design-Kurs (Stil-Prompt und bewusste Entscheidungen in `CLAUDE.md`)
- ✅ Export von Schnitt und Grundriss als DXF (für ArchiCAD, Revit, AutoCAD), zusätzlich SVG und PDF – Wunsch der Betreuung (in AutoCAD 2027 getestet; ArchiCAD/Revit offen)
- [ ] Veröffentlichung auf GitHub Pages
- [ ] README auf Deutsch

### Could
- [ ] Maßstabsfigur (menschliche Silhouette)
- [ ] Gewichtung der Kriterien durch den Nutzer
- [ ] Materialvergleich (mit externen Daten)
- [ ] IFC-/3D-Export (PDF-Export ist nach „Should“ gewandert)
- [ ] Maßstäbliches Drucken (A4 quer, 1:50; bisher auf Seitenbreite verkleinert, ohne Maßstab)

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
- ✅ Podestregeln recherchiert (sekundär, siehe `notlar.md`) und in `js/norm.js` übernommen (18.11.)
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

- ✅ Treppenformen (18.11., Teil A „L“): `js/treppenformen.js` mit `berechneTreppe(form, richtung, eingabe)` für gerade, L (und vorbereitet U); Steigung/Auftritt unabhängig von der Form, die Form teilt nur auf Läufe auf (Lauf i: nᵢ Steigungen, nᵢ − 1 Auftritte, Podest ersetzt einen Auftritt); L probiert alle Aufteilungen (Läufe normgerecht → passt in den Raum bzw. kleinstes Fehlmaß → ausgewogen); Normprüfung neu: ≥ 3 Steigungen je Lauf, ≤ 18 Steigungen je Lauf (nur Gebäude im Allgemeinen – gerade Treppe mit 19+ Steigungen dort jetzt ✗ „Podest nötig“), Podestlänge ≥ Laufbreite
- ✅ L-Treppe gezeichnet: Grundriss mit Läufen und Viertelpodest (links/rechts gespiegelt), Stufennummern fortlaufend, Lauflinie über das Podest, Schnittlinie und gestrichelte Teile über die Läufe hinweg, Raumüberstand je Lauf/Podest, Maßketten Lauf 1 | Podest und Breite in Abschnitten; Schnitt als Abwicklung entlang der Lauflinie mit Podestplatte (18 cm angenommen), Kette Lauf | Podest | Lauf, Höhenkote auf dem Podest; Grundriss bei L in eigener Lage (gleicher Maßstab, nicht mehr unter dem Schnitt)
- ✅ Vorläufige Formwahl im Ergebnis „Gerade Treppe | L-Treppe (links | rechts)“ – wird im Variantenvergleich zu Karten; Kennwerte mit Aufteilung („16 (8 + 8)“) und Platzbedarf Länge × Breite; Export-Dateiname mit Form (`treppe_275_L-links_grundriss.dxf`); Druckzeile nennt die Treppenform; alle Texte DE/EN/FR
- ✅ Gerade Treppe nach dem Umbau unverändert: Elementlisten (Bildschirm und Export) in 6 Fällen und das SVG im Browser identisch geprüft (Konsole, ohne Node)

**Stand 18.11., Teil A (L-Treppe) fertig.** Nächster Teil: U-Treppe.

**Stand 16.11. abends:** Gerade Treppe vollständig (Berechnung, Normprüfung, Raumprüfung, Schnitt, Grundriss, DE/EN/FR, Export DXF/SVG/PDF). DXF in AutoCAD 2027 erfolgreich getestet; PDF mit zwei Seiten in zwei Fällen (600 cm, Raum 1000 × 1000 und 600 × 600) geprüft. Alles committet und gepusht.

## Nächste Schritte

**Di 17.11.**
1. ✅ Gestaltung (siehe Stand) – vom Nutzer im Browser prüfen lassen, dann pushen.
2. DXF in ArchiCAD und Revit (Uni) öffnen: Einheit (mm wählen), Ebenen, Umlaute (ä, ö, ü, ß, é), ± prüfen (AutoCAD 2027 ✅).

**Mi 18.11.**
3. ✅ Teil A: L-Treppe (Berechnung, Grundriss, Abwicklung, Export, Texte).
4. Teil B: U-Treppe – Berechnung ist schon in `treppenformen.js` (ausgewogen, Halbpodest 2B + Auge, Treppenauge 10 cm), Grundriss/Abwicklung sind vorbereitet; noch: Knopf „U-Treppe“ in der Formwahl, Untertitel der Seite, Geometrie im Browser prüfen lassen (Nutzer), Commit.
5. Teil C: Variantenvergleich – `js/bewertung.js` (Gewichte an einer Stelle: Komfort 40 %, Platz 30 %, Sicherheit 20 %, Nutzung 10 %; Formeln siehe `notlar.md`), Ausschluss (passt nicht / Norm nicht erfüllt), Stufenzahl je Form (steilere normgerechte Stufung, wenn die bequemste nicht passt), drei Karten (gerade, L mit links/rechts, U) mit Mini-Grundriss, Werten und Punkten, Empfehlung mit Begründungssatz, Ausgeschlossene blass und gestrichelt; danach Szenarien gemeinsam prüfen und Gewichte ggf. anpassen.

**Später / offen**
5. Französische Texte von einer Muttersprachlerin / einem Muttersprachler prüfen lassen (Fachbegriffe in `notlar.md`).
6. Kopfhöhe 2,00 m im Schnitt prüfen und darstellen. Dafür muss die Lage bzw. Länge der Deckenöffnung festgelegt werden – vorher Plan abstimmen.
7. Wände und Treppenloch im Grundriss (bisher nur Raumrechteck).
8. Antritts-/Austrittsfläche: in DIN 18065 bisher keine Regel gefunden (siehe `notlar.md`) – Original prüfen, falls zugänglich.
9. Quelle für die Schnitthöhe ca. 1 m prüfen (vermutlich DIN 1356-1).
10. README (Do): Hinweis „DXF: beim Import Einheit mm wählen“ aufnehmen (siehe `notlar.md`).

## Gestaltung (Di) – erledigt 17.11.

- ✅ Grundriss, rechter Rand: Maßtexte („fehlt 20,0“, „60,0“, „100,0“) überschneiden sich mit der Stufennummer „16“ oder stehen zu gedrängt.
- ✅ Formular: Zwischen dem Hinweis „Mindestens 80 cm …“ und dem Kasten „Verfügbarer Raum“ fehlt der Abstand.
- ✅ Maßtexte in EN/FR sind etwas länger („Total going 99.0“ / „Reculement 99,0“: 92 / 98 px statt 86 px im Deutschen) – bei sehr kurzen Treppen prüfen, ob sie noch zwischen die Maßlinien passen.
