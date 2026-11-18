/*
 * spindeltreppe.js – Geometrie und Normprüfung der Spindeltreppe (4. Treppenform).
 *
 * Radien vom Mittelpunkt der Spindel aus:
 *   rS  Spindel (halber Durchmesser, Annahme aus material.js)
 *   Ri  innere Begrenzung der nutzbaren Laufbreite (Ri ≥ rS; schmalere Stufenteile zählen nicht)
 *   Ra  äußere Begrenzung = Ri + B
 *   rL  Lauflinie, im Gehbereich Ri + 0,5 B … Ri + 0,7 B (norm.js)
 *   D   Außendurchmesser = 2 · (Ra + Geländerzuschlag)
 *
 * Ablauf:
 *   1. Steigung s und Auftritt a wie bei allen Formen (Stufung aus berechnung.js).
 *   2. Teilung t (Stufen je Vollkreis, ganzzahlig): die kleinste, bei der
 *      – die lichte Durchgangshöhe t · s − Stufendicke ≥ 200 cm ist und
 *      – die Lauflinie mit Auftritt a im Gehbereich liegen kann, obwohl der Auftritt an der
 *        inneren Begrenzung ≥ 10 cm sein muss.
 *      Kleinstes t = kleinster Durchmesser.
 *   3. Lauflinie: rL so, dass der Auftritt auf der Lauflinie genau a ist.
 *      Ri so, dass die Lauflinie bei 0,6 B liegt (Empfehlung DGUV); ist dieses Ri zu klein
 *      (Spindel oder Auftritt innen), dann das kleinste zulässige Ri – die Lauflinie rückt
 *      im Gehbereich nach innen (bis 0,5 B).
 *
 * Auftritte werden als Sehne zwischen zwei Stufenvorderkanten gemessen: 2 r sin(π / t).
 * Das ist etwas kleiner als der Bogen (sichere Seite). TODO: Quelle prüfen (Messregel DIN 18065).
 * Mit ganzzahligem t liegt Stufe k + t genau über Stufe k (gleiche Stufenkante im Grundriss).
 */

// Bevorzugte Lage der Lauflinie: 4/10 der nutzbaren Laufbreite vom äußeren Handlauf,
// also 0,6 B von der inneren Begrenzung (Mitte des Gehbereichs).
// Empfehlung DGUV-Information BGI/GUV-I 561 „Treppen“, zitiert nach Baunetz Wissen
// „Spindeltreppen“ (abgerufen 18.11.), Original nicht eingesehen – kein Normwert.
const SPINDEL_LAUFLINIE_ANTEIL = 0.6;

// Obergrenze der Suche nach der Teilung (Plausibilität, kein Normwert).
const SPINDEL_TEILUNG_MAX = 60;

/** Sehnenfaktor: Auftritt auf dem Radius r = r · sehne(t). */
function sehne(t) {
  return 2 * Math.sin(Math.PI / t);
}

/** Kleinste zulässige innere Begrenzung bei Teilung t: Spindel und Auftritt innen ≥ 10 cm. */
function kleinsteInnereBegrenzung(t, masse) {
  const norm = DIN18065.spindeltreppe;
  return Math.max(masse.spindelDurchmesser / 2, norm.auftrittInnenMin / sehne(t));
}

/** Passt die Lauflinie bei Teilung t in den Gehbereich? */
function lauflinieMoeglich(t, a, B, masse) {
  const norm = DIN18065.spindeltreppe;
  const rL = a / sehne(t);
  return rL - kleinsteInnereBegrenzung(t, masse) >= norm.gehbereichInnenAnteil * B - RECHENTOLERANZ;
}

/** Kleinste Teilung, die lichte Durchgangshöhe und Gehbereich erfüllt (sonst die größte versuchte). */
function waehleTeilung(stufung, B, durchgangshoeheMin, masse) {
  const s = stufung.steigung;
  const tDurchgang = Math.ceil((durchgangshoeheMin + masse.stufendicke) / s - RECHENTOLERANZ);
  for (let t = Math.max(tDurchgang, 3); t <= SPINDEL_TEILUNG_MAX; t++) {
    if (lauflinieMoeglich(t, stufung.auftritt, B, masse)) return t;
  }
  return Math.max(tDurchgang, SPINDEL_TEILUNG_MAX);
}

/** Radien, Winkel und Durchmesser der Spindeltreppe (alle Maße in cm, Winkel in Grad). */
function spindelGeometrie(stufung, B, durchgangshoeheMin, masse) {
  const { anzahlSteigungen: n, steigung: s, auftritt: a } = stufung;
  const t = waehleTeilung(stufung, B, durchgangshoeheMin, masse);
  const rL = a / sehne(t);
  const Ri = Math.max(kleinsteInnereBegrenzung(t, masse), rL - SPINDEL_LAUFLINIE_ANTEIL * B);
  const Ra = Ri + B;
  const stufenwinkel = 360 / t;
  return {
    teilung: t,
    stufenwinkel,
    // Antritt (erste Setzstufe) bei 0°, Austritt (letzte Setzstufe, auf die obere Decke) bei:
    drehwinkel: (n - 1) * stufenwinkel,
    rS: masse.spindelDurchmesser / 2,
    Ri, Ra, rL,
    lauflinieAbstand: rL - Ri, // von der inneren Begrenzung
    auftrittInnen: Ri * sehne(t),
    auftrittAussen: Ra * sehne(t),
    durchgangshoehe: t * s - masse.stufendicke,
    gelaenderZuschlag: masse.gelaenderZuschlag,
    stufendicke: masse.stufendicke,
    durchmesser: 2 * (Ra + masse.gelaenderZuschlag),
  };
}

/** Prüfungen nur der Spindeltreppe (ohne Texte, Schlüssel wie in berechnung.js). */
function pruefeSpindel(geo, B, grenzen) {
  const norm = DIN18065.spindeltreppe;
  const gehbereich = {
    min: norm.gehbereichInnenAnteil * B,
    max: (norm.gehbereichInnenAnteil + norm.gehbereichAnteil) * B,
  };
  return [
    {
      kriterium: "spindelLaufbreite", wert: B, grenze: { max: norm.laufbreiteMax },
      ok: B <= norm.laufbreiteMax + RECHENTOLERANZ,
    },
    {
      kriterium: "auftrittInnen", wert: geo.auftrittInnen, grenze: { min: norm.auftrittInnenMin },
      ok: geo.auftrittInnen >= norm.auftrittInnenMin - RECHENTOLERANZ,
    },
    {
      kriterium: "lauflinieGehbereich", wert: geo.lauflinieAbstand, grenze: gehbereich,
      ok: abweichung(geo.lauflinieAbstand, gehbereich.min, gehbereich.max) === 0,
    },
    {
      kriterium: "durchgangshoehe", wert: geo.durchgangshoehe, grenze: { min: grenzen.durchgangshoeheMin },
      ok: geo.durchgangshoehe >= grenzen.durchgangshoeheMin - RECHENTOLERANZ,
    },
  ];
}

/**
 * Spindeltreppe als Ergebnis im selben Format wie berechneTreppe() (treppenformen.js):
 * ein „Lauf“ entlang der Lauflinie (n Steigungen, n − 1 Auftritte, Länge = Abwicklung),
 * kein Podest, Footprint = umschließendes Quadrat D × D. Zusätzlich: spindel (Geometrie).
 * @param {"links"|"rechts"} richtung Drehsinn beim Hinaufgehen (links = gegen den Uhrzeigersinn)
 */
function berechneSpindeltreppe(richtung, eingabe, stufung) {
  const { geschosshoehe, gebaeudeart, laufbreite: B, raumVorgabe = null } = eingabe;
  const grenzen = DIN18065.gebaeudearten[gebaeudeart];
  const masse = spindelMasse(MATERIALIEN[eingabe.material] ?? MATERIALIEN[STANDARD_MATERIAL]);
  const geo = spindelGeometrie(stufung, B, grenzen.durchgangshoeheMin, masse);

  const n = stufung.anzahlSteigungen;
  const laeufe = [neuerLauf(n, stufung.auftritt)];
  const footprint = { laenge: geo.durchmesser, breite: geo.durchmesser };

  const stufenPruefungen = pruefeVariante(stufung, grenzen);
  const laufbreitePruefung = pruefeLaufbreite(B, grenzen);
  const laufPruefungen = pruefeLaeufe("spindel", laeufe, null, grenzen, B); // nur „≤ 18 ohne Podest“
  const spindelPruefungen = pruefeSpindel(geo, B, grenzen);
  const pruefungen = [...stufenPruefungen, laufbreitePruefung, ...laufPruefungen, ...spindelPruefungen];

  return {
    form: "spindel",
    richtung: richtung ?? "links",
    gebaeudeart,
    geschosshoehe,
    laufbreite: B,
    anzahlSteigungen: n,
    anzahlAuftritte: laeufe[0].auftritte,
    steigung: stufung.steigung,
    auftritt: stufung.auftritt,
    schrittmass: stufung.schrittmass,
    laeufe,
    podest: null,
    footprint,
    lauflaenge: laeufe[0].laenge, // Länge der Lauflinie (Abwicklung)
    spindel: geo,
    material: eingabe.material ?? STANDARD_MATERIAL, // geht in die Berechnung ein (Spindel, Stufendicke)
    pruefungen,
    raum: pruefeRaum(footprint, raumVorgabe),
    stufenNormgerecht: stufenPruefungen.every((p) => p.ok),
    laufbreiteNormgerecht: laufbreitePruefung.ok,
    laeufeNormgerecht: laufPruefungen.every((p) => p.ok),
    spindelNormgerecht: spindelPruefungen.every((p) => p.ok),
    normgerecht: pruefungen.every((p) => p.ok),
  };
}
