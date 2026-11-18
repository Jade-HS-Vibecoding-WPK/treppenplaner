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
  // Quelle: Baunetz Wissen „Spindeltreppen“ (mit Verweis auf DIN 18065, Ausgabe nicht genannt),
  // abgerufen 18.11.; Original nicht eingesehen (WEKA bestätigt nur s, a und Laufbreite)
  schrittmass: Object.freeze({
    min: 59,
    max: 65,
  }),

  // Treppenlauf: mindestens 3 Stufen, gezählt als Steigungen.
  // Quelle: Baunetz Wissen „Treppen“ (mit Verweis auf DIN 18065), Original nicht eingesehen
  // TODO: Quelle prüfen (zählt die Norm Steigungen oder Auftritte?)
  treppenlauf: Object.freeze({
    minSteigungen: 3,
  }),

  // Podestlänge ≥ nutzbare Laufbreite (Faktor 1 × Laufbreite).
  // Quelle: Baunetz Wissen „Treppen“ (mit Verweis auf DIN 18065), Original nicht eingesehen
  podest: Object.freeze({
    minLaengeJeLaufbreite: 1,
  }),

  // Spindeltreppe. Längs der Lauflinie gelten Steigung, Auftritt und Schrittmaß wie bei
  // geraden Treppen (Werte der Gebäudeart unten).
  // Quelle für alle Werte dieses Blocks: Baunetz Wissen „Spindeltreppen“ und Glossar „Gehbereich“
  // (mit Verweis auf DIN 18065, Ausgabe nicht genannt), abgerufen 18.11.; Original nicht eingesehen.
  spindeltreppe: Object.freeze({
    // Gehbereich = 2/10 der nutzbaren Laufbreite; die Lauflinie muss darin liegen.
    gehbereichAnteil: 0.2,
    // Innere Grenze des Gehbereichs in der Mitte der nutzbaren Laufbreite
    // (Anteil der Laufbreite, gemessen von der inneren Begrenzung).
    gehbereichInnenAnteil: 0.5,
    // Diese Lage des Gehbereichs gilt für nutzbare Laufbreiten bis 130 cm; für breitere
    // Spindeltreppen wurde keine Regel gefunden (im Tool: Variante ausgeschlossen).
    laufbreiteMax: 130,
    // Auftritt an der inneren Begrenzung der nutzbaren Laufbreite ≥ 10 cm; schmalere Bereiche
    // zählen nicht zur nutzbaren Laufbreite.
    // TODO: Quelle prüfen – gemessen als Sehne (im Tool) oder als Bogen? (Sehne ist die sichere Seite)
    auftrittInnenMin: 10,
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
      // Quelle: Baunetz Wissen „Spindeltreppen“ (mit Verweis auf DIN 18065, Ausgabe nicht genannt),
      // abgerufen 18.11.; Original nicht eingesehen. Im Tool nur bei der Spindeltreppe geprüft.
      durchgangshoeheMin: 200,

      // Podest spätestens nach 18 Steigungen: gilt hier nicht (Ausnahme für Wohngebäude
      // mit bis zu zwei Wohnungen). null = keine Begrenzung.
      // Quelle: Baunetz Wissen „Treppen“ (mit Verweis auf DIN 18065), Original nicht eingesehen
      maxSteigungenJeLauf: null,
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
      // Quelle: Baunetz Wissen „Spindeltreppen“ (mit Verweis auf DIN 18065, Ausgabe nicht genannt),
      // abgerufen 18.11.; Original nicht eingesehen. Im Tool nur bei der Spindeltreppe geprüft.
      durchgangshoeheMin: 200,

      // Podest spätestens nach 18 Steigungen (höchstens 18 Steigungen je Lauf).
      // Quelle: Baunetz Wissen „Treppen“ (mit Verweis auf DIN 18065), Original nicht eingesehen
      maxSteigungenJeLauf: 18,
    }),
  }),
});
