/*
 * grundriss.js – Grundriss einer geraden Treppe als SVG.
 *
 * Nutzt Hilfsfunktionen und Strichstärken aus zeichnung.js.
 * Maßstab und x-Lage werden vom Schnitt übernommen, damit der Grundriss
 * genau unter dem Schnitt liegt (Projektion).
 *
 * Geometrie in cm: x = Laufrichtung (0 = Antritt), y = quer zur Laufrichtung (0 … Laufbreite).
 */

// Schnitthöhe des Grundrisses über Fußboden.
// Darstellungskonvention, keine Normvorgabe (vermutlich DIN 1356-1, Bauzeichnungen).
// TODO: Quelle prüfen
const GRUNDRISS_SCHNITTHOEHE = 100; // cm

// Darstellung in Pixeln
const GRUNDRISS_RAND = { oben: 24, unten: 56 };
const STRICHELUNG = "5 3";            // Teile oberhalb der Schnittebene
const LAUFLINIE_STRICH = 0.75;
const NUMMER_SCHRIFTGROESSE = 12;
const LAUFLINIE_KREIS_RADIUS = 3.5;
const LAUFLINIE_PFEIL = { laenge: 9, halbeBreite: 3.5 };
const SCHNITTLINIE_UEBERSTAND = 8;    // px über die Treppenkante hinaus
const SCHNITTLINIE_ABSTAND = 4;       // px zwischen den beiden Linien

/** Berechnet die Grundrissgeometrie in cm. */
function grundrissGeometrie(ergebnis) {
  const n = ergebnis.anzahlSteigungen;
  const a = ergebnis.auftritt;
  const s = ergebnis.geschosshoehe / n;
  const L = (n - 1) * a;
  const B = ergebnis.laufbreite;

  // Vorderkanten der Stufen (Setzstufen) – die letzte liegt an der oberen Deckenkante.
  const setzstufen = Array.from({ length: n }, (_, i) => i * a);

  // Erste Stufe, deren Oberkante die Schnitthöhe erreicht. Die Schnittebene trifft deren
  // Setzstufe; dort (zwischen zwei Stufennummern) kreuzt die Schnittlinie die Lauflinie.
  const stufeImSchnitt = Math.ceil(GRUNDRISS_SCHNITTHOEHE / s - 1e-9);
  let schnittlinie = null;
  if (stufeImSchnitt <= n - 1) {
    const mitte = (stufeImSchnitt - 1) * a;
    const halbeSpanne = Math.max(1.5 * a, 0.5 * B) / 2;
    schnittlinie = {
      xAnfang: Math.max(mitte - halbeSpanne, 0), // bei y = 0
      xEnde: Math.min(mitte + halbeSpanne, L),   // bei y = B
    };
  }

  return { n, a, L, B, setzstufen, schnittlinie };
}

/**
 * Teilt eine Strecke (in cm) an der Schnittlinie in den Teil unterhalb der
 * Schnittebene (durchgezogen) und den Teil darüber (gestrichelt).
 */
function teileAnSchnittlinie(p1, p2, geo) {
  const sl = geo.schnittlinie;
  if (!sl) return { unten: [p1, p2], oben: null };

  // f < 0: Punkt liegt vor der Schnittlinie (Antrittsseite) → unterhalb der Schnittebene
  const f = ([x, y]) => x - (sl.xAnfang + (sl.xEnde - sl.xAnfang) * y / geo.B);
  const f1 = f(p1);
  const f2 = f(p2);
  if (f1 <= 0 && f2 <= 0) return { unten: [p1, p2], oben: null };
  if (f1 >= 0 && f2 >= 0) return { unten: null, oben: [p1, p2] };

  const t = f1 / (f1 - f2);
  const p = [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])];
  return f1 < 0 ? { unten: [p1, p], oben: [p, p2] } : { unten: [p, p2], oben: [p1, p] };
}

/** Zeichnet die Schnittlinie als Doppellinie, etwas über die Treppe hinaus verlängert. */
function zeichneSchnittlinie(g, geo, px) {
  const [x1, y1] = px([geo.schnittlinie.xAnfang, 0]);
  const [x2, y2] = px([geo.schnittlinie.xEnde, geo.B]);
  const laenge = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / laenge;
  const uy = (y2 - y1) / laenge;
  const u = SCHNITTLINIE_UEBERSTAND;
  for (const versatz of [0, SCHNITTLINIE_ABSTAND]) {
    linie(g, x1 - ux * u + versatz, y1 - uy * u, x2 + ux * u + versatz, y2 + uy * u, STRICH.schnitt);
  }
}

/** Lauflinie in der Mitte: Kreis am Antritt, Pfeil am Austritt. */
function zeichneLauflinie(g, geo, px, kante, k) {
  const yMitte = geo.B / 2;
  const [xKreis, yKreis] = px([0, yMitte]);
  svgElement(g, "circle", {
    cx: xKreis, cy: yKreis, r: LAUFLINIE_KREIS_RADIUS, "stroke-width": LAUFLINIE_STRICH,
  });

  // Linie vom Kreisrand bis zum Pfeilansatz
  const xStart = LAUFLINIE_KREIS_RADIUS / k;
  const xPfeil = geo.L - LAUFLINIE_PFEIL.laenge / k;
  kante([xStart, yMitte], [xPfeil, yMitte], LAUFLINIE_STRICH);

  // Gefüllter Pfeil, Spitze an der Austrittskante
  const [xSpitze, ySpitze] = px([geo.L, yMitte]);
  const xBasis = xSpitze - LAUFLINIE_PFEIL.laenge;
  const h = LAUFLINIE_PFEIL.halbeBreite;
  svgElement(g, "polygon", {
    points: `${xSpitze},${ySpitze} ${xBasis},${ySpitze - h} ${xBasis},${ySpitze + h}`,
    fill: "currentColor", "stroke-width": 0.5,
  });
}

/** Stufennummern 1 … n (Steigungen), über der Lauflinie; n liegt an der oberen Deckenkante. */
function zeichneStufennummern(schrift, geo, px, k) {
  const schriftgroesse = Math.min(NUMMER_SCHRIFTGROESSE, (geo.a * k) / 1.3);
  for (let nr = 1; nr <= geo.n; nr++) {
    const [x, y] = px([(nr - 0.5) * geo.a, geo.B / 2]);
    text(schrift, x, y - 5, String(nr), { "text-anchor": "middle", "font-size": schriftgroesse.toFixed(1) });
  }
}

/** Maßketten: Lauflänge unten, Laufbreite links – im Stil des Schnitts. */
function zeichneGrundrissMasse(g, schrift, geo, px) {
  const [x0, yOben] = px([0, 0]);
  const [xL, yUnten] = px([geo.L, geo.B]);

  // Lauflänge unten
  const yMassL = yUnten + 26;
  linie(g, x0, yUnten + 4, x0, yMassL + 4, STRICH.mass);
  linie(g, xL, yUnten + 4, xL, yMassL + 4, STRICH.mass);
  horizontalesMass(g, x0, xL, yMassL);
  text(schrift, (x0 + xL) / 2, yMassL - 4, "Lauflänge " + zahl(geo.L), { "text-anchor": "middle" });

  // Laufbreite links
  const xMassB = x0 - 28;
  linie(g, x0 - 4, yOben, xMassB - 4, yOben, STRICH.mass);
  linie(g, x0 - 4, yUnten, xMassB - 4, yUnten, STRICH.mass);
  vertikalesMass(g, xMassB, yUnten, yOben);
  const yMitte = (yOben + yUnten) / 2;
  // Nur die Zahl (wie die Geschosshöhe im Schnitt) – „Laufbreite …“ passt bei schmalen Treppen nicht.
  text(schrift, xMassB - 4, yMitte, zahl(geo.B), {
    "text-anchor": "middle",
    transform: `rotate(-90 ${xMassB - 4} ${yMitte})`,
  });
}

/**
 * Zeichnet den Grundriss der berechneten Treppe.
 * @param {SVGSVGElement} svg
 * @param {object} ergebnis Rückgabe von berechneGeradeTreppe()
 * @param {object} abb Abbildung des Schnitts (Rückgabe von zeichneSchnitt())
 */
function zeichneGrundriss(svg, ergebnis, abb) {
  const breitePx = abb.breitePx; // gleiche Breite wie der Schnitt → gleiche x-Lage
  const geo = grundrissGeometrie(ergebnis);
  const k = abb.k;
  const hoehePx = GRUNDRISS_RAND.oben + geo.B * k + GRUNDRISS_RAND.unten;
  const px = ([x, y]) => [abb.x(x), GRUNDRISS_RAND.oben + y * k];

  svg.replaceChildren();
  svg.setAttribute("viewBox", `0 0 ${breitePx} ${hoehePx.toFixed(0)}`);
  svg.setAttribute("width", breitePx);
  svg.setAttribute("height", hoehePx.toFixed(0));

  const g = svgElement(svg, "g", { stroke: "currentColor", fill: "none", "stroke-linecap": "square" });
  const schrift = svgElement(svg, "g", { fill: "currentColor", "font-size": SCHRIFTGROESSE });

  /** Kante unterhalb der Schnittebene durchgezogen, darüber gestrichelt. */
  function kante(p1, p2, breite = STRICH.schnitt) {
    const teile = teileAnSchnittlinie(p1, p2, geo);
    if (teile.unten) {
      const [a, b] = teile.unten.map(px);
      linie(g, a[0], a[1], b[0], b[1], breite);
    }
    if (teile.oben) {
      const [a, b] = teile.oben.map(px);
      const l = linie(g, a[0], a[1], b[0], b[1], breite);
      l.setAttribute("stroke-dasharray", STRICHELUNG);
      l.setAttribute("stroke-linecap", "butt");
    }
  }

  // Seitliche Begrenzung des Laufs
  kante([0, 0], [geo.L, 0]);
  kante([0, geo.B], [geo.L, geo.B]);

  // Stufenvorderkanten
  for (const x of geo.setzstufen) kante([x, 0], [x, geo.B]);

  if (geo.schnittlinie) zeichneSchnittlinie(g, geo, px);
  zeichneLauflinie(g, geo, px, kante, k);
  zeichneStufennummern(schrift, geo, px, k);
  zeichneGrundrissMasse(g, schrift, geo, px);
}
