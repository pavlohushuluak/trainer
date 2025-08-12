import { PlanTemplate } from '../templateTypes';

export const catTemplatesEn: PlanTemplate[] = [
  // CAT BEHAVIORAL TRAINING - EXPERT LEVEL
  {
    id: 'cat-behavior-expert',
    title: 'Cat Behavior Therapy using Professional Methods',
    description: 'Professional solution for cat problems - Inappropriate elimination, aggression, fear - using proven methods',
    category: 'Behavior',
    difficulty: 'Advanced',
    duration: '8-12 weeks',
    species: ['Katze', 'Cat', 'Katz'],
    ageGroups: ['6 months+', 'Adult'],
    exercises: [
      {
        id: 'territory-confidence',
        title: 'Territorial Confidence Building (Week 1-4)',
        description: '"Base Camp" method - creating safe zone for fearful cats',
        duration: '30-45 minutes',
        repetitions: 'Daily, multiple sessions',
        difficulty: 'Medium',
        materials: ['Feliway diffuser', 'Hiding places', 'Elevated places', 'Scratching post'],
        steps: [
          'One room becomes the "Base Camp" - here the cat feels 100% safe',
          'All resources in this room: Food, water, litter box, toys',
          'Feliway diffuser for calming, daily 30 minutes interactive play',
          'Only when cat is relaxed here, slowly expand territory',
          'Link new rooms only with positive experiences (food, play)',
          'Never force - cat determines the pace of expansion',
          'Setbacks are normal, return to base camp when stressed',
          'Goal: Cat "owns" every room and moves confidently'
        ]
      },
      {
        id: 'litter-box-protocol',
        title: 'Inappropriate Elimination Therapy Protocol (Week 2-8)',
        description: 'Systematic solution of litter box problems through cause analysis',
        duration: '20-30 minutes',
        repetitions: 'Observe at every litter box use',
        difficulty: 'Hard',
        materials: ['Multiple litter boxes', 'Various litter types', 'Enzyme cleaner', 'Vet check'],
        steps: [
          'Step 1: Exclude medical causes - vet visit mandatory!',
          'Step 2: Check litter box rule: Number = cats + 1',
          'Step 3: Analyze location - quiet, accessible, not next to food',
          'Step 4: Test litter preference - offer various types in parallel',
          'Step 5: Intensify cleaning - scoop daily, completely renew weekly',
          'Step 6: Eliminate stress factors - other cats, noises, changes',
          'Step 7: Treat problem areas with enzyme cleaner + make inaccessible',
          'Measure success: 2 weeks problem-free use = problem solved'
        ]
      },
      {
        id: 'interactive-play-therapy',
        title: 'Interactive Play Therapy (Week 1-12)',
        description: 'Professional hunting sequence simulation for behavior correction and exercise',
        duration: '15-20 minutes',
        repetitions: '2-3 times daily at fixed times',
        difficulty: 'Medium',
        materials: ['Feather wand', 'Various attachments', 'Treats', 'Timer'],
        steps: [
          'Timing: Always play before meals - hungry cats are more motivated',
          'Simulate hunting sequence: Stalking → Sneaking → Catching → Killing → Eating',
          'Movement of toy: Away from cat, realistic prey movements',
          'Prey "dies" at the end - lies still, cat can "catch" it',
          'Feed immediately after play - completes hunting sequence',
          'Rotate various attachments - cats get bored quickly',
          'With multiple cats: Play individually, otherwise competition and frustration',
          'Game ends when cat pants or loses interest'
        ]
      },
      {
        id: 'multi-cat-hierarchy',
        title: 'Multi-Cat Household Harmony (Week 4-12)',
        description: 'Conflict resolution and harmony building between multiple cats',
        duration: '45-60 minutes',
        repetitions: 'Daily observation and intervention',
        difficulty: 'Hard',
        materials: ['Multiple resource stations', 'Feliway Multicat', 'Separation gate', 'Treats'],
        steps: [
          'Resource expansion: Everything double/triple - litter boxes, food, water, scratching posts',
          'Territorial division: Each cat needs own "zone" with all resources',
          'Positive association: Cats get treats when they see each other relaxed',
          'Play time individually - prevents competition and frustration',
          'In conflicts: Distract, don\'t punish - "Find cause, don\'t fight symptom"',
          'Slow reintegration after fights: start again at base camp',
          'Use vertical territory - scratching posts, shelves, various heights',
          'Success: Cats ignore each other relaxed or groom each other'
        ]
      },
      {
        id: 'scientific-cat-training',
        title: 'Scientifically Based Cat Training (Week 2-10)',
        description: 'Positive reinforcement and medical training for everyday life',
        duration: '20-30 minutes',
        repetitions: 'Daily, short sessions',
        difficulty: 'Hard',
        materials: ['Clicker', 'High-quality treats', 'Target stick', 'Carrier'],
        steps: [
          'Phase 1: Establish clicker training - Click = treat, no exceptions',
          'Phase 2: Target training - cat touches stick with nose on command',
          'Phase 3: Carrier training - box becomes positive place',
          'Phase 4: Medical training - accept touching paws, checking ears',
          'Phase 5: Everyday training - come when called, "sit", "stay" on signal',
          'Always work with positive reinforcement - never force or punish',
          'Keep sessions short - cats have short attention span',
          'If refusal: End session, try again later'
        ]
      }
    ],
    tips: [
      'There are no bad cats, only misunderstood ones',
      'Cats are territorial and need security - never proceed too quickly',
      'Punishment never works with cats - only reinforces fear and stress',
      'Every behavior change needs 3-4 weeks to become stable',
      'With multiple cats: Always enough resources, otherwise competition arises',
      'Routine is extremely important for cats - fixed times for food and play'
    ],
    expectedResults: 'After 8-12 weeks you have relaxed, confident cats that "own" their territory, reliably use the litter box and live harmoniously together. Behavioral problems are permanently solved.'
  },

  // ADVANCED CAT ENRICHMENT
  {
    id: 'cognitive-cat-enrichment',
    title: 'Cognitive Enrichment for Indoor Cats',
    description: 'Professional environment design and mental stimulation following latest findings',
    category: 'Basic Training',
    difficulty: 'Advanced',
    duration: '6-8 weeks',
    species: ['Katze', 'Cat'],
    ageGroups: ['Adult', '6 months+'],
    exercises: [
      {
        id: 'environmental-enrichment',
        title: 'Catification - Optimal Room Design (Week 1-3)',
        description: 'Creating a cat-friendly environment with vertical territory',
        duration: '60-90 minutes setup',
        repetitions: 'Set up once, then observe',
        difficulty: 'Medium',
        materials: ['Scratching posts of various heights', 'Wall shelves', 'Hiding places', 'Lookout spots'],
        steps: [
          'Create vertical territory: At least 3 levels in every room',
          'Create superhighways: Cat highways from room to room at height',
          'Set up base camps: Safe zones with everything cat needs',
          'Lookout spots: Elevated positions for observing and relaxing',
          'Hiding places: Retreat spots for anxious moments',
          'Scratching opportunities: Horizontal and vertical, various textures',
          'Hunting opportunities: Hidden treats, integrate food puzzles',
          'Greenery: Cat grass and non-toxic plants for natural needs'
        ]
      },
      {
        id: 'puzzle-feeding',
        title: 'Food Puzzles and Mental Challenges (Week 2-6)',
        description: 'Activating natural hunting instincts through intelligent feeding',
        duration: '15-30 minutes per meal',
        repetitions: 'At every feeding',
        difficulty: 'Medium',
        materials: ['Food balls', 'Snuffle mats', 'Puzzle feeders', 'Hiding places'],
        steps: [
          'Level 1: Fill dry food in simple food ball',
          'Level 2: Hide food in apartment - cat must search',
          'Level 3: Puzzle feeders with various difficulty levels',
          'Level 4: Use snuffle mat for wet food and treats',
          'Level 5: Self-built puzzles from toilet paper rolls and cardboard',
          'Rotation: Use different puzzles daily against boredom',
          'Observation: Avoid frustration - simplify if overwhelmed',
          'Goal: Every meal becomes a mental challenge'
        ]
      }
    ],
    tips: [
      'Cats need mental stimulation just like physical exercise',
      'Boredom leads to behavioral problems - prevention is better than cure',
      'Change environment regularly - cats love controlled variety',
      'Observe your cat: Each has individual preferences'
    ],
    expectedResults: 'After 6-8 weeks you have an optimally designed, cat-friendly environment that promotes natural behaviors and provides mental stimulation. Your cat is more balanced and shows fewer behavioral problems.'
  }
]; 