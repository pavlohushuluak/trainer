import { PlanTemplate } from '../templateTypes';

export const birdTemplatesEn: PlanTemplate[] = [
  // BIRD TRAINING - POSITIVE REINFORCEMENT
  {
    id: 'parrot-basic-training',
    title: 'Parrot Basic Training with Positive Reinforcement',
    description: 'Professional training for parrots and large birds - Target Training, Medical Training and behavior management',
    category: 'Basic Training',
    difficulty: 'Advanced',
    duration: '12-16 weeks',
    species: ['Vogel', 'Bird', 'Papagei'],
    ageGroups: ['6 months+', 'Adult'],
    exercises: [
      {
        id: 'target-training-foundation',
        title: 'Target Training Foundation (Week 1-4)',
        description: 'Building the foundation for all further training units through target training',
        duration: '15-20 minutes',
        repetitions: '2-3 times daily',
        difficulty: 'Medium',
        materials: ['Target stick (wooden stick)', 'High-quality treats', 'Clicker (optional)', 'Quiet environment'],
        steps: [
          'Step 1: Hold target stick within beak reach, reward when bird touches it',
          'Step 2: Introduce "Touch" command - show target, give command, reward',
          'Step 3: Move target in various directions, bird follows',
          'Step 4: Gradually increase distance - bird goes to target',
          'Step 5: Transfer target training to various objects',
          'Important: Always end with reward, never too long sessions',
          'If refusal: Take break, try again later',
          'Goal: Reliable response to target signal within 2-3 seconds'
        ]
      },
      {
        id: 'medical-training-birds',
        title: 'Medical Training for Vet Visits (Week 4-10)',
        description: 'Accustoming to veterinary examinations and handling through positive conditioning',
        duration: '10-15 minutes',
        repetitions: 'Daily',
        difficulty: 'Hard',
        materials: ['Towel', 'Scale', 'Carrier', 'Treats'],
        steps: [
          'Phase 1: Towel training - show towel = treat (positive association)',
          'Phase 2: Gentle touching with towel, reward immediately',
          'Phase 3: Brief wrapping (1-2 seconds), massive reward',
          'Phase 4: Scale training - going on scale = reward',
          'Phase 5: Establish carrier as positive place',
          'Phase 6: Accept wing examination - build up very slowly',
          'Phase 7: Combination: Towel + examination + reward',
          'Never force - stop and rebuild if stressed'
        ]
      },
      {
        id: 'flight-recall-training',
        title: 'Free Flight and Recall Training (Week 8-16)',
        description: 'Safe free flight with reliable recall in controlled environments',
        duration: '30-45 minutes',
        repetitions: '3-4 times per week',
        difficulty: 'Hard',
        materials: ['Long leash (Aviator Harness)', 'High-quality rewards', 'Safe flight environment'],
        steps: [
          'IMPORTANT: Only in closed rooms or with safety harness!',
          'Week 1-2: Short distances (1-2 meters) - recall with target',
          'Week 3-4: Medium distances (3-5 meters) - reward perfect landing',
          'Week 5-6: Various heights - recall from elevated positions',
          'Week 7-8: Include distractions - other people, noises in room',
          'Advanced: Harness training for safe outdoor area',
          'Recall signal: Always same word/whistle + visual signal',
          'Golden rule: Never call if not 100% sure bird will come'
        ]
      },
      {
        id: 'behavioral-enrichment',
        title: 'Behavioral Enrichment and Problem Solving (Week 1-16)',
        description: 'Mental stimulation and solution of typical behavioral problems in birds',
        duration: '20-30 minutes',
        repetitions: 'Daily, various activities',
        difficulty: 'Medium',
        materials: ['Foraging toys', 'Natural branches', 'Hiding places', 'Various textures'],
        steps: [
          'Promote foraging: Hide food, bird must search and work',
          'Destruction material: Branches, cardboard, paper for safe chewing',
          'Social stimulation: Fixed times for attention and interaction',
          'Make environment varied: Change toys regularly',
          'Reduce screaming: Ignore negative attention, reward quiet',
          'Redirect biting: Offer alternatives, never use fingers as toys',
          'Establish routine: Fixed times for free flight, play, rest',
          'Problem behavior: Find causes (boredom, fear, hormones)'
        ]
      }
    ],
    tips: [
      'Positive reinforcement is the only effective way with birds',
      'Keep sessions short - birds have limited attention span',
      'Timing is crucial - reward must follow desired behavior immediately',
      'Never punish or force - destroys trust permanently',
      'Every bird is individual - adapt pace and methods',
      'Safety always comes first - never let fly unsecured'
    ],
    expectedResults: 'After 12-16 weeks you have a well-trained bird that responds to commands, accepts veterinary treatments and can fly freely in safe environments. Behavioral problems are significantly reduced.'
  },

  // SMALL BIRD TRAINING
  {
    id: 'small-bird-socialization',
    title: 'Small Bird Socialization and Handling',
    description: 'Gentle training for canaries, finches and other small birds',
    category: 'Basic Training',
    difficulty: 'Beginner',
    duration: '6-8 weeks',
    species: ['Vogel', 'Bird', 'Kanarienvogel', 'Fink'],
    ageGroups: ['Young', 'Adult'],
    exercises: [
      {
        id: 'gentle-habituation',
        title: 'Gentle Habituation to Humans (Week 1-4)',
        description: 'Stress-free habituation of small birds to human presence',
        duration: '10-15 minutes',
        repetitions: 'Several times daily',
        difficulty: 'Easy',
        materials: ['Quiet voice', 'Treats (millet)', 'Patience'],
        steps: [
          'Week 1: Simply stay near the cage, speak quietly',
          'Week 2: Slow movements, offer food through cage bars',
          'Week 3: Slowly move hand into cage, don\'t grab',
          'Week 4: Offer food from hand, patience if refused',
          'Never hasty movements or loud noises',
          'If panic, stop immediately and start again later',
          'Positive association: Human proximity = good things happen',
          'Goal: Bird stays relaxed during human presence'
        ]
      }
    ],
    tips: [
      'Small birds are very stress-prone - always proceed gently',
      'Consider group behavior - some species need conspecifics',
      'Keep environment quiet - avoid sudden noises'
    ],
    expectedResults: 'After 6-8 weeks your small birds are relaxed during human presence and accept basic handling for care and vet visits.'
  }
]; 