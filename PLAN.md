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
- [ ] Raumprüfung für L- und U-Treppe (gleiche Funktion `pruefeRaum`)
- [ ] L- und U-Treppe mit Podest (Podestregeln siehe `notlar.md`)
- [ ] Variantenvergleich + Bewertung + Empfehlung
- [ ] Veröffentlichung auf GitHub Pages
- [ ] README auf Deutsch

### Could
- [ ] Maßstabsfigur (menschliche Silhouette)
- [ ] Gewichtung der Kriterien durch den Nutzer
- [ ] Materialvergleich (mit externen Daten)
- [ ] PDF-Export

## Etappen

| Tag | Inhalt |
|---|---|
| Mo 16.11. | Berechnung + Schnitt |
| Di 17.11. | Grundrisszeichnung + Gestaltung |
| Mi 18.11. | Flächeneingabe + L/U + Empfehlung |
| Do 19.11. | 12:00 Freeze, Veröffentlichung, README |
| Fr 20.11. | Poster + Präsentation (Abgabe 16:00) |

## Stand

- ✅ Projekt-Setup: `CLAUDE.md`, `notlar.md`, `.gitignore`
- ✅ Grenzwerte DIN 18065:2020-08 zentral in `js/norm.js`, mit Quellenangabe
- ✅ Gerade Treppe: Stufenzahl, Steigung, Auftritt, Schrittmaßregel, Prüfung grün/rot
- ✅ Schnitt als SVG: Decken, Laufplatte (18 cm angenommen), Schraffur, Höhenkoten, Maßketten (s, a, Lauflänge, Geschosshöhe), automatischer Maßstab
- ✅ Podestregeln recherchiert (sekundär, siehe `notlar.md`) – noch nicht in der App
- ✅ Nutzbare Laufbreite als Eingabe: Vorschlag = Mindestmaß der Gebäudeart (80 / 100 cm), eigene Eingabe bleibt erhalten, rot unter dem Mindestmaß, eigene Zeile in der Normprüfung
- ✅ Grundriss als SVG (`js/grundriss.js`): gleicher Maßstab, genau unter dem Schnitt (Projektion); Stufennummern 1 … n (Steigungen), Lauflinie mit Kreis und Pfeil, Schnittlinie bei ca. 1 m (Darstellungskonvention, Quelle offen), darüber gestrichelt; Maßketten Lauflänge und Laufbreite

- ✅ Größere Zeichnungen: Seite 64rem breit, Schrift 13 px (Stufennummern 12 px), Mindestmaßstab (Grundriss ≥ 90 px hoch, Auftritt ≥ 28 px); 250–350 cm passen auf einem Laptop ohne Scrollen; nur auf schmalen Bildschirmen oder bei sehr hohen Geschossen scrollen Schnitt und Grundriss gemeinsam horizontal und bleiben übereinander
- ✅ Rundung korrigiert: Berechnung, Lauflänge, Zeichnungen und Normprüfung mit exakten Werten (z. B. 300 cm → Lauflänge 504,3 cm); gerundet wird nur bei der Anzeige; Normprüfung zeigt bis zu 2 Nachkommastellen (z. B. 19,04 cm ✗)
- ✅ Schnittlinie im Grundriss liegt an der Setzstufe, die die Schnittebene trifft – zwischen zwei Stufennummern
- ✅ Raumeingabe (gerade Treppe): verfügbare Länge (in Laufrichtung) und Breite, beide optional; allgemeine Prüfung `pruefeRaum(footprint, vorgabe)` in `js/raum.js` für jeden rechteckigen Footprint; Zeile „Passt in den Raum“ (Raumvorgabe, keine Normprüfung) mit Fehlmaß („Es fehlen 20 cm Länge“) und eigenem Raumurteil; Grundriss mit feinem Raumrechteck (Treppe links unten an der Wand), schraffiertem Überstand und roten Fehlmaßen; vereinfacht: benötigte Breite = Laufbreite, ohne Antritts-/Austrittsfläche

## Nächste Schritte

1. L- und U-Treppe mit Podest; Footprint je Variante berechnen und mit `pruefeRaum` prüfen.
2. Kopfhöhe 2,00 m im Schnitt prüfen und darstellen. Dafür muss die Lage bzw. Länge der Deckenöffnung festgelegt werden – vorher Plan abstimmen.
3. Wände und Treppenloch im Grundriss (bisher nur Raumrechteck).
4. Antritts-/Austrittsfläche: in DIN 18065 bisher keine Regel gefunden (siehe `notlar.md`) – Original prüfen, falls zugänglich.
5. Quelle für die Schnitthöhe ca. 1 m prüfen (vermutlich DIN 1356-1).

## Gestaltung – nach der Mehrsprachigkeit

- Grundriss, rechter Rand: Maßtexte („fehlt 20,0“, „60,0“, „100,0“) überschneiden sich mit der Stufennummer „16“ oder stehen zu gedrängt.
- Formular: Zwischen dem Hinweis „Mindestens 80 cm …“ und dem Kasten „Verfügbarer Raum“ fehlt der Abstand.
