/*
 * norm.js – Alle Grenzwerte nach DIN 18065 an genau einer Stelle.
 *
 * Quelle (für alle Werte, sofern nicht anders angegeben):
 *   DIN 18065:2020-08, Tabelle 1 (zitiert nach WEKA-Fachportal, Original nicht eingesehen)
 *
 * Alle Maße in Zentimetern.
 * Werte gelten für baurechtlich notwendige Treppen.
 */

const DIN18065 = Object.freeze({
  // Schrittmaßregel: 59 cm ≤ 2s + a ≤ 65 cm
  // Quelle: DIN 18065:2020-08, Tabelle 1 (zitiert nach WEKA-Fachportal, Original nicht eingesehen)
  schrittmass: Object.freeze({
    min: 59,
    max: 65,
  }),

  gebaeudearten: Object.freeze({
    wohngebaeude: Object.freeze({
      // Normbegriff (deutsch). Angezeigt wird der Text aus i18n.js („gebaeudeart.wohngebaeude“).
      bezeichnung: "Wohngebäude mit bis zu zwei Wohnungen / innerhalb von Wohnungen",

      // Steigung s: 14–20 cm
      // Quelle: DIN 18065:2020-08, Tabelle 1 (zitiert nach WEKA-Fachportal, Original nicht eingesehen)
      steigung: Object.freeze({ min: 14, max: 20 }),

      // Auftritt a: 23–37 cm
      // Quelle: DIN 18065:2020-08, Tabelle 1 (zitiert nach WEKA-Fachportal, Original nicht eingesehen)
      auftritt: Object.freeze({ min: 23, max: 37 }),

      // Nutzbare Laufbreite: ≥ 80 cm
      // Quelle: DIN 18065:2020-08, Tabelle 1 (zitiert nach WEKA-Fachportal, Original nicht eingesehen)
      laufbreiteMin: 80,

      // Lichte Durchgangshöhe: ≥ 200 cm
      // Quelle: DIN 18065:2020-08 (zitiert nach WEKA-Fachportal, Original nicht eingesehen)
      durchgangshoeheMin: 200,
    }),

    allgemein: Object.freeze({
      // Normbegriff (deutsch). Angezeigt wird der Text aus i18n.js („gebaeudeart.allgemein“).
      bezeichnung: "Gebäude im Allgemeinen",

      // Steigung s: 14–19 cm
      // Quelle: DIN 18065:2020-08, Tabelle 1 (zitiert nach WEKA-Fachportal, Original nicht eingesehen)
      steigung: Object.freeze({ min: 14, max: 19 }),

      // Auftritt a: 26–37 cm
      // Quelle: DIN 18065:2020-08, Tabelle 1 (zitiert nach WEKA-Fachportal, Original nicht eingesehen)
      auftritt: Object.freeze({ min: 26, max: 37 }),

      // Nutzbare Laufbreite: ≥ 100 cm
      // Quelle: DIN 18065:2020-08, Tabelle 1 (zitiert nach WEKA-Fachportal, Original nicht eingesehen)
      laufbreiteMin: 100,

      // Lichte Durchgangshöhe: ≥ 200 cm
      // Quelle: DIN 18065:2020-08 (zitiert nach WEKA-Fachportal, Original nicht eingesehen)
      durchgangshoeheMin: 200,
    }),
  }),
});
