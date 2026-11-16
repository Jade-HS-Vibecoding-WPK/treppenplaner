/*
 * berechnung.js – Berechnung und Normprüfung einer geraden Treppe.
 * Unabhängig von der Oberfläche; liest Grenzwerte nur aus DIN18065 (norm.js).
 */

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

/** Rundet auf eine Nachkommastelle (Millimeter). */
function rundeMm(wert) {
  return Math.round(wert * 10) / 10;
}

/** Wie weit liegt ein Wert außerhalb von [min, max]? 0 = innerhalb. */
function abweichung(wert, min, max) {
  if (wert < min) return min - wert;
  if (wert > max) return wert - max;
  return 0;
}

/**
 * Berechnet Steigung und Auftritt für eine bestimmte Anzahl Steigungen n.
 * Der Auftritt wird aus der Schrittmaßregel abgeleitet und auf die Normgrenzen begrenzt.
 */
function varianteFuerStufenzahl(geschosshoehe, n, grenzen) {
  // Mit der exakten Steigung weiterrechnen und erst am Ende runden,
  // sonst addieren sich Rundungsfehler (z. B. 300 / 18: a = 29,7 statt 29,6).
  const steigungExakt = geschosshoehe / n;
  const auftritt = rundeMm(
    begrenze(ZIEL_SCHRITTMASS - 2 * steigungExakt, grenzen.auftritt.min, grenzen.auftritt.max)
  );
  const schrittmass = rundeMm(2 * steigungExakt + auftritt);
  return { anzahlSteigungen: n, steigung: rundeMm(steigungExakt), auftritt, schrittmass };
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

/** Erstellt die Liste der Normprüfungen für eine Variante. */
function pruefeVariante(variante, grenzen) {
  const sm = DIN18065.schrittmass;
  return [
    {
      bezeichnung: "Steigung s",
      wert: variante.steigung,
      grenze: `${grenzen.steigung.min}–${grenzen.steigung.max} cm`,
      ok: abweichung(variante.steigung, grenzen.steigung.min, grenzen.steigung.max) === 0,
    },
    {
      bezeichnung: "Auftritt a",
      wert: variante.auftritt,
      grenze: `${grenzen.auftritt.min}–${grenzen.auftritt.max} cm`,
      ok: abweichung(variante.auftritt, grenzen.auftritt.min, grenzen.auftritt.max) === 0,
    },
    {
      bezeichnung: "Schrittmaß 2s + a",
      wert: variante.schrittmass,
      grenze: `${sm.min}–${sm.max} cm`,
      ok: abweichung(variante.schrittmass, sm.min, sm.max) === 0,
    },
  ];
}

/** Prüft die nutzbare Laufbreite gegen das Mindestmaß der Gebäudeart. */
function pruefeLaufbreite(laufbreite, grenzen) {
  return {
    bezeichnung: "Nutzbare Laufbreite",
    wert: laufbreite,
    grenze: `≥ ${grenzen.laufbreiteMin} cm`,
    ok: laufbreite >= grenzen.laufbreiteMin,
  };
}

/**
 * Hauptfunktion: findet die beste gerade Treppe für eine Geschosshöhe.
 * @param {number} geschosshoehe in cm
 * @param {string} gebaeudeart Schlüssel aus DIN18065.gebaeudearten
 * @param {number} laufbreite nutzbare Laufbreite in cm (Eingabe des Nutzers)
 */
function berechneGeradeTreppe(geschosshoehe, gebaeudeart, laufbreite) {
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

  return {
    geschosshoehe,
    laufbreite,
    anzahlSteigungen: beste.anzahlSteigungen,
    anzahlAuftritte,
    steigung: beste.steigung,
    auftritt: beste.auftritt,
    schrittmass: beste.schrittmass,
    lauflaenge: rundeMm(anzahlAuftritte * beste.auftritt),
    pruefungen,
    stufenNormgerecht: stufenPruefungen.every((p) => p.ok),
    normgerecht: pruefungen.every((p) => p.ok),
  };
}
