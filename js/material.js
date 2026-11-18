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
      // Spindeltreppe: Kragstufen um die Spindel – vereinfacht, in Wirklichkeit meist eine
      // monolithische Wendelplatte (Hinweis in der Legende und im README)
      kragstufe: { dicke: 8 },     // cm – Annahme (Nutzer, 18.11.), kein Normwert
      spindel: { durchmesser: 20 }, // cm – Annahme (Nutzer, 18.11.), kein Normwert
      gelaender: { zuschlag: 5 },   // cm, Spindeltreppe: Geländer außen um die nutzbare Laufbreite – Annahme (Nutzer, 18.11.)
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
      spindel: { durchmesser: 12 }, // cm – Annahme (Nutzer, 18.11.), kein Normwert
      gelaender: { zuschlag: 5 },   // cm, Spindeltreppe: Geländer außen um die nutzbare Laufbreite – Annahme (Nutzer, 18.11.)
    },
    // Linien parallel zur Faser (längs der Trittstufe), dicht und etwas kräftiger, damit die dünne
    // Trittstufe als geschnitten lesbar ist – vereinfacht, Darstellung nicht normgeprüft
    schraffur: { art: "linien", winkel: 0, abstand: 2, breite: 0.6 },
    schnittkontur: 1.5, // px, kräftiger als STRICH.schnitt (Darstellung, kein Normwert)
  },
  stahl: {
    schluessel: "stahl",
    konstruktion: "wange",
    bauteile: {
      trittstufe: { dicke: 4 },                        // cm – Annahme (Nutzer, 17.11.), kein Normwert
      wange: { dicke: 1.5, hoehe: 25, ueberstand: 5 }, // cm – Annahme (Flachstahl, Nutzer 17.11.), kein Normwert
      spindel: { durchmesser: 10 }, // cm – Annahme (Stahlrohr, Nutzer 18.11.), kein Normwert
      gelaender: { zuschlag: 5 },   // cm, Spindeltreppe: Geländer außen um die nutzbare Laufbreite – Annahme (Nutzer, 18.11.)
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

/**
 * Maße der Spindeltreppe aus dem Material (alles Annahmen, keine Normwerte):
 * Spindeldurchmesser, Geländerzuschlag außen und Stufendicke (Holz/Stahl: die Trittstufe
 * wie bei der Wangentreppe, Stahlbeton: Kragstufe). Die Stufendicke geht in die lichte
 * Durchgangshöhe ein.
 */
function spindelMasse(material) {
  const stufe = bauteil(material, "trittstufe") ?? bauteil(material, "kragstufe");
  return {
    spindelDurchmesser: bauteil(material, "spindel").durchmesser,
    gelaenderZuschlag: bauteil(material, "gelaender").zuschlag,
    stufendicke: stufe.dicke,
  };
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
    z.schraffur(ebene, umriss, { winkel: s.winkel, abstandPx: s.abstand, breite: s.breite });
  }
}

/** Geschnittenes Bauteil (z. B. Trittstufe): Materialschraffur und Umriss (Schnittstrich, bei Holz kräftiger). */
function geschnittenesBauteil(z, material, ebene, umriss) {
  materialSchraffur(z, material, umriss);
  z.polylinie(ebene, umriss, material.schnittkontur ?? STRICH.schnitt, { geschlossen: true });
}
