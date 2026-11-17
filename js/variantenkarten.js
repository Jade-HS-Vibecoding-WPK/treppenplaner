/*
 * variantenkarten.js – Anzeige des Variantenvergleichs (bewertung.js):
 * Empfehlungssatz, drei Karten mit Mini-Grundriss (ohne Maße) und die Kurztabelle für den Druck.
 * Rechnet nichts selbst; Texte aus i18n.js, Zahlenformat wie in app.js (cm, NBSP).
 */

const SKIZZE_RAND = 0.06; // Anteil der größeren Seite als Luft rund um den Mini-Grundriss

/** Neues SVG-Element (Namensraum SVG_NS aus svg-ausgabe.js). */
function skizzenElement(eltern, name, attribute) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [schluessel, wert] of Object.entries(attribute)) el.setAttribute(schluessel, wert);
  eltern.appendChild(el);
  return el;
}

/**
 * Mini-Grundriss ohne Maße: Läufe mit Setzstufen, Podest, Lauflinie, ggf. Raumrechteck
 * (rot, wenn die Treppe nicht hineinpasst). Gleiche Anordnung wie der große Grundriss (anordnung()).
 * Koordinaten in cm, y nach oben → im SVG gespiegelt.
 */
function miniGrundriss(treppe) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "karte-skizze");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("preserveAspectRatio", "xMinYMid meet");

  const { laeufe, podest } = anordnung(treppe);
  const B = treppe.laufbreite;
  const a = treppe.auftritt;
  const vorgabe = treppe.raum?.vorgabe;
  const raum = vorgabe?.laenge != null && vorgabe?.breite != null ? vorgabe : null;
  const xMax = Math.max(treppe.footprint.laenge, raum?.laenge ?? 0);
  const yMax = Math.max(treppe.footprint.breite, raum?.breite ?? 0);
  const rand = SKIZZE_RAND * Math.max(xMax, yMax);
  svg.setAttribute("viewBox", `${-rand} ${-yMax - rand} ${xMax + 2 * rand} ${yMax + 2 * rand}`);

  const p = ([x, y]) => `${x},${-y}`;
  const strich = { fill: "none", stroke: "currentColor", "vector-effect": "non-scaling-stroke" };
  const rechteck = (r, breite, extra = {}) =>
    skizzenElement(svg, "rect", {
      ...strich, x: r.x1, y: -r.y2, width: r.x2 - r.x1, height: r.y2 - r.y1, "stroke-width": breite, ...extra,
    });

  if (raum) {
    rechteck({ x1: 0, y1: 0, x2: raum.laenge, y2: raum.breite }, 0.75, {
      "stroke-dasharray": "4 3",
      class: treppe.raum.passt ? "" : "fehlmass",
    });
  }
  for (const lauf of laeufe) {
    rechteck(laufRechteck(lauf, B), 1);
    const auftritte = Math.round(lauf.laenge / a);
    for (let i = 1; i < auftritte; i++) {
      const punkte = [laufPunkt(lauf, i * a, -B / 2), laufPunkt(lauf, i * a, B / 2)].map(p).join(" ");
      skizzenElement(svg, "polyline", { ...strich, points: punkte, "stroke-width": 0.5 });
    }
  }
  if (podest) rechteck(podest.rechteck, 1);

  // Lauflinie mit Antrittskreis
  const lauflinie = [laufPunkt(laeufe[0], 0, 0), laufPunkt(laeufe[0], laeufe[0].laenge, 0)];
  if (podest) lauflinie.push(...podest.lauflinie);
  for (const lauf of laeufe.slice(1)) lauflinie.push(laufPunkt(lauf, 0, 0), laufPunkt(lauf, lauf.laenge, 0));
  skizzenElement(svg, "polyline", { ...strich, points: lauflinie.map(p).join(" "), "stroke-width": 0.5 });
  const [sx, sy] = lauflinie[0];
  skizzenElement(svg, "circle", { ...strich, cx: sx, cy: -sy, r: B / 12, "stroke-width": 0.75 });
  return svg;
}

/** Text eines Ausschlussgrunds, z. B. „passt nicht: es fehlen 34,3 cm Länge“. */
function ausschlussText(g) {
  switch (g.grund) {
    case "raum": return t("ausschluss.raum", { teile: fehltTeile(g.fehlt) });
    case "podestNoetig": return t("ausschluss.podestNoetig", { max: g.max });
    case "laufZuKurz": return t("ausschluss.laufZuKurz", { min: g.min });
    default: return t("ausschluss." + g.grund);
  }
}

/** Satz über der Kartenreihe: Empfehlung mit Begründung oder „Keine Variante passt“. */
function empfehlungText(vergleich) {
  if (!vergleich.empfehlung) {
    const naechste = vergleich.varianten.find((v) => v.form === vergleich.naechste);
    return t("empfehlung.keine", {
      form: t("form." + naechste.form),
      grund: naechste.gruende.map(ausschlussText).join("; "),
    });
  }
  const sieger = vergleich.varianten.find((v) => v.form === vergleich.empfehlung);
  const werte = { form: t("form." + sieger.form), punkte: Math.round(sieger.gesamt) };
  if (vergleich.begruendung.art === "einzige") return t("empfehlung.einzige", werte);
  return t("empfehlung.satz", { ...werte, grund: t("empfehlung.grund." + vergleich.begruendung.kriterium) });
}

/** Kleines Inline-Element mit Klasse und Text (Inhalt der Kartenschaltfläche: nur Phrasing-Elemente). */
function span(klasse, text = "") {
  const el = document.createElement("span");
  if (klasse) el.className = klasse;
  el.textContent = text;
  return el;
}

/** Wertezeile der Karte: Bezeichnung links, Wert rechts. */
function kartenwert(bezeichnung, wert) {
  const zeile = span("");
  const b = document.createElement("b");
  b.textContent = wert;
  zeile.append(bezeichnung, b);
  return zeile;
}

function karte(v, vergleich, gewaehlt) {
  const tr = v.treppe;
  const el = document.createElement("div");
  el.className = "karte" + (v.ausgeschlossen ? " ausgeschlossen" : "") + (gewaehlt ? " gewaehlt" : "");
  el.dataset.form = v.form;

  const knopf = document.createElement("button");
  knopf.type = "button";
  knopf.className = "karte-wahl";
  knopf.setAttribute("aria-pressed", String(gewaehlt));
  const inhalt = span("karte-inhalt");
  knopf.appendChild(inhalt);

  const kopf = span("karte-kopf");
  kopf.appendChild(span("karte-titel", t("form." + v.form)));
  if (vergleich.empfehlung === v.form) kopf.appendChild(span("karte-marke", t("vergleich.empfehlung")));
  if (vergleich.naechste === v.form) kopf.appendChild(span("karte-marke", t("vergleich.naechste")));
  // Hinweis, kein Normverstoß: schwarz umrandet statt rot (Rot nur für Probleme)
  if (steilheit(tr).sehrSteil) kopf.appendChild(span("karte-marke steil", t("hinweis.sehrSteil")));
  inhalt.append(kopf, miniGrundriss(tr));

  const jeLauf = tr.laeufe.length > 1 ? ` (${tr.laeufe.map((l) => l.steigungen).join(" + ")})` : "";
  const werte = span("karte-werte");
  werte.append(
    kartenwert(t("ergebnis.anzahlSteigungen"), tr.anzahlSteigungen + jeLauf),
    kartenwert("s / a", `${zahl(tr.steigung)} / ${cm(tr.auftritt)}`),
    kartenwert(t("ergebnis.platzbedarf"), `${zahl(tr.footprint.laenge)}${NBSP}× ${cm(tr.footprint.breite)}`),
  );
  inhalt.appendChild(werte);

  if (v.ausgeschlossen) {
    const gruende = span("karte-gruende");
    for (const g of v.gruende) gruende.appendChild(span("", "✗ " + ausschlussText(g)));
    inhalt.appendChild(gruende);
  } else {
    // Gesamtpunkte groß, Teilpunkte klein daneben (spart eine Zeile)
    const bewertungszeile = span("karte-bewertung");
    bewertungszeile.appendChild(span("karte-punkte", t("vergleich.vonHundert", { punkte: Math.round(v.gesamt) })));
    const teile = Object.keys(GEWICHTE).map((k) => `${t("bewertung." + k)} ${Math.round(v.punkte[k])}`);
    bewertungszeile.appendChild(span("karte-teilpunkte", teile.join(" · ")));
    inhalt.appendChild(bewertungszeile);
  }
  el.appendChild(knopf);

  // L: Drehsinn links | rechts (gleiche Punkte, Spiegelbild)
  if (v.form === "L") {
    const wahl = document.createElement("div");
    wahl.className = "richtungwahl";
    wahl.setAttribute("role", "group");
    wahl.setAttribute("aria-label", t("vergleich.drehsinn"));
    wahl.appendChild(span("", t("vergleich.drehsinnLabel")));
    ["links", "rechts"].forEach((richtung, i) => {
      if (i > 0) {
        const trenner = span("", "|");
        trenner.setAttribute("aria-hidden", "true");
        wahl.appendChild(trenner);
      }
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.richtung = richtung;
      b.textContent = t("richtung." + richtung);
      b.setAttribute("aria-pressed", String(tr.richtung === richtung));
      wahl.appendChild(b);
    });
    el.appendChild(wahl);
  }
  return el;
}

/** Kurzvergleich für Seite 1 des Drucks: Variante | Punkte | Ergebnis. */
function zeigeVergleichDruck(vergleich) {
  const tbody = document.querySelector("#vergleichDruck tbody");
  tbody.replaceChildren();
  for (const v of vergleich.varianten) {
    let ergebnis = "";
    if (vergleich.empfehlung === v.form) ergebnis = t("vergleich.empfehlung");
    else if (v.ausgeschlossen) ergebnis = "✗ " + v.gruende.map(ausschlussText).join("; ");
    const punkte = v.ausgeschlossen ? "–" : t("vergleich.vonHundert", { punkte: Math.round(v.gesamt) });
    fuegePruefzeileHinzu(tbody, [formText(v.treppe), punkte, ergebnis], !v.ausgeschlossen);
  }
}

/** Empfehlung, Karten und Drucktabelle; gewaehlteForm = Form der gezeichneten Variante. */
function zeigeVergleich(vergleich, gewaehlteForm) {
  const satz = document.getElementById("empfehlung");
  satz.textContent = empfehlungText(vergleich);
  satz.className = "urteil empfehlung " + (vergleich.empfehlung ? "ok" : "nicht-ok");

  document.getElementById("varianten").replaceChildren(
    ...vergleich.varianten.map((v) => karte(v, vergleich, v.form === gewaehlteForm)),
  );
  zeigeVergleichDruck(vergleich);

  // „Karte anklicken“ nur am Bildschirm (im Druck ausgeblendet)
  document.getElementById("gewichteHinweis").replaceChildren(
    t("vergleich.gewichte", GEWICHTE) + " ",
    span("nur-bildschirm", t("vergleich.anklicken")),
  );
}
