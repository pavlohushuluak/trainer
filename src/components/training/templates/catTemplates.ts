
import { PlanTemplate } from '../templateTypes';

export const catTemplates: PlanTemplate[] = [
  // CAT BEHAVIORAL TRAINING - EXPERT LEVEL
  {
    id: 'cat-behavior-expert',
    title: 'Katzen-Verhaltenstherapie nach professionellen Methoden',
    description: 'Professionelle Lösung von Katzenproblemen - Unsauberkeit, Aggression, Angst - nach bewährten Methoden',
    category: 'Verhalten',
    difficulty: 'Fortgeschritten',
    duration: '8-12 Wochen',
    species: ['Katze', 'Cat', 'Katz'],
    ageGroups: ['6 Monate+', 'Erwachsen'],
    exercises: [
      {
        id: 'territory-confidence',
        title: 'Territorialer Selbstbewusstsein-Aufbau (Woche 1-4)',
        description: '"Base Camp" Methode - sichere Zone für ängstliche Katzen schaffen',
        duration: '30-45 Minuten',
        repetitions: 'Täglich, mehrere Sessions',
        difficulty: 'Mittel',
        materials: ['Feliway-Diffusor', 'Versteckmöglichkeiten', 'Erhöhte Plätze', 'Kratzbaum'],
        steps: [
          'Ein Raum wird zum "Base Camp" - hier fühlt sich die Katze 100% sicher',
          'Alle Ressourcen in diesem Raum: Futter, Wasser, Katzenklo, Spielzeug',
          'Feliway-Diffusor für Beruhigung, täglich 30 Minuten interaktives Spielen',
          'Erst wenn Katze hier entspannt ist, langsam Territorium erweitern',
          'Neue Räume nur mit positiven Erfahrungen verknüpfen (Futter, Spiel)',
          'Niemals zwingen - Katze bestimmt das Tempo der Erweiterung',
          'Rückschritte sind normal, zurück zum Base Camp bei Stress',
          'Ziel: Katze "owns" jeden Raum und bewegt sich selbstbewusst'
        ]
      },
      {
        id: 'litter-box-protocol',
        title: 'Unsauberkeits-Therapie Protokoll (Woche 2-8)',
        description: 'Systematische Lösung von Katzenklo-Problemen durch Ursachenanalyse',
        duration: '20-30 Minuten',
        repetitions: 'Bei jeder Klo-Benutzung beobachten',
        difficulty: 'Schwer',
        materials: ['Mehrere Katzenklos', 'Verschiedene Streu-Arten', 'Enzymreiniger', 'Tierarzt-Check'],
        steps: [
          'Schritt 1: Medizinische Ursachen ausschließen - Tierarzt-Besuch obligatorisch!',
          'Schritt 2: Klo-Regel überprüfen: Anzahl = Katzen + 1',
          'Schritt 3: Standort analysieren - ruhig, zugänglich, nicht neben Futter',
          'Schritt 4: Streu-Präferenz testen - verschiedene Arten parallel anbieten',
          'Schritt 5: Reinigung intensivieren - täglich schöpfen, wöchentlich komplett erneuern',
          'Schritt 6: Stress-Faktoren eliminieren - andere Katzen, Geräusche, Veränderungen',
          'Schritt 7: Problem-Stellen mit Enzymreiniger behandeln + unzugänglich machen',
          'Erfolg messen: 2 Wochen problemlose Benutzung = Problem gelöst'
        ]
      },
      {
        id: 'interactive-play-therapy',
        title: 'Interaktive Spiel-Therapie (Woche 1-12)',
        description: 'Professionelle Jagdsequenz-Simulation zur Verhaltenskorrektur und Auslastung',
        duration: '15-20 Minuten',
        repetitions: '2-3 mal täglich zu festen Zeiten',
        difficulty: 'Mittel',
        materials: ['Federangel', 'Verschiedene Anhänger', 'Leckerlis', 'Timer'],
        steps: [
          'Timing: Immer vor den Mahlzeiten spielen - hungrige Katzen sind motivierter',
          'Jagdsequenz simulieren: Spähen → Anschleichen → Packen → Töten → Fressen',
          'Bewegung des Spielzeugs: Weg von der Katze, realistische Beutetier-Bewegungen',
          'Beute "stirbt" am Ende - liegt still, Katze kann sie "fangen"',
          'Sofort nach dem Spiel füttern - komplettiert die Jagdsequenz',
          'Verschiedene Anhänger rotieren - Katzen langweilen sich schnell',
          'Bei mehreren Katzen: Einzeln spielen, sonst Konkurrenz und Frust',
          'Spiel endet wenn Katze hechelt oder das Interesse verliert'
        ]
      },
      {
        id: 'multi-cat-hierarchy',
        title: 'Mehrkatzenhaushalts-Harmonie (Woche 4-12)',
        description: 'Konfliktlösung und Harmonie-Aufbau zwischen mehreren Katzen',
        duration: '45-60 Minuten',
        repetitions: 'Täglich beobachten und intervenieren',
        difficulty: 'Schwer',
        materials: ['Mehrere Ressourcen-Stationen', 'Feliway Multicat', 'Trenngitter', 'Leckerlis'],
        steps: [
          'Ressourcen-Aufstockung: Alles doppelt/dreifach - Klos, Futter, Wasser, Kratzbäume',
          'Territoriale Aufteilung: Jede Katze braucht eigene "Zone" mit allen Ressourcen',
          'Positive Verknüpfung: Katzen bekommen Leckerlis wenn sie sich entspannt sehen',
          'Spielzeit einzeln - verhindert Konkurrenz und Frust',
          'Bei Konflikten: Ablenken, nicht bestrafen - "Ursache finden, nicht Symptom bekämpfen"',
          'Langsame Reintegration nach Kämpfen: wieder bei Basis-Camp beginnen',
          'Vertikales Territorium nutzen - Kratzbäume, Regale, verschiedene Höhen',
          'Erfolg: Katzen ignorieren sich entspannt oder pflegen sich gegenseitig'
        ]
      },
      {
        id: 'scientific-cat-training',
        title: 'Wissenschaftlich fundiertes Katzentraining (Woche 2-10)',
        description: 'Positive Verstärkung und Medical Training für den Alltag',
        duration: '20-30 Minuten',
        repetitions: 'Täglich, kurze Sessions',
        difficulty: 'Schwer',
        materials: ['Clicker', 'Hochwertige Leckerlis', 'Target-Stick', 'Transportbox'],
        steps: [
          'Phase 1: Clicker-Training etablieren - Click = Leckerli, keine Ausnahmen',
          'Phase 2: Target-Training - Katze berührt Stick mit Nase auf Kommando',
          'Phase 3: Transportbox-Training - Box wird zum positiven Ort gemacht',
          'Phase 4: Medical Training - Pfoten anfassen, Ohren kontrollieren akzeptieren',
          'Phase 5: Alltagstraining - Auf Namen kommen, "Sitz", "Bleib" auf Signal',
          'Immer mit positiver Verstärkung arbeiten - niemals zwingen oder strafen',
          'Sessions kurz halten - Katzen haben kurze Aufmerksamkeitsspanne',
          'Bei Verweigerung: Session beenden, später nochmal probieren'
        ]
      }
    ],
    tips: [
      'Es gibt keine bösen Katzen, nur missverstandene',
      'Katzen sind territorial und brauchen Sicherheit - niemals zu schnell vorgehen',
      'Bestrafung funktioniert bei Katzen nie - verstärkt nur Angst und Stress',
      'Jede Verhaltensänderung braucht 3-4 Wochen um stabil zu werden',
      'Bei mehreren Katzen: Immer genug Ressourcen, sonst entsteht Konkurrenz',
      'Routine ist für Katzen extrem wichtig - feste Zeiten für Futter und Spiel'
    ],
    expectedResults: 'Nach 8-12 Wochen haben Sie entspannte, selbstbewusste Katzen die ihr Territorium "besitzen", das Katzenklo zuverlässig nutzen und harmonisch miteinander leben. Verhaltensprobleme sind dauerhaft gelöst.'
  },

  // ADVANCED CAT ENRICHMENT
  {
    id: 'cognitive-cat-enrichment',
    title: 'Kognitive Bereicherung für Wohnungskatzen',
    description: 'Professionelle Umgebungsgestaltung und mentale Stimulation nach neuesten Erkenntnissen',
    category: 'Grundtraining',
    difficulty: 'Fortgeschritten',
    duration: '6-8 Wochen',
    species: ['Katze', 'Cat'],
    ageGroups: ['Erwachsen', '6 Monate+'],
    exercises: [
      {
        id: 'environmental-enrichment',
        title: 'Catification - Optimale Raumgestaltung (Woche 1-3)',
        description: 'Schaffen einer katzengerechten Umgebung mit vertikalem Territorium',
        duration: '60-90 Minuten Setup',
        repetitions: 'Einmalig einrichten, dann beobachten',
        difficulty: 'Mittel',
        materials: ['Kratzbäume verschiedener Höhen', 'Wandregale', 'Verstecke', 'Aussichtsplätze'],
        steps: [
          'Vertikales Territorium schaffen: Mindestens 3 Ebenen in jedem Raum',
          'Superhighways erstellen: Katzen-Autobahnen von Raum zu Raum in der Höhe',
          'Base Camps einrichten: Sichere Zonen mit allem was Katze braucht',
          'Aussichtsplätze: Erhöhte Positionen zum Beobachten und Entspannen',
          'Verstecke: Rückzugsorte für ängstliche Momente schaffen',
          'Kratzmöglichkeiten: Horizontal und vertikal, verschiedene Texturen',
          'Jagdgelegenheiten: Versteckte Leckerlis, Futter-Puzzles integrieren',
          'Grünzeug: Katzengras und ungiftige Pflanzen für natürliche Bedürfnisse'
        ]
      },
      {
        id: 'puzzle-feeding',
        title: 'Futter-Puzzle und mentale Herausforderungen (Woche 2-6)',
        description: 'Aktivierung natürlicher Jagdinstinkte durch intelligente Fütterung',
        duration: '15-30 Minuten pro Mahlzeit',
        repetitions: 'Bei jeder Fütterung',
        difficulty: 'Mittel',
        materials: ['Futter-Bälle', 'Schnüffelmatten', 'Puzzle-Feeder', 'Verstecke'],
        steps: [
          'Stufe 1: Trockenfutter in einfachen Futter-Ball füllen',
          'Stufe 2: Futter in der Wohnung verstecken - Katze muss suchen',
          'Stufe 3: Puzzle-Feeder mit verschiedenen Schwierigkeitsgraden',
          'Stufe 4: Schnüffelmatte für Nassfutter und Leckerlis verwenden',
          'Stufe 5: Selbstgebaute Puzzles aus Klopapierrollen und Kartons',
          'Rotation: Täglich andere Puzzles verwenden gegen Langeweile',
          'Beobachtung: Frust vermeiden - bei Überforderung vereinfachen',
          'Ziel: Jede Mahlzeit wird zur mentalen Herausforderung'
        ]
      }
    ],
    tips: [
      'Katzen brauchen mentale Stimulation genau wie körperliche Bewegung',
      'Langeweile führt zu Verhaltensproblemen - vorbeugen ist besser als heilen',
      'Umgebung regelmäßig ändern - Katzen lieben kontrollierte Abwechslung',
      'Beobachten Sie Ihre Katze: Jede hat individuelle Vorlieben'
    ],
    expectedResults: 'Nach 6-8 Wochen haben Sie eine optimal gestaltete, katzengerechte Umgebung die natürliche Verhaltensweisen fördert und mentale Stimulation bietet. Ihre Katze ist ausgeglichener und zeigt weniger Verhaltensprobleme.'
  }
];
