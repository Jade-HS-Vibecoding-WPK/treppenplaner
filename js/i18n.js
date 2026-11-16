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
    "urteil.normgerecht": "✓ Die Treppe erfüllt die geprüften Anforderungen der DIN 18065.",
    "urteil.keineLoesung":
      "✗ Für diese Geschosshöhe ist keine normgerechte gerade Treppe möglich. Gezeigt wird die nächstliegende Lösung.",
    "urteil.laufbreite": "✗ Die nutzbare Laufbreite unterschreitet das Mindestmaß nach DIN 18065.",

    "kriterium.steigung": "Steigung s",
    "kriterium.auftritt": "Auftritt a",
    "kriterium.schrittmass": "Schrittmaß 2s + a",
    "kriterium.laufbreite": "Nutzbare Laufbreite",

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
      "Schnitt, ohne Maßstab · Maße in cm · Laufplattendicke angenommen 18 cm · Deckendicke angenommen 20 cm",
    "grundriss.titel": "Grundriss",
    "grundriss.aria": "Grundriss der geraden Treppe",
    "grundriss.legende":
      "Grundriss, ohne Maßstab · Maße in cm · Darstellung ohne Wände/Handlauf · " +
      "Schnittführung ca. 1 m über Fußboden (Darstellungskonvention, keine Normvorgabe)",

    // Beschriftungen in den Zeichnungen (kurz, damit sie an die Maßlinien passen)
    "zeichnung.lauflaenge": "Lauflänge {wert}",
    "zeichnung.raum": "Raum {wert}",
    "zeichnung.fehlt": "fehlt {wert}",

    "fuss.landesrecht": "Orientierungshilfe, ersetzt keine Prüfung nach Landesbauordnung.",
    "fuss.quelle":
      "Grenzwerte: DIN 18065:2020-08, Tabelle 1 (zitiert nach WEKA-Fachportal, Original nicht eingesehen).",
    "fuss.uebersetzung": "", // im Deutschen nicht nötig (leer = ausgeblendet)
  },

  en: {
    "seite.untertitel": "Straight stair – design to DIN 18065 (German standard for stairs in buildings)",
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
    "urteil.normgerecht": "✓ The stair meets the checked requirements of DIN 18065.",
    "urteil.keineLoesung":
      "✗ No straight stair complying with DIN 18065 is possible for this storey height. The closest solution is shown.",
    "urteil.laufbreite": "✗ The clear width is below the minimum required by DIN 18065.",

    "kriterium.steigung": "Rise s",
    "kriterium.auftritt": "Going a",
    "kriterium.schrittmass": "2R + G rule (2s + a)",
    "kriterium.laufbreite": "Clear width",

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
      "Section, not to scale · dimensions in cm · waist thickness assumed 18 cm · slab thickness assumed 20 cm",
    "grundriss.titel": "Plan",
    "grundriss.aria": "Plan of the straight stair",
    "grundriss.legende":
      "Plan, not to scale · dimensions in cm · shown without walls/handrail · " +
      "cut approx. 1 m above floor (drawing convention, not a requirement of the standard)",

    "zeichnung.lauflaenge": "Total going {wert}",
    "zeichnung.raum": "Space {wert}",
    "zeichnung.fehlt": "missing {wert}",

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
    "urteil.normgerecht": "✓ L'escalier satisfait aux exigences vérifiées de la DIN 18065.",
    "urteil.keineLoesung":
      "✗ Aucun escalier droit conforme à la DIN 18065 n'est possible pour cette hauteur d'étage. " +
      "La solution la plus proche est affichée.",
    "urteil.laufbreite": "✗ L'emmarchement est inférieur au minimum exigé par la DIN 18065.",

    "kriterium.steigung": "Hauteur de marche s",
    "kriterium.auftritt": "Giron a",
    "kriterium.schrittmass": "Formule de Blondel (2s + a)",
    "kriterium.laufbreite": "Emmarchement (largeur utile)",

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
      "Coupe, sans échelle · cotes en cm · épaisseur de paillasse supposée 18 cm · épaisseur de dalle supposée 20 cm",
    "grundriss.titel": "Vue en plan",
    "grundriss.aria": "Vue en plan de l'escalier droit",
    "grundriss.legende":
      "Vue en plan, sans échelle · cotes en cm · représentée sans murs ni main courante · " +
      "plan de coupe à env. 1 m au-dessus du sol (convention de dessin, pas une exigence de la norme)",

    "zeichnung.lauflaenge": "Reculement {wert}",
    "zeichnung.raum": "Espace {wert}",
    "zeichnung.fehlt": "manque {wert}",

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
