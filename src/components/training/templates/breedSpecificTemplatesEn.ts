import { PlanTemplate } from '../templateTypes';

export const breedSpecificTemplatesEn: PlanTemplate[] = [
  // GERMAN SHEPHERD SPECIALIZED TRAINING
  {
    id: 'german-shepherd-working-dog',
    title: 'German Shepherd Working Dog Training',
    description: 'Breed-specific training for German Shepherds - Protection, obedience and work drive following professional standards',
    category: 'Breed Specific',
    difficulty: 'Expert',
    duration: '16-24 weeks',
    species: ['Hund', 'Dog'],
    breeds: ['Deutscher Schäferhund', 'German Shepherd', 'Belgischer Schäferhund'],
    ageGroups: ['1-3 years', 'Adult'],
    exercises: [
      {
        id: 'protection-foundation',
        title: 'Protection Instinct Foundation (Week 1-8)',
        description: 'Controlled building of natural protection instinct without promoting aggression',
        duration: '45-60 minutes',
        repetitions: '3 times per week',
        difficulty: 'Hard',
        materials: ['Bite sleeve', 'Protection suit (advanced)', 'Helper', 'Long leash'],
        steps: [
          'ONLY work with experienced protection dog helper!',
          'Phase 1: Awaken prey drive - move bite sleeve, encourage dog to grab',
          'Introduce "WATCH" command - only use for real threats',
          'Build clear "OUT" - dog must release immediately on command',
          'Controlled barking on "SPEAK" - never allow uncontrolled barking',
          'Distinguish friend/enemy: Normal visitors are ignored',
          'Protection drive only on command and only in justified situations',
          'Important: Always maintain complete control - dog never decides alone'
        ]
      },
      {
        id: 'precision-obedience',
        title: 'Precision Obedience following Professional Standards (Week 4-16)',
        description: 'Millimeter-precise execution of all basic commands as in dog sports',
        duration: '30-45 minutes',
        repetitions: 'Daily',
        difficulty: 'Hard',
        materials: ['Targets/markers', 'Motivation toy', 'Precision treats'],
        steps: [
          'Heel position: Dog sits exactly parallel, shoulder at height of your left leg',
          'Sit from movement: Sit immediately on signal, hold position until release',
          'Down at distance: Lie down from 50m distance, remain motionless for 5 minutes',
          'Stand from running: Immediate stop in perfect stand position',
          'Retrieve with millimeter precision: Place object exactly in front of feet',
          'Send ahead: Run 100m straight ahead, lie down on command',
          'Jump over 1m high hurdle with retrieve object',
          'All without treats - only with praise and toy as reward'
        ]
      },
      {
        id: 'tracking-work',
        title: 'Tracking Work Basic Course (Week 8-20)',
        description: 'Professional nose work - building 400m tracks with objects',
        duration: '60-90 minutes',
        repetitions: '2-3 times per week',
        difficulty: 'Hard',
        materials: ['Tracking harness', '10m leash', 'Tracking objects', 'Treats for track'],
        steps: [
          'Week 1-2: 20m track in straight line, treat every 3m',
          'Dog learns: Nose down = reward comes',
          'Week 3-4: First corners (90°), track length to 50m',
          'Week 5-8: Two corners, 100m track, first objects to indicate',
          'Week 9-12: More complex corners, 200m track, increase track age (30 min → 3 hours)',
          'Week 13-20: 400m track with 4 corners, 3 objects, up to 24h old track',
          'Always let work calmly - Shepherds tend to be hectic',
          'If mistakes: Back to last safe point, start again'
        ]
      }
    ],
    tips: [
      'German Shepherds need a job - without work they develop behavioral problems',
      'Mental exhaustion is more important than physical - 20 minutes brain work = 2 hours running',
      'Early socialization extremely important - otherwise they become overprotective',
      'Consistency is vital with this breed - they constantly test boundaries',
      'Never train out of boredom or frustration - Shepherds notice your mood immediately'
    ],
    expectedResults: 'After 16-24 weeks you have a high-performance working dog with perfect obedience, controlled protection instincts and pronounced tracking abilities. Suitable for dog sports, rescue work or professional protection service.'
  }
]; 