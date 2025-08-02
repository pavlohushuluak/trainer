
import { PlanTemplate } from '../templateTypes';

export const horseTemplates: PlanTemplate[] = [
  // HORSE TRAINING - NATURAL HORSEMANSHIP
  {
    id: 'natural-horsemanship-foundation',
    title: 'Natural Horsemanship Grundausbildung',
    description: 'Aufbau einer vertrauensvollen Partnerschaft zwischen Mensch und Pferd durch natürliche Kommunikation',
    category: 'Grundtraining',
    difficulty: 'Experte',
    duration: '20-30 Wochen',
    species: ['Pferd', 'Horse'],
    ageGroups: ['2-4 Jahre', 'Jungpferd', 'Erwachsen'],
    exercises: [
      {
        id: 'seven-games-foundation',
        title: 'Die 7 Grundlagen-Spiele (Woche 1-8)',
        description: 'Aufbau von Vertrauen, Respekt und Kommunikation durch die fundamentalen 7 Spiele',
        duration: '45-60 Minuten',
        repetitions: 'Täglich',
        difficulty: 'Schwer',
        materials: ['12ft Seil', 'Carrot Stick', 'Halfter', 'Geduld und Konsequenz'],
        steps: [
          'Spiel 1 - Friendly Game: Pferd überall berühren können, ohne dass es weggeht',
          'Spiel 2 - Porcupine Game: Pferd weicht auf leichten Druck zurück (Finger → Halfter → Seil)',
          'Spiel 3 - Driving Game: Pferd bewegt sich von rhythmischem Druck weg',
          'Spiel 4 - Yo-Yo Game: Pferd kommt und geht auf Handsignal',
          'Spiel 5 - Circling Game: Pferd läuft kontrolliert im Kreis um Sie',
          'Spiel 6 - Sideways Game: Pferd bewegt sich seitwärts auf Kommando',
          'Spiel 7 - Squeeze Game: Pferd geht durch enge Räume und über Hindernisse',
          'Jedes Spiel wird schrittweise aufgebaut, nie mit Gewalt erzwungen'
        ]
      },
      {
        id: 'liberty-connection',
        title: 'Liberty-Training - Freiheitsdressur (Woche 8-16)',
        description: 'Aufbau einer so starken Bindung, dass das Pferd freiwillig bei Ihnen bleibt und mitarbeitet',
        duration: '30-45 Minuten',
        repetitions: '4-5 mal pro Woche',
        difficulty: 'Schwer',
        materials: ['Eingezäunte Arena', 'Carrot Stick', 'Leckerlis (sparsam)', 'Körpersprache'],
        steps: [
          'Prerequisite: Pferd muss alle 7 Spiele mit Halfter perfekt beherrschen',
          'Phase 1: Halfter ab, aber Seil noch dran - Sicherheit gewährleisten',
          'Phase 2: Komplett frei - beginnen mit "Friendly Game" ohne jede Ausrüstung',
          'Aufbau von "Join Up": Pferd wendet sich Ihnen zu und folgt freiwillig',
          'Körpersprache perfektionieren: Minimale Signale, maximale Wirkung',
          'Respekt ohne Halfter: Pferd bleibt in persönlichem Raum nur auf Einladung',
          'Fortgeschritten: Kreiseln, Richtungswechsel, Tempo-Variationen frei',
          'Höchstes Level: Pferd folgt überall, auch außerhalb der Arena'
        ]
      },
      {
        id: 'saddle-preparation',
        title: 'Sattel-Vorbereitung & Anreiten (Woche 12-24)',
        description: 'Sanfte Gewöhnung an Sattel und Reiter nach Natural Horsemanship Prinzipien',
        duration: '60-90 Minuten',
        repetitions: 'Täglich, sehr langsame Progression',
        difficulty: 'Schwer',
        materials: ['Satteldecke', 'Sattel', 'Longiergurt', 'Trense', 'Erfahrener Trainer'],
        steps: [
          'NUR wenn Bodenarbeit perfekt sitzt - niemals vorher aufsitzen!',
          'Woche 1-2: Satteldecke auflegen, überall bewegen lassen',
          'Woche 3-4: Sattel auflegen, zunächst ungegurtet',
          'Woche 5-6: Leicht gurten, alle 7 Spiele mit Sattel wiederholen',
          'Woche 7-8: Gewicht simulieren - Säcke über Sattel legen',
          'Woche 9-10: Aufsteigen und wieder absteigen, noch nicht sitzen',
          'Woche 11-12: Erstes vorsichtiges Aufsitzen, nur Sekunden',
          'Langsame Steigerung: Erst still sitzen, dann minimale Bewegungen',
          'Erstes Reiten nur im Schritt, mit Bodenhelfer',
          'Bei jeder Unsicherheit: Zurück zu vorherigem Schritt'
        ]
      },
      {
        id: 'gentle-communication',
        title: 'Sanfte Kommunikation & Vertrauensaufbau (Woche 1-12)',
        description: 'Einfühlsame Methoden für klare, ruhige Kommunikation mit dem Pferd',
        duration: '30-45 Minuten',
        repetitions: 'Täglich',
        difficulty: 'Schwer',
        materials: ['Ruhige Umgebung', 'Geduld', 'Konsistente Körpersprache'],
        steps: [
          'Grundprinzip: Ruhe und Klarheit in jeder Bewegung ausstrahlen',
          'Timing perfektionieren: Richtige Reaktion im richtigen Moment',
          'Pressure and Release: Minimaler Druck, sofortiges Loslassen bei Reaktion',
          'Körpersprache bewusst einsetzen: Position, Energie, Intention',
          'Grenzen setzen ohne Aggression: Klar aber respektvoll',
          'Belohnung durch Ruhe: Entspannung ist die beste Belohnung',
          'Probleme durch Ursachenforschung lösen, nicht Symptome bekämpfen',
          'Jede Session mit positiver Note beenden'
        ]
      }
    ],
    tips: [
      'Grundsatz: "Das Pferd ist nie falsch" - wenn etwas nicht klappt, sind WIR das Problem',
      'Timing und Gefühl sind alles - 1 Sekunde zu spät = komplett andere Message',
      'Niemals mit Zeitdruck arbeiten - Pferde spüren Stress und Ungeduld sofort',
      'Sicherheit geht vor Fortschritt - lieber langsam und sicher als schnell und gefährlich',
      'Nur mit erfahrenem Natural Horsemanship Trainer arbeiten',
      'Jede Session positiv beenden - Pferd soll Lust auf mehr haben'
    ],
    expectedResults: 'Nach 20-30 Wochen haben Sie ein Pferd, das Ihnen vertraut, respektiert und gerne mit Ihnen zusammenarbeitet. Die Basis für lebenslange Partnerschaft ist gelegt, und das Pferd ist bereit für weiterführende Ausbildung unter dem Sattel.'
  },

  // ADVANCED HORSEMANSHIP
  {
    id: 'advanced-ground-work',
    title: 'Fortgeschrittene Bodenarbeit für alle Disziplinen',
    description: 'Professionelle Bodenarbeit die Pferd und Reiter auf alle Reitsport-Disziplinen vorbereitet',
    category: 'Grundtraining',
    difficulty: 'Experte',
    duration: '16-20 Wochen',
    species: ['Pferd', 'Horse'],
    ageGroups: ['3+ Jahre', 'Erwachsen'],
    exercises: [
      {
        id: 'precision-ground-work',
        title: 'Präzisions-Bodenarbeit (Woche 1-8)',
        description: 'Millimetergenaue Ausführung aller Bewegungen vom Boden aus',
        duration: '45-60 Minuten',
        repetitions: 'Täglich',
        difficulty: 'Schwer',
        materials: ['Kappzaum oder Halfter', 'Longierpeitsche', 'Kegel/Pylonen', 'Stangen'],
        steps: [
          'Exakte Positionen: Pferd steht millimetergenau wo Sie es haben wollen',
          'Schulter-herein vom Boden: Seitengänge präzise einleiten und beenden',
          'Rückwärts in gerader Linie: 20 Schritte ohne Abweichung',
          'Vorhand und Hinterhand bewegen: Auf minimale Zeichen reagieren',
          'Stangenarbeit: Über Stangen in verschiedenen Abständen',
          'Tempo-Übergänge: Vom Halt in Trab, ohne Zwischenschritte',
          'Richtungsänderungen: 90° Wendungen ohne Geschwindigkeitsverlust',
          'Konzentration aufbauen: 30 Minuten fokussiert arbeiten können'
        ]
      },
      {
        id: 'desensitization-program',
        title: 'Systematische Desensibilisierung (Woche 4-12)',
        description: 'Pferd wird schrittweise an alle möglichen Umweltreize gewöhnt',
        duration: '30-45 Minuten',
        repetitions: '4-5 mal pro Woche',
        difficulty: 'Schwer',
        materials: ['Planen', 'Bälle', 'Regenschirm', 'Radio', 'Fahrzeuge'],
        steps: [
          'Akustische Reize: Radio, Verkehrslärm, laute Geräusche stufenweise',
          'Visuelle Reize: Flatternde Gegenstände, Planen, ungewöhnliche Objekte',
          'Taktile Reize: Überall berühren lassen, auch mit Gegenständen',
          'Bewegliche Objekte: Bälle, fahrende Gegenstände, andere Tiere',
          'Verschiedene Untergründe: Sand, Asphalt, Kies, Wasser, Brücken',
          'Enge Räume: Durch Tore, Anhänger, unter niedrigen Hindernissen',
          'Alltagssituationen: Tierarzt, Schmied, Verladen üben',
          'Stresstest: Mehrere Reize gleichzeitig - Gelassenheit bewahren'
        ]
      }
    ],
    tips: [
      'Bodenarbeit ist die Basis für alles weitere Training',
      'Perfektion vom Boden überträgt sich automatisch aufs Reiten',
      'Niemals Fortschritte erzwingen - lieber einen Tag länger üben',
      'Ein gut ausgebildetes Bodenpferd ist sicherer und entspannter'
    ],
    expectedResults: 'Nach 16-20 Wochen haben Sie ein Pferd mit exzellenter Bodenarbeit, das auf feinste Hilfen reagiert und in jeder Situation gelassen bleibt. Perfekte Basis für jede Reitweise.'
  }
];
