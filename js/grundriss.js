/*
 * grundriss.js – Grundriss einer Treppe aus Läufen und Podesten (gerade, L, U);
 * die Spindeltreppe zeichnet spindelgrundriss.js (gleiche Ausgabe, eigene Geometrie).
 *
 * grundrissElemente() liefert eine Elementliste (elemente.js); zeichneGrundriss() gibt sie
 * als SVG aus. Bei der geraden Treppe werden Maßstab und x-Lage vom Schnitt übernommen,
 * damit der Grundriss genau unter dem Schnitt liegt (Projektion). Bei L- und U-Treppe
 * ist der Schnitt eine Abwicklung; der Grundriss hat dann denselben Maßstab, aber eine
 * eigene Lage.
 *
 * Geometrie in cm: x = Laufrichtung des ersten Laufs (0 = Antritt), y quer dazu, nach oben.
 * Die Treppe liegt in der linken unteren Ecke des Raums (y = 0 … Breite).
 *
 * Jeder Lauf hat ein eigenes Koordinatensystem: Startpunkt auf der Lauflinie an der ersten
 * Setzstufe, Richtung d (Laufrichtung) und Normale nrm (links von d).
 * u = Abstand entlang d, v = Abstand entlang nrm (−B/2 … +B/2).
 */

// Schnitthöhe des Grundrisses über Fußboden.
// Darstellungskonvention, keine Normvorgabe (vermutlich DIN 1356-1, Bauzeichnungen).
// TODO: Quelle prüfen
const GRUNDRISS_SCHNITTHOEHE = 100; // cm

// Darstellung in Pixeln
const GRUNDRISS_RAND = { oben: 24, unten: 56 };
const GRUNDRISS_RAND_SEITLICH = { links: 40, rechts: 56 }; // nur L/U (eigene Lage)
const LAUFLINIE_STRICH = 0.75;
const NUMMER_SCHRIFTGROESSE = 12;
const LAUFLINIE_KREIS_RADIUS = 3.5;
const LAUFLINIE_PFEIL = { laenge: 9, halbeBreite: 3.5 };
const SCHNITTLINIE_UEBERSTAND = 8;    // px über die Treppenkante hinaus
const SCHNITTLINIE_ABSTAND = 4;       // px zwischen den beiden Linien
const RAUM_STRICH = 0.75;             // Begrenzung des verfügbaren Raums (fein)
const RAUMMASS_ABSTAND = 30;          // px zwischen Lauflängen- und Raummaßkette

/** Punkt im Koordinatensystem eines Laufs → Grundrisskoordinaten. */
function laufPunkt(lauf, u, v) {
  return [
    lauf.start[0] + u * lauf.d[0] + v * lauf.nrm[0],
    lauf.start[1] + u * lauf.d[1] + v * lauf.nrm[1],
  ];
}

/** Grundrisskoordinaten → (u, v) im Koordinatensystem eines Laufs. */
function laufKoordinaten(lauf, [x, y]) {
  const dx = x - lauf.start[0];
  const dy = y - lauf.start[1];
  return { u: dx * lauf.d[0] + dy * lauf.d[1], v: dx * lauf.nrm[0] + dy * lauf.nrm[1] };
}

/**
 * Lage der Läufe und des Podests je Form.
 * L links: Lauf 1 an der unteren Wand nach rechts, Podest rechts, Lauf 2 nach oben.
 * L rechts: gespiegelt – Lauf 1 oben, Lauf 2 nach unten.
 * U (Linksdrehung): Lauf 1 unten nach rechts, Halbpodest rechts, Lauf 2 oben zurück.
 * Podest: Rechteck, Außenkanten (ohne die Setzstufen der Läufe) und Lauflinie
 * vom Ende des ersten bis zum Anfang des zweiten Laufs.
 */
function anordnung(e) {
  const B = e.laufbreite;
  const h = B / 2;
  const [l1, l2] = e.laeufe;
  const richtungX = { d: [1, 0], nrm: [0, 1] };

  if (e.form === "gerade") {
    return { laeufe: [{ ...richtungX, start: [0, h], laenge: l1.laenge, steigungen: l1.steigungen }], podest: null };
  }

  const L1 = l1.laenge;
  const L2 = l2.laenge;

  if (e.form === "L" && e.richtung !== "rechts") {
    return {
      laeufe: [
        { ...richtungX, start: [0, h], laenge: L1, steigungen: l1.steigungen },
        { d: [0, 1], nrm: [-1, 0], start: [L1 + h, B], laenge: L2, steigungen: l2.steigungen },
      ],
      podest: {
        rechteck: { x1: L1, x2: L1 + B, y1: 0, y2: B },
        kanten: [[[L1, 0], [L1 + B, 0]], [[L1 + B, 0], [L1 + B, B]]],
        lauflinie: [[L1, h], [L1 + h, h], [L1 + h, B]],
      },
    };
  }

  if (e.form === "L") {
    const W = B + L2;
    return {
      laeufe: [
        { ...richtungX, start: [0, W - h], laenge: L1, steigungen: l1.steigungen },
        { d: [0, -1], nrm: [1, 0], start: [L1 + h, W - B], laenge: L2, steigungen: l2.steigungen },
      ],
      podest: {
        rechteck: { x1: L1, x2: L1 + B, y1: W - B, y2: W },
        kanten: [[[L1, W], [L1 + B, W]], [[L1 + B, W], [L1 + B, W - B]]],
        lauflinie: [[L1, W - h], [L1 + h, W - h], [L1 + h, W - B]],
      },
    };
  }

  // U: der erste Lauf ist nie kürzer als der zweite (Aufteilung ⌈n/2⌉ / ⌊n/2⌋).
  const W = 2 * B + TREPPENAUGE;
  return {
    laeufe: [
      { ...richtungX, start: [0, h], laenge: L1, steigungen: l1.steigungen },
      { d: [-1, 0], nrm: [0, -1], start: [L1, W - h], laenge: L2, steigungen: l2.steigungen },
    ],
    podest: {
      rechteck: { x1: L1, x2: L1 + B, y1: 0, y2: W },
      kanten: [
        [[L1, 0], [L1 + B, 0]],
        [[L1 + B, 0], [L1 + B, W]],
        [[L1 + B, W], [L1, W]],
        [[L1, B], [L1, B + TREPPENAUGE]], // Kante zum Treppenauge
      ],
      lauflinie: [[L1, h], [L1 + h, h], [L1 + h, W - h], [L1, W - h]],
    },
  };
}

/** Achsparalleles Rechteck eines Laufs (für Raumüberstand und Maßketten). */
function laufRechteck(lauf, B) {
  const ecken = [laufPunkt(lauf, 0, B / 2), laufPunkt(lauf, lauf.laenge, -B / 2)];
  return {
    x1: Math.min(ecken[0][0], ecken[1][0]), x2: Math.max(ecken[0][0], ecken[1][0]),
    y1: Math.min(ecken[0][1], ecken[1][1]), y2: Math.max(ecken[0][1], ecken[1][1]),
  };
}

/** Berechnet die Grundrissgeometrie in cm. */
function grundrissGeometrie(ergebnis) {
  const n = ergebnis.anzahlSteigungen;
  const a = ergebnis.auftritt;
  const s = ergebnis.geschosshoehe / n;
  const B = ergebnis.laufbreite;
  const fp = ergebnis.footprint;
  const { laeufe, podest } = anordnung(ergebnis);

  // Erste Stufe, deren Oberkante die Schnitthöhe erreicht. Die Schnittebene trifft deren
  // Setzstufe; dort (zwischen zwei Stufennummern) kreuzt die Schnittlinie die Lauflinie.
  const stufeImSchnitt = Math.ceil(GRUNDRISS_SCHNITTHOEHE / s - 1e-9);
  let schnittlinie = null;
  if (stufeImSchnitt <= n - 1) {
    let rest = stufeImSchnitt;
    let index = 0;
    while (rest > laeufe[index].steigungen) rest -= laeufe[index++].steigungen;
    const lauf = laeufe[index];
    const mitte = (rest - 1) * a;
    const halbeSpanne = Math.max(1.5 * a, 0.5 * B) / 2;
    schnittlinie = {
      lauf,
      pfadIndex: 2 * index,
      uAnfang: Math.max(mitte - halbeSpanne, 0),          // bei v = +B/2 (links)
      uEnde: Math.min(mitte + halbeSpanne, lauf.laenge),  // bei v = −B/2 (rechts, an der Wand)
    };
  }

  // Belegte Fläche: Footprint und die Zelle der letzten Stufennummer (auf der oberen Decke).
  const letzter = laeufe[laeufe.length - 1];
  const zelle = laufRechteck({ ...letzter, start: laufPunkt(letzter, letzter.laenge, 0), laenge: a }, B);
  const belegt = {
    xMin: Math.min(0, zelle.x1), xMax: Math.max(fp.laenge, zelle.x2),
    yMin: Math.min(0, zelle.y1), yMax: Math.max(fp.breite, zelle.y2),
  };

  // Wangen (nur Holz/Stahl) erweitern die belegte Fläche – Maßketten rücken nach außen.
  const wangen = wangenGeometrie(ergebnis.form, laeufe, podest, B, materialVon(ergebnis));
  for (const [p, q] of wangen.flat()) {
    for (const [x, y] of [p, q]) {
      belegt.xMin = Math.min(belegt.xMin, x); belegt.xMax = Math.max(belegt.xMax, x);
      belegt.yMin = Math.min(belegt.yMin, y); belegt.yMax = Math.max(belegt.yMax, y);
    }
  }

  const rechtecke = laeufe.map((l) => laufRechteck(l, B));
  if (podest) rechtecke.push(podest.rechteck);

  return {
    form: ergebnis.form, n, a, B, fp, laeufe, podest, schnittlinie, belegt, rechtecke, wangen,
    raum: raumGeometrie(ergebnis.raum, rechtecke, fp),
  };
}

/**
 * Raumrechteck in cm: Antritt an der linken Raumkante, Treppe in der linken unteren Ecke
 * (Raum y = 0 … breite). Ohne Vorgabe in einer Richtung gilt dort das Treppenmaß.
 * Überstand = Teile der Läufe und Podeste außerhalb des Raums (je Rechteck höchstens zwei).
 */
function raumGeometrie(raum, rechtecke, fp) {
  if (!raum) return null;
  const laenge = raum.vorgabe.laenge ?? fp.laenge;
  const breite = raum.vorgabe.breite ?? fp.breite;
  const ueberstand = [];
  for (const r of rechtecke) {
    if (r.x2 - laenge > RECHENTOLERANZ) ueberstand.push({ x1: Math.max(r.x1, laenge), x2: r.x2, y1: r.y1, y2: r.y2 });
    const x2 = Math.min(r.x2, laenge);
    if (r.y2 - breite > RECHENTOLERANZ && x2 > r.x1) {
      ueberstand.push({ x1: r.x1, x2, y1: Math.max(r.y1, breite), y2: r.y2 });
    }
  }
  return {
    laenge, breite,
    laengeVorgegeben: raum.vorgabe.laenge != null,
    breiteVorgegeben: raum.vorgabe.breite != null,
    fehlt: raum.fehlt,
    ueberstand,
  };
}

/** Raumrechteck (nur vorgegebene Seiten) und schraffierter Überstand der Treppe. */
function raumElemente(z, geo) {
  const r = geo.raum;
  for (const u of r.ueberstand) {
    z.schraffur(EBENE.raum, [[u.x1, u.y1], [u.x2, u.y1], [u.x2, u.y2], [u.x1, u.y2]]);
  }

  // Nur die vorgegebenen Begrenzungen zeichnen: Länge → Querwände, Breite → Längswände.
  const ecken = { lo: [0, r.breite], ro: [r.laenge, r.breite], lu: [0, 0], ru: [r.laenge, 0] };
  const strecke = (p, q) => z.linie(EBENE.raum, p, q, RAUM_STRICH);
  if (r.breiteVorgegeben) {
    strecke(ecken.lo, ecken.ro);
    strecke(ecken.lu, ecken.ru);
  }
  if (r.laengeVorgegeben) {
    strecke(ecken.lo, ecken.lu);
    strecke(ecken.ro, ecken.ru);
  }
}

/**
 * Maßketten des Raums: Länge unter der Lauflänge, Breite rechts; Fehlmaße rot.
 * yBasis = Unterkante der belegten Fläche (0 oder tiefer, wenn eine Stufennummer darunter steht).
 */
function raumMassElemente(z, geo) {
  const r = geo.raum;
  const m = z.m;
  const rot = { fehlmass: true };
  const L = geo.fp.laenge;
  const B = geo.fp.breite;
  const yBasis = geo.belegt.yMin;

  if (r.laengeVorgegeben) {
    const y = yBasis - (26 + RAUMMASS_ABSTAND) * m;
    hilfslinie(z, [0, yBasis - 4 * m], [0, y - 4 * m]);
    hilfslinie(z, [r.laenge, yBasis - 4 * m], [r.laenge, y - 4 * m]);
    horizontalesMass(z, 0, r.laenge, y);
    const wertRaum = zahl(r.laenge);
    z.text([r.laenge / 2, y + 4 * m], masstext(z, t("zeichnung.raum", { wert: wertRaum }), wertRaum, r.laenge), {
      ausrichtung: "mitte",
    });
    if (r.fehlt.laenge > 0) {
      hilfslinie(z, [L, yBasis - 4 * m], [L, y - 4 * m], rot);
      horizontalesMass(z, r.laenge, L, y, rot);
      z.text([(r.laenge + L) / 2, y - 16 * m], t("zeichnung.fehlt", { wert: zahl(fehlmassAufgerundet(r.fehlt.laenge)) }), {
        ausrichtung: "mitte", ...rot,
      });
    }
  }

  if (r.breiteVorgegeben) {
    // Die letzte Stufennummer kann rechts hinter der Treppe stehen – Maßkette erst danach.
    const xRechts = Math.max(geo.belegt.xMax, r.laenge);
    const x = xRechts + 30 * m;
    hilfslinie(z, [xRechts + 4 * m, 0], [x + 4 * m, 0]);
    hilfslinie(z, [xRechts + 4 * m, r.breite], [x + 4 * m, r.breite]);
    vertikalesMass(z, x, 0, r.breite);
    z.text([x - 4 * m, r.breite / 2], zahl(r.breite), { ausrichtung: "mitte", drehung: 90 });
    if (r.fehlt.breite > 0) {
      hilfslinie(z, [xRechts + 4 * m, B], [x + 4 * m, B], rot);
      vertikalesMass(z, x, r.breite, B, rot);
      // rechts neben den Maßstrichen (± 4 px), damit der Text die Hilfslinien nicht berührt
      z.text([x + 18 * m, (r.breite + B) / 2], t("zeichnung.fehlt", { wert: zahl(fehlmassAufgerundet(r.fehlt.breite)) }), {
        ausrichtung: "mitte", drehung: 90, ...rot,
      });
    }
  }
}

/*
 * Pfadindex: Lauf i → 2i, Podest nach Lauf i → 2i + 1. Alles vor dem Lauf mit der
 * Schnittlinie liegt unter der Schnittebene (durchgezogen), alles danach darüber (gestrichelt).
 */

/**
 * Teilt eine Strecke (in cm) im Lauf mit der Schnittlinie in den Teil unterhalb der
 * Schnittebene (durchgezogen) und den Teil darüber (gestrichelt).
 */
function teileAnSchnittlinie(p1, p2, geo, pfadIndex) {
  const sl = geo.schnittlinie;
  if (!sl || pfadIndex < sl.pfadIndex) return { unten: [p1, p2], oben: null };
  if (pfadIndex > sl.pfadIndex) return { unten: null, oben: [p1, p2] };

  // f < 0: Punkt liegt vor der Schnittlinie (Antrittsseite) → unterhalb der Schnittebene
  const f = (p) => {
    const { u, v } = laufKoordinaten(sl.lauf, p);
    return u - (sl.uAnfang + (sl.uEnde - sl.uAnfang) * (geo.B / 2 - v) / geo.B);
  };
  const f1 = f(p1);
  const f2 = f(p2);
  if (f1 <= 0 && f2 <= 0) return { unten: [p1, p2], oben: null };
  if (f1 >= 0 && f2 >= 0) return { unten: null, oben: [p1, p2] };

  const anteil = f1 / (f1 - f2); // nicht „t“: das ist die Übersetzungsfunktion (i18n.js)
  const p = [p1[0] + anteil * (p2[0] - p1[0]), p1[1] + anteil * (p2[1] - p1[1])];
  return f1 < 0 ? { unten: [p1, p], oben: [p, p2] } : { unten: [p, p2], oben: [p1, p] };
}

/** Kante unterhalb der Schnittebene durchgezogen, darüber gestrichelt. */
function kante(z, geo, p1, p2, pfadIndex, ebene = EBENE.treppe, breite = STRICH.schnitt) {
  const teile = teileAnSchnittlinie(p1, p2, geo, pfadIndex);
  if (teile.unten) z.linie(ebene, ...teile.unten, breite);
  if (teile.oben) z.linie(ebene, ...teile.oben, breite, { gestrichelt: true });
}

/** Seitliche Begrenzungen und Setzstufen aller Läufe, Außenkanten des Podests. */
function treppenkantenElemente(z, geo) {
  const h = geo.B / 2;
  geo.laeufe.forEach((lauf, i) => {
    kante(z, geo, laufPunkt(lauf, 0, h), laufPunkt(lauf, lauf.laenge, h), 2 * i);
    kante(z, geo, laufPunkt(lauf, 0, -h), laufPunkt(lauf, lauf.laenge, -h), 2 * i);
    for (let j = 0; j < lauf.steigungen; j++) {
      kante(z, geo, laufPunkt(lauf, j * geo.a, h), laufPunkt(lauf, j * geo.a, -h), 2 * i);
    }
  });
  if (geo.podest) {
    for (const [p, q] of geo.podest.kanten) kante(z, geo, p, q, 1);
  }
}

/** Schnittlinie als Doppellinie, etwas über die Treppe hinaus verlängert. */
function schnittlinieElemente(z, geo) {
  const sl = geo.schnittlinie;
  const d = sl.lauf.d;
  const p1 = laufPunkt(sl.lauf, sl.uAnfang, geo.B / 2);
  const p2 = laufPunkt(sl.lauf, sl.uEnde, -geo.B / 2);
  const laenge = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
  const u = SCHNITTLINIE_UEBERSTAND * z.m;
  const ux = (p2[0] - p1[0]) / laenge * u;
  const uy = (p2[1] - p1[1]) / laenge * u;
  for (const versatz of [0, SCHNITTLINIE_ABSTAND * z.m]) {
    z.linie(
      EBENE.treppe,
      [p1[0] - ux + versatz * d[0], p1[1] - uy + versatz * d[1]],
      [p2[0] + ux + versatz * d[0], p2[1] + uy + versatz * d[1]],
      STRICH.schnitt
    );
  }
}

/*
 * Wangen im Grundriss (Holz, Stahl): je Seite ein Streifen der Wangendicke außerhalb der
 * nutzbaren Laufbreite, entlang der Läufe und um das Podest (Gehrung an den Ecken).
 * Konstruiert als Parallelen zur Lauflinie im Abstand B/2 … B/2 + Dicke.
 * U-Treppe: die beiden Wangen am Treppenauge stoßen aneinander, wenn zwei Wangendicken
 * breiter als das Auge sind (vereinfacht, Hinweis in der Legende).
 */

/** Lauflinie als Punktfolge mit Pfadindex je Strecke (Lauf i → 2i, Podest → 2i + 1). */
function lauflinienPfad(laeufe, podest) {
  const punkte = [laufPunkt(laeufe[0], 0, 0)];
  const index = [];
  const anhaengen = (p, pfadIndex) => {
    const letzter = punkte[punkte.length - 1];
    if (Math.hypot(p[0] - letzter[0], p[1] - letzter[1]) <= RECHENTOLERANZ) return;
    // Geradeaus weiter (z. B. Lauf → Podest): Abschnitte zusammenfassen. Sonst wäre der kurze
    // Podestabschnitt an der Innenecke kürzer als der Wangenabstand und die Parallele liefe
    // über die Ecke hinaus und zurück. Der Abschnitt behält den Pfadindex des Laufs (gerade Zahl),
    // damit er an der Schnittlinie richtig geteilt wird.
    const k = punkte.length - 1;
    if (k > 0) {
      const vorher = punkte[k - 1];
      const kreuz = (letzter[0] - vorher[0]) * (p[1] - letzter[1]) - (letzter[1] - vorher[1]) * (p[0] - letzter[0]);
      const skalar = (letzter[0] - vorher[0]) * (p[0] - letzter[0]) + (letzter[1] - vorher[1]) * (p[1] - letzter[1]);
      const laengen = Math.hypot(letzter[0] - vorher[0], letzter[1] - vorher[1]) * Math.hypot(p[0] - letzter[0], p[1] - letzter[1]);
      if (Math.abs(kreuz) <= 1e-9 * laengen && skalar > 0) {
        punkte[k] = p;
        if (pfadIndex % 2 === 0) index[k - 1] = pfadIndex;
        return;
      }
    }
    punkte.push(p);
    index.push(pfadIndex);
  };
  laeufe.forEach((lauf, i) => {
    anhaengen(laufPunkt(lauf, 0, 0), 2 * i - 1); // Ende des Podests davor (bei i = 0 ohne Wirkung)
    anhaengen(laufPunkt(lauf, lauf.laenge, 0), 2 * i);
    if (i < laeufe.length - 1 && podest) for (const p of podest.lauflinie) anhaengen(p, 2 * i + 1);
  });
  return { punkte, index };
}

/** Parallele zum Pfad im Abstand abstand (positiv = links in Laufrichtung), Ecken auf Gehrung. */
function parallelePfad(punkte, abstand) {
  const links = (p, q) => {
    const l = Math.hypot(q[0] - p[0], q[1] - p[1]);
    return [-(q[1] - p[1]) / l, (q[0] - p[0]) / l];
  };
  return punkte.map((p, k) => {
    const n1 = k > 0 ? links(punkte[k - 1], p) : null;
    const n2 = k < punkte.length - 1 ? links(p, punkte[k + 1]) : null;
    let n = n1 ?? n2;
    if (n1 && n2) {
      const f = 1 + n1[0] * n2[0] + n1[1] * n2[1]; // Gehrung: (n1 + n2) / (1 + n1·n2)
      n = [(n1[0] + n2[0]) / f, (n1[1] + n2[1]) / f];
    }
    return [p[0] + abstand * n[0], p[1] + abstand * n[1]];
  });
}

/**
 * Wangen als Kantenlisten [p, q, pfadIndex]: Außenkante und Stirnseiten. Die Innenkante ist
 * die Treppenkante (schon gezeichnet). Ohne Wangen (Stahlbeton): leere Liste.
 */
function wangenGeometrie(form, laeufe, podest, B, material) {
  const dicke = wangendicke(material);
  if (dicke <= 0) return [];
  const pfad = lauflinienPfad(laeufe, podest);
  const letzte = pfad.punkte.length - 1;
  return [1, -1].map((seite) => {
    // U dreht links: Seite +1 liegt am Treppenauge.
    const d = form === "U" && seite === 1 ? Math.min(dicke, TREPPENAUGE / 2) : dicke;
    const innen = parallelePfad(pfad.punkte, seite * B / 2);
    const aussen = parallelePfad(pfad.punkte, seite * (B / 2 + d));
    const kanten = [[innen[0], aussen[0], pfad.index[0]], [innen[letzte], aussen[letzte], pfad.index[letzte - 1]]];
    for (let k = 0; k < letzte; k++) kanten.push([aussen[k], aussen[k + 1], pfad.index[k]]);
    // Kanten, die ganz auf einer früheren liegen, entfallen: z. B. stoßen bei der Holz-U-Treppe die
    // Wangen am Treppenauge aneinander – sonst überlagern sich die Strichelungen beider Läufe und
    // die Kante wirkt über der Schnittebene durchgezogen. Es bleibt die Kante des unteren Laufs.
    const behalten = [];
    for (const k of kanten) {
      const [p, q] = k;
      if (Math.hypot(q[0] - p[0], q[1] - p[1]) <= RECHENTOLERANZ) continue;
      if (behalten.some(([a, b]) => liegtAufStrecke(p, a, b) && liegtAufStrecke(q, a, b))) continue;
      behalten.push(k);
    }
    return behalten;
  });
}

/** Liegt Punkt p auf der Strecke a–b (Toleranz 0,01 mm)? */
function liegtAufStrecke(p, a, b) {
  const laenge = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const abstand = Math.abs((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) / laenge;
  const anteil = ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / (laenge * laenge);
  const tol = 1e-3;
  return abstand <= tol && anteil >= -tol / laenge && anteil <= 1 + tol / laenge;
}

/** Wangen: fein wie die Treppenkanten, über der Schnittebene gestrichelt. */
function wangenElemente(z, geo) {
  for (const kanten of geo.wangen) {
    for (const [p, q, pfadIndex] of kanten) kante(z, geo, p, q, pfadIndex, EBENE.wange);
  }
}

/** Lauflinie in der Mitte der Läufe, über das Podest: Kreis am Antritt, Pfeil am Austritt. */
function lauflinieElemente(z, geo) {
  const m = z.m;
  const radius = LAUFLINIE_KREIS_RADIUS * m;
  const erster = geo.laeufe[0];
  const letzter = geo.laeufe[geo.laeufe.length - 1];
  z.kreis(EBENE.lauflinie, erster.start, radius, LAUFLINIE_STRICH);

  // Teilstrecken mit Pfadindex: Läufe, dazwischen die Lauflinie auf dem Podest
  const strecken = [];
  geo.laeufe.forEach((lauf, i) => {
    const uAnfang = i === 0 ? radius : 0;
    const uEnde = lauf === letzter ? lauf.laenge - LAUFLINIE_PFEIL.laenge * m : lauf.laenge;
    strecken.push([laufPunkt(lauf, uAnfang, 0), laufPunkt(lauf, uEnde, 0), 2 * i]);
    if (lauf !== letzter && geo.podest) {
      const punkte = geo.podest.lauflinie;
      for (let k = 0; k < punkte.length - 1; k++) strecken.push([punkte[k], punkte[k + 1], 2 * i + 1]);
    }
  });
  for (const [p, q, index] of strecken) {
    if (Math.hypot(q[0] - p[0], q[1] - p[1]) > RECHENTOLERANZ) {
      kante(z, geo, p, q, index, EBENE.lauflinie, LAUFLINIE_STRICH);
    }
  }

  // Gefüllter Pfeil, Spitze an der Austrittskante
  const h = LAUFLINIE_PFEIL.halbeBreite * m;
  const spitze = laufPunkt(letzter, letzter.laenge, 0);
  const basis = laufPunkt(letzter, letzter.laenge - LAUFLINIE_PFEIL.laenge * m, 0);
  const quer = letzter.nrm;
  z.flaeche(
    EBENE.lauflinie,
    [spitze, [basis[0] + h * quer[0], basis[1] + h * quer[1]], [basis[0] - h * quer[0], basis[1] - h * quer[1]]],
    0.5
  );
}

/**
 * Stufennummern 1 … n (Steigungen), fortlaufend über alle Läufe; die Nummer steht auf dem
 * Auftritt hinter ihrer Setzstufe (die letzte eines Laufs auf dem Podest bzw. der oberen Decke).
 * Waagerechte Läufe: über der Lauflinie; senkrechte Läufe: rechts neben der Lauflinie.
 */
function stufennummerElemente(z, geo) {
  const hoehe = Math.min(NUMMER_SCHRIFTGROESSE * z.m, geo.a / 1.3);
  let nr = 0;
  for (const lauf of geo.laeufe) {
    for (let j = 1; j <= lauf.steigungen; j++) {
      nr++;
      const [x, y] = laufPunkt(lauf, (j - 0.5) * geo.a, 0);
      if (lauf.d[1] === 0) {
        z.text([x, y + 5 * z.m], String(nr), { ausrichtung: "mitte", hoehe });
      } else {
        z.text([x + 5 * z.m, y - 0.36 * hoehe], String(nr), { ausrichtung: "links", hoehe });
      }
    }
  }
}

/** Maßketten der geraden Treppe: Lauflänge unten, Laufbreite links – im Stil des Schnitts. */
function geradeMassElemente(z, geo) {
  const m = z.m;
  const L = geo.fp.laenge;

  // Lauflänge unten (unter der Wange, falls vorhanden)
  const yBasis = geo.belegt.yMin;
  const yMassL = yBasis - 26 * m;
  hilfslinie(z, [0, yBasis - 4 * m], [0, yMassL - 4 * m]);
  hilfslinie(z, [L, yBasis - 4 * m], [L, yMassL - 4 * m]);
  horizontalesMass(z, 0, L, yMassL);
  const wertL = zahl(L);
  z.text([L / 2, yMassL + 4 * m], masstext(z, t("zeichnung.lauflaenge", { wert: wertL }), wertL, L), {
    ausrichtung: "mitte",
  });

  // Laufbreite links
  const xMassB = -28 * m;
  hilfslinie(z, [-4 * m, geo.B], [xMassB - 4 * m, geo.B]);
  hilfslinie(z, [-4 * m, 0], [xMassB - 4 * m, 0]);
  vertikalesMass(z, xMassB, 0, geo.B);
  // Nur die Zahl (wie die Geschosshöhe im Schnitt) – „Laufbreite …“ passt bei schmalen Treppen nicht.
  z.text([xMassB - 4 * m, geo.B / 2], zahl(geo.B), { ausrichtung: "mitte", drehung: 90 });
}

/** Sortierte, eindeutige Werte (Gleitkommarauschen unter 0,01 mm zusammengefasst). */
function eindeutigSortiert(werte) {
  const gerundet = werte.map((w) => Math.round(w * 1e3) / 1e3);
  return [...new Set(gerundet)].sort((p, q) => p - q);
}

/**
 * Maßketten der L- und U-Treppe: unten Lauf 1 | Podest, links die Breite in Abschnitten
 * (Laufbreite, Lauf 2 bzw. Treppenauge). Passt eine Zahl nicht zwischen die Maßstriche,
 * steht sie außen neben der Kette.
 */
function podestMassElemente(z, geo) {
  const m = z.m;
  const L1 = geo.laeufe[0].laenge;
  const yBasis = geo.belegt.yMin;

  // unten: Lauf 1 und Podest
  const yMass = yBasis - 26 * m;
  const xKette = [0, L1, L1 + geo.B];
  for (const x of xKette) hilfslinie(z, [x, yBasis - 4 * m], [x, yMass - 4 * m]);
  for (let i = 0; i < xKette.length - 1; i++) {
    const [x1, x2] = [xKette[i], xKette[i + 1]];
    if (x2 - x1 <= RECHENTOLERANZ) continue;
    horizontalesMass(z, x1, x2, yMass);
    const wert = zahl(x2 - x1);
    const lang = t(i === 0 ? "zeichnung.lauflaenge" : "zeichnung.podest", { wert });
    z.text([(x1 + x2) / 2, yMass + 4 * m], masstext(z, lang, wert, x2 - x1), { ausrichtung: "mitte" });
  }

  // links: Breite in Abschnitten (Ränder der Läufe und des Podests)
  const xLinks = geo.belegt.xMin;
  const xMass = xLinks - 28 * m;
  const yWerte = eindeutigSortiert(geo.rechtecke.flatMap((r) => [r.y1, r.y2]));
  for (const y of yWerte) hilfslinie(z, [xLinks - 4 * m, y], [xMass - 4 * m, y]);
  for (let i = 0; i < yWerte.length - 1; i++) {
    const [y1, y2] = [yWerte[i], yWerte[i + 1]];
    vertikalesMass(z, xMass, y1, y2);
    const wert = zahl(y2 - y1);
    // Zahl zu lang für den Abschnitt (z. B. Treppenauge 10 cm) → weiter außen
    const passt = masstext(z, wert, "", y2 - y1) === wert;
    z.text([xMass - (passt ? 4 : 18) * m, (y1 + y2) / 2], wert, { ausrichtung: "mitte", drehung: 90 });
  }
}

/**
 * Elementliste des Grundrisses in cm.
 * @param {object} ergebnis Rückgabe von berechneTreppe()
 * @param {number} cmProPx Umrechnung der Beschriftungsgrößen (px) in cm
 */
function grundrissElemente(ergebnis, cmProPx) {
  if (ergebnis.form === "spindel") return spindelGrundrissElemente(ergebnis, cmProPx); // spindelgrundriss.js
  const geo = grundrissGeometrie(ergebnis);
  const z = neueZeichenliste(cmProPx);

  if (geo.raum) raumElemente(z, geo); // zuerst, damit die Treppe darüber liegt

  treppenkantenElemente(z, geo);
  wangenElemente(z, geo);
  if (geo.schnittlinie) schnittlinieElemente(z, geo);
  lauflinieElemente(z, geo);
  stufennummerElemente(z, geo);
  if (geo.form === "gerade") geradeMassElemente(z, geo);
  else podestMassElemente(z, geo);
  if (geo.raum) raumMassElemente(z, geo);

  return z.elemente;
}

/**
 * Zeichnet den Grundriss der berechneten Treppe.
 * @param {SVGSVGElement} svg
 * @param {object} ergebnis Rückgabe von berechneTreppe()
 * @param {object} abb Abbildung des Schnitts (Rückgabe von zeichneSchnitt())
 */
function zeichneGrundriss(svg, ergebnis, abb) {
  const geo = ergebnis.form === "spindel" ? spindelGrundrissGeometrie(ergebnis) : grundrissGeometrie(ergebnis);
  const k = abb.k;
  const elemente = grundrissElemente(ergebnis, 1 / k);
  const randUnten = GRUNDRISS_RAND.unten + (geo.raum?.laengeVorgegeben ? RAUMMASS_ABSTAND + 16 : 0);

  if (geo.form === "gerade") {
    // Ist der Raum breiter als die Treppe, liegt seine obere Wand über der Treppe.
    // Wangen (Holz/Stahl) liegen außerhalb der Laufbreite: oben über B, unten unter 0.
    const yMax = Math.max(geo.belegt.yMax, geo.raum?.breite ?? 0);
    const hoehePx = GRUNDRISS_RAND.oben + (yMax - geo.belegt.yMin) * k + randUnten;
    // gleiche Breite wie der Schnitt → gleiche x-Lage
    const px = ([x, y]) => [abb.x(x), GRUNDRISS_RAND.oben + (yMax - y) * k];
    zeichneElemente(svg, elemente, px, 1 / k, { breite: abb.breitePx, hoehe: hoehePx });
    return;
  }

  // L/U/Spindel: eigene Lage, gleicher Maßstab. Links Platz für die Breitenkette, rechts für die Raumbreite.
  const { xMin, yMin } = geo.belegt;
  const xMax = Math.max(geo.belegt.xMax, geo.raum?.laenge ?? 0);
  const yMax = Math.max(geo.belegt.yMax, geo.raum?.breite ?? 0);
  const randLinks = GRUNDRISS_RAND_SEITLICH.links + 28;
  const randRechts = GRUNDRISS_RAND_SEITLICH.rechts + (geo.raum?.breiteVorgegeben ? 30 + 24 : 0);
  const breitePx = Math.ceil(randLinks + (xMax - xMin) * k + randRechts);
  const hoehePx = GRUNDRISS_RAND.oben + (yMax - yMin) * k + randUnten;
  const px = ([x, y]) => [randLinks + (x - xMin) * k, GRUNDRISS_RAND.oben + (yMax - y) * k];
  zeichneElemente(svg, elemente, px, 1 / k, { breite: breitePx, hoehe: hoehePx });
}
