/*
 * app.js – Verbindet Formular, Berechnung und Ergebnisanzeige.
 */

const GESCHOSSHOEHE_MIN = 50;  // Plausibilitätsgrenze der Eingabe (kein Normwert)
const GESCHOSSHOEHE_MAX = 600; // Plausibilitätsgrenze der Eingabe (kein Normwert)
const LAUFBREITE_MIN = 30;     // Plausibilitätsgrenze der Eingabe (kein Normwert)
const LAUFBREITE_MAX = 400;    // Plausibilitätsgrenze der Eingabe (kein Normwert)

// Geschütztes Leerzeichen: Zahl und Einheit nie getrennt umbrechen.
const NBSP = " ";

const formular = document.getElementById("eingabe");
const fehlerAnzeige = document.getElementById("fehler");
const ergebnisBlock = document.getElementById("ergebnis");

/**
 * Formatiert eine Zahl im Format der Sprache mit Einheit cm (nur Anzeige – gerechnet wird exakt).
 * maxStellen = 2 in der Normprüfung, damit z. B. 19,04 cm nicht als „19,0“ erscheint.
 */
function cm(wert, maxStellen = 1) {
  return zahlFlexibel(wert, maxStellen, 1) + NBSP + "cm";
}

/**
 * Zulässiger Bereich als Text: {min, max} → „14–20 cm“, {min} → „≥ 80 cm“, {max} → „≤ 18“.
 * einheit "anzahl" (z. B. Steigungen je Lauf) ohne „cm“.
 */
function grenzeText(grenze, einheit = "cm") {
  const z = (wert) => zahlFlexibel(wert, 1);
  const suffix = einheit === "anzahl" ? "" : " cm";
  if (grenze.min != null && grenze.max != null) return `${z(grenze.min)}–${z(grenze.max)}${suffix}`;
  if (grenze.min != null) return `≥ ${z(grenze.min)}${suffix}`;
  return `≤ ${z(grenze.max)}${suffix}`;
}

/** Wert einer Prüfzeile: Längen mit bis zu 2 Nachkommastellen, Anzahlen ganzzahlig. */
function pruefwertText(p) {
  return p.einheit === "anzahl" ? String(p.wert) : cm(p.wert, 2);
}

/** Gesamturteil: erst die Stufen, dann die Laufbreite, dann die Aufteilung auf Läufe. */
function urteilText(e) {
  if (e.normgerecht) return t("urteil.normgerecht");
  if (!e.stufenNormgerecht) return t("urteil.keineLoesung");
  if (!e.laufbreiteNormgerecht) return t("urteil.laufbreite");
  if (e.form === "spindel" && !e.spindelNormgerecht) return t("urteil.spindel");
  if (e.form === "gerade" || e.form === "spindel") {
    return t("urteil.podestNoetig", { max: DIN18065.gebaeudearten[e.gebaeudeart].maxSteigungenJeLauf });
  }
  return t("urteil.laeufe");
}

// Letzte Fehlermeldung als Schlüssel, damit sie beim Sprachwechsel neu übersetzt werden kann.
let letzterFehler = null;

function zeigeFehler(schluessel, werte = {}) {
  letzterFehler = { schluessel, werte };
  fehlerAnzeige.textContent = t(schluessel, werte);
  fehlerAnzeige.hidden = false;
  ergebnisBlock.hidden = true;
  letztesErgebnis = null;
  letzterVergleich = null;
}

function setzeText(id, text) {
  document.getElementById(id).textContent = text;
}

function zeigeErgebnis(e) {
  letzterFehler = null;
  fehlerAnzeige.hidden = true;

  // Mit Podest: Aufteilung auf die Läufe in Klammern, z. B. „16 (8 + 8)“
  const jeLauf = (wert) => (e.laeufe.length > 1 ? ` (${e.laeufe.map(wert).join(" + ")})` : "");
  setzeText("anzahlSteigungen", e.anzahlSteigungen + jeLauf((l) => l.steigungen));
  setzeText("anzahlAuftritte", e.anzahlAuftritte + jeLauf((l) => l.auftritte));
  setzeText("steigung", cm(e.steigung));
  setzeText("auftritt", cm(e.auftritt));
  zeigeSteilHinweis(e);
  setzeText("schrittmass", cm(e.schrittmass));
  // Gerade Treppe: Lauflänge; mit Podest: Platzbedarf Länge × Breite; Spindeltreppe: Durchmesser D
  const gerade = e.form === "gerade";
  const spindel = e.form === "spindel";
  const titel = gerade ? "ergebnis.lauflaenge" : spindel ? "ergebnis.durchmesser" : "ergebnis.platzbedarf";
  setzeI18n(document.getElementById("lauflaengeTitel"), titel);
  // Umbruch höchstens nach „×“, nie vor „cm“
  const platzbedarf = `${zahl(e.footprint.laenge)}${NBSP}× ${cm(e.footprint.breite)}`;
  setzeText("lauflaenge", gerade ? cm(e.lauflaenge) : spindel ? cm(e.spindel.durchmesser) : platzbedarf);
  // Spindeltreppe: Teilung und Hinweis „notwendige Treppe“
  document.getElementById("teilungKennwert").hidden = !spindel;
  if (spindel) setzeText("teilung", String(e.spindel.teilung));
  const spindelHinweis = document.getElementById("spindelHinweis");
  spindelHinweis.hidden = !spindel;
  spindelHinweis.textContent = spindel ? t("hinweis.notwendigeTreppe") : "";
  setzeZeichnungstitel(gerade);
  if (spindel) setzeI18n(grundrissSvg, "grundriss.ariaSpindel", true);
  setzeLegenden(e, auswahl.material);
  setzeUntertitel(e.form);

  const urteil = document.getElementById("gesamturteil");
  urteil.textContent = urteilText(e);
  urteil.className = "urteil " + (e.normgerecht ? "ok" : "nicht-ok");

  const tbody = document.getElementById("pruefungen");
  tbody.replaceChildren();
  for (const p of e.pruefungen) {
    const ergebnis = p.ok ? t("pruefung.erfuellt") : t("pruefung.nichtErfuellt");
    fuegePruefzeileHinzu(tbody, [t("kriterium." + p.kriterium), pruefwertText(p), grenzeText(p.grenze, p.einheit), ergebnis], p.ok);
  }

  zeigeRaumpruefung(tbody, e.raum);
  zeigeDruckEingabe(e);

  ergebnisBlock.hidden = false;

  // Zeichnung erst nach dem Einblenden, damit die verfügbare Breite bekannt ist.
  // Das Material ändert nur die Zeichnungen (und den Export), nicht Berechnung und Normprüfung.
  letztesErgebnis = { ...e, material: auswahl.material };
  zeichneZeichnungen();
}

/** „sehr steil“ hinter dem Wert, der den Hinweis auslöst (s und/oder a); schwarz, kein Normverstoß. */
function zeigeSteilHinweis(e) {
  const steil = steilheit(e);
  for (const id of ["steigung", "auftritt"]) {
    if (!steil[id]) continue;
    const hinweis = document.createElement("span");
    hinweis.className = "steil-hinweis";
    hinweis.textContent = t("hinweis.sehrSteil");
    document.getElementById(id).append(" ", hinweis); // Leerzeichen für Screenreader
  }
}

/** Setzt einen Wörterbuchschlüssel (Text oder aria-label), damit ein Sprachwechsel ihn mit übersetzt. */
function setzeI18n(el, schluessel, aria = false) {
  if (aria) {
    el.dataset.i18nAria = schluessel;
    el.setAttribute("aria-label", t(schluessel));
  } else {
    el.dataset.i18n = schluessel;
    el.textContent = t(schluessel);
  }
}

/** Untertitel der Seite je nach gewählter Form (gerade | L | U | spindel). */
function setzeUntertitel(form) {
  const endung = { gerade: "", L: "L", U: "U", spindel: "Spindel" }[form];
  const schluessel = "seite.untertitel" + endung;
  setzeI18n(document.querySelector(".untertitel"), schluessel);
}

/** Gerade Treppe: Schnitt; mit Podest: Abwicklung entlang der Lauflinie. */
function setzeZeichnungstitel(gerade) {
  setzeI18n(document.getElementById("schnittTitel"), gerade ? "schnitt.titel" : "schnitt.titelAbwicklung");
  setzeI18n(schnittSvg, gerade ? "schnitt.aria" : "schnitt.ariaAbwicklung", true);
  setzeI18n(grundrissSvg, gerade ? "grundriss.aria" : "grundriss.ariaPodest", true);
}

/**
 * Bildunterschriften von Schnitt und Grundriss mit Material und Annahmen (Maße aus material.js).
 * Wird bei jedem Sprachwechsel neu gesetzt (zeigeAuswahl), daher ohne data-i18n.
 */
function setzeLegenden(e, materialSchluessel) {
  const material = MATERIALIEN[materialSchluessel];
  const gerade = e.form === "gerade";
  const materialText = t("materialText." + material.schluessel);
  const cm = (wert) => zahlFlexibel(wert, 1);

  let konstruktion;
  if (e.form === "spindel") {
    konstruktion = t("konstruktion.spindel", { material: materialText, tritt: cm(spindelMasse(material).stufendicke) });
    if (material.konstruktion === "laufplatte") konstruktion += " · " + t("konstruktion.spindelStahlbeton");
    konstruktion += " · " + t("schnitt.spindelMasse");
  } else if (material.konstruktion === "laufplatte") {
    konstruktion = t(gerade ? "konstruktion.laufplatte" : "konstruktion.laufplatteAbwicklung", {
      platte: cm(bauteil(material, "laufplatte").dicke),
    });
  } else {
    const wange = bauteil(material, "wange");
    konstruktion = t(gerade ? "konstruktion.wange" : "konstruktion.wangeAbwicklung", {
      material: materialText,
      tritt: cm(bauteil(material, "trittstufe").dicke),
      wd: cm(wange.dicke),
      wh: cm(wange.hoehe),
    });
  }
  document.getElementById("schnittLegende").textContent = t(gerade ? "schnitt.legende" : "schnitt.legendeAbwicklung", {
    konstruktion, decke: cm(DECKENDICKE),
  });

  const teile = [t(e.form === "spindel" ? "grundriss.legendeSpindel" : "grundriss.legende", { material: materialText })];
  if (e.form === "spindel") {
    const masse = spindelMasse(material);
    teile.push(t("grundriss.spindel", {
      r: cm(e.spindel.rL), d: cm(masse.spindelDurchmesser), g: cm(masse.gelaenderZuschlag),
    }));
  } else if (material.konstruktion === "wange") {
    teile.push(t("grundriss.wangen"));
  }
  // U: Wangen am Treppenauge stoßen aneinander, wenn zwei Wangendicken breiter sind als das Auge.
  const augeMin = 2 * wangendicke(material);
  if (e.form === "U" && augeMin > TREPPENAUGE + RECHENTOLERANZ) {
    teile.push(t("grundriss.augeVereinfacht", { material: materialText, min: cm(augeMin) }));
  }
  const legende = document.getElementById("grundrissLegende");
  legende.textContent = teile.join(" · ");
  legende.dataset.basis = legende.textContent; // Ergänzung nach dem Zeichnen: ergaenzeAustrittLegende()
}

/**
 * Spindeltreppe: Passt die Beschriftung „Austritt“ beim aktuellen Maßstab nicht in den Grundriss
 * (spindelgrundriss.js lässt sie dann weg), erklärt die Legende die kräftige Strichlinie.
 * Nach jedem Zeichnen aufgerufen, weil der Maßstab von der Fensterbreite abhängt.
 */
function ergaenzeAustrittLegende() {
  const legende = document.getElementById("grundrissLegende");
  const basis = legende.dataset.basis ?? legende.textContent;
  const beschriftet = [...grundrissSvg.querySelectorAll("text")].some((n) => n.textContent === t("zeichnung.austritt"));
  const fehlt = letztesErgebnis.form === "spindel" && !beschriftet;
  legende.textContent = fehlt ? `${basis} · ${t("grundriss.austrittLegende")}` : basis;
}

/** Name der Treppenform, z. B. „L-Treppe (links)“. */
function formText(e) {
  const name = t("form." + e.form);
  return e.richtung ? `${name} (${t("richtung." + e.richtung)})` : name;
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

/** Fehlmaß als Text, aufgerundet auf 0,1 cm (gleiche Regel wie im Grundriss, siehe raum.js). */
function fehlmass(wert) {
  return zahlFlexibel(fehlmassAufgerundet(wert), 1) + NBSP + "cm";
}

/** Fehlmaße als Aufzählung, z. B. „84 cm Länge und 10 cm Breite“ (Satzbau je Sprache in i18n.js). */
function fehltTeile(fehlt) {
  const teile = [];
  if (fehlt.laenge > 0) teile.push(t("raum.fehltLaenge", { wert: fehlmass(fehlt.laenge) }));
  if (fehlt.breite > 0) teile.push(t("raum.fehltBreite", { wert: fehlmass(fehlt.breite) }));
  return teile.join(t("raum.und"));
}

/** Text wie „Es fehlen 84 cm Länge und 10 cm Breite.“ */
function fehltText(fehlt) {
  return t("raum.fehlt", { teile: fehltTeile(fehlt) });
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

  teile.push(t("druck.form", { wert: formText(e) })); // Formwahl ist im Druck ausgeblendet
  teile.push(t("druck.material", { wert: t("material." + auswahl.material) })); // Materialwahl ebenso

  const zeile = document.getElementById("druckEingabe");
  const titel = document.createElement("strong");
  titel.textContent = t("eingabe.titel");
  zeile.replaceChildren(titel, " " + teile.join(" · "));
}

/** Schnitt und Grundriss zeichnen; der Grundriss übernimmt Maßstab und x-Lage des Schnitts. */
function zeichneZeichnungen() {
  // Sichtbare Breite des Scrollbereichs, nicht der Abbildung (die wächst mit der Zeichnung).
  // Abgerundet: clientWidth rundet z. B. 957,6 px auf 958 – die Zeichnung wäre dann zu breit.
  const breite = Math.floor(zeichenflaeche.getBoundingClientRect().width);
  const abbildung = zeichneSchnitt(schnittSvg, letztesErgebnis, breite);
  zeichneGrundriss(grundrissSvg, letztesErgebnis, abbildung);
  ergaenzeAustrittLegende();
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
  } else if (letzterVergleich) {
    zeigeAuswahl();
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

  letzteEingabe = { geschosshoehe, gebaeudeart, laufbreite, raumVorgabe, material: auswahl.material };
  berechneVergleich(true);
});

// Variantenvergleich (bewertung.js): alle vier Formen; gezeichnet, geprüft und exportiert
// wird die gewählte Karte – nach „Berechnen“ die Empfehlung (oder die, der am wenigsten fehlt).
let letzteEingabe = null;
let letzterVergleich = null;
const auswahl = { form: null, richtung: { L: "links", spindel: "links" }, material: STANDARD_MATERIAL };

/** Vergleicht die Varianten neu; bei neuer Eingabe wird die Empfehlung gewählt. */
function berechneVergleich(neueEingabe) {
  letzterVergleich = vergleicheVarianten(letzteEingabe, auswahl.richtung);
  if (neueEingabe) auswahl.form = letzterVergleich.empfehlung ?? letzterVergleich.naechste;
  zeigeAuswahl();
}

/** Karten, Urteil, Kennwerte, Zeichnungen und Normprüfung der gewählten Variante. */
function zeigeAuswahl() {
  zeigeVergleich(letzterVergleich, auswahl.form);
  zeigeErgebnis(letzterVergleich.varianten.find((v) => v.form === auswahl.form).treppe);
}

document.getElementById("varianten").addEventListener("click", (ereignis) => {
  const richtungKnopf = ereignis.target.closest("[data-richtung]");
  const karte = ereignis.target.closest(".karte");
  if (!karte) return;
  auswahl.form = karte.dataset.form;
  if (richtungKnopf) {
    auswahl.richtung[auswahl.form] = richtungKnopf.dataset.richtung; // L oder Spindeltreppe
    berechneVergleich(false);
  } else {
    zeigeAuswahl();
  }
  // Die Karten werden neu aufgebaut: Fokus auf dieselbe Schaltfläche zurücksetzen.
  const ziel = richtungKnopf
    ? `.karte[data-form="${auswahl.form}"] [data-richtung="${auswahl.richtung[auswahl.form]}"]`
    : `.karte[data-form="${auswahl.form}"] .karte-wahl`;
  document.querySelector(ziel)?.focus();
});

// Materialwahl: zeichnet die gewählte Variante neu. Gerade, L und U bleiben gleich; bei der
// Spindeltreppe gehen Spindel und Stufendicke in die Berechnung ein – daher neu vergleichen.
const materialwahl = document.querySelector(".materialwahl");
materialwahl.addEventListener("click", (ereignis) => {
  const knopf = ereignis.target.closest("button[data-material]");
  if (!knopf || knopf.dataset.material === auswahl.material) return;
  auswahl.material = knopf.dataset.material;
  for (const b of materialwahl.querySelectorAll("button")) {
    b.setAttribute("aria-pressed", String(b === knopf));
  }
  if (!letzterVergleich) return;
  letzteEingabe = { ...letzteEingabe, material: auswahl.material };
  berechneVergleich(false);
});

// Beim Öffnen sofort mit den Standardwerten des Formulars rechnen (275 cm, Wohngebäude, 80 cm),
// damit rechts gleich eine Beispieltreppe zu sehen ist. Ein Sprachwechsel zeichnet sie neu.
formular.requestSubmit();
