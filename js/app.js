/*
 * app.js – Verbindet Formular, Berechnung und Ergebnisanzeige.
 */

const GESCHOSSHOEHE_MIN = 50;  // Plausibilitätsgrenze der Eingabe (kein Normwert)
const GESCHOSSHOEHE_MAX = 600; // Plausibilitätsgrenze der Eingabe (kein Normwert)
const LAUFBREITE_MIN = 30;     // Plausibilitätsgrenze der Eingabe (kein Normwert)
const LAUFBREITE_MAX = 400;    // Plausibilitätsgrenze der Eingabe (kein Normwert)

const formular = document.getElementById("eingabe");
const fehlerAnzeige = document.getElementById("fehler");
const ergebnisBlock = document.getElementById("ergebnis");

/**
 * Formatiert eine Zahl im Format der Sprache mit Einheit cm (nur Anzeige – gerechnet wird exakt).
 * maxStellen = 2 in der Normprüfung, damit z. B. 19,04 cm nicht als „19,0“ erscheint.
 */
function cm(wert, maxStellen = 1) {
  return zahlFlexibel(wert, maxStellen, 1) + " cm";
}

/** Zulässiger Bereich als Text: {min, max} → „14–20 cm“, {min} → „≥ 80 cm“. */
function grenzeText(grenze) {
  return grenze.max != null
    ? `${zahlFlexibel(grenze.min, 1)}–${zahlFlexibel(grenze.max, 1)} cm`
    : `≥ ${zahlFlexibel(grenze.min, 1)} cm`;
}

// Letzte Fehlermeldung als Schlüssel, damit sie beim Sprachwechsel neu übersetzt werden kann.
let letzterFehler = null;

function zeigeFehler(schluessel, werte = {}) {
  letzterFehler = { schluessel, werte };
  fehlerAnzeige.textContent = t(schluessel, werte);
  fehlerAnzeige.hidden = false;
  ergebnisBlock.hidden = true;
  letztesErgebnis = null;
}

function setzeText(id, text) {
  document.getElementById(id).textContent = text;
}

function zeigeErgebnis(e) {
  letzterFehler = null;
  fehlerAnzeige.hidden = true;

  setzeText("anzahlSteigungen", e.anzahlSteigungen);
  setzeText("anzahlAuftritte", e.anzahlAuftritte);
  setzeText("steigung", cm(e.steigung));
  setzeText("auftritt", cm(e.auftritt));
  setzeText("schrittmass", cm(e.schrittmass));
  setzeText("lauflaenge", cm(e.lauflaenge));

  const urteil = document.getElementById("gesamturteil");
  if (e.normgerecht) {
    urteil.textContent = t("urteil.normgerecht");
  } else if (!e.stufenNormgerecht) {
    urteil.textContent = t("urteil.keineLoesung");
  } else {
    urteil.textContent = t("urteil.laufbreite");
  }
  urteil.className = "urteil " + (e.normgerecht ? "ok" : "nicht-ok");

  const tbody = document.getElementById("pruefungen");
  tbody.replaceChildren();
  for (const p of e.pruefungen) {
    const ergebnis = p.ok ? t("pruefung.erfuellt") : t("pruefung.nichtErfuellt");
    fuegePruefzeileHinzu(tbody, [t("kriterium." + p.kriterium), cm(p.wert, 2), grenzeText(p.grenze), ergebnis], p.ok);
  }

  zeigeRaumpruefung(tbody, e.raum);
  zeigeDruckEingabe(e);

  ergebnisBlock.hidden = false;

  // Zeichnung erst nach dem Einblenden, damit die verfügbare Breite bekannt ist.
  letztesErgebnis = e;
  zeichneZeichnungen();
}

/** Hängt eine Zeile an die Prüftabelle an; die letzte Zelle ist das Ergebnis (grün/rot). */
function fuegePruefzeileHinzu(tbody, zellen, ok, klasse = "") {
  const zeile = document.createElement("tr");
  if (klasse) zeile.className = klasse;
  zellen.forEach((inhalt, i) => {
    const td = document.createElement("td");
    td.textContent = inhalt;
    if (i === zellen.length - 1) td.className = ok ? "ok" : "nicht-ok";
    zeile.appendChild(td);
  });
  tbody.appendChild(zeile);
}

/** Fehlmaß aufgerundet auf 1 Nachkommastelle, damit ein echter Fehlbetrag nie als „0“ erscheint. */
function fehlmass(wert) {
  return zahlFlexibel(Math.ceil(wert * 10) / 10, 1) + " cm";
}

/** Text wie „Es fehlen 84 cm Länge und 10 cm Breite.“ (Satzbau je Sprache in i18n.js) */
function fehltText(fehlt) {
  const teile = [];
  if (fehlt.laenge > 0) teile.push(t("raum.fehltLaenge", { wert: fehlmass(fehlt.laenge) }));
  if (fehlt.breite > 0) teile.push(t("raum.fehltBreite", { wert: fehlmass(fehlt.breite) }));
  return t("raum.fehlt", { teile: teile.join(t("raum.und")) });
}

/** Zeile „Passt in den Raum“ und Raumurteil – getrennt von der Normprüfung. */
function zeigeRaumpruefung(tbody, raum) {
  const urteil = document.getElementById("raumurteil");
  const hinweis = document.getElementById("raumHinweis");
  hinweis.hidden = !raum;
  urteil.hidden = !raum;
  if (!raum) return;
  hinweis.textContent = t("raum.hinweis");

  const { footprint, vorgabe, fehlt, passt } = raum;
  const wert = `${zahl(footprint.laenge)} × ${zahl(footprint.breite)} cm`;
  const zahlKurz = (v) => zahlFlexibel(v, 1);
  let grenze;
  if (vorgabe.laenge != null && vorgabe.breite != null) {
    grenze = `≤ ${zahlKurz(vorgabe.laenge)} × ${zahlKurz(vorgabe.breite)} cm`;
  } else if (vorgabe.laenge != null) {
    grenze = `${t("raum.laenge")} ≤ ${zahlKurz(vorgabe.laenge)} cm`;
  } else {
    grenze = `${t("raum.breite")} ≤ ${zahlKurz(vorgabe.breite)} cm`;
  }
  grenze += " " + t("raum.vorgabe");
  const ergebnis = passt ? t("raum.passt") : "✗ " + fehltText(fehlt);
  fuegePruefzeileHinzu(tbody, [t("raum.kriterium"), wert, grenze, ergebnis], passt, "raumzeile");

  urteil.textContent = passt ? t("raum.urteilPasst") : t("raum.urteilPasstNicht", { fehlt: fehltText(fehlt) });
  urteil.className = "urteil " + (passt ? "ok" : "nicht-ok");
}

/**
 * Zeile „Eingabe“ für den Druck (das Formular ist dort ausgeblendet), z. B.
 * „Eingabe Geschosshöhe 275 cm · Gebäudeart: … · Nutzbare Laufbreite 80 cm · Verfügbarer Raum 400 × 100 cm“.
 */
function zeigeDruckEingabe(e) {
  const masz = (wert) => zahlFlexibel(wert, 1) + " cm";
  const teile = [
    `${t("druck.geschosshoehe")} ${masz(e.geschosshoehe)}`,
    t("druck.gebaeudeart", { wert: t("gebaeudeart." + e.gebaeudeart) }), // Doppelpunkt je Sprache (FR: „ : “)
    `${t("druck.laufbreite")} ${masz(e.laufbreite)}`,
  ];
  const vorgabe = e.raum?.vorgabe;
  if (vorgabe?.laenge != null && vorgabe.breite != null) {
    teile.push(`${t("druck.raum")} ${zahlFlexibel(vorgabe.laenge, 1)} × ${masz(vorgabe.breite)}`);
  } else if (vorgabe?.laenge != null) {
    teile.push(t("druck.raumSeite", { seite: t("raum.laenge"), wert: masz(vorgabe.laenge) }));
  } else if (vorgabe?.breite != null) {
    teile.push(t("druck.raumSeite", { seite: t("raum.breite"), wert: masz(vorgabe.breite) }));
  }

  const zeile = document.getElementById("druckEingabe");
  const titel = document.createElement("strong");
  titel.textContent = t("eingabe.titel");
  zeile.replaceChildren(titel, " " + teile.join(" · "));
}

/** Schnitt und Grundriss zeichnen; der Grundriss übernimmt Maßstab und x-Lage des Schnitts. */
function zeichneZeichnungen() {
  // Sichtbare Breite des Scrollbereichs, nicht der Abbildung (die wächst mit der Zeichnung).
  const abbildung = zeichneSchnitt(schnittSvg, letztesErgebnis, zeichenflaeche.clientWidth);
  zeichneGrundriss(grundrissSvg, letztesErgebnis, abbildung);
}

// Bei Größenänderung des Fensters neu zeichnen (nur wenn sich die Breite ändert).
const zeichenflaeche = document.querySelector(".zeichnungen");
const schnittSvg = document.getElementById("schnitt");
const grundrissSvg = document.getElementById("grundriss");
let letztesErgebnis = null;
let letzteBreite = 0;
new ResizeObserver(() => {
  const breite = zeichenflaeche.clientWidth;
  if (letztesErgebnis && breite > 0 && breite !== letzteBreite) {
    letzteBreite = breite;
    zeichneZeichnungen();
  }
}).observe(zeichenflaeche);

// Nutzbare Laufbreite: Vorschlag = Mindestmaß der Gebäudeart, rot wenn darunter.
const laufbreiteHinweis = document.getElementById("laufbreiteHinweis");
let laufbreiteVomNutzerGeaendert = false;

function laufbreiteMinimum() {
  return DIN18065.gebaeudearten[formular.gebaeudeart.value].laufbreiteMin;
}

function aktualisiereLaufbreiteHinweis() {
  const minimum = laufbreiteMinimum();
  const wert = Number(formular.laufbreite.value);
  const zuKlein = formular.laufbreite.value !== "" && Number.isFinite(wert) && wert < minimum;
  formular.laufbreite.classList.toggle("nicht-ok", zuKlein);
  laufbreiteHinweis.classList.toggle("nicht-ok", zuKlein);
  laufbreiteHinweis.textContent = t(zuKlein ? "laufbreite.unterschritten" : "laufbreite.mindestens", {
    min: zahlFlexibel(minimum, 1),
  });
}

formular.laufbreite.addEventListener("input", () => {
  laufbreiteVomNutzerGeaendert = true;
  aktualisiereLaufbreiteHinweis();
});

for (const auswahl of formular.gebaeudeart) {
  auswahl.addEventListener("change", () => {
    // Eigene Eingaben des Nutzers bleiben erhalten.
    if (!laufbreiteVomNutzerGeaendert) formular.laufbreite.value = laufbreiteMinimum();
    aktualisiereLaufbreiteHinweis();
  });
}

aktualisiereLaufbreiteHinweis();

// Sprachwechsel (i18n.js): statische Texte sind schon übersetzt; dynamische Texte und Zeichnungen neu aufbauen.
document.addEventListener("sprachwechsel", () => {
  aktualisiereLaufbreiteHinweis();
  if (letzterFehler) {
    fehlerAnzeige.textContent = t(letzterFehler.schluessel, letzterFehler.werte);
  } else if (letztesErgebnis) {
    zeigeErgebnis(letztesErgebnis);
  }
});

formular.addEventListener("submit", (ereignis) => {
  ereignis.preventDefault();

  const geschosshoehe = Number(formular.geschosshoehe.value.replace(",", "."));
  const gebaeudeart = formular.gebaeudeart.value;

  if (!formular.geschosshoehe.value || !Number.isFinite(geschosshoehe)) {
    zeigeFehler("fehler.geschosshoeheUngueltig");
    return;
  }
  if (geschosshoehe < GESCHOSSHOEHE_MIN || geschosshoehe > GESCHOSSHOEHE_MAX) {
    zeigeFehler("fehler.geschosshoeheBereich", { min: GESCHOSSHOEHE_MIN, max: GESCHOSSHOEHE_MAX });
    return;
  }

  const laufbreite = Number(formular.laufbreite.value);
  if (!formular.laufbreite.value || !Number.isFinite(laufbreite)) {
    zeigeFehler("fehler.laufbreiteUngueltig");
    return;
  }
  if (laufbreite < LAUFBREITE_MIN || laufbreite > LAUFBREITE_MAX) {
    zeigeFehler("fehler.laufbreiteBereich", { min: LAUFBREITE_MIN, max: LAUFBREITE_MAX });
    return;
  }

  const raumVorgabe = { laenge: null, breite: null };
  for (const [schluessel, feld, fehlerPraefix] of [
    ["laenge", formular.raumLaenge, "fehler.raumLaenge"],
    ["breite", formular.raumBreite, "fehler.raumBreite"],
  ]) {
    if (feld.value === "" && feld.validity.badInput) {
      zeigeFehler(fehlerPraefix + "Ungueltig");
      return;
    }
    if (feld.value === "") continue; // optional
    const wert = Number(feld.value);
    if (!Number.isFinite(wert) || wert < RAUMMASS_MIN || wert > RAUMMASS_MAX) {
      zeigeFehler(fehlerPraefix + "Bereich", { min: RAUMMASS_MIN, max: RAUMMASS_MAX });
      return;
    }
    raumVorgabe[schluessel] = wert;
  }

  zeigeErgebnis(berechneGeradeTreppe(geschosshoehe, gebaeudeart, laufbreite, raumVorgabe));
});

// Beim Öffnen sofort mit den Standardwerten des Formulars rechnen (275 cm, Wohngebäude, 80 cm),
// damit rechts gleich eine Beispieltreppe zu sehen ist. Ein Sprachwechsel zeichnet sie neu.
formular.requestSubmit();
