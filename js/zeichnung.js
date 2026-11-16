/*
 * zeichnung.js – Schnitt einer geraden Treppe als SVG.
 *
 * Geometrie wird in cm berechnet (y nach oben, Ursprung = Antritt auf OKFF unten)
 * und dann in Pixel umgerechnet. Der Maßstab ergibt sich automatisch aus der
 * verfügbaren Breite; bei Größenänderung wird neu gezeichnet.
 */

// Zeichnungsannahmen – keine Normwerte.
const LAUFPLATTENDICKE = 18; // cm, Annahme (Vorgabe des Nutzers)
const DECKENDICKE = 20;      // cm, Annahme für die Darstellung der Geschossdecken
const DECKENUEBERSTAND = 60; // cm, sichtbare Decke vor bzw. hinter der Treppe

// Darstellung in Pixeln
const RAND = { links: 40, rechts: 56, oben: 36, unten: 60 };
const MAX_PX_PRO_CM = 2.5;   // sehr kleine Treppen nicht übergroß zeichnen
const MAX_HOEHE_PX = 560;    // sehr hohe Treppen nicht zu lang werden lassen (Mindestmaßstab hat Vorrang)
// Mindestmaßstab für die Lesbarkeit des Grundrisses (gilt für Schnitt und Grundriss gemeinsam).
// Reicht die Breite nicht, wird horizontal gescrollt.
// Gewählt so, dass Geschosshöhen von 250–350 cm auf einem Laptop (~950 px Zeichenbreite) ohne Scrollen passen.
const MIN_LAUFBREITE_PX = 90;  // Höhe des Treppenlaufs im Grundriss
const MIN_AUFTRITT_PX = 28;    // Platz für zweistellige Stufennummern (12 px)
const STRICH = { decke: 2, schnitt: 1, mass: 0.5, schraffur: 0.4 };
const SCHRIFTGROESSE = 13;

const SVG_NS = "http://www.w3.org/2000/svg";

/** Erzeugt ein SVG-Element mit Attributen und hängt es an. */
function svgElement(eltern, name, attribute = {}) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [schluessel, wert] of Object.entries(attribute)) el.setAttribute(schluessel, wert);
  eltern.appendChild(el);
  return el;
}

/** Zahl im deutschen Format, z. B. 17,2 */
function zahl(wert, stellen = 1) {
  return wert.toLocaleString("de-DE", { minimumFractionDigits: stellen, maximumFractionDigits: stellen });
}

/** Berechnet alle Punkte des Schnitts in cm. */
function schnittGeometrie(ergebnis) {
  const H = ergebnis.geschosshoehe;
  const n = ergebnis.anzahlSteigungen;
  const s = H / n;              // exakter Wert, damit die letzte Stufe genau auf OKFF oben trifft
  const a = ergebnis.auftritt;
  const L = (n - 1) * a;

  // Stufenprofil: n Steigungen, n − 1 Auftritte
  const profil = [[0, 0]];
  for (let i = 0; i < n; i++) {
    profil.push([i * a, (i + 1) * s]);
    if (i < n - 1) profil.push([(i + 1) * a, (i + 1) * s]);
  }

  // Unterseite der Laufplatte: parallel zur Linie durch die Stufenkehlen (y = s/a · x),
  // senkrecht gemessen um LAUFPLATTENDICKE versetzt.
  const steigungsVerhaeltnis = s / a;
  const vertikalerVersatz = LAUFPLATTENDICKE * Math.hypot(a, s) / a;
  const xUnterseiteUnten = vertikalerVersatz / steigungsVerhaeltnis;                  // trifft OKFF unten
  const xUnterseiteOben = (H - DECKENDICKE + vertikalerVersatz) / steigungsVerhaeltnis; // trifft Deckenunterseite oben

  // Ist der verfügbare Raum länger als die Treppe, reicht die Zeichnung bis zum Raumende,
  // damit der Grundriss (gleiche x-Achse) das Raumrechteck vollständig zeigt.
  const raumLaenge = ergebnis.raum?.vorgabe.laenge ?? 0;
  const xEnde = Math.max(L + DECKENUEBERSTAND, xUnterseiteOben + 40, raumLaenge);

  // Treppe und obere Decke als ein geschnittener Körper
  const treppeUndDecke = [
    ...profil,
    [xEnde, H],
    [xEnde, H - DECKENDICKE],
    [xUnterseiteOben, H - DECKENDICKE],
    [xUnterseiteUnten, 0],
  ];

  const untereDecke = [
    [-DECKENUEBERSTAND, 0],
    [xEnde, 0],
    [xEnde, -DECKENDICKE],
    [-DECKENUEBERSTAND, -DECKENDICKE],
  ];

  return {
    H, n, s, a, L, xEnde, treppeUndDecke, untereDecke,
    bereich: { xMin: -DECKENUEBERSTAND, xMax: xEnde, yMin: -DECKENDICKE, yMax: H },
  };
}

/** Kleinster Maßstab (px/cm), bei dem Grundriss und Stufennummern lesbar bleiben. */
function mindestMassstab(ergebnis) {
  return Math.min(
    Math.max(MIN_LAUFBREITE_PX / ergebnis.laufbreite, MIN_AUFTRITT_PX / ergebnis.auftritt),
    MAX_PX_PRO_CM
  );
}

/**
 * Legt Maßstab und Umrechnung cm → px fest.
 * Der Maßstab füllt die verfügbare Breite, unterschreitet aber nie kMin;
 * dann wird die Zeichnung breiter als der Container (horizontal scrollbar).
 */
function erstelleAbbildung(bereich, breitePx, kMin) {
  const breiteCm = bereich.xMax - bereich.xMin;
  const hoeheCm = bereich.yMax - bereich.yMin;
  const kPasst = Math.min(
    (breitePx - RAND.links - RAND.rechts) / breiteCm,
    (MAX_HOEHE_PX - RAND.oben - RAND.unten) / hoeheCm,
    MAX_PX_PRO_CM
  );
  const k = Math.max(kPasst, kMin);
  return {
    k,
    x: (x) => RAND.links + (x - bereich.xMin) * k,
    y: (y) => RAND.oben + (bereich.yMax - y) * k,
    breitePx: Math.max(breitePx, Math.ceil(RAND.links + breiteCm * k + RAND.rechts)),
    hoehePx: RAND.oben + hoeheCm * k + RAND.unten,
  };
}

function punkteText(punkte, abb) {
  return punkte.map(([x, y]) => `${abb.x(x).toFixed(2)},${abb.y(y).toFixed(2)}`).join(" ");
}

function linie(g, x1, y1, x2, y2, breite) {
  return svgElement(g, "line", { x1, y1, x2, y2, "stroke-width": breite });
}

function text(g, x, y, inhalt, attribute = {}) {
  const el = svgElement(g, "text", { x, y, ...attribute });
  el.textContent = inhalt;
  return el;
}

/** Architektonischer Maßstrich (45°-Schrägstrich) an Punkt (x, y) in px. */
function massstrich(g, x, y) {
  linie(g, x - 4, y + 4, x + 4, y - 4, STRICH.schnitt);
}

/** Horizontale Maßlinie in px bei y, von x1 bis x2 (y-Achse nach unten, x1 < x2). */
function horizontalesMass(g, x1, x2, y) {
  linie(g, x1 - 5, y, x2 + 5, y, STRICH.mass);
  massstrich(g, x1, y);
  massstrich(g, x2, y);
}

/** Vertikale Maßlinie in px bei x, von y1 (unten) bis y2 (oben). */
function vertikalesMass(g, x, y1, y2) {
  linie(g, x, y1 + 5, x, y2 - 5, STRICH.mass);
  massstrich(g, x, y1);
  massstrich(g, x, y2);
}

/** Höhenkote: Dreieck mit Spitze auf der Linie, Text rechts daneben. */
function hoehenkote(g, schrift, x, y, beschriftung) {
  svgElement(g, "polygon", {
    points: `${x},${y} ${x - 5},${y - 8} ${x + 5},${y - 8}`,
    "stroke-width": STRICH.schnitt,
  });
  linie(g, x - 5, y - 8, x + 40, y - 8, STRICH.mass);
  text(schrift, x + 8, y - 11, beschriftung);
}

/**
 * Zeichnet den Schnitt der berechneten Treppe in das übergebene SVG-Element.
 * @param {SVGSVGElement} svg
 * @param {object} ergebnis Rückgabe von berechneGeradeTreppe()
 * @param {number} breitePx sichtbare Breite der Zeichenfläche
 */
function zeichneSchnitt(svg, ergebnis, breitePx) {
  const geo = schnittGeometrie(ergebnis);
  const abb = erstelleAbbildung(geo.bereich, breitePx, mindestMassstab(ergebnis));

  svg.replaceChildren();
  svg.setAttribute("viewBox", `0 0 ${abb.breitePx} ${abb.hoehePx.toFixed(0)}`);
  svg.setAttribute("width", abb.breitePx);
  svg.setAttribute("height", abb.hoehePx.toFixed(0));

  // Schraffur für geschnittene Bauteile
  const defs = svgElement(svg, "defs");
  const muster = svgElement(defs, "pattern", {
    id: "schraffur", patternUnits: "userSpaceOnUse", width: 5, height: 5, patternTransform: "rotate(45)",
  });
  svgElement(muster, "line", {
    x1: 0, y1: 0, x2: 0, y2: 5, stroke: "currentColor", "stroke-width": STRICH.schraffur,
  });

  const g = svgElement(svg, "g", { stroke: "currentColor", fill: "none", "stroke-linecap": "square" });
  const schrift = svgElement(svg, "g", { fill: "currentColor", "font-size": SCHRIFTGROESSE });

  // Geschnittene Bauteile
  svgElement(g, "polygon", {
    points: punkteText(geo.untereDecke, abb), fill: "url(#schraffur)", "stroke-width": STRICH.schnitt,
  });
  svgElement(g, "polygon", {
    points: punkteText(geo.treppeUndDecke, abb), fill: "url(#schraffur)", "stroke-width": STRICH.schnitt,
    "stroke-linejoin": "miter",
  });

  // Fußbodenoberkanten kräftig
  linie(g, abb.x(geo.bereich.xMin), abb.y(0), abb.x(geo.xEnde), abb.y(0), STRICH.decke);
  linie(g, abb.x(geo.L), abb.y(geo.H), abb.x(geo.xEnde), abb.y(geo.H), STRICH.decke);

  // Höhenkoten übereinander am rechten Rand (unter der oberen Decke ist Platz für ± 0,00)
  const xKote = Math.max(abb.x(geo.xEnde) - 45, abb.x(geo.L) + 22);
  hoehenkote(g, schrift, xKote, abb.y(0), "± 0,00");
  hoehenkote(g, schrift, xKote, abb.y(geo.H), "+ " + zahl(geo.H / 100, 2));

  // Geschosshöhe rechts
  const xMassRechts = abb.x(geo.xEnde) + 28;
  linie(g, abb.x(geo.xEnde) + 4, abb.y(0), xMassRechts + 4, abb.y(0), STRICH.mass);
  linie(g, abb.x(geo.xEnde) + 4, abb.y(geo.H), xMassRechts + 4, abb.y(geo.H), STRICH.mass);
  vertikalesMass(g, xMassRechts, abb.y(0), abb.y(geo.H));
  const yMitte = (abb.y(0) + abb.y(geo.H)) / 2;
  text(schrift, xMassRechts + 14, yMitte, zahl(geo.H), {
    "text-anchor": "middle",
    transform: `rotate(-90 ${xMassRechts + 14} ${yMitte})`,
  });

  // s und a an der obersten Stufe – darüber ist der Luftraum frei
  const xRiss = abb.x(geo.L);                // letzte Setzstufe
  const xVorderkante = abb.x(geo.L - geo.a); // Vorderkante der obersten Trittstufe
  const yTritt = abb.y(geo.H - geo.s);       // oberste Trittstufe
  const yOben = abb.y(geo.H);                // OKFF oben

  // Steigung s: links der letzten Setzstufe
  const xMassS = xRiss - 14;
  linie(g, xRiss - 3, yOben, xMassS - 4, yOben, STRICH.mass);
  vertikalesMass(g, xMassS, yTritt, yOben);
  // Text links an der Hilfslinie von a vorbei, damit nichts kreuzt
  const xTextS = Math.min(xMassS - 6, xVorderkante - 6);
  text(schrift, xTextS, (yTritt + yOben) / 2 + 4, "s = " + zahl(ergebnis.steigung), {
    "text-anchor": "end",
  });

  // Auftritt a: über der obersten Trittstufe, Beschriftung links
  const yMassA = yOben - 16;
  linie(g, xVorderkante, yTritt - 3, xVorderkante, yMassA - 4, STRICH.mass);
  linie(g, xRiss, yOben - 3, xRiss, yMassA - 4, STRICH.mass);
  horizontalesMass(g, xVorderkante, xRiss, yMassA);
  text(schrift, xVorderkante - 8, yMassA + 4, "a = " + zahl(ergebnis.auftritt), { "text-anchor": "end" });

  // Lauflänge unten, unter der Decke
  const x0 = abb.x(0);
  const yDeckeUnten = abb.y(-DECKENDICKE);
  const yMassL = yDeckeUnten + 26;
  linie(g, x0, yDeckeUnten + 4, x0, yMassL + 4, STRICH.mass);
  linie(g, xRiss, yDeckeUnten + 4, xRiss, yMassL + 4, STRICH.mass);
  horizontalesMass(g, x0, xRiss, yMassL);
  text(schrift, (x0 + xRiss) / 2, yMassL - 4, "Lauflänge " + zahl(ergebnis.lauflaenge), {
    "text-anchor": "middle",
  });

  // Abbildung zurückgeben, damit der Grundriss mit gleichem Maßstab darunter liegt.
  return abb;
}
