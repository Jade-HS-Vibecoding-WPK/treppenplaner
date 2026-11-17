/*
 * berechnung.js – Berechnung und Normprüfung einer geraden Treppe.
 * Unabhängig von der Oberfläche; liest Grenzwerte nur aus DIN18065 (norm.js).
 *
 * Alle Werte werden exakt (ungerundet) berechnet und geprüft.
 * Gerundet wird nur bei der Anzeige (app.js, zeichnung.js, grundriss.js).
 */

// Toleranz für Gleitkomma-Vergleiche (z. B. 19.000000000000004 ≤ 19), weit unter 0,1 mm.
const RECHENTOLERANZ = 1e-9;

// Zielwert für 2s + a bei der Wahl der Stufenzahl.
// Keine Normvorgabe, sondern gängige Faustregel (z. B. s = 17 cm, a = 29 cm → 63 cm).
const ZIEL_SCHRITTMASS = 63;

// Bevorzugte Steigung bei mehreren gleich guten Lösungen (sonst würde die steilste gewählt).
// Keine Normvorgabe, sondern gängiges Komfortmaß (17/29-Treppe).
const ZIEL_STEIGUNG = 17;

/** Begrenzt einen Wert auf den Bereich [min, max]. */
function begrenze(wert, min, max) {
  return Math.min(Math.max(wert, min), max);
}

/** Wie weit liegt ein Wert außerhalb von [min, max]? 0 = innerhalb. */
function abweichung(wert, min, max) {
  if (wert < min - RECHENTOLERANZ) return min - wert;
  if (wert > max + RECHENTOLERANZ) return wert - max;
  return 0;
}

/**
 * Berechnet Steigung und Auftritt für eine bestimmte Anzahl Steigungen n (exakte Werte).
 * Der Auftritt wird aus der Schrittmaßregel abgeleitet und auf die Normgrenzen begrenzt.
 * Beispiel 300 cm, n = 18: s = 16,666…, a = 29,666…, Lauflänge = 17 · a = 504,33… cm.
 */
function varianteFuerStufenzahl(geschosshoehe, n, grenzen) {
  const steigung = geschosshoehe / n;
  const auftritt = begrenze(ZIEL_SCHRITTMASS - 2 * steigung, grenzen.auftritt.min, grenzen.auftritt.max);
  const schrittmass = 2 * steigung + auftritt;
  return { anzahlSteigungen: n, steigung, auftritt, schrittmass };
}

/**
 * Bewertet eine Variante: Normverstöße wiegen schwer,
 * danach zählt die Nähe zum Ziel-Schrittmaß und zur bevorzugten Steigung. Kleiner = besser.
 */
function bewertung(variante, grenzen) {
  const verstoss =
    abweichung(variante.steigung, grenzen.steigung.min, grenzen.steigung.max) +
    abweichung(variante.auftritt, grenzen.auftritt.min, grenzen.auftritt.max) +
    abweichung(variante.schrittmass, DIN18065.schrittmass.min, DIN18065.schrittmass.max);
  return (
    verstoss * 1000 +
    Math.abs(variante.schrittmass - ZIEL_SCHRITTMASS) +
    Math.abs(variante.steigung - ZIEL_STEIGUNG)
  );
}

/**
 * Erstellt die Liste der Normprüfungen für eine Variante.
 * Ohne Texte: `kriterium` ist ein Schlüssel für die Übersetzung (i18n.js, „kriterium.…“),
 * `grenze` enthält nur Zahlen ({min, max} oder {min}); den Text baut app.js.
 */
function pruefeVariante(variante, grenzen) {
  const sm = DIN18065.schrittmass;
  return [
    {
      kriterium: "steigung",
      wert: variante.steigung,
      grenze: { min: grenzen.steigung.min, max: grenzen.steigung.max },
      ok: abweichung(variante.steigung, grenzen.steigung.min, grenzen.steigung.max) === 0,
    },
    {
      kriterium: "auftritt",
      wert: variante.auftritt,
      grenze: { min: grenzen.auftritt.min, max: grenzen.auftritt.max },
      ok: abweichung(variante.auftritt, grenzen.auftritt.min, grenzen.auftritt.max) === 0,
    },
    {
      kriterium: "schrittmass",
      wert: variante.schrittmass,
      grenze: { min: sm.min, max: sm.max },
      ok: abweichung(variante.schrittmass, sm.min, sm.max) === 0,
    },
  ];
}

/** Prüft die nutzbare Laufbreite gegen das Mindestmaß der Gebäudeart. */
function pruefeLaufbreite(laufbreite, grenzen) {
  return {
    kriterium: "laufbreite",
    wert: laufbreite,
    grenze: { min: grenzen.laufbreiteMin },
    ok: laufbreite >= grenzen.laufbreiteMin,
  };
}

/**
 * Hauptfunktion: findet die beste gerade Treppe für eine Geschosshöhe.
 * @param {number} geschosshoehe in cm
 * @param {string} gebaeudeart Schlüssel aus DIN18065.gebaeudearten
 * @param {number} laufbreite nutzbare Laufbreite in cm (Eingabe des Nutzers)
 * @param {{laenge: number|null, breite: number|null}} [raumVorgabe] verfügbare Fläche (optional)
 */
function berechneGeradeTreppe(geschosshoehe, gebaeudeart, laufbreite, raumVorgabe = null) {
  const grenzen = DIN18065.gebaeudearten[gebaeudeart];

  // Alle sinnvollen Stufenzahlen durchprobieren (eine mehr als die flachste zulässige).
  const maxN = Math.ceil(geschosshoehe / grenzen.steigung.min) + 1;
  let beste = null;
  for (let n = 1; n <= maxN; n++) {
    const variante = varianteFuerStufenzahl(geschosshoehe, n, grenzen);
    variante.punkte = bewertung(variante, grenzen);
    if (!beste || variante.punkte < beste.punkte) beste = variante;
  }

  const anzahlAuftritte = beste.anzahlSteigungen - 1; // gerade Treppe: n − 1 Auftritte
  const stufenPruefungen = pruefeVariante(beste, grenzen);
  const pruefungen = [...stufenPruefungen, pruefeLaufbreite(laufbreite, grenzen)];
  const lauflaenge = anzahlAuftritte * beste.auftritt;

  // Footprint der geraden Treppe, vereinfacht: Breite = nutzbare Laufbreite.
  const raum = pruefeRaum({ laenge: lauflaenge, breite: laufbreite }, raumVorgabe);

  return {
    gebaeudeart, // Eingabe, für die Druckzeile „Eingabe“
    geschosshoehe,
    laufbreite,
    anzahlSteigungen: beste.anzahlSteigungen,
    anzahlAuftritte,
    steigung: beste.steigung,
    auftritt: beste.auftritt,
    schrittmass: beste.schrittmass,
    lauflaenge,
    pruefungen,
    raum, // null ohne Raumvorgabe; keine Normprüfung, fließt nicht in „normgerecht“ ein
    stufenNormgerecht: stufenPruefungen.every((p) => p.ok),
    normgerecht: pruefungen.every((p) => p.ok),
  };
}
