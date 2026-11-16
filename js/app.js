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
 * Formatiert eine Zahl deutsch mit Einheit cm (nur Anzeige – gerechnet wird exakt).
 * maxStellen = 2 in der Normprüfung, damit z. B. 19,04 cm nicht als „19,0“ erscheint.
 */
function cm(wert, maxStellen = 1) {
  return wert.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: maxStellen }) + " cm";
}

function zeigeFehler(text) {
  fehlerAnzeige.textContent = text;
  fehlerAnzeige.hidden = false;
  ergebnisBlock.hidden = true;
}

function setzeText(id, text) {
  document.getElementById(id).textContent = text;
}

function zeigeErgebnis(e) {
  fehlerAnzeige.hidden = true;

  setzeText("anzahlSteigungen", e.anzahlSteigungen);
  setzeText("anzahlAuftritte", e.anzahlAuftritte);
  setzeText("steigung", cm(e.steigung));
  setzeText("auftritt", cm(e.auftritt));
  setzeText("schrittmass", cm(e.schrittmass));
  setzeText("lauflaenge", cm(e.lauflaenge));

  const urteil = document.getElementById("gesamturteil");
  if (e.normgerecht) {
    urteil.textContent = "✓ Die Treppe erfüllt die geprüften Anforderungen der DIN 18065.";
  } else if (!e.stufenNormgerecht) {
    urteil.textContent =
      "✗ Für diese Geschosshöhe ist keine normgerechte gerade Treppe möglich. Gezeigt wird die nächstliegende Lösung.";
  } else {
    urteil.textContent = "✗ Die nutzbare Laufbreite unterschreitet das Mindestmaß nach DIN 18065.";
  }
  urteil.className = "urteil " + (e.normgerecht ? "ok" : "nicht-ok");

  const tbody = document.getElementById("pruefungen");
  tbody.replaceChildren();
  for (const p of e.pruefungen) {
    fuegePruefzeileHinzu(tbody, [p.bezeichnung, cm(p.wert, 2), p.grenze, p.ok ? "✓ erfüllt" : "✗ nicht erfüllt"], p.ok);
  }

  zeigeRaumpruefung(tbody, e.raum);

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
  return (Math.ceil(wert * 10) / 10).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " cm";
}

/** Text wie „Es fehlen 84 cm Länge und 10 cm Breite.“ */
function fehltText(fehlt) {
  const teile = [];
  if (fehlt.laenge > 0) teile.push(`${fehlmass(fehlt.laenge)} Länge`);
  if (fehlt.breite > 0) teile.push(`${fehlmass(fehlt.breite)} Breite`);
  return `Es fehlen ${teile.join(" und ")}.`;
}

/** Zeile „Passt in den Raum“ und Raumurteil – getrennt von der Normprüfung. */
function zeigeRaumpruefung(tbody, raum) {
  const urteil = document.getElementById("raumurteil");
  document.getElementById("raumHinweis").hidden = !raum;
  urteil.hidden = !raum;
  if (!raum) return;

  const { footprint, vorgabe, fehlt, passt } = raum;
  const wert = `${zahl(footprint.laenge)} × ${zahl(footprint.breite)} cm`;
  const zahlKurz = (v) => v.toLocaleString("de-DE", { maximumFractionDigits: 1 });
  let grenze;
  if (vorgabe.laenge != null && vorgabe.breite != null) {
    grenze = `≤ ${zahlKurz(vorgabe.laenge)} × ${zahlKurz(vorgabe.breite)} cm`;
  } else if (vorgabe.laenge != null) {
    grenze = `Länge ≤ ${zahlKurz(vorgabe.laenge)} cm`;
  } else {
    grenze = `Breite ≤ ${zahlKurz(vorgabe.breite)} cm`;
  }
  grenze += " (Raumvorgabe)";
  const ergebnis = passt ? "✓ passt" : "✗ " + fehltText(fehlt);
  fuegePruefzeileHinzu(tbody, ["Passt in den Raum", wert, grenze, ergebnis], passt, "raumzeile");

  urteil.textContent = passt
    ? "✓ Die Treppe passt in den verfügbaren Raum."
    : "✗ Die Treppe passt nicht in den verfügbaren Raum. " + fehltText(fehlt);
  urteil.className = "urteil " + (passt ? "ok" : "nicht-ok");
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
  laufbreiteHinweis.textContent = zuKlein
    ? `Unterschreitet das Mindestmaß von ${minimum} cm nach DIN 18065.`
    : `Mindestens ${minimum} cm nach DIN 18065.`;
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

formular.addEventListener("submit", (ereignis) => {
  ereignis.preventDefault();

  const geschosshoehe = Number(formular.geschosshoehe.value.replace(",", "."));
  const gebaeudeart = formular.gebaeudeart.value;

  if (!formular.geschosshoehe.value || !Number.isFinite(geschosshoehe)) {
    zeigeFehler("Bitte eine gültige Geschosshöhe in cm eingeben.");
    return;
  }
  if (geschosshoehe < GESCHOSSHOEHE_MIN || geschosshoehe > GESCHOSSHOEHE_MAX) {
    zeigeFehler(`Die Geschosshöhe muss zwischen ${GESCHOSSHOEHE_MIN} und ${GESCHOSSHOEHE_MAX} cm liegen.`);
    return;
  }

  const laufbreite = Number(formular.laufbreite.value);
  if (!formular.laufbreite.value || !Number.isFinite(laufbreite)) {
    zeigeFehler("Bitte eine gültige nutzbare Laufbreite in cm eingeben.");
    return;
  }
  if (laufbreite < LAUFBREITE_MIN || laufbreite > LAUFBREITE_MAX) {
    zeigeFehler(`Die nutzbare Laufbreite muss zwischen ${LAUFBREITE_MIN} und ${LAUFBREITE_MAX} cm liegen.`);
    return;
  }

  const raumVorgabe = { laenge: null, breite: null };
  for (const [schluessel, feld, name] of [
    ["laenge", formular.raumLaenge, "verfügbare Länge"],
    ["breite", formular.raumBreite, "verfügbare Breite"],
  ]) {
    if (feld.value === "" && feld.validity.badInput) {
      zeigeFehler(`Bitte eine gültige ${name} in cm eingeben oder das Feld leer lassen.`);
      return;
    }
    if (feld.value === "") continue; // optional
    const wert = Number(feld.value);
    if (!Number.isFinite(wert) || wert < RAUMMASS_MIN || wert > RAUMMASS_MAX) {
      zeigeFehler(`Die ${name} muss zwischen ${RAUMMASS_MIN} und ${RAUMMASS_MAX} cm liegen.`);
      return;
    }
    raumVorgabe[schluessel] = wert;
  }

  zeigeErgebnis(berechneGeradeTreppe(geschosshoehe, gebaeudeart, laufbreite, raumVorgabe));
});
