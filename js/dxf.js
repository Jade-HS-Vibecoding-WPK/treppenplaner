/*
 * dxf.js – Schreibt eine Elementliste (elemente.js) als DXF R12 (AC1009, ASCII).
 *
 * R12 ist das älteste und am weitesten unterstützte DXF-Format. Daraus folgen Grenzen:
 *  - Keine HATCH-Elemente (erst ab R14): Schraffuren werden als einzelne Linien geschrieben.
 *  - Keine Strichstärken (erst ab R2000): sie werden im CAD-Programm je Ebene festgelegt.
 *  - Keine assoziativen Bemaßungen: Maßketten bestehen aus Linien und Texten.
 *  - Keine Einheitenangabe ($INSUNITS gehört nicht zu R12): Einheit mm, Maßstab 1:1,
 *    der Hinweis steht neben den Export-Schaltflächen.
 * Texte werden in Windows-1252 kodiert ($DWGCODEPAGE = ANSI_1252).
 */

const DXF_MM_PRO_CM = 10;
const DXF_NEUE_ZEILE = "\r\n";
const DXF_LINIENTYP_GESTRICHELT = "GESTRICHELT";
const DXF_FARBE = { standard: 7, fehlmass: 1 }; // AutoCAD-Farbindex: 7 = schwarz/weiß, 1 = rot
const DXF_EBENEN = Object.values(EBENE);

// Verhältnis Versalhöhe : Schriftgrad (Helvetica ca. 0,72). Die DXF-Texthöhe ist die Versalhöhe,
// der SVG-Schriftgrad die Kegelhöhe – so wirken beide Texte gleich groß. Typografischer Näherungswert.
const DXF_VERSALHOEHE = 0.72;

/** Gleitkommazahl für DXF: Punkt als Dezimaltrenner, höchstens 4 Nachkommastellen, immer mit „.“. */
function dxfZahl(wert) {
  const gerundet = Math.round(wert * 1e4) / 1e4;
  const text = String(Object.is(gerundet, -0) ? 0 : gerundet);
  return text.includes(".") ? text : text + ".0";
}

/** Sammelt Gruppencode/Wert-Paare (Gruppencode rechtsbündig in 3 Zeichen, wie AutoCAD ihn schreibt). */
function neuerDxfSchreiber() {
  const zeilen = [];
  const s = {
    paar(code, wert) { zeilen.push(String(code).padStart(3), String(wert)); return s; },
    punkt(codeX, [x, y]) {
      return s.paar(codeX, dxfZahl(x * DXF_MM_PRO_CM)).paar(codeX + 10, dxfZahl(y * DXF_MM_PRO_CM)).paar(codeX + 20, "0.0");
    },
    text: () => zeilen.join(DXF_NEUE_ZEILE) + DXF_NEUE_ZEILE,
  };
  return s;
}

/** Ebene, Linientyp und Farbe eines Elements. */
function dxfEigenschaften(s, el) {
  s.paar(8, el.ebene);
  if (el.gestrichelt) s.paar(6, DXF_LINIENTYP_GESTRICHELT);
  if (el.fehlmass) s.paar(62, DXF_FARBE.fehlmass);
}

function dxfLinie(s, el, p1, p2) {
  s.paar(0, "LINE");
  dxfEigenschaften(s, el);
  s.punkt(10, p1).punkt(11, p2);
}

function dxfPolylinie(s, el, punkte, geschlossen) {
  s.paar(0, "POLYLINE");
  dxfEigenschaften(s, el);
  s.paar(66, 1).punkt(10, [0, 0]).paar(70, geschlossen ? 1 : 0);
  for (const p of punkte) {
    s.paar(0, "VERTEX").paar(8, el.ebene).punkt(10, p);
  }
  s.paar(0, "SEQEND").paar(8, el.ebene);
}

/** Gefülltes Dreieck bzw. Viereck als SOLID (Eckreihenfolge 1, 2, 4, 3 – Eigenheit von SOLID). */
function dxfFlaeche(s, el) {
  const p = el.punkte;
  if (p.length > 4) {
    dxfPolylinie(s, el, p, true); // kommt nicht vor; dann wenigstens der Umriss
    return;
  }
  const [p1, p2, p3, p4 = p3] = p;
  s.paar(0, "SOLID");
  dxfEigenschaften(s, el);
  s.punkt(10, p1).punkt(11, p2).punkt(12, p4).punkt(13, p3);
}

function dxfKreis(s, el) {
  s.paar(0, "CIRCLE");
  dxfEigenschaften(s, el);
  s.punkt(10, el.mitte).paar(40, dxfZahl(el.radius * DXF_MM_PRO_CM));
}

const DXF_AUSRICHTUNG = { links: 0, mitte: 1, rechts: 2 }; // Gruppe 72, Grundlinie bleibt (73 = 0)

function dxfText(s, el) {
  s.paar(0, "TEXT");
  dxfEigenschaften(s, el);
  s.punkt(10, el.position)
    .paar(40, dxfZahl(el.hoehe * DXF_VERSALHOEHE * DXF_MM_PRO_CM))
    .paar(1, el.inhalt);
  if (el.drehung) s.paar(50, dxfZahl(el.drehung));
  const ausrichtung = DXF_AUSRICHTUNG[el.ausrichtung];
  if (ausrichtung) s.paar(72, ausrichtung).punkt(11, el.position); // bei Ausrichtung gilt der Punkt 11
}

/**
 * Schraffurlinien in einem Polygon: Parallelen im Winkel el.winkel mit Abstand el.abstand.
 * Das Polygon wird so gedreht, dass die Linien waagerecht liegen; je Linie werden die
 * Schnittpunkte mit den Kanten paarweise verbunden (innen – außen – innen …).
 */
function schraffurLinien(el) {
  const w = (el.winkel * Math.PI) / 180;
  const cos = Math.cos(w);
  const sin = Math.sin(w);
  const drehe = ([x, y]) => [x * cos + y * sin, -x * sin + y * cos];      // um −winkel
  const zurueck = ([x, y]) => [x * cos - y * sin, x * sin + y * cos];     // um +winkel
  const umriss = el.umriss.map(drehe);
  const ys = umriss.map((p) => p[1]);
  const linien = [];
  for (let i = Math.ceil(Math.min(...ys) / el.abstand); i * el.abstand <= Math.max(...ys); i++) {
    const y = i * el.abstand;
    const xs = [];
    umriss.forEach((p, j) => {
      const q = umriss[(j + 1) % umriss.length];
      // halboffenes Intervall, damit eine Ecke nicht doppelt zählt
      if ((p[1] <= y) !== (q[1] <= y)) xs.push(p[0] + ((y - p[1]) / (q[1] - p[1])) * (q[0] - p[0]));
    });
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      if (xs[k + 1] - xs[k] > 1e-6) linien.push([zurueck([xs[k], y]), zurueck([xs[k + 1], y])]);
    }
  }
  return linien;
}

/** Ausdehnung aller Elemente (für $EXTMIN/$EXTMAX, damit „Zoom Grenzen“ sofort passt). */
function dxfAusdehnung(elemente) {
  const punkte = elemente.flatMap((el) => {
    switch (el.typ) {
      case "linie": return [el.p1, el.p2];
      case "polylinie": case "flaeche": return el.punkte;
      case "schraffur": return el.umriss;
      case "kreis": return [[el.mitte[0] - el.radius, el.mitte[1] - el.radius], [el.mitte[0] + el.radius, el.mitte[1] + el.radius]];
      case "text": return [el.position];
      default: return [];
    }
  });
  return {
    min: [Math.min(...punkte.map((p) => p[0])), Math.min(...punkte.map((p) => p[1]))],
    max: [Math.max(...punkte.map((p) => p[0])), Math.max(...punkte.map((p) => p[1]))],
  };
}

function dxfKopf(s, ausdehnung) {
  s.paar(0, "SECTION").paar(2, "HEADER");
  s.paar(9, "$ACADVER").paar(1, "AC1009");
  s.paar(9, "$DWGCODEPAGE").paar(3, "ANSI_1252");
  s.paar(9, "$INSBASE").punkt(10, [0, 0]);
  s.paar(9, "$EXTMIN").punkt(10, ausdehnung.min);
  s.paar(9, "$EXTMAX").punkt(10, ausdehnung.max);
  s.paar(9, "$LTSCALE").paar(40, "1.0");
  s.paar(0, "ENDSEC");
}

/** Tabellen: Linientypen, Ebenen, Textstil. strichelung = [Strich, Lücke] in cm. */
function dxfTabellen(s, strichelung) {
  s.paar(0, "SECTION").paar(2, "TABLES");

  const [strich, luecke] = strichelung.map((w) => w * DXF_MM_PRO_CM);
  s.paar(0, "TABLE").paar(2, "LTYPE").paar(70, 2);
  s.paar(0, "LTYPE").paar(2, "CONTINUOUS").paar(70, 0).paar(3, "Solid line")
    .paar(72, 65).paar(73, 0).paar(40, "0.0");
  s.paar(0, "LTYPE").paar(2, DXF_LINIENTYP_GESTRICHELT).paar(70, 0).paar(3, "__ __ __")
    .paar(72, 65).paar(73, 2).paar(40, dxfZahl(strich + luecke))
    .paar(49, dxfZahl(strich)).paar(49, dxfZahl(-luecke));
  s.paar(0, "ENDTAB");

  const ebenen = ["0", ...DXF_EBENEN];
  s.paar(0, "TABLE").paar(2, "LAYER").paar(70, ebenen.length);
  for (const name of ebenen) {
    s.paar(0, "LAYER").paar(2, name).paar(70, 0).paar(62, DXF_FARBE.standard).paar(6, "CONTINUOUS");
  }
  s.paar(0, "ENDTAB");

  s.paar(0, "TABLE").paar(2, "STYLE").paar(70, 1);
  s.paar(0, "STYLE").paar(2, "STANDARD").paar(70, 0).paar(40, "0.0").paar(41, "1.0")
    .paar(50, "0.0").paar(71, 0).paar(42, "2.5").paar(3, "txt").paar(4, "");
  s.paar(0, "ENDTAB");

  s.paar(0, "ENDSEC");
}

/**
 * Erzeugt den DXF-Text aus einer Elementliste.
 * @param {object[]} elemente Koordinaten in cm
 * @param {number[]} strichelung [Strich, Lücke] in cm für gestrichelte Linien
 */
function erzeugeDxf(elemente, strichelung) {
  const s = neuerDxfSchreiber();
  dxfKopf(s, dxfAusdehnung(elemente));
  dxfTabellen(s, strichelung);

  s.paar(0, "SECTION").paar(2, "ENTITIES");
  for (const el of elemente) {
    switch (el.typ) {
      case "linie": dxfLinie(s, el, el.p1, el.p2); break;
      case "polylinie": dxfPolylinie(s, el, el.punkte, el.geschlossen); break;
      case "flaeche": dxfFlaeche(s, el); break;
      case "kreis": dxfKreis(s, el); break;
      case "text": dxfText(s, el); break;
      case "schraffur":
        for (const [p1, p2] of schraffurLinien(el)) dxfLinie(s, el, p1, p2);
        break;
    }
  }
  s.paar(0, "ENDSEC");
  s.paar(0, "EOF");
  return s.text();
}

// Windows-1252: 0x80–0x9F weichen von Unicode ab, sonst gilt Latin-1 (0x00–0xFF).
const CP1252_SONDERZEICHEN = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87,
  0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91,
  0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98,
  0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
};

/** Kodiert Text als Windows-1252; nicht darstellbare Zeichen werden „?“. */
function alsWindows1252(text) {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 0x80 || (c >= 0xa0 && c <= 0xff)) bytes[i] = c;
    else bytes[i] = CP1252_SONDERZEICHEN[c] ?? 0x3f;
  }
  return bytes;
}
