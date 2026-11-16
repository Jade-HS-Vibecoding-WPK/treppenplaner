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

/** Dateiname mit Geschosshöhe, z. B. treppe_280_schnitt.dxf (282,5 cm → treppe_282-5_…). */
function exportDateiname(ergebnis, zeichnung, endung) {
  const hoehe = String(Math.round(ergebnis.geschosshoehe * 10) / 10).replace(".", "-");
  return `treppe_${hoehe}_${zeichnung}.${endung}`;
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

document.querySelector(".export").addEventListener("click", (ereignis) => {
  const knopf = ereignis.target.closest("button[data-export]");
  if (!knopf || !letztesErgebnis) return;
  const zeichnung = knopf.dataset.zeichnung;
  if (knopf.dataset.export === "dxf") exportiereDxf(letztesErgebnis, zeichnung);
});
