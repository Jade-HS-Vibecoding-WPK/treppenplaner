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
- [ ] Schnitt vergrößern
- [ ] Kopfhöhe 2,00 m im Schnitt prüfen
- [ ] Eingabe der verfügbaren Fläche (Länge × Breite)
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

## Nächste Schritte

1. Schnitt (und Grundriss) vergrößerbar machen (z. B. Klick → Vollansicht).
2. Kopfhöhe 2,00 m im Schnitt prüfen und darstellen. Dafür muss die Lage bzw. Länge der Deckenöffnung festgelegt werden – vorher Plan abstimmen.
3. Flächeneingabe (Länge × Breite); dabei Wände und Treppenloch im Grundriss ergänzen.
4. Quelle für die Schnitthöhe ca. 1 m prüfen (vermutlich DIN 1356-1).
