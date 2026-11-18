/*
 * bewertung.js – Variantenvergleich: gerade, L-, U- und Spindeltreppe berechnen, ausschließen,
 * bewerten und die beste empfehlen.
 *
 * Ablauf:
 *   1. Stufung je Form: die bequemste normgerechte Stufung, die in den Raum passt;
 *      passt sie nicht, wird eine steilere (oder andere) normgerechte versucht.
 *   2. Ausschluss vor der Bewertung: Norm nicht erfüllt oder passt nicht in den Raum.
 *   3. Punkte 0–100 je Kriterium, gewichtet zur Gesamtpunktzahl.
 *   4. Empfehlung = höchste Gesamtpunktzahl unter den nicht ausgeschlossenen Varianten.
 *
 * Die Gewichte und Bewertungsformeln sind KEINE Normwerte, sondern eine Festlegung
 * des Nutzers (17.11., siehe notlar.md). Ohne Texte: Schlüssel und Zahlen, Texte baut app.js.
 */

// Gewichte in Prozent (Summe 100). Festlegung des Nutzers, kein Normwert.
const GEWICHTE = Object.freeze({
  komfort: 40,
  platz: 30,
  sicherheit: 20,
  nutzung: 10,
});

// Komfort: volle Punkte bei s = 17 cm und a = 29 cm (17/29-Treppe, gängige Faustregel,
// kein Normwert); 0 Punkte bei 3 cm (s) bzw. 6 cm (a) Abweichung. Festlegung des Nutzers.
const KOMFORT = Object.freeze({
  steigung: 17, steigungSpanne: 3,
  auftritt: 29, auftrittSpanne: 6,
});

// Sicherheit nach der längsten Folge von Steigungen ohne Podest:
// ≤ 8 → 100 Punkte (Annahme des Nutzers), ≥ 18 → 0 Punkte (die 18-Steigungen-Regel aus
// norm.js, hier für alle Gebäudearten als Maßstab verwendet), dazwischen linear.
const SICHERHEIT = Object.freeze({
  vollBis: 8,
  nullAb: DIN18065.gebaeudearten.allgemein.maxSteigungenJeLauf,
});

// Nutzung: Punkte für gerade Läufe und Podest (Ruhepunkt, Möbeltransport).
// Nur bei „Gebäude im Allgemeinen“; in Wohngebäuden bekommen alle Formen 100.
// Festlegung des Nutzers, kein Normwert.
const NUTZUNG = Object.freeze({
  geradeLaeufe: 50, // gerade, L und U (die Spindeltreppe hat keine geraden Läufe)
  podest: 50,
});

// Hinweis „sehr steil“ (Karten und Kennwerte): ab dieser Steigung ODER bis zu diesem Auftritt.
// Eigene Annahme, kein Normwert – nur ein Hinweis, kein Ausschluss und keine Normprüfung.
const SEHR_STEIL = Object.freeze({
  steigungAb: 19, // cm
  auftrittBis: 24, // cm
});

/** Welche Werte lösen den Hinweis „sehr steil“ aus? (Toleranz gegen Gleitkommafehler) */
function steilheit(t) {
  const steigung = t.steigung >= SEHR_STEIL.steigungAb - RECHENTOLERANZ;
  const auftritt = t.auftritt <= SEHR_STEIL.auftrittBis + RECHENTOLERANZ;
  return { steigung, auftritt, sehrSteil: steigung || auftritt };
}

/** Begrenzt auf 0 … 100. */
function punkte0bis100(wert) {
  return Math.min(Math.max(wert, 0), 100);
}

function auftrittPunkte(auftritt) {
  return punkte0bis100(100 * (1 - Math.abs(auftritt - KOMFORT.auftritt) / KOMFORT.auftrittSpanne));
}

// Spindeltreppe: Auftrittspunkte gemittelt über die nutzbare Laufbreite (Zahl der Stützstellen).
// Festlegung des Nutzers (18.11., Variante C), kein Normwert.
const KOMFORT_SPINDEL_STUETZSTELLEN = 200;

/**
 * Spindeltreppe: Der Auftritt wächst linear von der inneren zur äußeren Begrenzung
 * (auftrittInnen … auftrittAussen). Bewertet wird der Mittelwert der Auftrittspunkte
 * über die ganze nutzbare Laufbreite – die keilförmigen Stufen kosten Komfort.
 */
function auftrittPunkteSpindel(g) {
  let summe = 0;
  for (let i = 0; i < KOMFORT_SPINDEL_STUETZSTELLEN; i++) {
    const anteil = (i + 0.5) / KOMFORT_SPINDEL_STUETZSTELLEN;
    summe += auftrittPunkte(g.auftrittInnen + anteil * (g.auftrittAussen - g.auftrittInnen));
  }
  return summe / KOMFORT_SPINDEL_STUETZSTELLEN;
}

function komfortPunkte(t) {
  const ks = punkte0bis100(100 * (1 - Math.abs(t.steigung - KOMFORT.steigung) / KOMFORT.steigungSpanne));
  const ka = t.spindel ? auftrittPunkteSpindel(t.spindel) : auftrittPunkte(t.auftritt);
  return (ks + ka) / 2;
}

/**
 * Tatsächlich belegte Grundfläche: Läufe (Länge × Laufbreite) + Podest (Tiefe × Breite).
 * Nicht das umschließende Rechteck (footprint): Die freie Ecke der L-Treppe bleibt nutzbar
 * und zählt nicht. Das Rechteck gilt weiter für „Passt in den Raum“ (pruefeRaum).
 * Spindeltreppe: Kreisfläche mit dem Außendurchmesser D (die Ecken des Quadrats bleiben frei).
 */
function belegteFlaeche(t) {
  if (t.spindel) return (Math.PI * t.spindel.durchmesser ** 2) / 4;
  const laeufe = t.laeufe.reduce((summe, l) => summe + l.laenge * t.laufbreite, 0);
  return laeufe + (t.podest ? t.podest.tiefe * t.podest.breite : 0);
}

/**
 * Platz: mit Länge und Breite des Raums der freie Anteil der Raumfläche,
 * sonst relativ zur kleinsten Variante (kleinste = 100). Beides mit der belegten Fläche.
 */
function platzPunkte(t, raumVorgabe, kleinsteFlaeche) {
  if (raumVorgabe?.laenge != null && raumVorgabe?.breite != null) {
    return punkte0bis100(100 * (1 - belegteFlaeche(t) / (raumVorgabe.laenge * raumVorgabe.breite)));
  }
  return punkte0bis100((100 * kleinsteFlaeche) / belegteFlaeche(t));
}

function sicherheitPunkte(t) {
  const m = Math.max(...t.laeufe.map((l) => l.steigungen));
  const { vollBis, nullAb } = SICHERHEIT;
  return punkte0bis100((100 * (nullAb - m)) / (nullAb - vollBis));
}

function nutzungPunkte(t) {
  if (t.gebaeudeart !== "allgemein") return 100;
  return (t.form === "spindel" ? 0 : NUTZUNG.geradeLaeufe) + (t.podest ? NUTZUNG.podest : 0);
}

/** Summe der Fehlmaße (0 ohne Raumvorgabe oder wenn es passt). */
function fehltSumme(t) {
  return t.raum ? t.raum.fehlt.laenge + t.raum.fehlt.breite : 0;
}

/**
 * Stufung je Form: unter allen Stufenzahlen (die bequemste zuerst, stufenKandidaten())
 * die erste, mit der die Treppe normgerecht ist und in den Raum passt.
 * Gibt es keine, dann die normgerechte mit dem kleinsten Fehlmaß; ist keine normgerecht,
 * die bequemste (deren Mängel zeigt die Normprüfung).
 */
function treppeFuerForm(form, richtung, eingabe) {
  const grenzen = DIN18065.gebaeudearten[eingabe.gebaeudeart];
  const kandidaten = stufenKandidaten(eingabe.geschosshoehe, grenzen);
  let beste = null;
  let besterSchluessel = null;
  for (const stufung of kandidaten) {
    const t = berechneTreppe(form, richtung, eingabe, stufung);
    const schluessel = [Number(!t.normgerecht), fehltSumme(t)];
    if (schluessel[0] === 0 && schluessel[1] === 0) return t; // bequemste geeignete
    if (!beste || schluessel[0] < besterSchluessel[0] ||
        (schluessel[0] === besterSchluessel[0] && schluessel[1] < besterSchluessel[1] - RECHENTOLERANZ)) {
      beste = t;
      besterSchluessel = schluessel;
    }
  }
  return beste;
}

/**
 * Gründe für den Ausschluss (leer = nicht ausgeschlossen), ohne Texte:
 * stufen | laufbreite | podestNoetig | laufZuKurz | podest | spindelLaufbreite | spindel | raum.
 */
function ausschlussGruende(t) {
  const gruende = [];
  if (!t.stufenNormgerecht) gruende.push({ grund: "stufen" });
  if (!t.laufbreiteNormgerecht) gruende.push({ grund: "laufbreite" });
  for (const p of t.pruefungen) {
    if (p.ok) continue;
    if (p.kriterium === "laufMax") gruende.push({ grund: "podestNoetig", max: p.grenze.max });
    if (p.kriterium === "laufMin") gruende.push({ grund: "laufZuKurz", min: p.grenze.min });
    if (p.kriterium === "podestlaenge") gruende.push({ grund: "podest" });
    if (p.kriterium === "spindelLaufbreite") gruende.push({ grund: "spindelLaufbreite", max: p.grenze.max });
    if (["auftrittInnen", "lauflinieGehbereich", "durchgangshoehe"].includes(p.kriterium)) {
      gruende.push({ grund: "spindel" });
    }
  }
  if (t.raum && !t.raum.passt) gruende.push({ grund: "raum", fehlt: t.raum.fehlt });
  return gruende;
}

/**
 * Begründung der Empfehlung: das Kriterium mit dem größten gewichteten Vorsprung
 * vor der zweitbesten Variante; bei nur einer geeigneten Variante „einzige“.
 */
function begruendung(geeignete) {
  if (geeignete.length === 1) return { art: "einzige" };
  const [erste, zweite] = geeignete;
  let kriterium = null;
  let vorsprung = -Infinity;
  for (const k of Object.keys(GEWICHTE)) {
    const v = (GEWICHTE[k] * (erste.punkte[k] - zweite.punkte[k])) / 100;
    if (v > vorsprung) { vorsprung = v; kriterium = k; }
  }
  return { art: "vorsprung", kriterium, zweite: zweite.form };
}

/**
 * Hauptfunktion: alle vier Formen berechnen, ausschließen, bewerten, empfehlen.
 * @param {object} eingabe wie bei berechneTreppe() (mit material für die Spindeltreppe)
 * @param {{L: "links"|"rechts", spindel: "links"|"rechts"}} richtungen Drehsinn der L- und der
 *   Spindeltreppe (gleiche Punkte für beide Richtungen, Spiegelbild)
 * @returns {{varianten: object[], empfehlung: string|null, naechste: string|null, begruendung: object|null}}
 *   empfehlung = Form mit den meisten Punkten (null, wenn keine Variante geeignet ist);
 *   naechste = die Variante, der am wenigsten fehlt (nur wenn keine geeignet ist).
 */
function vergleicheVarianten(eingabe, richtungen = { L: "links", spindel: "links" }) {
  const varianten = TREPPENFORMEN.map((form) => {
    const treppe = treppeFuerForm(form, richtungen[form] ?? null, eingabe);
    const gruende = ausschlussGruende(treppe);
    return { form, treppe, gruende, ausgeschlossen: gruende.length > 0 };
  });

  const geeignet = varianten.filter((v) => !v.ausgeschlossen);
  const vergleichsbasis = geeignet.length > 0 ? geeignet : varianten;
  const kleinsteFlaeche = Math.min(...vergleichsbasis.map((v) => belegteFlaeche(v.treppe)));

  for (const v of varianten) {
    const t = v.treppe;
    v.punkte = {
      komfort: komfortPunkte(t),
      platz: platzPunkte(t, eingabe.raumVorgabe, kleinsteFlaeche),
      sicherheit: sicherheitPunkte(t),
      nutzung: nutzungPunkte(t),
    };
    v.gesamt = Object.keys(GEWICHTE).reduce((summe, k) => summe + (GEWICHTE[k] * v.punkte[k]) / 100, 0);
  }

  // Stabil sortiert: bei Gleichstand gewinnt die einfachere Form (Reihenfolge gerade, L, U, Spindel).
  const rangfolge = [...geeignet].sort((p, q) => q.gesamt - p.gesamt);
  if (rangfolge.length > 0) {
    return { varianten, empfehlung: rangfolge[0].form, naechste: null, begruendung: begruendung(rangfolge) };
  }

  // Keine geeignet: zuerst Varianten, die nur am Raum scheitern, dann das kleinste Fehlmaß.
  const nurRaum = (v) => v.gruende.every((g) => g.grund === "raum");
  const naechste = [...varianten].sort(
    (p, q) => Number(!nurRaum(p)) - Number(!nurRaum(q)) || fehltSumme(p.treppe) - fehltSumme(q.treppe),
  )[0];
  return { varianten, empfehlung: null, naechste: naechste.form, begruendung: null };
}
