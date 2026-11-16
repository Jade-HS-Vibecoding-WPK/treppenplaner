/*
 * raum.js – Prüft, ob ein rechteckiger Footprint in den verfügbaren Raum passt.
 *
 * Allgemein gehalten: gilt für jede Treppenform, deren Grundriss sich als
 * Rechteck Länge × Breite beschreiben lässt (gerade, L- und U-Treppe).
 * Keine Normprüfung – die Maße sind eine Vorgabe des Nutzers (Raumvorgabe).
 *
 * Alle Maße in cm.
 */

// Plausibilitätsgrenzen der Eingabe (kein Normwert)
const RAUMMASS_MIN = 50;
const RAUMMASS_MAX = 2000;

/**
 * @param {{laenge: number, breite: number}} footprint benötigte Fläche
 * @param {{laenge: number|null, breite: number|null}} vorgabe verfügbare Fläche; null = keine Vorgabe
 * @returns {null | {footprint, vorgabe, fehlt: {laenge: number, breite: number}, passt: boolean}}
 *          null, wenn weder Länge noch Breite vorgegeben ist.
 */
function pruefeRaum(footprint, vorgabe) {
  if (!vorgabe || (vorgabe.laenge == null && vorgabe.breite == null)) return null;

  const fehlt = {
    laenge: fehlendesMass(footprint.laenge, vorgabe.laenge),
    breite: fehlendesMass(footprint.breite, vorgabe.breite),
  };
  return { footprint, vorgabe, fehlt, passt: fehlt.laenge === 0 && fehlt.breite === 0 };
}

/** Fehlendes Maß in cm (0, wenn es passt oder nichts vorgegeben ist). Toleranz gegen Gleitkommafehler. */
function fehlendesMass(benoetigt, verfuegbar) {
  if (verfuegbar == null) return 0;
  const differenz = benoetigt - verfuegbar;
  return differenz > RECHENTOLERANZ ? differenz : 0; // RECHENTOLERANZ aus berechnung.js
}
