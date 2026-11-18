/*
 * zeichnung.js – Schnitt einer geraden Treppe bzw. Abwicklung entlang der Lauflinie (L, U, Spindel).
 *
 * Geometrie in cm (y nach oben, Ursprung = Antritt auf OKFF unten).
 * Abwicklung: x = Länge entlang der Lauflinie; das Podest erscheint als waagerechtes Stück
 * (Länge der Lauflinie auf dem Podest), die Podestplatte so dick wie die Laufplatte.
 * schnittElemente() liefert eine Elementliste (elemente.js); zeichneSchnitt() gibt sie
 * als SVG aus. Der Maßstab ergibt sich automatisch aus der verfügbaren Breite;
 * bei Größenänderung wird neu gezeichnet.
 */

// Zeichnungsannahmen – keine Normwerte.
// Laufplattendicke: material.js (Stahlbeton, Annahme)
const DECKENDICKE = 20;      // cm, Annahme für die Darstellung der Geschossdecken
const DECKENUEBERSTAND = 60; // cm, sichtbare Decke vor bzw. hinter der Treppe

// Darstellung in Pixeln
const RAND = { links: 40, rechts: 56, oben: 36, unten: 60 };
const MAX_PX_PRO_CM = 2.5;   // sehr kleine Treppen nicht übergroß zeichnen
const MAX_HOEHE_PX = 560;    // sehr hohe Treppen nicht zu lang werden lassen (Mindestmaßstab hat Vorrang)
// Mindestmaßstab für die Lesbarkeit des Grundrisses (gilt für Schnitt und Grundriss gemeinsam).
// Reicht die Breite nicht, wird horizontal gescrollt.
// Gewählt so, dass Geschosshöhen von 250–350 cm auf einem Laptop (~950 px Zeichenbreite) ohne Scrollen passen.
const MIN_LAUFBREITE_PX = 90;  // Höhe des Treppenlaufs im Grundriss
const MIN_AUFTRITT_PX = 28;    // Platz für zweistellige Stufennummern (12 px)

// zahl() (Zahlenformat je Sprache) steht in i18n.js.

/** Berechnet alle Punkte des Schnitts in cm. */
function schnittGeometrie(ergebnis) {
  const H = ergebnis.geschosshoehe;
  const n = ergebnis.anzahlSteigungen;
  const s = H / n;              // exakter Wert, damit die letzte Stufe genau auf OKFF oben trifft
  const a = ergebnis.auftritt;
  const podestLaenge = ergebnis.podest?.lauflinie ?? 0;
  const LAUFPLATTENDICKE = bauteil(MATERIALIEN.stahlbeton, "laufplatte").dicke;

  // Setzstufen entlang der Lauflinie; Fußpunkt (x0) und Höhe (h0) jedes Laufs.
  const setzstufen = [];
  const laufAnfang = [];
  let x = 0;
  ergebnis.laeufe.forEach((lauf, i) => {
    laufAnfang.push({ x0: x, h0: setzstufen.length * s });
    for (let j = 0; j < lauf.steigungen; j++) setzstufen.push(x + j * a);
    x += lauf.laenge + (i < ergebnis.laeufe.length - 1 ? podestLaenge : 0);
  });
  const L = setzstufen[n - 1]; // Länge der Abwicklung (gerade Treppe: Lauflänge)

  // Stufenprofil: n Steigungen, dazwischen Auftritte bzw. Podeste
  const profil = [[0, 0]];
  for (let i = 0; i < n; i++) {
    profil.push([setzstufen[i], (i + 1) * s]);
    if (i < n - 1) profil.push([setzstufen[i + 1], (i + 1) * s]);
  }

  // Unterseite der Laufplatte: je Lauf parallel zur Linie durch die Stufenkehlen
  // (y = h0 + s/a · (x − x0)), senkrecht gemessen um LAUFPLATTENDICKE versetzt.
  const steigungsVerhaeltnis = s / a;
  const vertikalerVersatz = LAUFPLATTENDICKE * Math.hypot(a, s) / a;
  const xUnterseiteUnten = vertikalerVersatz / steigungsVerhaeltnis;                  // trifft OKFF unten
  const letzterLauf = laufAnfang[laufAnfang.length - 1];
  const xUnterseiteOben =                                                             // trifft Deckenunterseite oben
    letzterLauf.x0 + (H - DECKENDICKE - letzterLauf.h0 + vertikalerVersatz) / steigungsVerhaeltnis;

  // Podestplatten (Dicke = LAUFPLATTENDICKE): Knickpunkte der Unterseite, von oben nach unten.
  const podestUnterseite = [];
  for (let i = laufAnfang.length - 1; i > 0; i--) {
    const oben = laufAnfang[i];
    const unten = laufAnfang[i - 1];
    const y = oben.h0 - LAUFPLATTENDICKE;
    podestUnterseite.push(
      [oben.x0 + (vertikalerVersatz - LAUFPLATTENDICKE) / steigungsVerhaeltnis, y],
      [unten.x0 + (y - unten.h0 + vertikalerVersatz) / steigungsVerhaeltnis, y]
    );
  }
  const podeste = laufAnfang.slice(1).map((l) => ({ x1: l.x0 - podestLaenge, x2: l.x0, hoehe: l.h0 }));

  // Ist der verfügbare Raum länger als die gerade Treppe, reicht die Zeichnung bis zum Raumende,
  // damit der Grundriss (gleiche x-Achse) das Raumrechteck vollständig zeigt.
  const raumLaenge = ergebnis.form === "gerade" ? ergebnis.raum?.vorgabe.laenge ?? 0 : 0;
  const xEnde = Math.max(L + DECKENUEBERSTAND, xUnterseiteOben + 40, raumLaenge);

  // Treppe und obere Decke bilden einen geschnittenen Körper (eine Schraffur).
  // Die Umrisslinie wird für die Ebenen in Treppe und Decke geteilt.
  const umrissTreppe = [[xUnterseiteOben, H - DECKENDICKE], ...podestUnterseite, [xUnterseiteUnten, 0], ...profil]; // endet bei [L, H]
  const umrissObereDecke = [[L, H], [xEnde, H], [xEnde, H - DECKENDICKE], [xUnterseiteOben, H - DECKENDICKE]];
  const treppeUndDecke = [...profil, ...umrissObereDecke.slice(1), ...podestUnterseite, [xUnterseiteUnten, 0]];

  const untereDecke = [
    [-DECKENUEBERSTAND, 0],
    [xEnde, 0],
    [xEnde, -DECKENDICKE],
    [-DECKENUEBERSTAND, -DECKENDICKE],
  ];

  const geo = {
    H, n, s, a, L, xEnde, treppeUndDecke, umrissTreppe, umrissObereDecke, untereDecke, laufAnfang, podeste,
    setzstufen,
    bereich: { xMin: -DECKENUEBERSTAND, xMax: xEnde, yMin: -DECKENDICKE, yMax: H },
  };
  // Wangentreppe (Holz, Stahl): eigene Bauteile statt Laufplatte. Der Bereich (und damit der
  // Maßstab) bleibt wie bei Stahlbeton, damit ein Materialwechsel die Zeichnung nicht verschiebt.
  const material = materialVon(ergebnis);
  if (ergebnis.form === "spindel") geo.spindeltreppe = spindelSchnittGeometrie(geo, ergebnis);
  else if (material.konstruktion === "wange") geo.wangentreppe = wangentreppeGeometrie(geo, material);
  return geo;
}

/** Geschnittene Trittflächen zwischen zwei Setzstufen, Oberkante bei (i + 1) · s, Dicke nach unten. */
function trittstufenRechtecke(geo, dicke) {
  const { s, setzstufen } = geo;
  const stufen = [];
  for (let i = 0; i < setzstufen.length - 1; i++) {
    const [x1, x2, y] = [setzstufen[i], setzstufen[i + 1], (i + 1) * s];
    stufen.push([[x1, y], [x2, y], [x2, y - dicke], [x1, y - dicke]]);
  }
  return stufen;
}

/**
 * Spindeltreppe als Abwicklung entlang der Lauflinie (ohne Podest, ein „Lauf“):
 *  - Kragstufen (an der Spindel eingespannt), geschnitten, Dicke aus spindelMasse() – alle
 *    Materialien gleich dargestellt; bei Stahlbeton vereinfacht (meist monolithische Wendelplatte)
 *  - keine Laufplatte, keine Wangen; obere Decke als eigener Stahlbetonkörper
 *  - lichte Durchgangshöhe: Stufe t (eine Umdrehung höher) liegt im Grundriss genau über
 *    Stufe 0 – sie wird gestrichelt über der ersten Stufe gezeigt, mit Maß (nur wenn es sie gibt)
 */
function spindelSchnittGeometrie(geo, ergebnis) {
  const { H, s, a, L, xEnde, n } = geo;
  const g = ergebnis.spindel;
  const dicke = g.stufendicke;
  const obereDecke = [[L, H], [xEnde, H], [xEnde, H - DECKENDICKE], [L, H - DECKENDICKE]];
  let durchgang = null;
  if (g.teilung <= n - 2) {
    const oben = (g.teilung + 1) * s; // Oberkante der Stufe eine Umdrehung höher
    durchgang = {
      stufeOben: [[0, oben], [a, oben], [a, oben - dicke], [0, oben - dicke]],
      x: a / 2, von: s, bis: oben - dicke,
    };
  }
  return { trittstufen: trittstufenRechtecke(geo, dicke), obereDecke, durchgang };
}

/**
 * Wangentreppe im Schnitt (Abwicklung) – offene Stufen, keine Laufplatte:
 *  - Trittstufen und Podestbelag (geschnitten): Rechtecke a × Trittstufendicke unter jeder Trittfläche
 *  - Wange (in Ansicht hinter der Schnittebene): Band entlang der Stufenvorderkanten, auf dem Podest
 *    waagerecht; unten auf dem Fußboden abgeschnitten, oben an der Deckenstirn (x = L)
 *  - obere Decke als eigener Stahlbetonkörper
 */
function wangentreppeGeometrie(geo, material) {
  const { H, s, a, L, xEnde, laufAnfang } = geo;
  const dicke = bauteil(material, "trittstufe").dicke;
  const wange = bauteil(material, "wange");

  // Trittflächen zwischen zwei Setzstufen (Podest: längere Fläche), Oberkante bei (i + 1) · s
  const trittstufen = trittstufenRechtecke(geo, dicke);

  // Wangenkanten als Folge von Geraden: je Lauf parallel zur Linie der Stufenvorderkanten
  // (durch [x0, h0 + s], Neigung s/a), je Podest waagerecht. Abstände senkrecht zur Steigung.
  const neigung = s / a;
  const senkrecht = Math.hypot(a, s) / a; // senkrechter Abstand → lotrechter Versatz
  const geraden = (versatz) => {
    const liste = [];
    laufAnfang.forEach((lauf, i) => {
      if (i > 0) liste.push({ punkt: [0, lauf.h0 + versatz], neigung: 0 }); // Podest davor
      liste.push({ punkt: [lauf.x0, lauf.h0 + s + versatz * senkrecht], neigung });
    });
    return liste;
  };
  const oben = kantenzug(geraden(wange.ueberstand), -DECKENUEBERSTAND, xEnde);
  const unten = kantenzug(geraden(wange.ueberstand - wange.hoehe), -DECKENUEBERSTAND, xEnde);
  let band = [...oben, ...unten.reverse()];
  band = schneidePolygon(band, ([, y]) => y);       // nicht unter den Fußboden
  band = schneidePolygon(band, ([x]) => L - x);     // endet an der Stirn der oberen Decke

  const obereDecke = [[L, H], [xEnde, H], [xEnde, H - DECKENDICKE], [L, H - DECKENDICKE]];
  return { trittstufen, wange: band, obereDecke };
}

/** Schnittpunkte aufeinanderfolgender Geraden {punkt, neigung}; Anfang bei x = xAnfang, Ende bei x = xEnde. */
function kantenzug(geraden, xAnfang, xEnde) {
  const yAuf = (g, x) => g.punkt[1] + g.neigung * (x - g.punkt[0]);
  const punkte = [[xAnfang, yAuf(geraden[0], xAnfang)]];
  for (let i = 0; i < geraden.length - 1; i++) {
    const [g, h] = [geraden[i], geraden[i + 1]];
    // g und h sind nie parallel (Lauf – Podest – Lauf)
    const x = (h.punkt[1] - g.punkt[1] + g.neigung * g.punkt[0] - h.neigung * h.punkt[0]) / (g.neigung - h.neigung);
    punkte.push([x, yAuf(g, x)]);
  }
  const letzte = geraden[geraden.length - 1];
  punkte.push([xEnde, yAuf(letzte, xEnde)]);
  return punkte;
}

/**
 * Schneidet ein Polygon an einer Halbebene ab (Sutherland–Hodgman).
 * seite(p) ist linear in p; behalten wird seite(p) ≥ 0.
 */
function schneidePolygon(punkte, seite) {
  const ergebnis = [];
  punkte.forEach((p, i) => {
    const q = punkte[(i + 1) % punkte.length];
    const [sp, sq] = [seite(p), seite(q)];
    if (sp >= 0) ergebnis.push(p);
    if ((sp >= 0) !== (sq >= 0)) {
      const f = sp / (sp - sq);
      ergebnis.push([p[0] + f * (q[0] - p[0]), p[1] + f * (q[1] - p[1])]);
    }
  });
  return ergebnis;
}

/** Kleinster Maßstab (px/cm), bei dem Grundriss und Stufennummern lesbar bleiben. */
function mindestMassstab(ergebnis) {
  return Math.min(
    Math.max(MIN_LAUFBREITE_PX / ergebnis.laufbreite, MIN_AUFTRITT_PX / ergebnis.auftritt),
    MAX_PX_PRO_CM
  );
}

/**
 * Legt Maßstab und Umrechnung cm → px fest.
 * Der Maßstab füllt die verfügbare Breite, unterschreitet aber nie kMin;
 * dann wird die Zeichnung breiter als der Container (horizontal scrollbar).
 */
function erstelleAbbildung(bereich, breitePx, kMin) {
  const breiteCm = bereich.xMax - bereich.xMin;
  const hoeheCm = bereich.yMax - bereich.yMin;
  const kPasst = Math.min(
    (breitePx - RAND.links - RAND.rechts) / breiteCm,
    (MAX_HOEHE_PX - RAND.oben - RAND.unten) / hoeheCm,
    MAX_PX_PRO_CM
  );
  const k = Math.max(kPasst, kMin);
  return {
    k,
    x: (x) => RAND.links + (x - bereich.xMin) * k,
    y: (y) => RAND.oben + (bereich.yMax - y) * k,
    // − 0,01 px: Gleitkommarauschen (z. B. 958,0000001) darf nicht auf 959 px aufrunden –
    // sonst ist die Zeichnung 1 px breiter als der Scrollbereich und es erscheint ein Scrollbalken.
    breitePx: Math.max(breitePx, Math.ceil(RAND.links + breiteCm * k + RAND.rechts - 0.01)),
    hoehePx: RAND.oben + hoeheCm * k + RAND.unten,
  };
}

/**
 * Elementliste des Schnitts in cm.
 * @param {object} ergebnis Rückgabe von berechneTreppe()
 * @param {number} cmProPx Umrechnung der Beschriftungsgrößen (px) in cm
 */
function schnittElemente(ergebnis, cmProPx) {
  const geo = schnittGeometrie(ergebnis);
  const z = neueZeichenliste(cmProPx);
  const m = cmProPx;
  const { H, L, s, a, xEnde } = geo;

  // Geschnittene Bauteile: Schraffur und Umriss
  z.schraffur(EBENE.schraffur, geo.untereDecke);
  z.polylinie(EBENE.decke, geo.untereDecke, STRICH.schnitt, { geschlossen: true });
  if (geo.spindeltreppe) {
    spindelSchnittElemente(z, geo, materialVon(ergebnis));
  } else if (geo.wangentreppe) {
    wangentreppeElemente(z, geo.wangentreppe, materialVon(ergebnis));
  } else {
    z.schraffur(EBENE.schraffur, geo.treppeUndDecke);
    z.polylinie(EBENE.treppe, geo.umrissTreppe, STRICH.schnitt);
    z.polylinie(EBENE.decke, geo.umrissObereDecke, STRICH.schnitt);
  }

  // Fußbodenoberkanten kräftig
  z.linie(EBENE.decke, [geo.bereich.xMin, 0], [xEnde, 0], STRICH.decke);
  z.linie(EBENE.decke, [L, H], [xEnde, H], STRICH.decke);

  // Höhenkoten übereinander am rechten Rand (unter der oberen Decke ist Platz für ± 0,00)
  const xKote = Math.max(xEnde - 45 * m, L + 22 * m);
  hoehenkote(z, xKote, 0, "± " + zahl(0, 2));
  hoehenkote(z, xKote, H, "+ " + zahl(H / 100, 2));

  // Geschosshöhe rechts
  const xMassRechts = xEnde + 28 * m;
  hilfslinie(z, [xEnde + 4 * m, 0], [xMassRechts + 4 * m, 0]);
  hilfslinie(z, [xEnde + 4 * m, H], [xMassRechts + 4 * m, H]);
  vertikalesMass(z, xMassRechts, 0, H);
  z.text([xMassRechts + 14 * m, H / 2], zahl(H), { ausrichtung: "mitte", drehung: 90 });

  // s und a an der obersten Stufe – darüber ist der Luftraum frei
  const xVorderkante = L - a;  // Vorderkante der obersten Trittstufe (letzte Setzstufe bei L)
  const yTritt = H - s;        // oberste Trittstufe

  // Steigung s: links der letzten Setzstufe
  const xMassS = L - 14 * m;
  hilfslinie(z, [L - 3 * m, H], [xMassS - 4 * m, H]);
  vertikalesMass(z, xMassS, yTritt, H);
  // Text links an der Hilfslinie von a vorbei, damit nichts kreuzt
  const xTextS = Math.min(xMassS - 6 * m, xVorderkante - 6 * m);
  z.text([xTextS, (yTritt + H) / 2 - 4 * m], "s = " + zahl(ergebnis.steigung), { ausrichtung: "rechts" });

  // Auftritt a: über der obersten Trittstufe, Beschriftung links
  const yMassA = H + 16 * m;
  hilfslinie(z, [xVorderkante, yTritt + 3 * m], [xVorderkante, yMassA + 4 * m]);
  hilfslinie(z, [L, H + 3 * m], [L, yMassA + 4 * m]);
  horizontalesMass(z, xVorderkante, L, yMassA);
  z.text([xVorderkante - 8 * m, yMassA - 4 * m], "a = " + zahl(ergebnis.auftritt), { ausrichtung: "rechts" });

  // Lauflänge unten, unter der Decke
  const yMassL = -DECKENDICKE - 26 * m;
  if (geo.podeste.length === 0) {
    hilfslinie(z, [0, -DECKENDICKE - 4 * m], [0, yMassL - 4 * m]);
    hilfslinie(z, [L, -DECKENDICKE - 4 * m], [L, yMassL - 4 * m]);
    horizontalesMass(z, 0, L, yMassL);
    const wertL = zahl(ergebnis.lauflaenge);
    z.text([L / 2, yMassL + 4 * m], masstext(z, t("zeichnung.lauflaenge", { wert: wertL }), wertL, L), {
      ausrichtung: "mitte",
    });
  } else {
    podestSchnittElemente(z, geo, yMassL);
  }

  return z.elemente;
}

/**
 * Wangentreppe: obere Decke (Stahlbeton, geschnitten), Wange in Ansicht (fein, ohne Schraffur),
 * darüber die geschnittenen Trittstufen mit Materialschraffur – sie verdecken die Wange nicht,
 * weil sie ganz innerhalb des Wangenbands liegen.
 */
function wangentreppeElemente(z, w, material) {
  z.schraffur(EBENE.schraffur, w.obereDecke);
  z.polylinie(EBENE.decke, w.obereDecke, STRICH.schnitt, { geschlossen: true });
  z.polylinie(EBENE.wange, w.wange, STRICH.mass, { geschlossen: true });
  for (const stufe of w.trittstufen) geschnittenesBauteil(z, material, EBENE.trittstufe, stufe);
}

/**
 * Spindeltreppe: obere Decke (geschnitten), Kragstufen mit Materialschraffur, darüber
 * gestrichelt die Stufe eine Umdrehung höher und die lichte Durchgangshöhe als Maß.
 */
function spindelSchnittElemente(z, geo, material) {
  const sp = geo.spindeltreppe;
  const m = z.m;
  z.schraffur(EBENE.schraffur, sp.obereDecke);
  z.polylinie(EBENE.decke, sp.obereDecke, STRICH.schnitt, { geschlossen: true });
  for (const stufe of sp.trittstufen) geschnittenesBauteil(z, material, EBENE.trittstufe, stufe);

  const d = sp.durchgang;
  if (!d) return;
  z.polylinie(EBENE.trittstufe, d.stufeOben, STRICH.schnitt, { geschlossen: true, gestrichelt: true });
  vertikalesMass(z, d.x, d.von, d.bis);
  const wert = zahl(d.bis - d.von);
  const text = masstext(z, t("zeichnung.durchgangshoehe", { wert }), wert, d.bis - d.von);
  z.text([d.x - 4 * m, (d.von + d.bis) / 2], text, { ausrichtung: "mitte", drehung: 90, hintergrund: true });
}

/**
 * Abwicklung: Maßkette Lauf | Podest | Lauf unten und Höhenkote auf jedem Podest.
 */
function podestSchnittElemente(z, geo, yMassL) {
  const m = z.m;
  const xKette = [0, ...geo.podeste.flatMap((p) => [p.x1, p.x2]), geo.L];
  for (const x of xKette) hilfslinie(z, [x, -DECKENDICKE - 4 * m], [x, yMassL - 4 * m]);
  for (let i = 0; i < xKette.length - 1; i++) {
    const [x1, x2] = [xKette[i], xKette[i + 1]];
    if (x2 - x1 <= RECHENTOLERANZ) continue; // Lauf mit nur einer Steigung
    horizontalesMass(z, x1, x2, yMassL);
    const wert = zahl(x2 - x1);
    const lang = t(i % 2 === 0 ? "zeichnung.lauflaenge" : "zeichnung.podest", { wert });
    z.text([(x1 + x2) / 2, yMassL + 4 * m], masstext(z, lang, wert, x2 - x1), { ausrichtung: "mitte" });
  }

  for (const p of geo.podeste) {
    hoehenkote(z, p.x1 + 12 * m, p.hoehe, "+ " + zahl(p.hoehe / 100, 2));
  }
}

/**
 * Zeichnet den Schnitt der berechneten Treppe in das übergebene SVG-Element.
 * @param {SVGSVGElement} svg
 * @param {object} ergebnis Rückgabe von berechneTreppe()
 * @param {number} breitePx sichtbare Breite der Zeichenfläche
 * @returns Abbildung (Maßstab, x-Lage) – der Grundriss liegt mit gleichem Maßstab darunter.
 */
function zeichneSchnitt(svg, ergebnis, breitePx) {
  const geo = schnittGeometrie(ergebnis);
  const abb = erstelleAbbildung(geo.bereich, breitePx, mindestMassstab(ergebnis));
  const cmProPx = 1 / abb.k;
  zeichneElemente(svg, schnittElemente(ergebnis, cmProPx), ([x, y]) => [abb.x(x), abb.y(y)], cmProPx, {
    breite: abb.breitePx, hoehe: abb.hoehePx,
  });
  return abb;
}
