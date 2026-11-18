/*
 * i18n.js – Alle Texte der Oberfläche in Deutsch, Englisch und Französisch.
 *
 * - Texte stehen nur hier (Wörterbuch TEXTE); andere Dateien rufen t("schluessel") auf.
 * - Platzhalter: t("fehler.geschosshoeheBereich", { min: 50, max: 600 }) → {min}, {max}.
 * - Fehlt ein Schlüssel in EN/FR, wird der deutsche Text gezeigt (mit Warnung in der Konsole).
 * - Zahlen werden je Sprache formatiert (de-DE / en-GB / fr-FR); gerechnet wird immer exakt.
 * - Statische Texte in index.html: data-i18n="schluessel" (Text), data-i18n-aria="schluessel" (aria-label).
 *
 * Fachbegriffe und offene Fragen zur Übersetzung: siehe notlar.md, „Fachbegriffe DE / EN / FR“.
 * TODO: Französisch von einer Muttersprachlerin / einem Muttersprachler prüfen lassen.
 */

const SPRACHEN = Object.freeze({
  de: { zahlenformat: "de-DE" },
  en: { zahlenformat: "en-GB" },
  fr: { zahlenformat: "fr-FR" },
});
const STANDARDSPRACHE = "de";
const SPRACHE_SPEICHERSCHLUESSEL = "treppenplaner.sprache";

const TEXTE = {
  de: {
    "seite.untertitel": "Gerade Treppe – Bemessung nach DIN 18065",
    "seite.untertitelL": "L-Treppe mit Viertelpodest – Bemessung nach DIN 18065",
    "seite.untertitelU": "U-Treppe mit Halbpodest – Bemessung nach DIN 18065",
    "sprachwahl.label": "Sprache",

    "eingabe.titel": "Eingabe",
    "eingabe.geschosshoehe": "Geschosshöhe (cm)",
    "eingabe.gebaeudeart": "Gebäudeart",
    "gebaeudeart.wohngebaeude": "Wohngebäude mit bis zu zwei Wohnungen / innerhalb von Wohnungen",
    "gebaeudeart.allgemein": "Gebäude im Allgemeinen",
    "gebaeudeart.hinweis": "Wohngebäude mit mehr als zwei Wohnungen → Gebäude im Allgemeinen.",
    "eingabe.laufbreite": "Nutzbare Laufbreite (cm)",
    "laufbreite.mindestens": "Mindestens {min} cm nach DIN 18065.",
    "laufbreite.unterschritten": "Unterschreitet das Mindestmaß von {min} cm nach DIN 18065.",
    "eingabe.raum": "Verfügbarer Raum (optional)",
    "eingabe.raumLaenge": "Verfügbare Länge (cm, in Laufrichtung)",
    "eingabe.raumBreite": "Verfügbare Breite (cm)",
    "eingabe.raumHinweis": "Leer lassen, wenn es keine Vorgabe gibt.",
    "eingabe.berechnen": "Berechnen",

    "fehler.geschosshoeheUngueltig": "Bitte eine gültige Geschosshöhe in cm eingeben.",
    "fehler.geschosshoeheBereich": "Die Geschosshöhe muss zwischen {min} und {max} cm liegen.",
    "fehler.laufbreiteUngueltig": "Bitte eine gültige nutzbare Laufbreite in cm eingeben.",
    "fehler.laufbreiteBereich": "Die nutzbare Laufbreite muss zwischen {min} und {max} cm liegen.",
    "fehler.raumLaengeUngueltig": "Bitte eine gültige verfügbare Länge in cm eingeben oder das Feld leer lassen.",
    "fehler.raumLaengeBereich": "Die verfügbare Länge muss zwischen {min} und {max} cm liegen.",
    "fehler.raumBreiteUngueltig": "Bitte eine gültige verfügbare Breite in cm eingeben oder das Feld leer lassen.",
    "fehler.raumBreiteBereich": "Die verfügbare Breite muss zwischen {min} und {max} cm liegen.",

    "ergebnis.titel": "Ergebnis",
    "ergebnis.anzahlSteigungen": "Anzahl Steigungen",
    "ergebnis.anzahlAuftritte": "Anzahl Auftritte",
    "ergebnis.lauflaenge": "Lauflänge (Grundriss)",
    "ergebnis.platzbedarf": "Platzbedarf (Grundriss)",
    "formwahl.label": "Treppenform",
    "form.gerade": "Gerade Treppe",
    "form.L": "L-Treppe",
    "form.U": "U-Treppe",
    "form.spindel": "Spindeltreppe",
    "richtung.links": "links",
    "richtung.rechts": "rechts",
    "vergleich.titel": "Variantenvergleich",
    "vergleich.empfehlung": "Empfehlung",
    "vergleich.ausgeschlossen": "ausgeschlossen",
    "vergleich.naechste": "am nächsten",
    "hinweis.sehrSteil": "sehr steil",
    "vergleich.punkte": "Punkte",
    "vergleich.vonHundert": "{punkte} / 100",
    "vergleich.variante": "Variante",
    "vergleich.ergebnis": "Ergebnis",
    "vergleich.drehsinn": "Drehsinn",
    "vergleich.drehsinnLabel": "Drehsinn:",
    "vergleich.gewichte":
      "Punkte: Komfort {komfort} %, Platz {platz} %, Sicherheit {sicherheit} %, Nutzung {nutzung} % – " +
      "eigene Gewichtung, keine Normvorgabe.",
    "vergleich.anklicken": "Karte anklicken, um die Variante zu zeichnen.",
    "bewertung.komfort": "Komfort",
    "bewertung.platz": "Platz",
    "bewertung.sicherheit": "Sicherheit",
    "bewertung.nutzung": "Nutzung",
    "empfehlung.satz": "Empfehlung: {form} – {punkte} von 100 Punkten, vor allem wegen {grund}.",
    "empfehlung.einzige": "Empfehlung: {form} – die einzige Variante, die passt und die Norm erfüllt ({punkte} von 100 Punkten).",
    "empfehlung.keine": "✗ Keine Variante passt. Am nächsten kommt: {form} ({grund}).",
    "empfehlung.grund.komfort": "des bequemeren Steigungsverhältnisses",
    "empfehlung.grund.platz": "des geringeren Platzbedarfs",
    "empfehlung.grund.sicherheit": "der kürzeren Läufe",
    "empfehlung.grund.nutzung": "des Podests als Ruhepunkt",
    "ausschluss.stufen": "Norm nicht erfüllt: Steigung / Auftritt",
    "ausschluss.laufbreite": "Laufbreite unter dem Mindestmaß",
    "ausschluss.podestNoetig": "Podest nötig (mehr als {max} Steigungen)",
    "ausschluss.laufZuKurz": "Lauf zu kurz (weniger als {min} Steigungen)",
    "ausschluss.podest": "Podest zu kurz",
    "ausschluss.raum": "passt nicht: es fehlen {teile}",
    "urteil.normgerecht": "✓ Die Treppe erfüllt die geprüften Anforderungen der DIN 18065.",
    "urteil.keineLoesung":
      "✗ Für diese Geschosshöhe ist keine normgerechte Stufenfolge möglich. Gezeigt wird die nächstliegende Lösung.",
    "urteil.laufbreite": "✗ Die nutzbare Laufbreite unterschreitet das Mindestmaß nach DIN 18065.",
    "urteil.podestNoetig":
      "✗ Mehr als {max} Steigungen ohne Podest – für Gebäude im Allgemeinen ist ein Podest nötig (L- oder U-Treppe).",
    "urteil.laeufe": "✗ Die Aufteilung auf die Läufe erfüllt die Anforderungen nicht (siehe Normprüfung).",
    "urteil.spindel": "✗ Die Geometrie der Spindeltreppe erfüllt die Anforderungen nicht (siehe Normprüfung).",

    "kriterium.steigung": "Steigung s",
    "kriterium.auftritt": "Auftritt a",
    "kriterium.schrittmass": "Schrittmaß 2s + a",
    "kriterium.laufbreite": "Nutzbare Laufbreite",
    "kriterium.laufMin": "Steigungen je Lauf (mind.)",
    "kriterium.laufMax": "Steigungen je Lauf ohne Podest",
    "kriterium.podestlaenge": "Podestlänge",
    "kriterium.spindelLaufbreite": "Nutzbare Laufbreite (Regel Gehbereich)",
    "kriterium.auftrittInnen": "Auftritt an der inneren Begrenzung",
    "kriterium.lauflinieGehbereich": "Lauflinie im Gehbereich (Abstand von innen)",
    "kriterium.durchgangshoehe": "Lichte Durchgangshöhe",

    "pruefung.titel": "Normprüfung",
    "pruefung.kriterium": "Kriterium",
    "pruefung.wert": "Wert",
    "pruefung.zulaessig": "Zulässig",
    "pruefung.ergebnis": "Ergebnis",
    "pruefung.erfuellt": "✓ erfüllt",
    "pruefung.nichtErfuellt": "✗ nicht erfüllt",

    "raum.kriterium": "Passt in den Raum",
    "raum.laenge": "Länge",
    "raum.breite": "Breite",
    "raum.vorgabe": "(Raumvorgabe)",

    // Zeile „Eingabe“ nur im Druck (Formular ist dort ausgeblendet)
    "druck.geschosshoehe": "Geschosshöhe",
    "druck.laufbreite": "Nutzbare Laufbreite",
    "druck.raum": "Verfügbarer Raum",
    "druck.gebaeudeart": "Gebäudeart: {wert}",
    "druck.form": "Treppenform: {wert}",
    "druck.raumSeite": "Verfügbarer Raum: {seite} {wert}",
    "raum.passt": "✓ passt",
    "raum.fehltLaenge": "{wert} Länge",
    "raum.fehltBreite": "{wert} Breite",
    "raum.und": " und ",
    "raum.fehlt": "Es fehlen {teile}.",
    "raum.urteilPasst": "✓ Die Treppe passt in den verfügbaren Raum.",
    "raum.urteilPasstNicht": "✗ Die Treppe passt nicht in den verfügbaren Raum. {fehlt}",
    "raum.hinweis":
      "Raumprüfung vereinfacht: benötigte Breite = nutzbare Laufbreite (ohne Wangen, Handlauf " +
      "und Wandabstand); ohne Antritts- und Austrittsfläche.",

    "schnitt.titel": "Schnitt",
    "schnitt.aria": "Schnitt der geraden Treppe",
    "schnitt.legende":
      "Schnitt, ohne Maßstab · Maße in cm · {konstruktion} · Deckendicke angenommen {decke} cm · Schraffur vereinfacht",
    "grundriss.titel": "Grundriss",
    "grundriss.aria": "Grundriss der geraden Treppe",
    "schnitt.titelAbwicklung": "Abwicklung entlang der Lauflinie",
    "schnitt.ariaAbwicklung": "Abwicklung der Treppe entlang der Lauflinie",
    "schnitt.legendeAbwicklung":
      "Abwicklung entlang der Lauflinie, ohne Maßstab · Maße in cm · {konstruktion} · " +
      "Deckendicke angenommen {decke} cm · Schraffur vereinfacht",
    "grundriss.ariaPodest": "Grundriss der Treppe mit Podest",
    "grundriss.legende":
      "Grundriss, ohne Maßstab · Maße in cm · Material: {material} · Darstellung ohne Wände/Handlauf · " +
      "Schnittführung ca. 1 m über Fußboden (Darstellungskonvention, keine Normvorgabe)",

    // Beschriftungen in den Zeichnungen (kurz, damit sie an die Maßlinien passen)
    // Material (material.js): Schalter, Fließtext, Konstruktion in der Legende
    "material.titel": "Material",
    "material.stahlbeton": "Stahlbeton",
    "material.holz": "Holz",
    "material.stahl": "Stahl",
    "materialText.stahlbeton": "Stahlbeton",
    "materialText.holz": "Holz",
    "materialText.stahl": "Stahl",
    "konstruktion.laufplatte": "Stahlbeton, Laufplattendicke angenommen {platte} cm",
    "konstruktion.laufplatteAbwicklung": "Stahlbeton, Lauf- und Podestplatte angenommen {platte} cm",
    "konstruktion.wange":
      "{material}-Wangentreppe: Trittstufen {tritt} cm, Wangen {wd} × {wh} cm (Annahmen, keine Normwerte) · " +
      "offene Stufen, Prüfung offener Stufen nicht enthalten",
    "konstruktion.wangeAbwicklung":
      "{material}-Wangentreppe: Trittstufen und Podestbelag {tritt} cm, Wangen {wd} × {wh} cm " +
      "(Annahmen, keine Normwerte) · offene Stufen, Prüfung offener Stufen nicht enthalten",
    "grundriss.wangen": "Wangen außerhalb der nutzbaren Laufbreite, in der Raumprüfung nicht berücksichtigt (vereinfacht)",
    "grundriss.augeVereinfacht": "vereinfacht: bei {material} wäre ein Treppenauge ≥ {min} cm nötig",
    "druck.material": "Material: {wert}",
    "zeichnung.material": "Material: {wert} (Maße angenommen, keine Normwerte)",

    "zeichnung.lauflaenge": "Lauflänge {wert}",
    "zeichnung.podest": "Podest {wert}",
    "zeichnung.raum": "Raum {wert}",
    "zeichnung.fehlt": "fehlt {wert}",

    "export.titel": "Export",
    "export.schnitt": "Schnitt",
    "export.grundriss": "Grundriss",
    "export.drucken": "Drucken / PDF",
    "export.hinweisDxf": "DXF: Einheit mm, Maßstab 1:1",

    "fuss.landesrecht": "Orientierungshilfe, ersetzt keine Prüfung nach Landesbauordnung.",
    "fuss.quelle":
      "Grenzwerte: DIN 18065:2020-08, Tabelle 1 (zitiert nach WEKA-Fachportal, Original nicht eingesehen).",
    "fuss.uebersetzung": "", // im Deutschen nicht nötig (leer = ausgeblendet)
  },

  en: {
    "seite.untertitel": "Straight stair – design to DIN 18065 (German standard for stairs in buildings)",
    "seite.untertitelL":
      "L-shaped stair with quarter landing – design to DIN 18065 (German standard for stairs in buildings)",
    "seite.untertitelU":
      "U-shaped stair with half landing – design to DIN 18065 (German standard for stairs in buildings)",
    "sprachwahl.label": "Language",

    "eingabe.titel": "Input",
    "eingabe.geschosshoehe": "Storey height (cm)",
    "eingabe.gebaeudeart": "Building type",
    "gebaeudeart.wohngebaeude": "Residential buildings with no more than two dwellings / within dwellings",
    "gebaeudeart.allgemein": "Buildings in general",
    "gebaeudeart.hinweis": "Residential buildings with more than two dwellings → buildings in general.",
    "eingabe.laufbreite": "Clear width (cm)",
    "laufbreite.mindestens": "At least {min} cm according to DIN 18065.",
    "laufbreite.unterschritten": "Below the minimum of {min} cm according to DIN 18065.",
    "eingabe.raum": "Available space (optional)",
    "eingabe.raumLaenge": "Available length (cm, in walking direction)",
    "eingabe.raumBreite": "Available width (cm)",
    "eingabe.raumHinweis": "Leave blank if there is no constraint.",
    "eingabe.berechnen": "Calculate",

    "fehler.geschosshoeheUngueltig": "Please enter a valid storey height in cm.",
    "fehler.geschosshoeheBereich": "The storey height must be between {min} and {max} cm.",
    "fehler.laufbreiteUngueltig": "Please enter a valid clear width in cm.",
    "fehler.laufbreiteBereich": "The clear width must be between {min} and {max} cm.",
    "fehler.raumLaengeUngueltig": "Please enter a valid available length in cm or leave the field blank.",
    "fehler.raumLaengeBereich": "The available length must be between {min} and {max} cm.",
    "fehler.raumBreiteUngueltig": "Please enter a valid available width in cm or leave the field blank.",
    "fehler.raumBreiteBereich": "The available width must be between {min} and {max} cm.",

    "ergebnis.titel": "Result",
    "ergebnis.anzahlSteigungen": "Number of rises",
    "ergebnis.anzahlAuftritte": "Number of goings",
    "ergebnis.lauflaenge": "Total going (plan)",
    "ergebnis.platzbedarf": "Space required (plan)",
    "formwahl.label": "Stair shape",
    "form.gerade": "Straight stair",
    "form.L": "L-shaped stair",
    "form.U": "U-shaped stair",
    "form.spindel": "Spiral staircase",
    "richtung.links": "left",
    "richtung.rechts": "right",
    "vergleich.titel": "Comparison of options",
    "vergleich.empfehlung": "Recommended",
    "vergleich.ausgeschlossen": "excluded",
    "vergleich.naechste": "closest",
    "hinweis.sehrSteil": "very steep",
    "vergleich.punkte": "Points",
    "vergleich.vonHundert": "{punkte} / 100",
    "vergleich.variante": "Option",
    "vergleich.ergebnis": "Result",
    "vergleich.drehsinn": "Turn",
    "vergleich.drehsinnLabel": "Turn:",
    "vergleich.gewichte":
      "Points: comfort {komfort} %, space {platz} %, safety {sicherheit} %, use {nutzung} % – " +
      "our own weighting, not a requirement of the standard.",
    "vergleich.anklicken": "Click a card to draw that option.",
    "bewertung.komfort": "Comfort",
    "bewertung.platz": "Space",
    "bewertung.sicherheit": "Safety",
    "bewertung.nutzung": "Use",
    "empfehlung.satz": "Recommended: {form} – {punkte} of 100 points, mainly because of {grund}.",
    "empfehlung.einzige": "Recommended: {form} – the only option that fits and meets the standard ({punkte} of 100 points).",
    "empfehlung.keine": "✗ No option fits. Closest: {form} ({grund}).",
    "empfehlung.grund.komfort": "the more comfortable rise and going",
    "empfehlung.grund.platz": "the smaller footprint",
    "empfehlung.grund.sicherheit": "the shorter flights",
    "empfehlung.grund.nutzung": "the landing as a resting point",
    "ausschluss.stufen": "Standard not met: rise / going",
    "ausschluss.laufbreite": "Clear width below the minimum",
    "ausschluss.podestNoetig": "Landing required (more than {max} risers)",
    "ausschluss.laufZuKurz": "Flight too short (fewer than {min} risers)",
    "ausschluss.podest": "Landing too short",
    "ausschluss.raum": "does not fit: missing {teile}",
    "urteil.normgerecht": "✓ The stair meets the checked requirements of DIN 18065.",
    "urteil.keineLoesung":
      "✗ No step sequence complying with DIN 18065 is possible for this storey height. The closest solution is shown.",
    "urteil.laufbreite": "✗ The clear width is below the minimum required by DIN 18065.",
    "urteil.podestNoetig":
      "✗ More than {max} risers without a landing – buildings in general need a landing (L- or U-shaped stair).",
    "urteil.laeufe": "✗ The division into flights does not meet the requirements (see standard check).",
    "urteil.spindel": "✗ The geometry of the spiral staircase does not meet the requirements (see standard check).",

    "kriterium.steigung": "Rise s",
    "kriterium.auftritt": "Going a",
    "kriterium.schrittmass": "2R + G rule (2s + a)",
    "kriterium.laufbreite": "Clear width",
    "kriterium.laufMin": "Risers per flight (min.)",
    "kriterium.laufMax": "Risers per flight without landing",
    "kriterium.podestlaenge": "Landing length",
    "kriterium.spindelLaufbreite": "Clear width (walking zone rule)",
    "kriterium.auftrittInnen": "Going at the inner boundary",
    "kriterium.lauflinieGehbereich": "Walking line within walking zone (distance from inside)",
    "kriterium.durchgangshoehe": "Headroom",

    "pruefung.titel": "Check against DIN 18065",
    "pruefung.kriterium": "Criterion",
    "pruefung.wert": "Value",
    "pruefung.zulaessig": "Permitted",
    "pruefung.ergebnis": "Result",
    "pruefung.erfuellt": "✓ met",
    "pruefung.nichtErfuellt": "✗ not met",

    "raum.kriterium": "Fits the available space",
    "raum.laenge": "Length",
    "raum.breite": "Width",
    "raum.vorgabe": "(available space)",

    "druck.geschosshoehe": "Storey height",
    "druck.laufbreite": "Clear width",
    "druck.raum": "Available space",
    "druck.gebaeudeart": "Building type: {wert}",
    "druck.form": "Stair shape: {wert}",
    "druck.raumSeite": "Available space: {seite} {wert}",
    "raum.passt": "✓ fits",
    "raum.fehltLaenge": "{wert} of length",
    "raum.fehltBreite": "{wert} of width",
    "raum.und": " and ",
    "raum.fehlt": "Missing: {teile}.",
    "raum.urteilPasst": "✓ The stair fits the available space.",
    "raum.urteilPasstNicht": "✗ The stair does not fit the available space. {fehlt}",
    "raum.hinweis":
      "Simplified space check: required width = clear width (without stringers, handrail " +
      "and wall clearance); without landing areas at the foot and top of the stair.",

    "schnitt.titel": "Section",
    "schnitt.aria": "Section of the straight stair",
    "schnitt.legende":
      "Section, not to scale · dimensions in cm · {konstruktion} · slab thickness assumed {decke} cm · hatching simplified",
    "grundriss.titel": "Plan",
    "grundriss.aria": "Plan of the straight stair",
    "schnitt.titelAbwicklung": "Development along the walking line",
    "schnitt.ariaAbwicklung": "Development of the stair along the walking line",
    "schnitt.legendeAbwicklung":
      "Development along the walking line, not to scale · dimensions in cm · {konstruktion} · " +
      "slab thickness assumed {decke} cm · hatching simplified",
    "grundriss.ariaPodest": "Plan of the stair with landing",
    "grundriss.legende":
      "Plan, not to scale · dimensions in cm · material: {material} · shown without walls/handrail · " +
      "cut approx. 1 m above floor (drawing convention, not a requirement of the standard)",

    "material.titel": "Material",
    "material.stahlbeton": "Reinforced concrete",
    "material.holz": "Timber",
    "material.stahl": "Steel",
    "materialText.stahlbeton": "reinforced concrete",
    "materialText.holz": "timber",
    "materialText.stahl": "steel",
    "konstruktion.laufplatte": "reinforced concrete, waist thickness assumed {platte} cm",
    "konstruktion.laufplatteAbwicklung": "reinforced concrete, waist and landing thickness assumed {platte} cm",
    "konstruktion.wange":
      "{material} stringer stair: treads {tritt} cm, stringers {wd} × {wh} cm (assumptions, not values of the standard) · " +
      "open risers, check of open risers not included",
    "konstruktion.wangeAbwicklung":
      "{material} stringer stair: treads and landing deck {tritt} cm, stringers {wd} × {wh} cm " +
      "(assumptions, not values of the standard) · open risers, check of open risers not included",
    "grundriss.wangen": "stringers outside the clear width, not included in the space check (simplified)",
    "grundriss.augeVereinfacht": "simplified: a {material} stair would need a well of at least {min} cm",
    "druck.material": "Material: {wert}",
    "zeichnung.material": "Material: {wert} (dimensions assumed, not values of the standard)",

    "zeichnung.lauflaenge": "Total going {wert}",
    "zeichnung.podest": "Landing {wert}",
    "zeichnung.raum": "Space {wert}",
    "zeichnung.fehlt": "missing {wert}",

    "export.titel": "Export",
    "export.schnitt": "Section",
    "export.grundriss": "Plan",
    "export.drucken": "Print / PDF",
    "export.hinweisDxf": "DXF: unit mm, scale 1:1",

    "fuss.landesrecht":
      "For guidance only; does not replace a check under the German state building regulations (Landesbauordnung).",
    "fuss.quelle":
      "Limit values: DIN 18065:2020-08 (German standard for stairs in buildings), Table 1 " +
      "(quoted from WEKA-Fachportal, original not consulted).",
    "fuss.uebersetzung": "Translation for guidance only; the German text of the standard is authoritative.",
  },

  fr: {
    "seite.untertitel":
      "Escalier droit – dimensionnement selon la DIN 18065 (norme allemande relative aux escaliers)",
    "seite.untertitelL":
      "Escalier en L avec palier – dimensionnement selon la DIN 18065 (norme allemande relative aux escaliers)",
    "seite.untertitelU":
      "Escalier en U avec palier – dimensionnement selon la DIN 18065 (norme allemande relative aux escaliers)",
    "sprachwahl.label": "Langue",

    "eingabe.titel": "Saisie",
    "eingabe.geschosshoehe": "Hauteur d'étage (cm)",
    "eingabe.gebaeudeart": "Type de bâtiment",
    "gebaeudeart.wohngebaeude":
      "Bâtiments d'habitation d'au plus deux logements / à l'intérieur des logements",
    "gebaeudeart.allgemein": "Bâtiments en général",
    "gebaeudeart.hinweis": "Bâtiments d'habitation de plus de deux logements → bâtiments en général.",
    "eingabe.laufbreite": "Emmarchement (largeur utile, cm)",
    "laufbreite.mindestens": "Au moins {min} cm selon la DIN 18065.",
    "laufbreite.unterschritten": "Inférieur au minimum de {min} cm selon la DIN 18065.",
    "eingabe.raum": "Espace disponible (facultatif)",
    "eingabe.raumLaenge": "Longueur disponible (cm, dans le sens de la montée)",
    "eingabe.raumBreite": "Largeur disponible (cm)",
    "eingabe.raumHinweis": "Laisser vide s'il n'y a pas de contrainte.",
    "eingabe.berechnen": "Calculer",

    "fehler.geschosshoeheUngueltig": "Veuillez saisir une hauteur d'étage valide en cm.",
    "fehler.geschosshoeheBereich": "La hauteur d'étage doit être comprise entre {min} et {max} cm.",
    "fehler.laufbreiteUngueltig": "Veuillez saisir un emmarchement valide en cm.",
    "fehler.laufbreiteBereich": "L'emmarchement doit être compris entre {min} et {max} cm.",
    "fehler.raumLaengeUngueltig": "Veuillez saisir une longueur disponible valide en cm ou laisser le champ vide.",
    "fehler.raumLaengeBereich": "La longueur disponible doit être comprise entre {min} et {max} cm.",
    "fehler.raumBreiteUngueltig": "Veuillez saisir une largeur disponible valide en cm ou laisser le champ vide.",
    "fehler.raumBreiteBereich": "La largeur disponible doit être comprise entre {min} et {max} cm.",

    "ergebnis.titel": "Résultat",
    "ergebnis.anzahlSteigungen": "Nombre de contremarches",
    "ergebnis.anzahlAuftritte": "Nombre de marches",
    "ergebnis.lauflaenge": "Reculement (vue en plan)",
    "ergebnis.platzbedarf": "Encombrement (vue en plan)",
    "formwahl.label": "Forme de l’escalier",
    "form.gerade": "Escalier droit",
    "form.L": "Escalier en L",
    "form.U": "Escalier en U",
    "form.spindel": "Escalier à vis",
    "richtung.links": "à gauche",
    "richtung.rechts": "à droite",
    "vergleich.titel": "Comparaison des variantes",
    "vergleich.empfehlung": "Recommandation",
    "vergleich.ausgeschlossen": "exclue",
    "vergleich.naechste": "la plus proche",
    "hinweis.sehrSteil": "très raide",
    "vergleich.punkte": "Points",
    "vergleich.vonHundert": "{punkte} / 100",
    "vergleich.variante": "Variante",
    "vergleich.ergebnis": "Résultat",
    "vergleich.drehsinn": "Sens",
    "vergleich.drehsinnLabel": "Sens :",
    "vergleich.gewichte":
      "Points : confort {komfort} %, encombrement {platz} %, sécurité {sicherheit} %, usage {nutzung} % – " +
      "pondération propre, pas une exigence de la norme.",
    "vergleich.anklicken": "Cliquer sur une carte pour dessiner la variante.",
    "bewertung.komfort": "Confort",
    "bewertung.platz": "Encombrement",
    "bewertung.sicherheit": "Sécurité",
    "bewertung.nutzung": "Usage",
    "empfehlung.satz": "Recommandation : {form} – {punkte} points sur 100, surtout grâce {grund}.",
    "empfehlung.einzige":
      "Recommandation : {form} – la seule variante qui tient dans l'espace et respecte la norme ({punkte} points sur 100).",
    "empfehlung.keine": "✗ Aucune variante ne convient. La plus proche : {form} ({grund}).",
    "empfehlung.grund.komfort": "à un rapport hauteur/giron plus confortable",
    "empfehlung.grund.platz": "à un encombrement plus faible",
    "empfehlung.grund.sicherheit": "à des volées plus courtes",
    "empfehlung.grund.nutzung": "au palier de repos",
    "ausschluss.stufen": "Norme non respectée : hauteur / giron",
    "ausschluss.laufbreite": "Emmarchement inférieur au minimum",
    "ausschluss.podestNoetig": "Palier nécessaire (plus de {max} contremarches)",
    "ausschluss.laufZuKurz": "Volée trop courte (moins de {min} contremarches)",
    "ausschluss.podest": "Palier trop court",
    "ausschluss.raum": "ne tient pas : il manque {teile}",
    "urteil.normgerecht": "✓ L'escalier satisfait aux exigences vérifiées de la DIN 18065.",
    "urteil.keineLoesung":
      "✗ Aucune suite de marches conforme à la DIN 18065 n'est possible pour cette hauteur d'étage. " +
      "La solution la plus proche est affichée.",
    "urteil.laufbreite": "✗ L'emmarchement est inférieur au minimum exigé par la DIN 18065.",
    "urteil.podestNoetig":
      "✗ Plus de {max} marches sans palier – les bâtiments en général exigent un palier (escalier en L ou en U).",
    "urteil.laeufe": "✗ La répartition en volées ne satisfait pas aux exigences (voir vérification).",
    "urteil.spindel": "✗ La géométrie de l'escalier à vis ne satisfait pas aux exigences (voir vérification).",

    "kriterium.steigung": "Hauteur de marche s",
    "kriterium.auftritt": "Giron a",
    "kriterium.schrittmass": "Formule de Blondel (2s + a)",
    "kriterium.laufbreite": "Emmarchement (largeur utile)",
    "kriterium.laufMin": "Marches par volée (min.)",
    "kriterium.laufMax": "Marches par volée sans palier",
    "kriterium.podestlaenge": "Longueur du palier",
    "kriterium.spindelLaufbreite": "Emmarchement (règle de la zone de marche)",
    "kriterium.auftrittInnen": "Giron à la limite intérieure",
    "kriterium.lauflinieGehbereich": "Ligne de foulée dans la zone de marche (distance depuis l'intérieur)",
    "kriterium.durchgangshoehe": "Échappée",

    "pruefung.titel": "Vérification selon la DIN 18065",
    "pruefung.kriterium": "Critère",
    "pruefung.wert": "Valeur",
    "pruefung.zulaessig": "Admissible",
    "pruefung.ergebnis": "Résultat",
    "pruefung.erfuellt": "✓ respecté",
    "pruefung.nichtErfuellt": "✗ non respecté",

    "raum.kriterium": "Tient dans l'espace disponible",
    "raum.laenge": "Longueur",
    "raum.breite": "Largeur",
    "raum.vorgabe": "(espace disponible)",

    "druck.geschosshoehe": "Hauteur d'étage",
    "druck.laufbreite": "Emmarchement",
    "druck.raum": "Espace disponible",
    "druck.gebaeudeart": "Type de bâtiment : {wert}",
    "druck.form": "Forme : {wert}",
    "druck.raumSeite": "Espace disponible : {seite} {wert}",
    "raum.passt": "✓ tient",
    "raum.fehltLaenge": "{wert} en longueur",
    "raum.fehltBreite": "{wert} en largeur",
    "raum.und": " et ",
    "raum.fehlt": "Il manque {teile}.",
    "raum.urteilPasst": "✓ L'escalier tient dans l'espace disponible.",
    "raum.urteilPasstNicht": "✗ L'escalier ne tient pas dans l'espace disponible. {fehlt}",
    "raum.hinweis":
      "Vérification simplifiée : largeur nécessaire = emmarchement (sans limons, main courante " +
      "ni distance au mur) ; sans dégagement au départ et à l'arrivée.",

    "schnitt.titel": "Coupe",
    "schnitt.aria": "Coupe de l'escalier droit",
    "schnitt.legende":
      "Coupe, sans échelle · cotes en cm · {konstruktion} · épaisseur de dalle supposée {decke} cm · hachures simplifiées",
    "grundriss.titel": "Vue en plan",
    "grundriss.aria": "Vue en plan de l'escalier droit",
    "schnitt.titelAbwicklung": "Développement selon la ligne de foulée",
    "schnitt.ariaAbwicklung": "Développement de l’escalier selon la ligne de foulée",
    "schnitt.legendeAbwicklung":
      "Développement selon la ligne de foulée, sans échelle · cotes en cm · {konstruktion} · " +
      "épaisseur de dalle supposée {decke} cm · hachures simplifiées",
    "grundriss.ariaPodest": "Vue en plan de l’escalier avec palier",
    "grundriss.legende":
      "Vue en plan, sans échelle · cotes en cm · matériau : {material} · représentée sans murs ni main courante · " +
      "plan de coupe à env. 1 m au-dessus du sol (convention de dessin, pas une exigence de la norme)",

    "material.titel": "Matériau",
    "material.stahlbeton": "Béton armé",
    "material.holz": "Bois",
    "material.stahl": "Acier",
    "materialText.stahlbeton": "béton armé",
    "materialText.holz": "bois",
    "materialText.stahl": "acier",
    "konstruktion.laufplatte": "béton armé, épaisseur de paillasse supposée {platte} cm",
    "konstruktion.laufplatteAbwicklung": "béton armé, épaisseur de paillasse et de palier supposée {platte} cm",
    "konstruktion.wange":
      "escalier à limons en {material} : marches {tritt} cm, limons {wd} × {wh} cm (hypothèses, pas des valeurs de la norme) · " +
      "marches sans contremarches, contrôle des marches ouvertes non inclus",
    "konstruktion.wangeAbwicklung":
      "escalier à limons en {material} : marches et platelage du palier {tritt} cm, limons {wd} × {wh} cm " +
      "(hypothèses, pas des valeurs de la norme) · marches sans contremarches, contrôle des marches ouvertes non inclus",
    "grundriss.wangen": "limons hors de l’emmarchement, non pris en compte dans le contrôle de l’espace (simplifié)",
    "grundriss.augeVereinfacht": "simplifié : en {material}, il faudrait un jour d’escalier d’au moins {min} cm",
    "druck.material": "Matériau : {wert}",
    "zeichnung.material": "Matériau : {wert} (cotes supposées, pas des valeurs de la norme)",

    "zeichnung.lauflaenge": "Reculement {wert}",
    "zeichnung.podest": "Palier {wert}",
    "zeichnung.raum": "Espace {wert}",
    "zeichnung.fehlt": "manque {wert}",

    "export.titel": "Export",
    "export.schnitt": "Coupe",
    "export.grundriss": "Vue en plan",
    "export.drucken": "Imprimer / PDF",
    "export.hinweisDxf": "DXF : unité mm, échelle 1:1",

    "fuss.landesrecht":
      "Aide à l'orientation ; ne remplace pas une vérification selon les règlements de construction " +
      "des Länder allemands (Landesbauordnung).",
    "fuss.quelle":
      "Valeurs limites : DIN 18065:2020-08 (norme allemande relative aux escaliers), tableau 1 " +
      "(cité d'après WEKA-Fachportal, original non consulté).",
    "fuss.uebersetzung": "Traduction à titre indicatif ; seul le texte allemand de la norme fait foi.",
  },
};

let aktuelleSprache = gespeicherteSprache();

/** Liest die gespeicherte Sprache; ohne Speicher (z. B. privates Fenster) gilt Deutsch. */
function gespeicherteSprache() {
  try {
    const sprache = localStorage.getItem(SPRACHE_SPEICHERSCHLUESSEL);
    return sprache in SPRACHEN ? sprache : STANDARDSPRACHE;
  } catch {
    return STANDARDSPRACHE;
  }
}

/** Übersetzt einen Schlüssel und setzt Platzhalter wie {min} ein. */
function t(schluessel, werte = {}) {
  let text = TEXTE[aktuelleSprache][schluessel];
  if (text === undefined) {
    console.warn(`i18n: Schlüssel „${schluessel}“ fehlt in „${aktuelleSprache}“.`);
    text = TEXTE[STANDARDSPRACHE][schluessel] ?? schluessel;
  }
  return text.replace(/\{(\w+)\}/g, (platzhalter, name) => (name in werte ? String(werte[name]) : platzhalter));
}

/** Zahl mit fester Anzahl Nachkommastellen im Format der Sprache, z. B. 17,2 / 17.2 */
function zahl(wert, stellen = 1) {
  return wert.toLocaleString(SPRACHEN[aktuelleSprache].zahlenformat, {
    minimumFractionDigits: stellen,
    maximumFractionDigits: stellen,
  });
}

/** Zahl mit minStellen … maxStellen Nachkommastellen, z. B. 19,04 oder 400 */
function zahlFlexibel(wert, maxStellen, minStellen = 0) {
  return wert.toLocaleString(SPRACHEN[aktuelleSprache].zahlenformat, {
    minimumFractionDigits: minStellen,
    maximumFractionDigits: maxStellen,
  });
}

/** Überträgt die aktuelle Sprache auf alle statischen Texte der Seite. */
function uebersetzeSeite() {
  document.documentElement.lang = aktuelleSprache;
  for (const el of document.querySelectorAll("[data-i18n]")) {
    el.textContent = t(el.dataset.i18n);
    el.hidden = el.textContent === ""; // z. B. Übersetzungshinweis im Deutschen
  }
  for (const el of document.querySelectorAll("[data-i18n-aria]")) {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  }
  for (const knopf of document.querySelectorAll("[data-sprache]")) {
    knopf.setAttribute("aria-pressed", String(knopf.dataset.sprache === aktuelleSprache));
  }
}

/** Wechselt die Sprache, merkt sie im Browser und meldet den Wechsel (app.js zeichnet neu). */
function setzeSprache(sprache) {
  if (!(sprache in SPRACHEN) || sprache === aktuelleSprache) return;
  aktuelleSprache = sprache;
  try {
    localStorage.setItem(SPRACHE_SPEICHERSCHLUESSEL, sprache);
  } catch {
    // Speichern nicht möglich (z. B. privates Fenster) – Sprache gilt dann nur bis zum Neuladen.
  }
  uebersetzeSeite();
  document.dispatchEvent(new CustomEvent("sprachwechsel"));
}

for (const knopf of document.querySelectorAll("[data-sprache]")) {
  knopf.addEventListener("click", () => setzeSprache(knopf.dataset.sprache));
}
uebersetzeSeite();
