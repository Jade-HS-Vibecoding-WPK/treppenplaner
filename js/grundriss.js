/*
 * grundriss.js – Grundriss einer geraden Treppe.
 *
 * grundrissElemente() liefert eine Elementliste (elemente.js); zeichneGrundriss() gibt sie
 * als SVG aus. Maßstab und x-Lage werden vom Schnitt übernommen, damit der Grundriss
 * genau unter dem Schnitt liegt (Projektion).
 *
 * Geometrie in cm: x = Laufrichtung (0 = Antritt), y = quer zur Laufrichtung, nach oben.
 * Die Treppe liegt an der unteren Wand: y = 0 … Laufbreite.
 */

// Schnitthöhe des Grundrisses über Fußboden.
// Darstellungskonvention, keine Normvorgabe (vermutlich DIN 1356-1, Bauzeichnungen).
// TODO: Quelle prüfen
const GRUNDRISS_SCHNITTHOEHE = 100; // cm

// Darstellung in Pixeln
const GRUNDRISS_RAND = { oben: 24, unten: 56 };
const LAUFLINIE_STRICH = 0.75;
const NUMMER_SCHRIFTGROESSE = 12;
const LAUFLINIE_KREIS_RADIUS = 3.5;
const LAUFLINIE_PFEIL = { laenge: 9, halbeBreite: 3.5 };
const SCHNITTLINIE_UEBERSTAND = 8;    // px über die Treppenkante hinaus
const SCHNITTLINIE_ABSTAND = 4;       // px zwischen den beiden Linien
const RAUM_STRICH = 0.75;             // Begrenzung des verfügbaren Raums (fein)
const RAUMMASS_ABSTAND = 30;          // px zwischen Lauflängen- und Raummaßkette

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
      xAnfang: Math.max(mitte - halbeSpanne, 0), // bei y = B (der Wand gegenüber)
      xEnde: Math.min(mitte + halbeSpanne, L),   // bei y = 0 (an der Wand)
    };
  }

  return { n, a, L, B, setzstufen, schnittlinie, raum: raumGeometrie(ergebnis.raum, L, B) };
}

/**
 * Raumrechteck in cm: Antritt an der linken Raumkante, Treppe an der unteren Wand
 * (linke untere Ecke, Raum y = 0 … breite). Ohne Vorgabe in einer Richtung gilt dort das Treppenmaß.
 * Überstand = Teile der Treppe außerhalb des Raums (zwei sich nicht überlappende Rechtecke).
 */
function raumGeometrie(raum, L, B) {
  if (!raum) return null;
  const laenge = raum.vorgabe.laenge ?? L;
  const breite = raum.vorgabe.breite ?? B;
  const ueberstand = [];
  if (raum.fehlt.laenge > 0) ueberstand.push({ x1: laenge, x2: L, y1: 0, y2: B });
  if (raum.fehlt.breite > 0) ueberstand.push({ x1: 0, x2: Math.min(laenge, L), y1: breite, y2: B });
  return {
    laenge, breite,
    laengeVorgegeben: raum.vorgabe.laenge != null,
    breiteVorgegeben: raum.vorgabe.breite != null,
    fehlt: raum.fehlt,
    ueberstand,
  };
}

/** Raumrechteck (nur vorgegebene Seiten) und schraffierter Überstand der Treppe. */
function raumElemente(z, geo) {
  const r = geo.raum;
  for (const u of r.ueberstand) {
    z.schraffur(EBENE.raum, [[u.x1, u.y1], [u.x2, u.y1], [u.x2, u.y2], [u.x1, u.y2]]);
  }

  // Nur die vorgegebenen Begrenzungen zeichnen: Länge → Querwände, Breite → Längswände.
  const ecken = { lo: [0, r.breite], ro: [r.laenge, r.breite], lu: [0, 0], ru: [r.laenge, 0] };
  const strecke = (p, q) => z.linie(EBENE.raum, p, q, RAUM_STRICH);
  if (r.breiteVorgegeben) {
    strecke(ecken.lo, ecken.ro);
    strecke(ecken.lu, ecken.ru);
  }
  if (r.laengeVorgegeben) {
    strecke(ecken.lo, ecken.lu);
    strecke(ecken.ro, ecken.ru);
  }
}

/** Maßketten des Raums: Länge unter der Lauflänge, Breite rechts; Fehlmaße rot. */
function raumMassElemente(z, geo) {
  const r = geo.raum;
  const m = z.m;
  const rot = { fehlmass: true };

  if (r.laengeVorgegeben) {
    const y = -(26 + RAUMMASS_ABSTAND) * m;
    hilfslinie(z, [0, -4 * m], [0, y - 4 * m]);
    hilfslinie(z, [r.laenge, -4 * m], [r.laenge, y - 4 * m]);
    horizontalesMass(z, 0, r.laenge, y);
    const wertRaum = zahl(r.laenge);
    z.text([r.laenge / 2, y + 4 * m], masstext(z, t("zeichnung.raum", { wert: wertRaum }), wertRaum, r.laenge), {
      ausrichtung: "mitte",
    });
    if (r.fehlt.laenge > 0) {
      hilfslinie(z, [geo.L, -4 * m], [geo.L, y - 4 * m], rot);
      horizontalesMass(z, r.laenge, geo.L, y, rot);
      z.text([(r.laenge + geo.L) / 2, y - 16 * m], t("zeichnung.fehlt", { wert: zahl(r.fehlt.laenge) }), {
        ausrichtung: "mitte", ...rot,
      });
    }
  }

  if (r.breiteVorgegeben) {
    // Die Stufennummer n steht hinter der letzten Setzstufe (L … L + a) – Maßkette erst danach.
    const xRechts = Math.max(geo.L + geo.a, r.laenge);
    const x = xRechts + 30 * m;
    hilfslinie(z, [xRechts + 4 * m, 0], [x + 4 * m, 0]);
    hilfslinie(z, [xRechts + 4 * m, r.breite], [x + 4 * m, r.breite]);
    vertikalesMass(z, x, 0, r.breite);
    z.text([x - 4 * m, r.breite / 2], zahl(r.breite), { ausrichtung: "mitte", drehung: 90 });
    if (r.fehlt.breite > 0) {
      hilfslinie(z, [xRechts + 4 * m, geo.B], [x + 4 * m, geo.B], rot);
      vertikalesMass(z, x, r.breite, geo.B, rot);
      // rechts neben den Maßstrichen (± 4 px), damit der Text die Hilfslinien nicht berührt
      z.text([x + 18 * m, (r.breite + geo.B) / 2], t("zeichnung.fehlt", { wert: zahl(r.fehlt.breite) }), {
        ausrichtung: "mitte", drehung: 90, ...rot,
      });
    }
  }
}

/**
 * Teilt eine Strecke (in cm) an der Schnittlinie in den Teil unterhalb der
 * Schnittebene (durchgezogen) und den Teil darüber (gestrichelt).
 */
function teileAnSchnittlinie(p1, p2, geo) {
  const sl = geo.schnittlinie;
  if (!sl) return { unten: [p1, p2], oben: null };

  // f < 0: Punkt liegt vor der Schnittlinie (Antrittsseite) → unterhalb der Schnittebene
  const f = ([x, y]) => x - (sl.xAnfang + (sl.xEnde - sl.xAnfang) * (geo.B - y) / geo.B);
  const f1 = f(p1);
  const f2 = f(p2);
  if (f1 <= 0 && f2 <= 0) return { unten: [p1, p2], oben: null };
  if (f1 >= 0 && f2 >= 0) return { unten: null, oben: [p1, p2] };

  const anteil = f1 / (f1 - f2); // nicht „t“: das ist die Übersetzungsfunktion (i18n.js)
  const p = [p1[0] + anteil * (p2[0] - p1[0]), p1[1] + anteil * (p2[1] - p1[1])];
  return f1 < 0 ? { unten: [p1, p], oben: [p, p2] } : { unten: [p, p2], oben: [p1, p] };
}

/** Kante unterhalb der Schnittebene durchgezogen, darüber gestrichelt. */
function kante(z, geo, p1, p2, ebene = EBENE.treppe, breite = STRICH.schnitt) {
  const teile = teileAnSchnittlinie(p1, p2, geo);
  if (teile.unten) z.linie(ebene, ...teile.unten, breite);
  if (teile.oben) z.linie(ebene, ...teile.oben, breite, { gestrichelt: true });
}

/** Schnittlinie als Doppellinie, etwas über die Treppe hinaus verlängert. */
function schnittlinieElemente(z, geo) {
  const p1 = [geo.schnittlinie.xAnfang, geo.B];
  const p2 = [geo.schnittlinie.xEnde, 0];
  const laenge = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
  const u = SCHNITTLINIE_UEBERSTAND * z.m;
  const ux = (p2[0] - p1[0]) / laenge * u;
  const uy = (p2[1] - p1[1]) / laenge * u;
  for (const versatz of [0, SCHNITTLINIE_ABSTAND * z.m]) {
    z.linie(EBENE.treppe, [p1[0] - ux + versatz, p1[1] - uy], [p2[0] + ux + versatz, p2[1] + uy], STRICH.schnitt);
  }
}

/** Lauflinie in der Mitte: Kreis am Antritt, Pfeil am Austritt. */
function lauflinieElemente(z, geo) {
  const m = z.m;
  const yMitte = geo.B / 2;
  const radius = LAUFLINIE_KREIS_RADIUS * m;
  z.kreis(EBENE.lauflinie, [0, yMitte], radius, LAUFLINIE_STRICH);

  // Linie vom Kreisrand bis zum Pfeilansatz
  const xPfeil = geo.L - LAUFLINIE_PFEIL.laenge * m;
  kante(z, geo, [radius, yMitte], [xPfeil, yMitte], EBENE.lauflinie, LAUFLINIE_STRICH);

  // Gefüllter Pfeil, Spitze an der Austrittskante
  const h = LAUFLINIE_PFEIL.halbeBreite * m;
  z.flaeche(EBENE.lauflinie, [[geo.L, yMitte], [xPfeil, yMitte + h], [xPfeil, yMitte - h]], 0.5);
}

/** Stufennummern 1 … n (Steigungen), über der Lauflinie; n liegt an der oberen Deckenkante. */
function stufennummerElemente(z, geo) {
  const hoehe = Math.min(NUMMER_SCHRIFTGROESSE * z.m, geo.a / 1.3);
  for (let nr = 1; nr <= geo.n; nr++) {
    z.text([(nr - 0.5) * geo.a, geo.B / 2 + 5 * z.m], String(nr), { ausrichtung: "mitte", hoehe });
  }
}

/** Maßketten: Lauflänge unten, Laufbreite links – im Stil des Schnitts. */
function grundrissMassElemente(z, geo) {
  const m = z.m;

  // Lauflänge unten
  const yMassL = -26 * m;
  hilfslinie(z, [0, -4 * m], [0, yMassL - 4 * m]);
  hilfslinie(z, [geo.L, -4 * m], [geo.L, yMassL - 4 * m]);
  horizontalesMass(z, 0, geo.L, yMassL);
  const wertL = zahl(geo.L);
  z.text([geo.L / 2, yMassL + 4 * m], masstext(z, t("zeichnung.lauflaenge", { wert: wertL }), wertL, geo.L), {
    ausrichtung: "mitte",
  });

  // Laufbreite links
  const xMassB = -28 * m;
  hilfslinie(z, [-4 * m, geo.B], [xMassB - 4 * m, geo.B]);
  hilfslinie(z, [-4 * m, 0], [xMassB - 4 * m, 0]);
  vertikalesMass(z, xMassB, 0, geo.B);
  // Nur die Zahl (wie die Geschosshöhe im Schnitt) – „Laufbreite …“ passt bei schmalen Treppen nicht.
  z.text([xMassB - 4 * m, geo.B / 2], zahl(geo.B), { ausrichtung: "mitte", drehung: 90 });
}

/**
 * Elementliste des Grundrisses in cm.
 * @param {object} ergebnis Rückgabe von berechneGeradeTreppe()
 * @param {number} cmProPx Umrechnung der Beschriftungsgrößen (px) in cm
 */
function grundrissElemente(ergebnis, cmProPx) {
  const geo = grundrissGeometrie(ergebnis);
  const z = neueZeichenliste(cmProPx);

  if (geo.raum) raumElemente(z, geo); // zuerst, damit die Treppe darüber liegt

  // Seitliche Begrenzung des Laufs
  kante(z, geo, [0, geo.B], [geo.L, geo.B]);
  kante(z, geo, [0, 0], [geo.L, 0]);

  // Stufenvorderkanten
  for (const x of geo.setzstufen) kante(z, geo, [x, geo.B], [x, 0]);

  if (geo.schnittlinie) schnittlinieElemente(z, geo);
  lauflinieElemente(z, geo);
  stufennummerElemente(z, geo);
  grundrissMassElemente(z, geo);
  if (geo.raum) raumMassElemente(z, geo);

  return z.elemente;
}

/**
 * Zeichnet den Grundriss der berechneten Treppe.
 * @param {SVGSVGElement} svg
 * @param {object} ergebnis Rückgabe von berechneGeradeTreppe()
 * @param {object} abb Abbildung des Schnitts (Rückgabe von zeichneSchnitt())
 */
function zeichneGrundriss(svg, ergebnis, abb) {
  const geo = grundrissGeometrie(ergebnis);
  const k = abb.k;
  // Ist der Raum breiter als die Treppe, liegt seine obere Wand über der Treppe.
  const yMax = Math.max(geo.B, geo.raum?.breite ?? 0);
  const randUnten = GRUNDRISS_RAND.unten + (geo.raum?.laengeVorgegeben ? RAUMMASS_ABSTAND + 16 : 0);
  const hoehePx = GRUNDRISS_RAND.oben + yMax * k + randUnten;
  const px = ([x, y]) => [abb.x(x), GRUNDRISS_RAND.oben + (yMax - y) * k];

  // gleiche Breite wie der Schnitt → gleiche x-Lage
  zeichneElemente(svg, grundrissElemente(ergebnis, 1 / k), px, 1 / k, { breite: abb.breitePx, hoehe: hoehePx });
}
