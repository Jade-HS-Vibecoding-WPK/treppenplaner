/*
 * app.js – Verbindet Formular, Berechnung und Ergebnisanzeige.
 */

const GESCHOSSHOEHE_MIN = 50;  // Plausibilitätsgrenze der Eingabe (kein Normwert)
const GESCHOSSHOEHE_MAX = 600; // Plausibilitätsgrenze der Eingabe (kein Normwert)

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
  urteil.textContent = e.normgerecht
    ? "✓ Die Treppe erfüllt die geprüften Anforderungen der DIN 18065."
    : "✗ Für diese Geschosshöhe ist keine normgerechte gerade Treppe möglich. Gezeigt wird die nächstliegende Lösung.";
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
}

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

  zeigeErgebnis(berechneGeradeTreppe(geschosshoehe, gebaeudeart));
});
