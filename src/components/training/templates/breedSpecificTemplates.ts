
import { PlanTemplate } from '../templateTypes';

export const breedSpecificTemplates: PlanTemplate[] = [
  // GERMAN SHEPHERD SPECIALIZED TRAINING
  {
    id: 'german-shepherd-working-dog',
    title: 'Deutscher Schäferhund Arbeitshundetraining',
    description: 'Rassespezifisches Training für Deutsche Schäferhunde - Schutz, Gehorsam und Arbeitsfreude nach professionellen Standards',
    category: 'Rassespezifisch',
    difficulty: 'Experte',
    duration: '16-24 Wochen',
    species: ['Hund', 'Dog'],
    breeds: ['Deutscher Schäferhund', 'German Shepherd', 'Belgischer Schäferhund'],
    ageGroups: ['1-3 Jahre', 'Erwachsen'],
    exercises: [
      {
        id: 'protection-foundation',
        title: 'Schutzinstinkt-Grundlagen (Woche 1-8)',
        description: 'Kontrollierten Aufbau des natürlichen Schutzinstinkts ohne Aggressionsförderung',
        duration: '45-60 Minuten',
        repetitions: '3 mal pro Woche',
        difficulty: 'Schwer',
        materials: ['Beißwurst', 'Schutzanzug (fortgeschritten)', 'Helfer', 'Lange Leine'],
        steps: [
          'NUR mit erfahrenem Schutzdiensthelfer arbeiten!',
          'Phase 1: Beuteinstinkt wecken - Beißwurst bewegen, Hund zum Zupacken animieren',
          'Kommando "PASS AUF" einführen - nur bei echten Bedrohungen verwenden',
          'Klares "AUS" aufbauen - Hund muss sofort loslassen auf Kommando',
          'Kontrolliertes Bellen auf "GIB LAUT" - nie unkontrolliert bellen lassen',
          'Unterscheidung Freund/Feind: Normale Besucher werden ignoriert',
          'Schutztrieb nur auf Kommando und nur in berechtigten Situationen',
          'Wichtig: Immer vollständige Kontrolle behalten - Hund entscheidet nie selbst'
        ]
      },
      {
        id: 'precision-obedience',
        title: 'Präzisions-Gehorsam nach professionellen Standards (Woche 4-16)',
        description: 'Millimetergenaue Ausführung aller Grundkommandos wie im Hundesport',
        duration: '30-45 Minuten',
        repetitions: 'Täglich',
        difficulty: 'Schwer',
        materials: ['Targets/Markierungen', 'Motivationsspielzeug', 'Präzisions-Leckerlis'],
        steps: [
          'Fuß-Position: Hund sitzt exakt parallel, Schulter auf Höhe Ihres linken Beins',
          'Sitz aus der Bewegung: Auf ein Zeichen sofort setzen, Position halten bis zur Freigabe',
          'Platz auf Distanz: Aus 50m Entfernung hinlegen, 5 Minuten bewegungslos bleiben',
          'Steh aus dem Lauf: Sofortiger Stopp in perfekter Steh-Position',
          'Apportieren mit Millimeter-Präzision: Gegenstand exakt vor die Füße legen',
          'Voraussenden: 100m geradeaus laufen, auf Kommando hinlegen',
          'Sprung über 1m hohe Hürde mit Apport-Gegenstand',
          'Alles ohne Leckerli - nur mit Lob und Spielzeug als Belohnung'
        ]
      },
      {
        id: 'tracking-work',
        title: 'Fährtenarbeit Grundkurs (Woche 8-20)',
        description: 'Professionelle Nasenarbeit - Aufbau von 400m Fährten mit Gegenständen',
        duration: '60-90 Minuten',
        repetitions: '2-3 mal pro Woche',
        difficulty: 'Schwer',
        materials: ['Fährtengeschirr', '10m Leine', 'Fährtengegenstände', 'Leckerlis für Spur'],
        steps: [
          'Woche 1-2: 20m Spur in gerader Linie, alle 3m ein Leckerli',
          'Hund lernt: Nase runter = Belohnung kommt',
          'Woche 3-4: Erste Winkel einbauen (90°), Spurlänge auf 50m',
          'Woche 5-8: Zwei Winkel, 100m Spur, erste Gegenstände zum Verweisen',
          'Woche 9-12: Komplexere Winkel, 200m Spur, Alter der Spur steigern (30 Min → 3 Stunden)',
          'Woche 13-20: 400m Spur mit 4 Winkeln, 3 Gegenstände, bis zu 24h alte Spur',
          'Immer ruhig arbeiten lassen - Schäferhunde neigen zu Hektik',
          'Bei Fehlern: Zurück zum letzten sicheren Punkt, neu ansetzen'
        ]
      }
    ],
    tips: [
      'Deutsche Schäferhunde brauchen eine Aufgabe - ohne Arbeit entwickeln sie Verhaltensprobleme',
      'Mental erschöpfen ist wichtiger als körperlich - 20 Minuten Kopfarbeit = 2 Stunden Laufen',
      'Frühe Sozialisierung extrem wichtig - sonst werden sie überprotektiv',
      'Konsequenz ist bei dieser Rasse überlebenswichtig - sie testen ständig Grenzen',
      'Niemals aus Langeweile oder Frustration trainieren - Schäferhunde merken Ihre Stimmung sofort'
    ],
    expectedResults: 'Nach 16-24 Wochen haben Sie einen hochleistungsfähigen Arbeitshund mit perfektem Gehorsam, kontrollierten Schutzinstinkten und ausgeprägten Nasenarbeit-Fähigkeiten. Geeignet für Hundesport, Rettungsarbeit oder professionellen Schutzdienst.'
  }
];
