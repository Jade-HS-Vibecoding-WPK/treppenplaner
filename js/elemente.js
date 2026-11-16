/*
 * elemente.js – Geometrieliste für Schnitt und Grundriss.
 *
 * Zeichnungen werden zuerst als Liste einfacher Elemente berechnet und erst danach
 * ausgegeben (SVG am Bildschirm, später DXF und SVG-Export).
 *
 * Koordinaten: cm, y nach oben, Ursprung = Antritt (OKFF unten).
 * Jedes Element liegt auf einer Ebene (= DXF-Layer).
 *
 * Beschriftung (Schrift, Maßlinienabstände, Symbole) ist in Bildschirm-px festgelegt,
 * damit sie bei jedem Maßstab gleich groß erscheint. Mit cmProPx wird sie in cm
 * umgerechnet: am Bildschirm cmProPx = 1 / Maßstab, im Export ein fester Wert.
 */

const EBENE = {
  treppe: "TREPPE",
  decke: "DECKE",
  schraffur: "SCHRAFFUR",
  mass: "MASS",
  text: "TEXT",
  lauflinie: "LAUFLINIE",
  raum: "RAUM",
};

// Strichstärken und Schrift in px (nur SVG; im DXF legt das CAD-Programm sie je Ebene fest).
const STRICH = { decke: 2, schnitt: 1, mass: 0.5, schraffur: 0.4 };
const SCHRIFTGROESSE = 13;
const SCHRAFFUR_ABSTAND = 5; // px zwischen den Schraffurlinien (45°)

/**
 * Erzeugt eine leere Elementliste mit Methoden zum Hinzufügen.
 * Optionen: { fehlmass: true } (rot), { gestrichelt: true } (oberhalb der Schnittebene).
 */
function neueZeichenliste(cmProPx) {
  const elemente = [];
  const neu = (element) => { elemente.push(element); return element; };
  return {
    m: cmProPx,
    elemente,
    linie: (ebene, p1, p2, breite, optionen = {}) => neu({ typ: "linie", ebene, p1, p2, breite, ...optionen }),
    polylinie: (ebene, punkte, breite, optionen = {}) =>
      neu({ typ: "polylinie", ebene, punkte, breite, geschlossen: false, ...optionen }),
    /** Gefüllte Fläche (Pfeilspitze). */
    flaeche: (ebene, punkte, breite) => neu({ typ: "flaeche", ebene, punkte, breite }),
    kreis: (ebene, mitte, radius, breite) => neu({ typ: "kreis", ebene, mitte, radius, breite }),
    /** 45°-Schraffur innerhalb eines geschlossenen Umrisses (ohne Umrisslinie). */
    schraffur: (ebene, umriss) => neu({
      typ: "schraffur", ebene, umriss, winkel: 45, abstand: SCHRAFFUR_ABSTAND * cmProPx, breite: STRICH.schraffur,
    }),
    /** Text; position = Grundlinie, ausrichtung "links" | "mitte" | "rechts", drehung in Grad (gegen den Uhrzeigersinn). */
    text: (position, inhalt, optionen = {}) => neu({
      typ: "text", ebene: EBENE.text, position, inhalt,
      hoehe: SCHRIFTGROESSE * cmProPx, ausrichtung: "links", drehung: 0, ...optionen,
    }),
  };
}

/** Architektonischer Maßstrich (45°-Schrägstrich) am Punkt (x, y). */
function massstrich(z, x, y, optionen = {}) {
  const d = 4 * z.m;
  z.linie(EBENE.mass, [x - d, y - d], [x + d, y + d], STRICH.schnitt, optionen);
}

/** Horizontale Maßlinie bei y von x1 bis x2 (x1 < x2), Linie 5 px überstehend. */
function horizontalesMass(z, x1, x2, y, optionen = {}) {
  z.linie(EBENE.mass, [x1 - 5 * z.m, y], [x2 + 5 * z.m, y], STRICH.mass, optionen);
  massstrich(z, x1, y, optionen);
  massstrich(z, x2, y, optionen);
}

/** Vertikale Maßlinie bei x von y1 (unten) bis y2 (oben). */
function vertikalesMass(z, x, y1, y2, optionen = {}) {
  z.linie(EBENE.mass, [x, y1 - 5 * z.m], [x, y2 + 5 * z.m], STRICH.mass, optionen);
  massstrich(z, x, y1, optionen);
  massstrich(z, x, y2, optionen);
}

/** Maßhilfslinie (fein). */
function hilfslinie(z, p1, p2, optionen = {}) {
  z.linie(EBENE.mass, p1, p2, STRICH.mass, optionen);
}

/** Höhenkote: Dreieck mit Spitze auf der Linie, Text rechts daneben. */
function hoehenkote(z, x, y, beschriftung) {
  const m = z.m;
  z.polylinie(EBENE.mass, [[x, y], [x - 5 * m, y + 8 * m], [x + 5 * m, y + 8 * m]], STRICH.schnitt, { geschlossen: true });
  hilfslinie(z, [x - 5 * m, y + 8 * m], [x + 40 * m, y + 8 * m]);
  z.text([x + 8 * m, y + 11 * m], beschriftung);
}
