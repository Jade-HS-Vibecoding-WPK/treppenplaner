/*
 * treppenformen.js – Aufteilung der Steigungen auf Läufe und Podeste.
 *
 * Formen (gerade, L, U: nur Podestlösungen, keine gewendelten Stufen):
 *   gerade – ein Lauf
 *   L      – zwei Läufe im rechten Winkel, Viertelpodest B × B (Richtung links oder rechts)
 *   U      – zwei parallele Läufe, Halbpodest (Tiefe B, Breite 2B + Treppenauge)
 *   spindel – Spindeltreppe: eigene Geometrie in spindeltreppe.js, gleiches Ergebnisformat
 *
 * Steigung und Auftritt hängen nicht von der Form ab (berechnung.js); hier wird nur aufgeteilt.
 * Das Podest ersetzt einen Auftritt: Lauf i hat nᵢ Steigungen und nᵢ − 1 Auftritte;
 * die letzte Setzstufe eines Laufs führt auf das Podest bzw. auf die obere Decke.
 *
 * Footprint vereinfacht wie bei der geraden Treppe: Laufbreite = nutzbare Laufbreite
 * (ohne Wangen, Handlauf, Wandabstand).
 */

// Lichter Abstand zwischen den beiden Läufen der U-Treppe.
// Annahme, kein Normwert (Festlegung des Nutzers, 17.11.).
const TREPPENAUGE = 10; // cm

const TREPPENFORMEN = Object.freeze(["gerade", "L", "U"]);

function neuerLauf(steigungen, auftritt) {
  const auftritte = Math.max(steigungen - 1, 0);
  return { steigungen, auftritte, laenge: auftritte * auftritt };
}

/**
 * Mögliche Aufteilungen [n₁, n₂] der n Steigungen, die bevorzugte zuerst.
 * L: alle Aufteilungen mit mindestens 3 Steigungen je Lauf, die ausgewogenste zuerst
 *    (bei ungerader Zahl der längere Lauf zuerst).
 * U: immer ausgewogen – das ist auch immer die kürzeste U-Treppe.
 * Gibt es keine gültige Aufteilung (zu wenige Steigungen), wird die ausgewogene geliefert;
 * die Prüfung „Steigungen je Lauf“ schlägt dann fehl.
 */
function aufteilungen(form, n) {
  const ausgewogen = [Math.ceil(n / 2), Math.floor(n / 2)];
  if (form === "gerade") return [[n]];
  if (form === "U") return [ausgewogen];

  const min = DIN18065.treppenlauf.minSteigungen;
  const liste = [];
  for (let n1 = min; n1 <= n - min; n1++) liste.push([n1, n - n1]);
  liste.sort((p, q) => Math.abs(p[0] - p[1]) - Math.abs(q[0] - q[1]) || q[0] - p[0]);
  return liste.length > 0 ? liste : [ausgewogen];
}

/** Benötigte Grundfläche (Rechteck Länge × Breite); Länge = Laufrichtung des ersten Laufs. */
function footprintDerForm(form, laeufe, laufbreite) {
  const B = laufbreite;
  switch (form) {
    case "gerade": return { laenge: laeufe[0].laenge, breite: B };
    case "L": return { laenge: laeufe[0].laenge + B, breite: B + laeufe[1].laenge };
    case "U": return { laenge: Math.max(laeufe[0].laenge, laeufe[1].laenge) + B, breite: 2 * B + TREPPENAUGE };
  }
  throw new Error("Unbekannte Treppenform: " + form);
}

/**
 * Podest zwischen den Läufen (null bei der geraden Treppe).
 * tiefe = Podestlänge in Laufrichtung (für die Normprüfung),
 * lauflinie = Länge der Lauflinie auf dem Podest (für die Abwicklung im Schnitt):
 *   L: B/2 + B/2 = B;  U: B/2 + (B + Auge) + B/2 = 2B + Auge.
 */
function podestDerForm(form, laeufe, laufbreite, steigung) {
  if (form === "gerade") return null;
  const B = laufbreite;
  const quer = form === "L" ? B : 2 * B + TREPPENAUGE;
  return { hoehe: laeufe[0].steigungen * steigung, tiefe: B, breite: quer, lauflinie: quer };
}

/** Prüfungen der Läufe und des Podests (ohne Texte, Schlüssel wie in berechnung.js). */
function pruefeLaeufe(form, laeufe, podest, grenzen, laufbreite) {
  const pruefungen = [];
  const steigungen = laeufe.map((l) => l.steigungen);

  if (form === "L" || form === "U") {
    const min = DIN18065.treppenlauf.minSteigungen;
    const wert = Math.min(...steigungen);
    pruefungen.push({ kriterium: "laufMin", wert, grenze: { min }, einheit: "anzahl", ok: wert >= min });
  }
  if (grenzen.maxSteigungenJeLauf != null) {
    const max = grenzen.maxSteigungenJeLauf;
    const wert = Math.max(...steigungen);
    pruefungen.push({ kriterium: "laufMax", wert, grenze: { max }, einheit: "anzahl", ok: wert <= max });
  }
  if (podest) {
    const min = DIN18065.podest.minLaengeJeLaufbreite * laufbreite;
    pruefungen.push({
      kriterium: "podestlaenge", wert: podest.tiefe, grenze: { min }, ok: podest.tiefe >= min - RECHENTOLERANZ,
    });
  }
  return pruefungen;
}

/**
 * Wählt die Aufteilung: zuerst normgerechte Läufe, dann die, die in den Raum passt
 * (bzw. das kleinste Fehlmaß), bei Gleichstand die bevorzugte aus aufteilungen().
 */
function waehleAufteilung(form, stufung, grenzen, laufbreite, raumVorgabe) {
  const a = stufung.auftritt;
  const moeglichkeiten = aufteilungen(form, stufung.anzahlSteigungen).map((teilung) => {
    const laeufe = teilung.map((n) => neuerLauf(n, a));
    const footprint = footprintDerForm(form, laeufe, laufbreite);
    const podest = podestDerForm(form, laeufe, laufbreite, stufung.steigung);
    const laufPruefungen = pruefeLaeufe(form, laeufe, podest, grenzen, laufbreite);
    const raum = pruefeRaum(footprint, raumVorgabe);
    return {
      laeufe, footprint, podest, laufPruefungen, raum,
      laeufeOk: laufPruefungen.every((p) => p.ok),
      fehltSumme: raum ? raum.fehlt.laenge + raum.fehlt.breite : 0,
    };
  });
  // Array.prototype.sort ist stabil: die Reihenfolge aus aufteilungen() entscheidet bei Gleichstand.
  moeglichkeiten.sort((p, q) => Number(!p.laeufeOk) - Number(!q.laeufeOk) || p.fehltSumme - q.fehltSumme);
  return moeglichkeiten[0];
}

/**
 * Hauptfunktion: berechnet eine Treppe der gewünschten Form.
 * @param {"gerade"|"L"|"U"|"spindel"} form
 * @param {"links"|"rechts"|null} richtung nur für L und Spindeltreppe (Drehsinn beim Hinaufgehen)
 * @param {object|null} stufungVorgabe Stufung aus stufenKandidaten() (null = die bequemste)
 * @param {{geschosshoehe: number, gebaeudeart: string, laufbreite: number,
 *          raumVorgabe: {laenge: number|null, breite: number|null}|null,
 *          material?: string}} eingabe – material geht nur bei der Spindeltreppe in die Berechnung ein
 */
function berechneTreppe(form, richtung, eingabe, stufungVorgabe = null) {
  const { geschosshoehe, gebaeudeart, laufbreite, raumVorgabe = null } = eingabe;
  const grenzen = DIN18065.gebaeudearten[gebaeudeart];

  // Ohne Vorgabe die bequemste Stufung; bewertung.js gibt je Form ggf. eine steilere vor.
  const stufung = stufungVorgabe ?? stufenKandidaten(geschosshoehe, grenzen)[0];
  if (form === "spindel") return berechneSpindeltreppe(richtung, eingabe, stufung); // spindeltreppe.js
  const wahl = waehleAufteilung(form, stufung, grenzen, laufbreite, raumVorgabe);

  const stufenPruefungen = pruefeVariante(stufung, grenzen);
  const laufbreitePruefung = pruefeLaufbreite(laufbreite, grenzen);
  const pruefungen = [...stufenPruefungen, laufbreitePruefung, ...wahl.laufPruefungen];

  return {
    form,
    richtung: form === "L" ? richtung ?? "links" : null,
    gebaeudeart, // Eingabe, für die Druckzeile „Eingabe“
    geschosshoehe,
    laufbreite,
    anzahlSteigungen: stufung.anzahlSteigungen,
    anzahlAuftritte: wahl.laeufe.reduce((summe, l) => summe + l.auftritte, 0),
    steigung: stufung.steigung,
    auftritt: stufung.auftritt,
    schrittmass: stufung.schrittmass,
    laeufe: wahl.laeufe,
    podest: wahl.podest,
    footprint: wahl.footprint,
    lauflaenge: wahl.laeufe.reduce((summe, l) => summe + l.laenge, 0), // Summe der Läufe (ohne Podest)
    pruefungen,
    raum: wahl.raum, // null ohne Raumvorgabe; keine Normprüfung, fließt nicht in „normgerecht“ ein
    stufenNormgerecht: stufenPruefungen.every((p) => p.ok),
    laufbreiteNormgerecht: laufbreitePruefung.ok,
    laeufeNormgerecht: wahl.laeufeOk,
    normgerecht: pruefungen.every((p) => p.ok),
  };
}
