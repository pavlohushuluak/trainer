
import { PlanTemplate } from '../templateTypes';

export const dogTemplates: PlanTemplate[] = [
  // WELPEN GRUNDAUSBILDUNG
  {
    id: 'puppy-basics',
    title: 'Welpen-Grundkurs (8-16 Wochen)',
    description: 'Professionelle Welpenausbildung - Aufbau von Vertrauen, Grundgehorsam und sozialer Kompetenz',
    category: 'Grundtraining',
    difficulty: 'Anfänger',
    duration: '8-12 Wochen',
    species: ['Hund', 'Dog'],
    ageGroups: ['0-6 Monate', 'Welpe'],
    exercises: [
      {
        id: 'name-conditioning',
        title: 'Namens-Konditionierung',
        description: 'Aufbau einer positiven Verknüpfung mit dem Namen',
        duration: '3-5 Minuten pro Session',
        repetitions: '8-10 kurze Sessions täglich',
        difficulty: 'Einfach',
        materials: ['Weiche Mini-Leckerlis', 'Ruhiger Raum'],
        steps: [],
        goal: 'Ihr Welpe soll seinen Namen als das Schönste überhaupt empfinden und immer sofort aufmerksam werden, wenn Sie ihn rufen. Dies ist die Basis für alle weiteren Trainings.',
        shortDescription: 'Positive Namensverknüpfung als Fundament aller Kommunikation',
        stepByStepGuide: {
          step1: 'Sagen Sie den Namen Ihres Welpen in freundlichem, fröhlichem Ton (nicht zu aufgeregt!) und warten Sie auf seine Reaktion.',
          step2: 'SOFORT wenn er Sie auch nur kurz ansieht → "JA!" sagen und dabei seine volle Aufmerksamkeit einfordern.',
          step3: 'Leckerli geben und kurz loben. 2-3 Sekunden Pause, dann wiederholen - maximal 5 Wiederholungen pro Session.',
          errorCorrection: 'Ignoriert er Sie? → Näher gehen, interessanter werden (nicht lauter!), eventuell bessere Leckerlis verwenden. Nie den Namen mehrfach hintereinander rufen.',
          speciesAdaptation: 'Bei scheuen Welpen: Leiser sprechen und mehr Abstand halten. Bei aufgedrehten Welpen: Ruhiger werden und warten bis sie entspannt sind.'
        },
        repetitionSchedule: {
          dailyPractice: '3-5 Minuten je Session',
          frequency: '8-10 Sessions täglich (alle 1-2 Stunden)',
          trainingDuration: '2 Wochen für erste Erfolge, 4 Wochen für Perfektion',
          note: 'Nur bei Ruhe & Motivation üben - kein Zwang!'
        },
        requiredTools: {
          equipment: ['Weiche Mini-Leckerlis (erbsengroß)', 'Positive Stimme', 'Geduld'],
          location: 'Ruhiger Raum ohne Ablenkung',
          timeframe: 'Wenn Welpe wach und aufmerksam ist',
          speciesAdaptation: 'Bei Angsthunden: Noch kleinere Schritte und mehr Zeit einplanen'
        },
        learningTips: [
          'Name nie als "Nein" oder für Rückruf verwenden - nur für positive Aufmerksamkeit',
          'Nach 1 Woche mit leichten Ablenkungen üben (andere Räume, Garten)',
          'Führen Sie eine "Namen-Erfolgs-Liste" - notieren Sie täglich die Reaktionszeit',
          'Alle Familienmitglieder müssen das gleiche Training durchführen'
        ],
        commonMistakes: [
          'Den Namen mehrfach hintereinander rufen',
          'Zu aufgeregt oder zu laut werden',
          'Name für negative Situationen verwenden',
          'Zu lange Sessions (Welpen ermüden schnell)',
          'Ungeduld wenn Fortschritte langsam kommen'
        ]
      },
      {
        id: 'impulse-control-waiting',
        title: 'Impulskontrolle - Geduldig warten vor dem Napf',
        description: 'Aufbau von Selbstbeherrschung und Geduld',
        duration: '5-10 Minuten pro Mahlzeit',
        repetitions: 'Bei jeder Fütterung (3-4 mal täglich)',
        difficulty: 'Mittel',
        materials: ['Futternapf', 'Gewohntes Welpenfutter'],
        steps: [],
        goal: 'Ihr Welpe lernt Selbstbeherrschung und dass gute Dinge zu denen kommen, die warten können. Dies verhindert späteres Betteln und forderndes Verhalten.',
        shortDescription: 'Fundamentales Training für Impulskontrolle und Geduld',
        stepByStepGuide: {
          step1: 'Füllen Sie den Napf mit Futter und halten ihn in Brusthöhe, während der Welpe vor Ihnen steht.',
          step2: 'Senken Sie den Napf LANGSAM Richtung Boden. Stürzt der Welpe vor → Napf sofort wieder hoch heben.',
          step3: 'Erst wenn der Welpe sitzenbleibt und wartet, stellen Sie den Napf ab und geben das Freigabe-Wort "NIMM" oder "OK".',
          errorCorrection: 'Springt er vor → Napf sofort hochnehmen, 5 Sekunden warten, dann erneut versuchen. Nie schimpfen, nur konsequent sein.',
          speciesAdaptation: 'Bei sehr ungeduldigen Rassen (z.B. Terrier): Kleinere Schritte, bei ruhigen Rassen (z.B. Retriever): Schnellere Steigerung möglich'
        },
        repetitionSchedule: {
          dailyPractice: '5-10 Minuten pro Mahlzeit',
          frequency: 'Bei jeder Fütterung (3-4 mal täglich)',
          trainingDuration: 'Woche 1: 3-5 Sekunden, Woche 2-3: 10-15 Sekunden, Woche 4: 20-30 Sekunden',
          note: 'Das Futter selbst ist die Belohnung - keine zusätzlichen Leckerlis nötig'
        },
        requiredTools: {
          equipment: ['Futternapf', 'Gewohntes Welpenfutter', 'Viel Geduld'],
          location: 'Gewohnter Fütterungsplatz',
          timeframe: 'Zu allen Mahlzeiten',
          speciesAdaptation: 'Bei verfressenen Rassen: Besonders konsequent bleiben'
        },
        learningTips: [
          'Konsequenz ist der Schlüssel - nie nachgeben wenn er vorspringt',
          'Freigabe-Wort immer dasselbe verwenden',
          'Nie "SITZ" als Freigabe verwenden',
          'Erfolg: Welpe setzt sich automatisch vor jeden Napf'
        ],
        commonMistakes: [
          'Aufgeben wenn er anfangs vorspringt',
          'Schimpfen statt konsequent zu bleiben',
          'Unterschiedliche Regeln bei verschiedenen Mahlzeiten',
          'Zu schnell die Wartezeit steigern'
        ]
      },
      {
        id: 'recall-foundation',
        title: 'Lebensrettender Rückruf "HIER"',
        description: 'Aufbau des wichtigsten Kommandos überhaupt',
        duration: '10-15 Minuten pro Session',
        repetitions: '3-4 Sessions täglich in verschiedenen Situationen',
        difficulty: 'Mittel',
        materials: ['10 Meter Schleppleine', 'Jackpot-Leckerlis'],
        steps: [],
        goal: 'Aufbau des wichtigsten Kommandos überhaupt. Ihr Hund soll immer und sofort zu Ihnen kommen, egal was gerade interessanter erscheint. Dies kann Leben retten.',
        shortDescription: 'Das lebensrettende Kommando für absolute Sicherheit',
        stepByStepGuide: {
          step1: 'Rufen Sie NIEMALS "HIER" wenn Sie nicht 100% sicher sind, dass er kommt! Beginnen Sie nur wenn der Welpe sowieso zu Ihnen läuft.',
          step2: 'Kommt er zu Ihnen → überschwängliches Lob + 3-5 Jackpot-Leckerlis + ausgiebiges Streicheln. Er soll das Gefühl haben, das Beste verpasst zu haben.',
          step3: 'Belohnen Sie JEDES Kommen zu Ihnen, auch wenn er langsam war oder abgelenkt wurde. Das Ankommen ist der Erfolg!',
          errorCorrection: 'Kommt er nicht → zu ihm gehen (nicht nochmal rufen!) und freundlich zurückführen. Niemals schimpfen wenn er erst spät kommt.',
          speciesAdaptation: 'Bei Jagdhunden: Extra spannende Belohnungen. Bei scheuen Hunden: Nicht zu überschwänglich loben.'
        },
        repetitionSchedule: {
          dailyPractice: '10-15 Minuten pro Session',
          frequency: '3-4 Sessions täglich in verschiedenen Situationen',
          trainingDuration: 'Woche 1-2: Wohnung, Woche 3-4: Garten mit Leine, Woche 5-6: Mit Ablenkung',
          note: 'Nach 4 Wochen sollten 9 von 10 Rufen erfolgreich sein'
        },
        requiredTools: {
          equipment: ['10 Meter Schleppleine', 'Jackpot-Leckerlis (besonders lecker!)', 'Eventuell Quietschspielzeug'],
          location: 'Phase 1: Wohnung, Phase 2: eingezäunter Garten, Phase 3: kontrollierte Außenbereiche',
          timeframe: 'Wenn Welpe aufmerksam aber nicht überdreht ist',
          speciesAdaptation: 'Bei Windhunden: Besonders gute Leckerlis, da wenig futtermotiviert'
        },
        learningTips: [
          'Üben Sie auch "Hier" wenn er schon bei Ihnen ist - verstärkt die positive Verknüpfung',
          'Machen Sie sich interessanter als die Umgebung',
          'Variieren Sie die Belohnungen - mal Leckerli, mal Spiel, mal Streicheln',
          'Erfolgs-Test: 9 von 10 Rufen sollten erfolgreich sein'
        ],
        commonMistakes: [
          '"HIER" rufen wenn unsicher ob er kommt',
          'Mehrfach hintereinander rufen',
          'Schimpfen wenn er langsam kommt',
          'Rückruf nur für negative Dinge nutzen (Ende Spaziergang)',
          'Zu früh ohne Leine üben'
        ]
      },
      {
        id: 'leash-walking-foundation',
        title: 'Entspannte Spaziergänge - Leinenführigkeit',
        description: 'Leinenführigkeit ohne Ziehen',
        duration: '15-20 Minuten pro Spaziergang',
        repetitions: 'Bei jedem Spaziergang konsequent anwenden',
        difficulty: 'Mittel',
        materials: ['2 Meter Führleine', 'Gut sitzendes Geschirr'],
        steps: [],
        goal: 'Entspannte Spaziergänge ohne dass Ihr Arm abfällt! Ihr Welpe lernt, dass er nur vorwärts kommt, wenn die Leine locker ist. Ziehen führt zum Stillstand.',
        shortDescription: 'Grundlagen für entspannte Spaziergänge ohne Ziehen',
        stepByStepGuide: {
          step1: 'GRUNDREGEL etablieren: Straffe Leine = Stopp wie ein Baum, lockere Leine = Weitergehen. Sie werden zum vorhersagbaren "Ampelsystem".',
          step2: 'Zieht der Welpe → Sie bleiben SOFORT stehen (keine Vorwarnung!). Warten bis die Leine locker wird.',
          step3: 'Sobald die Leine locker ist → "FEIN!" sagen und sofort weitergehen. Alle 5-10 Schritte lockere Leine mit Leckerli belohnen.',
          errorCorrection: 'Zieht er sehr stark → einfach umdrehen und in die Gegenrichtung gehen. Er lernt: Ziehen führt weg vom Ziel.',
          speciesAdaptation: 'Bei sehr energischen Rassen: Vor dem Spaziergang 5 Minuten toben lassen. Bei ängstlichen Hunden: Mehr Geduld und positive Verstärkung.'
        },
        repetitionSchedule: {
          dailyPractice: '15-20 Minuten pro Spaziergang',
          frequency: 'Bei jedem Spaziergang konsequent anwenden',
          trainingDuration: 'Die ersten 2 Wochen sind entscheidend. Nach 4 Wochen: 15-minütige entspannte Spaziergänge',
          note: 'Die ersten Spaziergänge dauern länger - das ist normal und wichtig für den Lernprozess'
        },
        requiredTools: {
          equipment: ['2 Meter Führleine (KEIN Flexi-Leinen!)', 'Gut sitzendes Geschirr oder breites Halsband', 'Kleine Leckerlis in der Tasche'],
          location: 'Beginnen Sie in ruhiger Umgebung, dann steigern',
          timeframe: 'Zu allen Spazierzeiten',
          speciesAdaptation: 'Bei großen Rassen: Früh beginnen, da später schwerer zu korrigieren'
        },
        learningTips: [
          'Geduld ist der Schlüssel - Qualität vor Geschwindigkeit',
          'Tempo variieren - mal langsam, mal zügiger, aber nie hetzen',
          'Richtungsänderungen nutzen um Aufmerksamkeit zu fordern',
          'Belohnen Sie das Gehen neben Ihnen, nicht nur das Stehenbleiben'
        ],
        commonMistakes: [
          'Rucken, zerren oder schimpfen - verstärkt nur das Ziehen',
          'Nachgeben "nur dieses eine Mal"',
          'Zu lange Sessions für junge Welpen',
          'Flexi-Leinen verwenden (lehrt das Ziehen)',
          'Aufgeben nach den ersten schwierigen Spaziergängen'
        ]
      },
      {
        id: 'place-training',
        title: 'Der sichere Ruheort "AUF DEINEN PLATZ"',
        description: 'Aufbau eines sicheren Rückzugsortes',
        duration: '10-15 Minuten pro Session',
        repetitions: '4-5 Sessions täglich + bei Bedarf zur Beruhigung',
        difficulty: 'Mittel',
        materials: ['Hundedecke oder Kissen', 'Leckerlis'],
        steps: [],
        goal: 'Ihr Welpe bekommt einen eigenen "sicheren Hafen" - einen Ort zum Entspannen, wo er nie gestört wird. Gleichzeitig lernt er, auf Kommando zur Ruhe zu kommen.',
        shortDescription: 'Ein sicherer Rückzugsort für Entspannung und Ruhe',
        stepByStepGuide: {
          step1: 'Decke in ruhige Ecke legen, wo der Welpe das Geschehen beobachten kann. "AUF DEINEN PLATZ" sagen und mit Leckerli auf Decke locken.',
          step2: 'Sobald alle 4 Pfoten auf der Decke sind → "FEIN!" sagen + Leckerli geben + sanft streicheln. Er soll positive Gefühle mit dem Platz verknüpfen.',
          step3: 'Dauer schrittweise steigern: Tag 1-3: sofort freigeben, Tag 4-7: 10 Sekunden warten, Woche 2: 1 Minute, Woche 3: 5 Minuten.',
          errorCorrection: 'Steht er vor Freigabe auf → ruhig zurückführen ohne Schimpfen. Eventuell Kommando zu früh eingeführt → einen Schritt zurück.',
          speciesAdaptation: 'Bei unruhigen Rassen: Längere Gewöhnungszeit. Bei Hunden mit Trennungsangst: Besonders wichtig für emotionale Stabilität.'
        },
        repetitionSchedule: {
          dailyPractice: '10-15 Minuten pro Session',
          frequency: '4-5 Sessions täglich + bei Bedarf zur Beruhigung',
          trainingDuration: 'Woche 1: Aufbau, Woche 2-3: Dauer steigern, Woche 4: Selbstständige Nutzung',
          note: 'Immer mit "OK" oder "FREI" vom Platz entlassen - nie selbst holen'
        },
        requiredTools: {
          equipment: ['Waschbare Hundedecke oder Kissen', 'Leckerlis', 'Eventuell langanhaltender Kauartikel'],
          location: 'Ruhige Ecke mit Überblick über das Geschehen',
          timeframe: 'Bei Besuch, beim Kochen, oder wenn er überdreht ist',
          speciesAdaptation: 'Material an Rasse anpassen: Große Hunde brauchen größere, stabilere Plätze'
        },
        learningTips: [
          'SICHERE ZONE: Auf seinem Platz wird NIEMALS geschimpft oder gestört',
          'Später wird dies sein Lieblings-Entspannungsort - lebenslang!',
          'Bei Überforderung kann er selbstständig dorthin gehen',
          'Auch für Alltagssituationen nutzen: Besuch, Kochen, etc.'
        ],
        commonMistakes: [
          'Den Platz für Bestrafung oder Auszeiten nutzen',
          'Ihn störend wenn er freiwillig dort liegt',
          'Zu schnell die Wartezeit steigern',
          'Vergessen ihn freizugeben',
          'Ungeeigneten Ort wählen (zu laut, zu abgeschieden)'
        ]
      }
    ],
    tips: [
      'TIMING IST ALLES: Belohnen Sie exakt im richtigen Moment - 1 Sekunde zu spät = falsche Botschaft',
      'KURZE SESSIONS: Welpen können sich nur 3-5 Minuten konzentrieren - lieber öfter als länger',
      'POSITIVE VERSTÄRKUNG: Ein Lob ist 10x wirkungsvoller als jede Bestrafung',
      'FAMILIEN-REGELN: ALLE Familienmitglieder müssen die gleichen Kommandos und Regeln anwenden',
      'SCHLAF IST HEILIG: Welpen brauchen 18-20 Stunden Schlaf täglich - müde Welpen lernen nichts',
      'SOZIALISIERUNG GEHT VOR: Positive Erfahrungen mit Menschen, Tieren und Umwelt prägen fürs Leben',
      'GEDULD HABEN: Jeder Welpe lernt in seinem eigenen Tempo - Vergleiche mit anderen sind sinnlos'
    ],
    expectedResults: 'Nach 8-12 Wochen haben Sie einen gut sozialisierten Welpen, der seinen Namen kennt, grundlegende Impulskontrolle hat, an lockerer Leine läuft und einen zuverlässigen Rückruf zeigt. Die Basis für alle weiteren Trainings ist gelegt und Sie haben eine vertrauensvolle Beziehung aufgebaut.'
  },

  // ADULT DOG BEHAVIORAL TRAINING
  {
    id: 'adult-behavior',
    title: 'Verhaltenstraining für Erwachsene Hunde',
    description: 'Problemverhalten korrigieren und Führungsqualitäten entwickeln - für Hunde ab 1 Jahr',
    category: 'Verhalten',
    difficulty: 'Fortgeschritten',
    duration: '12-16 Wochen',
    species: ['Hund', 'Dog'],
    ageGroups: ['1-3 Jahre', 'Erwachsen'],
    exercises: [
      {
        id: 'leadership-exercises',
        title: 'Führungsübungen "ICH ENTSCHEIDE" (Woche 1-4)',
        description: 'Klare Rangordnung etablieren ohne Dominanztheorie - durch Ressourcenkontrolle',
        duration: '20-30 Minuten',
        repetitions: 'Täglich in Alltagssituationen',
        difficulty: 'Schwer',
        materials: ['Leckerlis', 'Spielzeug', 'Konsequenz'],
        steps: [
          'Regel 1: Alle Ressourcen gehören Ihnen - Futter, Spielzeug, Aufmerksamkeit, Zugang zu Räumen',
          'Der Hund muss um alles "bitten" - durch Sitz, Blickkontakt oder andere gewünschte Verhalten',
          'Ignorieren Sie aufdringliches Verhalten komplett - keine Aufmerksamkeit für Betteln, Anspringen, Fiepen',
          'Belohnen Sie ruhiges, abwartendes Verhalten sofort',
          'Türen: Sie gehen immer zuerst, der Hund wartet bis zur Freigabe',
          'Fütterung: Hund wartet mindestens 30 Sekunden vor dem Napf',
          'Spielzeug: Beginnen und beenden Sie das Spiel, nicht der Hund',
          'Nach 4 Wochen: Hund orientiert sich automatisch an Ihnen für alle Entscheidungen'
        ]
      },
      {
        id: 'frustration-tolerance',
        title: 'Frustrationstoleranz-Training (Woche 3-8)',
        description: 'Aufbau emotionaler Stabilität und Gelassenheit in stressigen Situationen',
        duration: '15-25 Minuten',
        repetitions: '2 mal täglich',
        difficulty: 'Schwer',
        materials: ['Verschiedene Leckerlis', 'Ablenkungen', 'Timer'],
        steps: [
          'Level 1: Leckerli in geschlossener Faust - Hund muss warten bis Sie öffnen',
          'Ignorieren Sie Kratzen, Bellen, Anspringen komplett',
          'Erst öffnen wenn Hund sich setzt und ruhig wartet (beginnen Sie mit 3 Sekunden)',
          'Level 2: Leckerli auf den Boden legen, mit der Hand abdecken',
          'Level 3: Leckerli hinlegen, "WARTE" sagen, langsam wegtreten',
          'Level 4: In aufregenden Situationen (andere Hunde, Jogger) Warte-Kommando üben',
          'Steigern Sie die Wartezeit und Ablenkung über 6 Wochen kontinuierlich',
          'Bei Fehlern: Übung sofort beenden, 5 Minuten Pause, dann einfachere Stufe'
        ]
      },
      {
        id: 'anti-aggression-protocol',
        title: 'Anti-Aggressions-Protokoll (Woche 5-12)',
        description: 'Professioneller Umgang mit Aggression gegen Menschen oder Hunde',
        duration: '30-45 Minuten',
        repetitions: 'Täglich, kontrollierte Situationen',
        difficulty: 'Schwer',
        materials: ['Maulkorb (sicherheitshalber)', 'Lange Leine', 'Hochwertige Leckerlis', 'Hilfsperson'],
        steps: [
          'WICHTIG: Bei ernster Aggression immer professionellen Trainer hinzuziehen!',
          'Phase 1: Trigger-Distanz ermitteln - Abstand wo Hund noch entspannt ist',
          'Konditionierung: Auslöser erscheint = Super-Leckerli kommt (nicht für Verhalten!)',
          'Schrittweise Distanz verringern über Wochen, nur bei entspanntem Hund',
          'Alternativverhalten aufbauen: "SCHAU MICH AN" wenn Trigger auftaucht',
          'Nie den Hund zwingen sich zu nähern - immer sein Tempo respektieren',
          'Bei Rückschlägen: Sofort größere Distanz, Training verlangsamen',
          'Erfolg messen durch Körpersprache: lockere Rute, entspannte Ohren, freiwillige Näherung'
        ]
      }
    ],
    tips: [
      'Ein Hund braucht einen souveränen Partner, keinen Kumpel',
      'Konstanz ist wichtiger als Perfektion - lieber jeden Tag 10 Minuten als einmal 2 Stunden',
      'Bei Verhaltensproblemen: Erst immer die Ursache finden, dann das Symptom behandeln',
      'Geduld haben - Verhaltensänderungen brauchen 6-8 Wochen um stabil zu werden',
      'Professionelle Hilfe suchen bei: Aggression, Trennungsangst, extremer Angst'
    ],
    expectedResults: 'Nach 12-16 Wochen haben Sie einen ausgeglichenen, respektvollen Hund der Sie als Führungsperson anerkennt, mit Frustration umgehen kann und auch in schwierigen Situationen kontrollierbar bleibt.'
  },

  // SENIOR DOG SPECIALIZED CARE
  {
    id: 'senior-dog-wellness',
    title: 'Senior-Hunde Wellness & Erhaltungstraining (7+ Jahre)',
    description: 'Altersgerechtes Training für ältere Hunde - Erhaltung der Mobilität, geistigen Fitness und Lebensqualität',
    category: 'Seniorentraining',
    difficulty: 'Anfänger',
    duration: 'Dauerhaft/Lebenslang',
    species: ['Hund', 'Dog'],
    ageGroups: ['7+ Jahre', 'Senior'],
    exercises: [
      {
        id: 'cognitive-stimulation',
        title: 'Kognitive Stimulation & Demenz-Prävention (täglich)',
        description: 'Geistige Fitness-Übungen um Demenz vorzubeugen und Gehirnfunktion zu erhalten',
        duration: '10-15 Minuten',
        repetitions: '2-3 mal täglich',
        difficulty: 'Einfach',
        materials: ['Schnüffelteppich', 'Intelligenzspielzeug', 'Leckerli-Verstecke', 'Neue Routen'],
        steps: [
          'Täglich neue Schnüffel-Aufgaben: Leckerlis in verschiedenen Verstecken',
          'Bekannte Kommandos in neuer Reihenfolge üben - fordert das Gehirn',
          'Neue, einfache Tricks lernen: "Winken", "Rolle", "Rückwärts gehen"',
          'Spazierwege variieren - neue Gerüche und Eindrücke wirken wie Gehirnjogging',
          'Intelligenzspielzeug rotieren - alle 3 Tage andere Aufgaben',
          'Soziale Kontakte fördern - andere freundliche Hunde treffen',
          'Bei Nachlassen der Leistung: Aufgaben vereinfachen, nicht aufgeben',
          'Erfolg: Hund bleibt neugierig und lernfähig bis ins hohe Alter'
        ]
      },
      {
        id: 'mobility-maintenance',
        title: 'Mobilitäts-Erhaltung & Gelenkschonung (täglich)',
        description: 'Sanfte Bewegungsübungen um Gelenksteifheit zu verhindern und Muskeln zu erhalten',
        duration: '15-20 Minuten',
        repetitions: 'Täglich, angepasst an Tagesform',
        difficulty: 'Einfach',
        materials: ['Rampen statt Treppen', 'Orthopädisches Hundebett', 'Warme Decken', 'Schmerzmedikation falls nötig'],
        steps: [
          'Aufwärm-Phase: 5 Minuten langsames Gehen vor jeder Aktivität',
          'Gelenkschonende Bewegung: Schwimmen ist ideal, sonst kurze Spaziergänge',
          'Passive Bewegung: Sanfte Massage und Bewegen der Gelenke',
          'Keine Sprünge oder abrupte Richtungswechsel mehr',
          'Bei Arthritis: Wärme vor Bewegung, Kälte nach Aktivität',
          'Gewichtskontrolle essentiell - jedes Kilo mehr belastet Gelenke',
          'Rutschfeste Unterlagen in der Wohnung',
          'Bei Schmerzen: Sofort Pause, Tierarzt konsultieren'
        ]
      },
      {
        id: 'comfort-care',
        title: 'Komfort-Pflege & Lebensqualität (täglich)',
        description: 'Spezialpflege für Senior-Hunde um Beschwerden zu lindern und Wohlbefinden zu steigern',
        duration: '20-30 Minuten',
        repetitions: 'Täglich, an Bedürfnisse angepasst',
        difficulty: 'Einfach',
        materials: ['Weiche Bürsten', 'Spezial-Shampoo', 'Nagelknipser', 'Zahnpflege', 'Warme Kompresse'],
        steps: [
          'Tägliche Fellpflege: Verfilzungen verhindern, Hautgesundheit fördern',
          'Regelmäßige Zahnkontrolle: Zahnstein führt zu Herzproblemen',
          'Krallen öfter schneiden: weniger Aktivität = langsamere Abnutzung',
          'Augen und Ohren täglich checken: Altersbedingte Probleme früh erkennen',
          'Warme, weiche Liegeplätze: Arthritis-Schmerzen lindern',
          'Futter anpassen: kleinere Portionen, leichter verdaulich',
          'Routine beibehalten: Senior-Hunde brauchen Sicherheit und Vorhersagbarkeit',
          'Mehr Aufmerksamkeit und Kuschelzeit - emotionale Bedürfnisse steigen'
        ]
      }
    ],
    tips: [
      'Senior-Hunde sind wie alte Menschen - sie verdienen Respekt und besondere Fürsorge',
      'Schmerzen werden oft versteckt - auf subtile Anzeichen achten: weniger Aktivität, Steifheit, Verhaltensänderungen',
      'Regelmäßige Tierarzt-Checks (alle 6 Monate) sind bei Senioren lebenswichtig',
      'Nie aufgeben wenn der Hund langsamer wird - anpassen, nicht einstellen',
      'Lebensqualität ist wichtiger als Lebensdauer - schmerzfreie, glückliche Jahre zählen'
    ],
    expectedResults: 'Ihr Senior-Hund bleibt länger mobil, geistig fit und schmerzfrei. Die Lebensqualität wird maximiert und altersbedingte Probleme werden früh erkannt und behandelt. Viele Hunde können so bis ins hohe Alter aktiv und glücklich bleiben.'
  }
];
