/*
 * spindelgrundriss.js – Grundriss der Spindeltreppe (Elementliste wie grundriss.js).
 *
 * Lage aus spindelLage() (spindeltreppe.js): Mittelpunkt in der Mitte des Quadrats D × D,
 * Antritt unten, Drehsinn links (gegen den Uhrzeigersinn) oder rechts.
 * Stufen werden mit k gezählt: Setzstufe k (0 = Antritt … n − 1 = Austritt auf die obere Decke),
 * Stufennummer j steht bei k = j − 0,5. Winkel = k · 360° / Teilung.
 *
 * Darstellung (vereinfacht):
 *  - Setzstufen als radiale Linien von der Spindel bis zur äußeren Begrenzung der nutzbaren
 *    Laufbreite; nur eine Umdrehung – bei ganzzahliger Teilung liegen die Kanten der zweiten
 *    Umdrehung genau darauf (überdeckte Kanten werden nicht doppelt gezeichnet).
 *  - Außenkante der Stufen (Radius Ra) und Geländer (Außendurchmesser D) als Bögen.
 *  - Spindel geschnitten, mit Materialschraffur (material.js).
 *  - Schnittlinie schräg über die Setzstufe, die die Schnittebene (ca. 1 m) trifft; alles danach
 *    gestrichelt (wie bei den anderen Formen).
 *  - Stufennummern: erste Umdrehung außen, zweite auf einem inneren Ring, ab der dritten nur
 *    noch die letzte Nummer.
 *  - Lauflinie: Kreis am Antritt, Pfeil am Austritt; die zweite Umdrehung liegt auf der ersten
 *    und wird nicht noch einmal gezeichnet (nur der Pfeil).
 */

const SPINDEL_SCHNITTLINIE_NEIGUNG = 0.25; // Stufen: Schnittlinie von k − 0,25 (innen) bis k + 0,25 (außen)
const SPINDEL_MASS_VERSATZ = 0.25;         // Stufen: radiale Maßlinien neben einer Setzstufe (nicht auf den Nummern)
const SPINDEL_KREIS_SEGMENTE = 48;          // Umriss der Spindel für Schraffur/Füllung

/** Grad gegen den Uhrzeigersinn für die Setzstufe k. */
function spindelGrad(lage, k) {
  return (lage.winkel(k) * 180) / Math.PI;
}

/** Bogen von Stufe k1 bis k2 (k1 < k2) – unabhängig vom Drehsinn gegen den Uhrzeigersinn ausgegeben. */
function spindelBogen(z, lage, ebene, radius, k1, k2, breite, optionen = {}) {
  if (k2 - k1 <= 1e-9) return;
  const [a, b] = [spindelGrad(lage, k1), spindelGrad(lage, k2)];
  const start = lage.drehsinn > 0 ? a : b;
  z.bogen(ebene, lage.mitte, radius, start, start + Math.abs(b - a), breite, optionen);
}

/** Geometrie des Spindel-Grundrisses (cm). */
function spindelGrundrissGeometrie(ergebnis) {
  const g = ergebnis.spindel;
  const n = ergebnis.anzahlSteigungen;
  const s = ergebnis.geschosshoehe / n;
  const D = g.durchmesser;
  const lage = spindelLage(ergebnis);

  // Setzstufe, die die Schnittebene trifft (wie grundriss.js): 0-basiert k = stufeImSchnitt − 1
  const stufeImSchnitt = Math.ceil(GRUNDRISS_SCHNITTHOEHE / s - 1e-9);
  const kSchnitt = stufeImSchnitt <= n - 1 ? stufeImSchnitt - 1 : null;

  const quadrat = { x1: 0, x2: D, y1: 0, y2: D };
  const fp = ergebnis.footprint;
  return {
    form: "spindel", n, B: ergebnis.laufbreite, g, D, lage, kSchnitt, fp,
    // letzte Setzstufe der ersten Umdrehung (bei weniger als einer Umdrehung: der Austritt)
    kEnde: Math.min(n - 1, g.teilung),
    belegt: { xMin: 0, xMax: D, yMin: 0, yMax: D },
    rechtecke: [quadrat],
    raum: raumGeometrie(ergebnis.raum, [quadrat], fp),
  };
}

/**
 * Stufenwinkel der Schnittlinie beim Radius r (von innen nach außen leicht schräg).
 * Stellen mit k < kSchnittBei(r) liegen unter der Schnittebene (durchgezogen).
 */
function kSchnittBei(geo, r) {
  const { rS, Ra } = geo.g;
  return geo.kSchnitt - SPINDEL_SCHNITTLINIE_NEIGUNG + (2 * SPINDEL_SCHNITTLINIE_NEIGUNG * (r - rS)) / (Ra - rS);
}

/** Bogen der ersten Umdrehung: bis zur Schnittlinie durchgezogen, danach gestrichelt. */
function spindelBogenGeteilt(z, geo, ebene, radius, k1, k2, breite) {
  if (geo.kSchnitt == null) {
    spindelBogen(z, geo.lage, ebene, radius, k1, k2, breite);
    return;
  }
  const kc = Math.min(Math.max(kSchnittBei(geo, radius), k1), k2);
  spindelBogen(z, geo.lage, ebene, radius, k1, kc, breite);
  spindelBogen(z, geo.lage, ebene, radius, kc, k2, breite, { gestrichelt: true });
}

/** Setzstufen (radial), Außenkante der Stufen und Geländer. */
function spindelKantenElemente(z, geo) {
  const { g, lage } = geo;
  for (let k = 0; k <= geo.kEnde; k++) {
    if (k === g.teilung) break; // liegt auf der Antrittskante
    const innen = lage.punkt(g.rS, k);
    const aussen = lage.punkt(g.Ra, k);
    if (geo.kSchnitt == null) {
      z.linie(EBENE.treppe, innen, aussen, STRICH.schnitt);
      continue;
    }
    // Radius, an dem die Schnittlinie diese Setzstufe kreuzt; außen davon unter der Schnittebene
    const anteil = (k - (geo.kSchnitt - SPINDEL_SCHNITTLINIE_NEIGUNG)) / (2 * SPINDEL_SCHNITTLINIE_NEIGUNG);
    const rKreuz = g.rS + Math.min(Math.max(anteil, 0), 1) * (g.Ra - g.rS);
    const kreuz = lage.punkt(rKreuz, k);
    if (rKreuz < g.Ra - 1e-9) z.linie(EBENE.treppe, kreuz, aussen, STRICH.schnitt);
    if (rKreuz > g.rS + 1e-9) z.linie(EBENE.treppe, innen, kreuz, STRICH.schnitt, { gestrichelt: true });
  }
  spindelBogenGeteilt(z, geo, EBENE.treppe, g.Ra, 0, geo.kEnde, STRICH.schnitt);
  spindelBogenGeteilt(z, geo, EBENE.gelaender, geo.D / 2, 0, geo.kEnde, STRICH.mass);
}

/** Spindel geschnitten: Materialschraffur (Stahl: gefüllt, als Dreiecke für DXF-SOLID) und Umriss. */
function spindelQuerschnittElemente(z, geo, material) {
  const { g, lage } = geo;
  const [mx, my] = lage.mitte;
  const umriss = [];
  for (let i = 0; i < SPINDEL_KREIS_SEGMENTE; i++) {
    const w = (2 * Math.PI * i) / SPINDEL_KREIS_SEGMENTE;
    umriss.push([mx + g.rS * Math.cos(w), my + g.rS * Math.sin(w)]);
  }
  const ebeneSchraffur = MATERIAL_SCHRAFFUR_EBENE[material.schluessel];
  if (material.schraffur.art === "voll") {
    umriss.forEach((p, i) => z.flaeche(ebeneSchraffur, [lage.mitte, p, umriss[(i + 1) % umriss.length]], STRICH.schraffur));
  } else {
    materialSchraffur(z, material, umriss);
  }
  z.kreis(EBENE.spindel, lage.mitte, g.rS, material.schnittkontur ?? STRICH.schnitt);
}

/** Schnittlinie als Doppellinie, schräg über die Setzstufe kSchnitt, außen etwas überstehend. */
function spindelSchnittlinieElemente(z, geo) {
  const { g, lage } = geo;
  const neigung = SPINDEL_SCHNITTLINIE_NEIGUNG;
  const p1 = lage.punkt(g.rS, geo.kSchnitt - neigung);
  const p2 = lage.punkt(g.Ra, geo.kSchnitt + neigung);
  const laenge = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
  const u = [(p2[0] - p1[0]) / laenge, (p2[1] - p1[1]) / laenge];
  const ueber = SCHNITTLINIE_UEBERSTAND * z.m;
  // zweite Linie in Gehrichtung versetzt (Tangente an der Lauflinie)
  const w = lage.winkel(geo.kSchnitt);
  const gehrichtung = [-Math.sin(w) * lage.drehsinn, Math.cos(w) * lage.drehsinn];
  for (const versatz of [0, SCHNITTLINIE_ABSTAND * z.m]) {
    const v = [versatz * gehrichtung[0], versatz * gehrichtung[1]];
    z.linie(EBENE.treppe, [p1[0] + v[0], p1[1] + v[1]], [p2[0] + ueber * u[0] + v[0], p2[1] + ueber * u[1] + v[1]], STRICH.schnitt);
  }
}

/** Lauflinie: Kreis am Antritt, Bogen (erste Umdrehung), gefüllter Pfeil an der letzten Setzstufe. */
function spindelLauflinieElemente(z, geo) {
  const { g, lage, n } = geo;
  const m = z.m;
  const radiusKreis = LAUFLINIE_KREIS_RADIUS * m;
  const stufeCm = g.rL * ((2 * Math.PI) / g.teilung); // Bogenlänge einer Stufe auf der Lauflinie
  z.kreis(EBENE.lauflinie, lage.punkt(g.rL, 0), radiusKreis, LAUFLINIE_STRICH);

  const kEnde = n - 1;
  const kPfeilBasis = kEnde - (LAUFLINIE_PFEIL.laenge * m) / stufeCm;
  const kBogenEnde = Math.min(kPfeilBasis, g.teilung);
  spindelBogenGeteilt(z, geo, EBENE.lauflinie, g.rL, radiusKreis / stufeCm, kBogenEnde, LAUFLINIE_STRICH);

  const h = LAUFLINIE_PFEIL.halbeBreite * m;
  const spitze = lage.punkt(g.rL, kEnde);
  const basisInnen = lage.punkt(g.rL - h, kPfeilBasis);
  const basisAussen = lage.punkt(g.rL + h, kPfeilBasis);
  z.flaeche(EBENE.lauflinie, [spitze, basisAussen, basisInnen], 0.5);
}

/** Radien der Nummernringe: 1. Umdrehung außen, 2. zwischen Lauflinie und innerer Begrenzung, 3. weiter innen. */
function spindelNummernRinge(g) {
  const innen = (g.Ri + g.rL) / 2;
  return [(g.rL + g.Ra) / 2, innen, (g.Ri + innen) / 2];
}

/** Stufennummern 1 … n: erste Umdrehung außen, zweite innen, danach nur die letzte Nummer. */
function spindelNummerElemente(z, geo) {
  const { g, lage, n } = geo;
  const ringe = spindelNummernRinge(g);
  const sehneFaktor = 2 * Math.sin(Math.PI / g.teilung);
  for (let j = 1; j <= n; j++) {
    const k = j - 0.5;
    const umdrehung = Math.floor(k / g.teilung);
    if (umdrehung > 1 && j < n) continue;
    // ab der dritten Umdrehung nur die letzte Nummer, auf einem dritten Ring weiter innen
    const r = ringe[Math.min(umdrehung, 2)];
    const hoehe = Math.min(NUMMER_SCHRIFTGROESSE * z.m, (r * sehneFaktor) / 1.3);
    const [x, y] = lage.punkt(r, k);
    z.text([x, y - 0.36 * hoehe], String(j), { ausrichtung: "mitte", hoehe });
  }
}

/**
 * Radiale Maßlinie von r1 bis r2 auf dem Strahl der Stufe k, Text darüber (lesbar gedreht).
 * rText = Radius der Textmitte (Standard: Mitte der Maßlinie).
 */
function radialesMass(z, geo, k, r1, r2, langText, kurzText, rText = (r1 + r2) / 2) {
  const m = z.m;
  const w = geo.lage.winkel(k);
  const u = [Math.cos(w), Math.sin(w)];
  const nrm = [-u[1], u[0]];
  const p = (r, quer = 0) => [geo.lage.mitte[0] + r * u[0] + quer * nrm[0], geo.lage.mitte[1] + r * u[1] + quer * nrm[1]];
  z.linie(EBENE.mass, p(r1 - 5 * m), p(r2 + 5 * m), STRICH.mass);
  for (const r of [r1, r2]) {
    const d = 4 * m; // Schrägstrich 45° zur Maßlinie
    z.linie(EBENE.mass, [p(r)[0] - d * (u[0] + nrm[0]), p(r)[1] - d * (u[1] + nrm[1])],
      [p(r)[0] + d * (u[0] + nrm[0]), p(r)[1] + d * (u[1] + nrm[1])], STRICH.schnitt);
  }
  // Text nie auf dem Kopf: Leserichtung entlang +u oder −u; „oben“ ist links der Leserichtung.
  // Grundlinie 4 px über der Maßlinie.
  const umgedreht = Math.cos(w) < -1e-9;
  const grad = (w * 180) / Math.PI + (umgedreht ? 180 : 0);
  const position = p(rText, (umgedreht ? -4 : 4) * m);
  const text = masstext(z, langText, kurzText, Math.abs(r2 - r1));
  z.text(position, text, { ausrichtung: "mitte", drehung: ((grad % 360) + 360) % 360 });
}

/** Stufe (mit Versatz neben der Setzstufe), deren Strahl am nächsten an der gewünschten Richtung liegt. */
function spindelMassStufe(geo, zielGrad) {
  let beste = SPINDEL_MASS_VERSATZ;
  let besterAbstand = Infinity;
  for (let k = 0; k < Math.min(geo.g.teilung, geo.n); k++) {
    const kv = k + SPINDEL_MASS_VERSATZ;
    const abstand = Math.abs(((spindelGrad(geo.lage, kv) - zielGrad + 540) % 360) - 180);
    if (abstand < besterAbstand) { besterAbstand = abstand; beste = kv; }
  }
  return beste;
}

/** Maße: Außendurchmesser D unten, Laufbreite B (links) und Radius der Lauflinie (rechts) radial. */
function spindelMassElemente(z, geo) {
  const m = z.m;
  const { D, g } = geo;
  const yMass = geo.belegt.yMin - 26 * m;
  // Hilfslinien an den Tangentenpunkten links und rechts (y = D/2)
  hilfslinie(z, [0, D / 2], [0, yMass - 4 * m]);
  hilfslinie(z, [D, D / 2], [D, yMass - 4 * m]);
  horizontalesMass(z, 0, D, yMass);
  z.text([D / 2, yMass + 4 * m], `Ø ${zahl(D)}`, { ausrichtung: "mitte" });

  const wertB = zahl(geo.B);
  radialesMass(z, geo, spindelMassStufe(geo, 180), g.Ri, g.Ra, wertB, wertB);
  // Radius der Lauflinie: Text so nah wie möglich an der Spindel, damit er die Nummern der
  // zweiten Umdrehung (innerer Ring) nicht berührt.
  const wertR = zahl(g.rL);
  const langR = t("zeichnung.radiusLauflinie", { wert: wertR });
  const kurzR = `r ${wertR}`;
  const halbeTextlaenge = (masstext(z, langR, kurzR, g.rL).length * ZEICHENBREITE * SCHRIFTGROESSE * m) / 2;
  const rText = Math.min(g.rS + halbeTextlaenge + 4 * m, g.rL / 2);
  radialesMass(z, geo, spindelMassStufe(geo, 0), 0, g.rL, langR, kurzR, Math.max(rText, halbeTextlaenge));
}

/**
 * Elementliste des Spindel-Grundrisses in cm (Aufruf aus grundrissElemente()).
 * @param {object} ergebnis Rückgabe von berechneTreppe("spindel", …)
 * @param {number} cmProPx Umrechnung der Beschriftungsgrößen (px) in cm
 */
function spindelGrundrissElemente(ergebnis, cmProPx) {
  const geo = spindelGrundrissGeometrie(ergebnis);
  const z = neueZeichenliste(cmProPx);
  if (geo.raum) raumElemente(z, geo);
  spindelKantenElemente(z, geo);
  spindelQuerschnittElemente(z, geo, materialVon(ergebnis));
  if (geo.kSchnitt != null) spindelSchnittlinieElemente(z, geo);
  spindelLauflinieElemente(z, geo);
  spindelNummerElemente(z, geo);
  spindelMassElemente(z, geo);
  if (geo.raum) raumMassElemente(z, geo);
  return z.elemente;
}

/**
 * Maßstab des Spindel-Grundrisses, solange es keinen Schnitt gibt: füllt die Breite,
 * höchstens MAX_HOEHE_PX hoch, nie kleiner als der Mindestmaßstab (zeichnung.js).
 */
function spindelGrundrissMassstab(ergebnis, breitePx) {
  const D = ergebnis.spindel.durchmesser;
  const raum = ergebnis.raum?.vorgabe;
  const breiteCm = Math.max(D, raum?.laenge ?? 0);
  const hoeheCm = Math.max(D, raum?.breite ?? 0);
  const randX = GRUNDRISS_RAND_SEITLICH.links + 28 + GRUNDRISS_RAND_SEITLICH.rechts + 54;
  const randY = GRUNDRISS_RAND.oben + GRUNDRISS_RAND.unten + RAUMMASS_ABSTAND + 16;
  const kPasst = Math.min((breitePx - randX) / breiteCm, (MAX_HOEHE_PX - randY) / hoeheCm, MAX_PX_PRO_CM);
  return { k: Math.max(kPasst, mindestMassstab(ergebnis)) };
}
