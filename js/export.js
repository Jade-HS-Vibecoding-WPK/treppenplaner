/*
 * export.js – Download von Schnitt und Grundriss (DXF, SVG) und Drucken (PDF).
 *
 * Für den Export werden die Elementlisten mit festem Beschriftungsmaßstab neu berechnet:
 * Texte und Maßlinienabstände sind so groß, dass die Zeichnung im Maßstab 1:50
 * geplottet eine Versalhöhe von 2,5 mm hat. Die Geometrie selbst ist immer 1:1.
 */

// Beschriftungsmaßstab für den Export (Annahme, gängiger Werkplanmaßstab für Treppen – kein Normwert).
const EXPORT_MASSSTAB = 50;
const EXPORT_VERSALHOEHE_PAPIER = 0.25; // cm (= 2,5 mm) auf dem Papier
// cm im Modell je Bildschirm-px der Beschriftung: 13 px Schrift → 2,5 mm Versalhöhe bei 1:50
const EXPORT_CM_PRO_PX = (EXPORT_VERSALHOEHE_PAPIER * EXPORT_MASSSTAB) / (SCHRIFTGROESSE * DXF_VERSALHOEHE);

const ZEICHNUNGEN = {
  schnitt: (ergebnis, cmProPx) => schnittElemente(ergebnis, cmProPx),
  grundriss: (ergebnis, cmProPx) => grundrissElemente(ergebnis, cmProPx),
};

/**
 * Dateiname mit Geschosshöhe und Form, z. B. treppe_280_schnitt.dxf (gerade),
 * treppe_280_L-links_grundriss.dxf, treppe_280_U_schnitt.svg (282,5 cm → treppe_282-5_…).
 */
function exportDateiname(ergebnis, zeichnung, endung) {
  const hoehe = String(Math.round(ergebnis.geschosshoehe * 10) / 10).replace(".", "-");
  const form = ergebnis.form === "gerade" ? "" : [ergebnis.form, ergebnis.richtung].filter(Boolean).join("-") + "_";
  return `treppe_${hoehe}_${form}${zeichnung}.${endung}`;
}

/** Bietet Daten als Datei zum Herunterladen an. */
function ladeHerunter(daten, dateiname, typ) {
  const url = URL.createObjectURL(new Blob([daten], { type: typ }));
  const link = document.createElement("a");
  link.href = url;
  link.download = dateiname;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportiereDxf(ergebnis, zeichnung) {
  const elemente = ZEICHNUNGEN[zeichnung](ergebnis, EXPORT_CM_PRO_PX);
  const strichelung = SVG_STRICHELUNG.split(" ").map((px) => Number(px) * EXPORT_CM_PRO_PX);
  const dxf = erzeugeDxf(elemente, strichelung);
  ladeHerunter(alsWindows1252(dxf), exportDateiname(ergebnis, zeichnung, "dxf"), "application/dxf");
}

/**
 * SVG wie am Bildschirm, als eigenständige Datei: Farben und Schrift stehen direkt in
 * den Attributen, weil das Stylesheet der Seite außerhalb des Browsers fehlt.
 */
function exportiereSvg(ergebnis, zeichnung) {
  const stil = getComputedStyle(document.documentElement);
  const tinte = stil.getPropertyValue("--tinte").trim();
  const rot = stil.getPropertyValue("--fehler").trim();

  const kopie = document.getElementById(zeichnung).cloneNode(true);
  kopie.setAttribute("xmlns", SVG_NS);
  kopie.setAttribute("font-family", stil.getPropertyValue("--schrift-technisch").trim());
  kopie.removeAttribute("role");
  for (const el of kopie.querySelectorAll("[stroke='currentColor'], [fill='currentColor']")) {
    for (const attribut of ["stroke", "fill"]) {
      if (el.getAttribute(attribut) === "currentColor") el.setAttribute(attribut, tinte);
    }
  }
  // Fehlmaße: Linien (stroke) und Texte (fill) rot
  for (const gruppe of kopie.querySelectorAll(".fehlmass")) {
    gruppe.setAttribute(gruppe.closest("[font-size]") ? "fill" : "stroke", rot);
    gruppe.removeAttribute("class");
  }
  // weißer Hintergrund wie am Bildschirm
  const hintergrund = document.createElementNS(SVG_NS, "rect");
  for (const [name, wert] of [["width", "100%"], ["height", "100%"], ["fill", "#fff"]]) hintergrund.setAttribute(name, wert);
  kopie.prepend(hintergrund);

  const svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(kopie);
  ladeHerunter(svg, exportDateiname(ergebnis, zeichnung, "svg"), "image/svg+xml");
}

/*
 * Drucken: Seite 1 = Ergebnis, Kennwerte, Normprüfung und Fußzeile; Seite 2 = Zeichnungen.
 * Am Bildschirm stehen die Zeichnungen vor der Normprüfung (damit man sie sofort sieht)
 * und die Fußzeile am Seitenende. Beim Drucken werden Normprüfung und Fußzeile vor die
 * Zeichnungen gestellt, damit die Fußzeile nie allein auf einer eigenen Seite landet.
 * Gilt auch für Strg+P, nicht nur für die Schaltfläche.
 */
const druckUmstellung = [document.querySelector(".normpruefung"), document.querySelector("footer")];
const bildschirmLage = druckUmstellung.map((el) => ({ el, eltern: el.parentNode, naechstes: el.nextSibling }));

window.addEventListener("beforeprint", () => {
  document.querySelector(".zeichnungen").before(...druckUmstellung);
});
window.addEventListener("afterprint", () => {
  for (const { el, eltern, naechstes } of bildschirmLage) eltern.insertBefore(el, naechstes);
});

document.querySelector(".export").addEventListener("click", (ereignis) => {
  const knopf = ereignis.target.closest("button[data-export]");
  if (!knopf || !letztesErgebnis) return;
  const zeichnung = knopf.dataset.zeichnung;
  switch (knopf.dataset.export) {
    case "dxf": exportiereDxf(letztesErgebnis, zeichnung); break;
    case "svg": exportiereSvg(letztesErgebnis, zeichnung); break;
    case "drucken": window.print(); break; // PDF über „Als PDF speichern“ im Druckdialog
  }
});
