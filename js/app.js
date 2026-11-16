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

/** Formatiert eine Zahl deutsch mit einer Nachkommastelle und Einheit cm. */
function cm(wert) {
  return wert.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " cm";
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
    const zeile = document.createElement("tr");
    const zellen = [p.bezeichnung, cm(p.wert), p.grenze, p.ok ? "✓ erfüllt" : "✗ nicht erfüllt"];
    zellen.forEach((inhalt, i) => {
      const td = document.createElement("td");
      td.textContent = inhalt;
      if (i === 3) td.className = p.ok ? "ok" : "nicht-ok";
      zeile.appendChild(td);
    });
    tbody.appendChild(zeile);
  }

  ergebnisBlock.hidden = false;

  // Zeichnung erst nach dem Einblenden, damit die verfügbare Breite bekannt ist.
  letztesErgebnis = e;
  zeichneZeichnungen();
}

/** Schnitt und Grundriss zeichnen; der Grundriss übernimmt Maßstab und x-Lage des Schnitts. */
function zeichneZeichnungen() {
  const abbildung = zeichneSchnitt(schnittSvg, letztesErgebnis);
  zeichneGrundriss(grundrissSvg, letztesErgebnis, abbildung);
}

// Bei Größenänderung des Fensters neu zeichnen (nur wenn sich die Breite ändert).
const schnittSvg = document.getElementById("schnitt");
const grundrissSvg = document.getElementById("grundriss");
let letztesErgebnis = null;
let letzteBreite = 0;
new ResizeObserver(() => {
  const breite = schnittSvg.parentElement.clientWidth;
  if (letztesErgebnis && breite > 0 && breite !== letzteBreite) {
    letzteBreite = breite;
    zeichneZeichnungen();
  }
}).observe(schnittSvg.parentElement);

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

  zeigeErgebnis(berechneGeradeTreppe(geschosshoehe, gebaeudeart, laufbreite));
});
