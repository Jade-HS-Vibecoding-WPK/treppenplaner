/*
 * svg-ausgabe.js – Gibt eine Elementliste (elemente.js) als SVG aus.
 *
 * px([x, y]) rechnet Weltkoordinaten (cm, y nach oben) in Bildpunkte um (y nach unten).
 * Größen in cm (Schrift, Radien, Schraffurabstand) werden mit cmProPx zurück in px gerechnet.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_STRICHELUNG = "5 3"; // px, Kanten oberhalb der Schnittebene

/** Erzeugt ein SVG-Element mit Attributen und hängt es an. */
function svgElement(eltern, name, attribute = {}) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [schluessel, wert] of Object.entries(attribute)) el.setAttribute(schluessel, wert);
  eltern.appendChild(el);
  return el;
}

function svgPunkte(punkte, px) {
  return punkte.map((p) => px(p).map((w) => w.toFixed(2)).join(",")).join(" ");
}

const TEXTANKER = { links: "start", mitte: "middle", rechts: "end" };

/**
 * Zeichnet alle Elemente in das SVG (vorheriger Inhalt wird entfernt).
 * @param {SVGSVGElement} svg
 * @param {object[]} elemente
 * @param {function} px Abbildung cm → px
 * @param {number} cmProPx
 * @param {{breite: number, hoehe: number}} groesse in px
 */
function zeichneElemente(svg, elemente, px, cmProPx, groesse) {
  svg.replaceChildren();
  svg.setAttribute("viewBox", `0 0 ${groesse.breite} ${groesse.hoehe.toFixed(0)}`);
  svg.setAttribute("width", groesse.breite);
  svg.setAttribute("height", groesse.hoehe.toFixed(0));

  const defs = svgElement(svg, "defs");
  const g = svgElement(svg, "g", { stroke: "currentColor", fill: "none", "stroke-linecap": "square" });
  const schrift = svgElement(svg, "g", { fill: "currentColor", "font-size": SCHRIFTGROESSE });

  const muster = new Map(); // Schraffurmuster je Abstand/Strichstärke, nur einmal anlegen
  function schraffurMuster(el) {
    const abstandPx = el.abstand / cmProPx;
    const schluessel = `${abstandPx.toFixed(3)}-${el.breite}-${el.winkel}`;
    if (!muster.has(schluessel)) {
      const id = `${svg.id}-schraffur-${muster.size}`;
      const pattern = svgElement(defs, "pattern", {
        id, patternUnits: "userSpaceOnUse", width: abstandPx, height: abstandPx, // Musterlinie senkrecht; SVG dreht im Uhrzeigersinn (y nach unten) → Linie im Winkel el.winkel (y nach oben)
        patternTransform: `rotate(${90 - el.winkel})`,
      });
      svgElement(pattern, "line", {
        x1: 0, y1: 0, x2: 0, y2: abstandPx, stroke: "currentColor", "stroke-width": el.breite,
      });
      muster.set(schluessel, id);
    }
    return muster.get(schluessel);
  }

  // Aufeinanderfolgende Fehlmaß-Elemente kommen in eine gemeinsame Gruppe (rot per CSS).
  const letzteGruppe = new Map();
  function ziel(el) {
    const eltern = el.typ === "text" ? schrift : g;
    if (!el.fehlmass) {
      letzteGruppe.delete(eltern);
      return eltern;
    }
    if (!letzteGruppe.has(eltern)) letzteGruppe.set(eltern, svgElement(eltern, "g", { class: "fehlmass" }));
    return letzteGruppe.get(eltern);
  }

  for (const el of elemente) {
    const eltern = ziel(el);
    switch (el.typ) {
      case "linie": {
        const [x1, y1] = px(el.p1);
        const [x2, y2] = px(el.p2);
        const linie = svgElement(eltern, "line", { x1, y1, x2, y2, "stroke-width": el.breite });
        if (el.gestrichelt) {
          linie.setAttribute("stroke-dasharray", SVG_STRICHELUNG);
          linie.setAttribute("stroke-linecap", "butt");
        }
        break;
      }
      case "polylinie":
        svgElement(eltern, el.geschlossen ? "polygon" : "polyline", {
          points: svgPunkte(el.punkte, px), "stroke-width": el.breite,
        });
        break;
      case "flaeche":
        svgElement(eltern, "polygon", {
          points: svgPunkte(el.punkte, px), fill: "currentColor", "stroke-width": el.breite,
        });
        break;
      case "kreis": {
        const [cx, cy] = px(el.mitte);
        svgElement(eltern, "circle", { cx, cy, r: el.radius / cmProPx, "stroke-width": el.breite });
        break;
      }
      case "schraffur":
        svgElement(eltern, "polygon", {
          points: svgPunkte(el.umriss, px), fill: `url(#${schraffurMuster(el)})`, stroke: "none",
        });
        break;
      case "text": {
        const [x, y] = px(el.position);
        const attribute = { x, y };
        if (el.ausrichtung !== "links") attribute["text-anchor"] = TEXTANKER[el.ausrichtung];
        if (el.drehung) attribute.transform = `rotate(${-el.drehung} ${x} ${y})`;
        const schriftPx = el.hoehe / cmProPx;
        if (Math.abs(schriftPx - SCHRIFTGROESSE) > 0.01) attribute["font-size"] = schriftPx.toFixed(1);
        svgElement(eltern, "text", attribute).textContent = el.inhalt;
        break;
      }
    }
  }
}
