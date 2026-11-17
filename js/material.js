/*
 * material.js – Material der Treppe: Konstruktion, Bauteilmaße und Schraffur.
 *
 * Alle Maße hier sind ANNAHMEN für die Darstellung, KEINE Normwerte. Die Normprüfung
 * (Steigung, Auftritt, nutzbare Laufbreite) hängt nicht vom Material ab.
 *
 * Konstruktion:
 *   "laufplatte" – massive Lauf- und Podestplatte, Stufen aufbetoniert (Stahlbeton)
 *   "wange"      – zwei Wangen links und rechts, dazwischen Trittstufen, offene Stufen
 *                  (ohne Setzstufen); Podest: Belag wie Trittstufen, am Rand Wangen
 *
 * Zugriff aus den Zeichnungen nur über materialVon(), bauteil() und materialSchraffur(),
 * damit weitere Treppenformen (z. B. Spindeltreppe) dieselbe Materiallogik nutzen.
 * Die Geschossdecken sind immer Stahlbeton (DECKENDICKE in zeichnung.js).
 */

const STANDARD_MATERIAL = "stahlbeton";

const MATERIALIEN = {
  stahlbeton: {
    schluessel: "stahlbeton",
    konstruktion: "laufplatte",
    bauteile: {
      laufplatte: { dicke: 18 }, // cm – Annahme (Vorgabe des Nutzers, 16.11.), kein Normwert
    },
    // 45°-Linien wie bisher – vereinfacht, in Anlehnung an DIN 1356-1 (Original nicht eingesehen)
    schraffur: { art: "linien", winkel: 45, abstand: 5 },
  },
  holz: {
    schluessel: "holz",
    konstruktion: "wange",
    bauteile: {
      trittstufe: { dicke: 5 },                    // cm – Annahme (Nutzer, 17.11.), kein Normwert
      wange: { dicke: 6, hoehe: 30, ueberstand: 5 }, // cm – Annahme (Nutzer, 17.11.), kein Normwert;
      // ueberstand = Oberkante Wange über der Linie der Stufenvorderkanten (senkrecht zur Steigung)
    },
    // Linien parallel zur Faser (längs der Trittstufe) – vereinfacht, Darstellung nicht normgeprüft
    schraffur: { art: "linien", winkel: 0, abstand: 3 },
  },
  stahl: {
    schluessel: "stahl",
    konstruktion: "wange",
    bauteile: {
      trittstufe: { dicke: 4 },                        // cm – Annahme (Nutzer, 17.11.), kein Normwert
      wange: { dicke: 1.5, hoehe: 25, ueberstand: 5 }, // cm – Annahme (Flachstahl, Nutzer 17.11.), kein Normwert
    },
    // Vollflächig schwarz (üblich für dünne Metallquerschnitte) – vereinfacht, Quelle nicht geprüft
    schraffur: { art: "voll" },
  },
};

/** Material einer Zeichnungseingabe (ergebnis.material = Schlüssel); Standard Stahlbeton. */
function materialVon(ergebnis) {
  return MATERIALIEN[ergebnis.material] ?? MATERIALIEN[STANDARD_MATERIAL];
}

/** Maße eines Bauteils, z. B. bauteil(material, "trittstufe").dicke; null, wenn es das Bauteil nicht gibt. */
function bauteil(material, name) {
  return material.bauteile[name] ?? null;
}

/** Wangendicke im Grundriss (0 ohne Wangen). */
function wangendicke(material) {
  return bauteil(material, "wange")?.dicke ?? 0;
}

/** DXF-Ebene der Materialschraffur; Stahlbeton bleibt auf SCHRAFFUR (wie bisher). */
const MATERIAL_SCHRAFFUR_EBENE = {
  stahlbeton: EBENE.schraffur,
  holz: EBENE.schraffurHolz,
  stahl: EBENE.schraffurStahl,
};

/**
 * Geschnittenes Bauteil aus diesem Material: Schraffur bzw. Füllung innerhalb des Umrisses.
 * Der Umriss selbst wird vom Aufrufer gezeichnet.
 */
function materialSchraffur(z, material, umriss) {
  const ebene = MATERIAL_SCHRAFFUR_EBENE[material.schluessel];
  const s = material.schraffur;
  if (s.art === "voll") {
    z.flaeche(ebene, umriss, STRICH.schraffur);
  } else {
    z.schraffur(ebene, umriss, { winkel: s.winkel, abstandPx: s.abstand });
  }
}
