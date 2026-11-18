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
 *  - Außenkante der Stufen (Radius Ra) und Geländer als Bögen, Deckenkante (Öffnung Ø D) und
 *    Austritt (letzte Setzstufe) gestrichelt über der Schnittebene.
 *  - Spindel geschnitten, mit Materialschraffur (material.js).
 *  - Schnittlinie schräg über die Setzstufe, die die Schnittebene (ca. 1 m) trifft; alles danach
 *    gestrichelt (wie bei den anderen Formen).
 *  - Stufennummern: erste Umdrehung außen, zweite auf einem inneren Ring, ab der dritten nur
 *    noch die letzte Nummer.
 *  - Lauflinie: Kreis am Antritt, bis zur Schnittlinie durchgezogen, dann gestrichelt bis zum
 *    Pfeil am Austritt; über eine Umdrehung hinaus leicht nach innen versetzt (Spirale).
 *  - Maßzahlen mit weißem Grund (nur SVG), damit Stufenkanten sie nicht durchkreuzen.
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
  // Geländer in der Mitte des Geländerzuschlags, damit die Deckenkante (Ø D) getrennt lesbar bleibt
  spindelBogenGeteilt(z, geo, EBENE.gelaender, g.Ra + g.gelaenderZuschlag / 2, 0, geo.kEnde, STRICH.mass);
}

/**
 * Obere Decke und Austritt (über der Schnittebene, daher gestrichelt):
 *  - Deckenöffnung = Kreis mit Ø D (Annahme, notlar.md) als Deckenkante
 *  - letzte Setzstufe (Austritt auf die obere Decke) kräftig, von der Spindel bis zur Deckenkante,
 *    mit der Beschriftung „Austritt“ außen
 */
function spindelAustrittElemente(z, geo) {
  const { g, lage, n, D } = geo;
  const m = z.m;
  const ueber = geo.kSchnitt != null; // ohne Schnittlinie (sehr niedrige Treppe) liegt alles darunter
  z.bogen(EBENE.decke, lage.mitte, D / 2, 0, 360, STRICH.schnitt, { gestrichelt: ueber });
  const kAustritt = n - 1;
  z.linie(EBENE.decke, lage.punkt(g.rS, kAustritt), lage.punkt(D / 2, kAustritt), STRICH.decke, { gestrichelt: ueber });

  // Beschriftung auf der Austrittskante zwischen Lauflinie und Außenkante, längs gedreht, mit
  // weißem Grund (unterbricht die Linie). Außerhalb des Kreises stießen sie an die Raummaße.
  // Passt der Text dort nicht, entfällt er (Kante und Pfeil zeigen den Austritt trotzdem).
  const text = t("zeichnung.austritt");
  const laenge = text.length * ZEICHENBREITE * SCHRIFTGROESSE * m;
  if (laenge + 8 * m > g.Ra - g.rL) return;
  const w = lage.winkel(kAustritt);
  const umgedreht = Math.cos(w) < -1e-9;
  const grad = (w * 180) / Math.PI + (umgedreht ? 180 : 0);
  const [x, y] = lage.punkt((g.rL + g.Ra) / 2, kAustritt);
  // Grundlinie um eine halbe Versalhöhe neben die Kante, damit die Schrift auf der Linie mittig sitzt
  const quer = 0.36 * SCHRIFTGROESSE * m * (umgedreht ? 1 : -1);
  z.text([x - quer * Math.sin(w), y + quer * Math.cos(w)], text, {
    ausrichtung: "mitte", drehung: ((grad % 360) + 360) % 360, hintergrund: true,
  });
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

// Zweite Umdrehung der Lauflinie: um diesen Abstand (px) nach innen versetzt, damit sie nicht auf
// dem durchgezogenen Anfang liegt und der Pfeil am Austritt eindeutig auf der gestrichelten Linie
// sitzt (Darstellung, vereinfacht). Übergang über die letzte Stufe vor der vollen Umdrehung.
const SPINDEL_LAUFLINIE_VERSATZ = 7;
const SPINDEL_LAUFLINIE_PUNKTE_JE_STUFE = 8;

/**
 * Lauflinie wie bei L/U: Kreis am Antritt, durchgezogen bis zur Schnittlinie, danach gestrichelt
 * bis zum Pfeil an der letzten Setzstufe (Austritt). Geht sie über eine Umdrehung hinaus, rückt
 * sie ab der letzten Stufe vor 360° leicht nach innen (Spirale statt Überdeckung).
 */
function spindelLauflinieElemente(z, geo) {
  const { g, lage, n } = geo;
  const m = z.m;
  const radiusKreis = LAUFLINIE_KREIS_RADIUS * m;
  const stufeCm = g.rL * ((2 * Math.PI) / g.teilung); // Bogenlänge einer Stufe auf der Lauflinie
  z.kreis(EBENE.lauflinie, lage.punkt(g.rL, 0), radiusKreis, LAUFLINIE_STRICH);

  const kEnde = n - 1;
  const kPfeilBasis = kEnde - (LAUFLINIE_PFEIL.laenge * m) / stufeCm;
  const versatz = SPINDEL_LAUFLINIE_VERSATZ * m;
  const kSpiraleAb = g.teilung - 1; // ab hier rückt die Lauflinie nach innen
  const radius = (k) => g.rL - versatz * Math.min(Math.max(k - kSpiraleAb, 0), 1);
  const spirale = kPfeilBasis > kSpiraleAb;

  // Kreisbogen bis zur Schnittlinie durchgezogen, danach gestrichelt (bis zum Beginn der Spirale)
  spindelBogenGeteilt(z, geo, EBENE.lauflinie, g.rL, radiusKreis / stufeCm, spirale ? kSpiraleAb : kPfeilBasis, LAUFLINIE_STRICH);
  if (spirale) {
    const punkte = [];
    const schritte = Math.ceil((kPfeilBasis - kSpiraleAb) * SPINDEL_LAUFLINIE_PUNKTE_JE_STUFE);
    for (let i = 0; i <= schritte; i++) {
      const k = kSpiraleAb + ((kPfeilBasis - kSpiraleAb) * i) / schritte;
      punkte.push(lage.punkt(radius(k), k));
    }
    z.polylinie(EBENE.lauflinie, punkte, LAUFLINIE_STRICH, { gestrichelt: geo.kSchnitt != null });
  }

  const h = LAUFLINIE_PFEIL.halbeBreite * m;
  const r = radius(kEnde);
  const spitze = lage.punkt(r, kEnde);
  const basisInnen = lage.punkt(r - h, kPfeilBasis);
  const basisAussen = lage.punkt(r + h, kPfeilBasis);
  z.flaeche(EBENE.lauflinie, [spitze, basisAussen, basisInnen], 0.5);
}

/** Radien der Nummernringe: 1. Umdrehung außen, ab der 2. zwischen Lauflinie und innerer Begrenzung. */
function spindelNummernRinge(g) {
  return [(g.rL + g.Ra) / 2, (g.Ri + g.rL) / 2];
}

/** Stufennummern 1 … n: erste Umdrehung außen, zweite innen, danach nur die letzte Nummer. */
function spindelNummerElemente(z, geo) {
  const { g, lage, n } = geo;
  const ringe = spindelNummernRinge(g);
  const sehneFaktor = 2 * Math.sin(Math.PI / g.teilung);
  // Ab der dritten Umdrehung (sehr hohe Geschosse) nur noch die letzte Nummer: Sie steht auf dem
  // inneren Ring anstelle der Nummer eine Umdrehung tiefer (am selben Platz wäre kein Raum).
  const letzteUmdrehung = Math.floor((n - 0.5) / g.teilung);
  for (let j = 1; j <= n; j++) {
    const k = j - 0.5;
    const umdrehung = Math.floor(k / g.teilung);
    if (umdrehung > 1 && j < n) continue;
    if (letzteUmdrehung > 1 && j === n - g.teilung) continue;
    const r = ringe[Math.min(umdrehung, 1)];
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
  z.text(position, text, { ausrichtung: "mitte", drehung: ((grad % 360) + 360) % 360, hintergrund: true });
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
  z.text([D / 2, yMass + 4 * m], `Ø ${zahl(D)}`, { ausrichtung: "mitte", hintergrund: true });

  const wertB = zahl(geo.B);
  radialesMass(z, geo, spindelMassStufe(geo, 180), g.Ri, g.Ra, wertB, wertB);
  // Radius der Lauflinie: Text so nah wie möglich an der Spindel, damit er die Nummern der
  // zweiten Umdrehung (innerer Ring) nicht berührt.
  const wertR = zahl(g.rL);
  const langR = t("zeichnung.radiusLauflinie", { wert: wertR });
  const kurzR = `r ${wertR}`;
  // Langer Text nur, wenn er zwischen Spindel und innerem Nummernring Platz hat
  const textlaenge = (text) => text.length * ZEICHENBREITE * SCHRIFTGROESSE * m;
  const frei = spindelNummernRinge(g)[1] - NUMMER_SCHRIFTGROESSE * m - g.rS - 4 * m;
  // Passt auch der kurze nicht (kleiner Maßstab), entfällt das Maß – r steht in der Legende.
  if (textlaenge(kurzR) > frei) return;
  const textR = textlaenge(langR) <= frei ? langR : kurzR;
  const rText = Math.max(g.rS + textlaenge(textR) / 2 + 4 * m, textlaenge(textR) / 2);
  radialesMass(z, geo, spindelMassStufe(geo, 0), 0, g.rL, textR, textR, rText);
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
  spindelAustrittElemente(z, geo);
  if (geo.kSchnitt != null) spindelSchnittlinieElemente(z, geo);
  spindelLauflinieElemente(z, geo);
  spindelNummerElemente(z, geo);
  spindelMassElemente(z, geo);
  if (geo.raum) raumMassElemente(z, geo);
  return z.elemente;
}

