import { PlanTemplate } from '../templateTypes';

export const horseTemplatesEn: PlanTemplate[] = [
  // HORSE TRAINING - NATURAL HORSEMANSHIP
  {
    id: 'natural-horsemanship-foundation',
    title: 'Natural Horsemanship Foundation Training',
    description: 'Building a trusting partnership between human and horse through natural communication',
    category: 'Basic Training',
    difficulty: 'Expert',
    duration: '20-30 weeks',
    species: ['Pferd', 'Horse'],
    ageGroups: ['2-4 years', 'Young horse', 'Adult'],
    exercises: [
      {
        id: 'seven-games-foundation',
        title: 'The 7 Foundation Games (Week 1-8)',
        description: 'Building trust, respect and communication through the fundamental 7 games',
        duration: '45-60 minutes',
        repetitions: 'Daily',
        difficulty: 'Hard',
        materials: ['12ft rope', 'Carrot Stick', 'Halter', 'Patience and consistency'],
        steps: [
          'Game 1 - Friendly Game: Can touch horse everywhere without it moving away',
          'Game 2 - Porcupine Game: Horse yields to light pressure (finger → halter → rope)',
          'Game 3 - Driving Game: Horse moves away from rhythmic pressure',
          'Game 4 - Yo-Yo Game: Horse comes and goes on hand signal',
          'Game 5 - Circling Game: Horse runs controlled in circle around you',
          'Game 6 - Sideways Game: Horse moves sideways on command',
          'Game 7 - Squeeze Game: Horse goes through tight spaces and over obstacles',
          'Each game is built step by step, never forced with violence'
        ]
      },
      {
        id: 'liberty-connection',
        title: 'Liberty Training - Free Dressage (Week 8-16)',
        description: 'Building such a strong bond that the horse voluntarily stays with you and cooperates',
        duration: '30-45 minutes',
        repetitions: '4-5 times per week',
        difficulty: 'Hard',
        materials: ['Fenced arena', 'Carrot Stick', 'Treats (sparingly)', 'Body language'],
        steps: [
          'Prerequisite: Horse must master all 7 games with halter perfectly',
          'Phase 1: Halter off, but rope still on - ensure safety',
          'Phase 2: Completely free - start with "Friendly Game" without any equipment',
          'Building "Join Up": Horse turns to you and follows voluntarily',
          'Perfect body language: Minimal signals, maximum effect',
          'Respect without halter: Horse stays in personal space only by invitation',
          'Advanced: Circling, direction changes, tempo variations free',
          'Highest level: Horse follows everywhere, even outside arena'
        ]
      },
      {
        id: 'saddle-preparation',
        title: 'Saddle Preparation & Breaking (Week 12-24)',
        description: 'Gentle acclimation to saddle and rider following Natural Horsemanship principles',
        duration: '60-90 minutes',
        repetitions: 'Daily, very slow progression',
        difficulty: 'Hard',
        materials: ['Saddle pad', 'Saddle', 'Lunging girth', 'Bit', 'Experienced trainer'],
        steps: [
          'ONLY when groundwork is perfect - never mount before!',
          'Week 1-2: Place saddle pad, let move around everywhere',
          'Week 3-4: Place saddle, initially ungirthed',
          'Week 5-6: Light girth, repeat all 7 games with saddle',
          'Week 7-8: Simulate weight - place bags over saddle',
          'Week 9-10: Mount and dismount, not yet sitting',
          'Week 11-12: First careful mounting, only seconds',
          'Slow progression: First sit still, then minimal movements',
          'First riding only at walk, with ground helper',
          'At any uncertainty: Back to previous step'
        ]
      },
      {
        id: 'gentle-communication',
        title: 'Gentle Communication & Trust Building (Week 1-12)',
        description: 'Sensitive methods for clear, calm communication with the horse',
        duration: '30-45 minutes',
        repetitions: 'Daily',
        difficulty: 'Hard',
        materials: ['Quiet environment', 'Patience', 'Consistent body language'],
        steps: [
          'Basic principle: Radiate calm and clarity in every movement',
          'Perfect timing: Right reaction at right moment',
          'Pressure and Release: Minimal pressure, immediate release on reaction',
          'Use body language consciously: Position, energy, intention',
          'Set boundaries without aggression: Clear but respectful',
          'Reward through calm: Relaxation is the best reward',
          'Solve problems through cause research, don\'t fight symptoms',
          'End every session on positive note'
        ]
      }
    ],
    tips: [
      'Principle: "The horse is never wrong" - if something doesn\'t work, WE are the problem',
      'Timing and feel are everything - 1 second too late = completely different message',
      'Never work under time pressure - horses sense stress and impatience immediately',
      'Safety comes before progress - rather slow and safe than fast and dangerous',
      'Only work with experienced Natural Horsemanship trainer',
      'End every session positively - horse should want more'
    ],
    expectedResults: 'After 20-30 weeks you have a horse that trusts, respects and enjoys working with you. The foundation for lifelong partnership is laid, and the horse is ready for further training under saddle.'
  },

  // ADVANCED HORSEMANSHIP
  {
    id: 'advanced-ground-work',
    title: 'Advanced Groundwork for All Disciplines',
    description: 'Professional groundwork that prepares horse and rider for all equestrian disciplines',
    category: 'Basic Training',
    difficulty: 'Expert',
    duration: '16-20 weeks',
    species: ['Pferd', 'Horse'],
    ageGroups: ['3+ years', 'Adult'],
    exercises: [
      {
        id: 'precision-ground-work',
        title: 'Precision Groundwork (Week 1-8)',
        description: 'Millimeter-precise execution of all movements from the ground',
        duration: '45-60 minutes',
        repetitions: 'Daily',
        difficulty: 'Hard',
        materials: ['Cavesson or halter', 'Lunging whip', 'Cones/pylons', 'Poles'],
        steps: [
          'Exact positions: Horse stands millimeter-precise where you want it',
          'Shoulder-in from ground: Initiate and end lateral movements precisely',
          'Backwards in straight line: 20 steps without deviation',
          'Move forehand and hindquarters: React to minimal signals',
          'Pole work: Over poles at various distances',
          'Tempo transitions: From halt to trot, without intermediate steps',
          'Direction changes: 90° turns without speed loss',
          'Build concentration: Can work focused for 30 minutes'
        ]
      },
      {
        id: 'desensitization-program',
        title: 'Systematic Desensitization (Week 4-12)',
        description: 'Horse is gradually accustomed to all possible environmental stimuli',
        duration: '30-45 minutes',
        repetitions: '4-5 times per week',
        difficulty: 'Hard',
        materials: ['Tarps', 'Balls', 'Umbrella', 'Radio', 'Vehicles'],
        steps: [
          'Acoustic stimuli: Radio, traffic noise, loud sounds gradually',
          'Visual stimuli: Fluttering objects, tarps, unusual objects',
          'Tactile stimuli: Let touch everywhere, also with objects',
          'Moving objects: Balls, driving objects, other animals',
          'Various surfaces: Sand, asphalt, gravel, water, bridges',
          'Tight spaces: Through gates, trailers, under low obstacles',
          'Everyday situations: Practice vet, farrier, loading',
          'Stress test: Multiple stimuli simultaneously - maintain calmness'
        ]
      }
    ],
    tips: [
      'Groundwork is the foundation for all further training',
      'Perfection from the ground automatically transfers to riding',
      'Never force progress - rather practice one day longer',
      'A well-trained ground horse is safer and more relaxed'
    ],
    expectedResults: 'After 16-20 weeks you have a horse with excellent groundwork that responds to the finest aids and remains calm in every situation. Perfect foundation for any riding style.'
  }
]; 