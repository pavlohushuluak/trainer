
import { PlanTemplate } from '../templateTypes';

export const exoticTemplates: PlanTemplate[] = [
  // RABBIT TRAINING
  {
    id: 'rabbit-litter-training',
    title: 'Kaninchen-Stubenreinheit und Grundtraining',
    description: 'Professionelles Training für Hauskaninchen - Stubenreinheit, Handling und Bereicherung',
    category: 'Grundtraining',
    difficulty: 'Fortgeschritten',
    duration: '8-12 Wochen',
    species: ['Kaninchen', 'Rabbit', 'Hase'],
    ageGroups: ['3 Monate+', 'Erwachsen'],
    exercises: [
      {
        id: 'litter-box-training',
        title: 'Katzenklo-Training für Kaninchen (Woche 1-6)',
        description: 'Systematischer Aufbau der Stubenreinheit nach bewährten Methoden',
        duration: '30-45 Minuten Beobachtung',
        repetitions: 'Kontinuierlich beobachten',
        difficulty: 'Mittel',
        materials: ['Große Katzentoilette', 'Kaninchen-Streu', 'Heu', 'Leckerlis'],
        steps: [
          'Woche 1: Beobachten wo Kaninchen natürlich hinmacht - dort Klo platzieren',
          'Klo-Setup: Streu rein, Heu darüber (Kaninchen fressen gern beim Geschäft)',
          'Woche 2: Andere "Unfälle" sofort beseitigen, keine Bestrafung',
          'Woche 3: Bei richtiger Benutzung sofort belohnen mit Leckerli',
          'Woche 4: Allmählich Bewegungsfreiheit erweitern, mehrere Klos aufstellen',
          'Woche 5: Territorium-Marking ist normal - Kastration hilft bei Rammeln',
          'Woche 6: Konsistenz - jeden Tag gleicher Ablauf und Belohnung',
          'Geduld: Manche Kaninchen brauchen länger als andere'
        ]
      },
      {
        id: 'rabbit-handling-training',
        title: 'Sanftes Handling und Medical Training (Woche 2-8)',
        description: 'Gewöhnung an notwendiges Handling für Pflege und Tierarztbesuche',
        duration: '15-20 Minuten',
        repetitions: 'Täglich',
        difficulty: 'Schwer',
        materials: ['Handtuch', 'Leckerlis', 'Nagelknipser', 'Bürste'],
        steps: [
          'Grundregel: Kaninchen niemals am Nacken oder an den Ohren greifen!',
          'Phase 1: Überall berühren können - Pfoten, Ohren, Bauch',
          'Phase 2: Kurzes Hochheben üben - Brust und Hinterteil stützen',
          'Phase 3: Handtuch-Training für sichere Fixierung beim Tierarzt',
          'Phase 4: Krallen-Schneiden akzeptieren - sehr langsam aufbauen',
          'Phase 5: Bürsten tolerieren - besonders bei Langhaar-Rassen wichtig',
          'Phase 6: Transportbox als positiven Ort etablieren',
          'Bei Stress: Sofort aufhören, Kaninchen können Herzinfarkt bekommen!'
        ]
      }
    ],
    tips: [
      'Kaninchen sind Beutetiere - niemals zwingen oder erschrecken',
      'Kastration/Sterilisation hilft bei Stubenreinheit und Verhalten',
      'Soziale Tiere - einzelne Kaninchen brauchen mehr menschliche Aufmerksamkeit',
      'Niemals auf dem Rücken halten - versetzt sie in Schockstarre'
    ],
    expectedResults: 'Nach 8-12 Wochen haben Sie ein stubenreines Kaninchen das grundlegendes Handling akzeptiert und entspannt mit Menschen interagiert.'
  },

  // GUINEA PIG TRAINING
  {
    id: 'guinea-pig-socialization',
    title: 'Meerschweinchen-Sozialisierung und Pflege-Training',
    description: 'Grundlegendes Training für Meerschweinchen - Handling, Sozialisierung und Pflege',
    category: 'Grundtraining',
    difficulty: 'Anfänger',
    duration: '6-8 Wochen',
    species: ['Meerschweinchen', 'Guinea Pig'],
    ageGroups: ['6 Wochen+', 'Erwachsen'],
    exercises: [
      {
        id: 'guinea-pig-handling',
        title: 'Sanftes Handling-Training (Woche 1-6)',
        description: 'Gewöhnung an menschlichen Kontakt und notwendige Pflege',
        duration: '10-15 Minuten',
        repetitions: 'Täglich',
        difficulty: 'Einfach',
        materials: ['Handtuch', 'Leckerlis (Gemüse)', 'Ruhige Umgebung'],
        steps: [
          'Woche 1: Hand langsam ins Gehege, Leckerli anbieten',
          'Woche 2: Sanftes Streicheln, wenn Tier entspannt ist',
          'Woche 3: Kurzes Hochheben üben - beide Hände verwenden',
          'Woche 4: Längeres Halten auf dem Schoß mit Handtuch',
          'Woche 5: Pflege-Handling - Krallen kontrollieren, Fell checken',
          'Woche 6: Routine etablieren für regelmäßige Gesundheitschecks',
          'Wichtig: Niemals von oben greifen - erschreckt Beutetiere',
          'Bei Panik: Sicher festhalten aber nicht quetschen'
        ]
      }
    ],
    tips: [
      'Meerschweinchen sind sehr sozial - niemals einzeln halten',
      'Laute Geräusche und schnelle Bewegungen vermeiden',
      'Regelmäßige Pflege ist wichtig - besonders Krallen und Haare'
    ],
    expectedResults: 'Nach 6-8 Wochen akzeptieren Ihre Meerschweinchen Handling für Pflege und zeigen weniger Angst vor menschlichem Kontakt.'
  }
];
