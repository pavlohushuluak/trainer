
import { PlanTemplate } from '../templateTypes';

export const birdTemplates: PlanTemplate[] = [
  // BIRD TRAINING - POSITIVE REINFORCEMENT
  {
    id: 'parrot-basic-training',
    title: 'Papageien-Grundtraining mit positiver Verstärkung',
    description: 'Professionelles Training für Papageien und große Vögel - Target Training, Medical Training und Verhaltensmanagement',
    category: 'Grundtraining',
    difficulty: 'Fortgeschritten',
    duration: '12-16 Wochen',
    species: ['Vogel', 'Bird', 'Papagei'],
    ageGroups: ['6 Monate+', 'Erwachsen'],
    exercises: [
      {
        id: 'target-training-foundation',
        title: 'Target Training Grundlagen (Woche 1-4)',
        description: 'Aufbau der Basis für alle weiteren Trainingseinheiten durch Target Training',
        duration: '15-20 Minuten',
        repetitions: '2-3 mal täglich',
        difficulty: 'Mittel',
        materials: ['Target-Stick (Holzstab)', 'Hochwertige Leckerlis', 'Clicker (optional)', 'Ruhige Umgebung'],
        steps: [
          'Schritt 1: Target-Stick in Schnabelreichweite halten, belohnen wenn Vogel ihn berührt',
          'Schritt 2: Kommando "Touch" einführen - Target zeigen, Kommando geben, belohnen',
          'Schritt 3: Target in verschiedene Richtungen bewegen, Vogel folgt',
          'Schritt 4: Entfernung schrittweise vergrößern - Vogel geht zum Target',
          'Schritt 5: Target Training auf verschiedene Objekte übertragen',
          'Wichtig: Immer mit Belohnung beenden, nie zu lange Sessions',
          'Bei Verweigerung: Pause machen, später nochmal versuchen',
          'Ziel: Zuverlässige Reaktion auf Target-Signal in 2-3 Sekunden'
        ]
      },
      {
        id: 'medical-training-birds',
        title: 'Medical Training für Tierarztbesuche (Woche 4-10)',
        description: 'Gewöhnung an tierärztliche Untersuchungen und Handling durch positive Konditionierung',
        duration: '10-15 Minuten',
        repetitions: 'Täglich',
        difficulty: 'Schwer',
        materials: ['Handtuch', 'Waage', 'Transportbox', 'Leckerlis'],
        steps: [
          'Phase 1: Handtuch-Training - Handtuch zeigen = Leckerli (positive Verknüpfung)',
          'Phase 2: Sanftes Berühren mit Handtuch, sofort belohnen',
          'Phase 3: Kurzes Umhüllen (1-2 Sekunden), massive Belohnung',
          'Phase 4: Waage-Training - auf Waage gehen = Belohnung',
          'Phase 5: Transportbox als positiven Ort etablieren',
          'Phase 6: Flügel kontrollieren akzeptieren - sehr langsam aufbauen',
          'Phase 7: Kombination: Handtuch + Untersuchung + Belohnung',
          'Niemals zwingen - bei Stress abbrechen und neu aufbauen'
        ]
      },
      {
        id: 'flight-recall-training',
        title: 'Freiflug und Rückruf-Training (Woche 8-16)',
        description: 'Sicherer Freiflug mit zuverlässigem Rückruf in kontrollierten Umgebungen',
        duration: '30-45 Minuten',
        repetitions: '3-4 mal pro Woche',
        difficulty: 'Schwer',
        materials: ['Lange Leine (Aviator Harness)', 'Hochwertige Belohnungen', 'Sichere Flugumgebung'],
        steps: [
          'WICHTIG: Nur in geschlossenen Räumen oder mit Sicherungsgeschirr!',
          'Woche 1-2: Kurze Distanzen (1-2 Meter) - Rückruf mit Target',
          'Woche 3-4: Mittlere Distanzen (3-5 Meter) - perfekte Landung belohnen',
          'Woche 5-6: Verschiedene Höhen - von erhöhten Positionen zurückrufen',
          'Woche 7-8: Ablenkung einbauen - andere Personen, Geräusche im Raum',
          'Fortgeschritten: Harness-Training für sicheren Außenbereich',
          'Rückruf-Signal: Immer dasselbe Wort/Pfiff + visuelles Signal',
          'Goldene Regel: Niemals rufen wenn nicht 100% sicher dass Vogel kommt'
        ]
      },
      {
        id: 'behavioral-enrichment',
        title: 'Verhaltens-Bereicherung und Problemlösung (Woche 1-16)',
        description: 'Mentale Stimulation und Lösung typischer Verhaltensprobleme bei Vögeln',
        duration: '20-30 Minuten',
        repetitions: 'Täglich, verschiedene Aktivitäten',
        difficulty: 'Mittel',
        materials: ['Foraging-Spielzeug', 'Naturäste', 'Versteckmöglichkeiten', 'Verschiedene Texturen'],
        steps: [
          'Foraging fördern: Futter verstecken, Vogel muss suchen und arbeiten',
          'Zerstörungsmaterial: Äste, Karton, Papier zum sicheren Zernagen',
          'Soziale Stimulation: Feste Zeiten für Aufmerksamkeit und Interaktion',
          'Umgebung abwechslungsreich gestalten: Spielzeug regelmäßig wechseln',
          'Schreien reduzieren: Ignore negative Aufmerksamkeit, belohne Ruhe',
          'Beißen umleiten: Alternativen anbieten, nie Finger als Spielzeug',
          'Routine etablieren: Feste Zeiten für Freiflug, Spiel, Ruhe',
          'Problemverhalten: Ursachen finden (Langeweile, Angst, Hormone)'
        ]
      }
    ],
    tips: [
      'Positive Verstärkung ist bei Vögeln der einzige effektive Weg',
      'Sessions kurz halten - Vögel haben begrenzte Aufmerksamkeitsspanne',
      'Timing ist entscheidend - Belohnung muss sofort nach gewünschtem Verhalten erfolgen',
      'Niemals bestrafen oder zwingen - zerstört Vertrauen dauerhaft',
      'Jeder Vogel ist individuell - Tempo und Methoden anpassen',
      'Sicherheit geht immer vor - niemals ungesichert fliegen lassen'
    ],
    expectedResults: 'Nach 12-16 Wochen haben Sie einen gut trainierten Vogel der auf Kommandos reagiert, tierärztliche Behandlungen akzeptiert und in sicherer Umgebung frei fliegen kann. Verhaltensprobleme sind deutlich reduziert.'
  },

  // SMALL BIRD TRAINING
  {
    id: 'small-bird-socialization',
    title: 'Kleinvogel-Sozialisierung und Handling',
    description: 'Sanftes Training für Kanarienvögel, Finken und andere Kleinvögel',
    category: 'Grundtraining',
    difficulty: 'Anfänger',
    duration: '6-8 Wochen',
    species: ['Vogel', 'Bird', 'Kanarienvogel', 'Fink'],
    ageGroups: ['Jung', 'Erwachsen'],
    exercises: [
      {
        id: 'gentle-habituation',
        title: 'Sanfte Gewöhnung an Menschen (Woche 1-4)',
        description: 'Stressfreie Gewöhnung kleiner Vögel an menschliche Präsenz',
        duration: '10-15 Minuten',
        repetitions: 'Mehrmals täglich',
        difficulty: 'Einfach',
        materials: ['Ruhige Stimme', 'Leckerlis (Hirse)', 'Geduld'],
        steps: [
          'Woche 1: Einfach in der Nähe des Käfigs aufhalten, ruhig sprechen',
          'Woche 2: Langsame Bewegungen, Futter durch Käfigstäbe anbieten',
          'Woche 3: Hand langsam in Käfig bewegen, nicht greifen',
          'Woche 4: Futter aus der Hand anbieten, Geduld bei Verweigerung',
          'Niemals hastige Bewegungen oder laute Geräusche',
          'Bei Panik sofort aufhören und später neu beginnen',
          'Positive Verknüpfung: Menschliche Nähe = gute Dinge passieren',
          'Ziel: Vogel bleibt entspannt bei menschlicher Anwesenheit'
        ]
      }
    ],
    tips: [
      'Kleinvögel sind sehr stressanfällig - immer sanft vorgehen',
      'Gruppenverhalten beachten - manche Arten brauchen Artgenossen',
      'Umgebung ruhig halten - plötzliche Geräusche vermeiden'
    ],
    expectedResults: 'Nach 6-8 Wochen sind Ihre Kleinvögel entspannt bei menschlicher Anwesenheit und akzeptieren grundlegendes Handling für Pflege und Tierarztbesuche.'
  }
];
