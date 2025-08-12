import { PlanTemplate } from '../templateTypes';

export const exoticTemplatesEn: PlanTemplate[] = [
  // RABBIT TRAINING
  {
    id: 'rabbit-litter-training',
    title: 'Rabbit House Training and Basic Training',
    description: 'Professional training for house rabbits - house training, handling and enrichment',
    category: 'Basic Training',
    difficulty: 'Advanced',
    duration: '8-12 weeks',
    species: ['Kaninchen', 'Rabbit', 'Hase'],
    ageGroups: ['3 months+', 'Adult'],
    exercises: [
      {
        id: 'litter-box-training',
        title: 'Litter Box Training for Rabbits (Week 1-6)',
        description: 'Systematic building of house training using proven methods',
        duration: '30-45 minutes observation',
        repetitions: 'Continuously observe',
        difficulty: 'Medium',
        materials: ['Large cat toilet', 'Rabbit litter', 'Hay', 'Treats'],
        steps: [
          'Week 1: Observe where rabbit naturally goes - place litter box there',
          'Litter box setup: Put litter in, hay on top (rabbits like to eat while doing business)',
          'Week 2: Clean up other "accidents" immediately, no punishment',
          'Week 3: Reward immediately with treat for correct use',
          'Week 4: Gradually expand freedom of movement, set up multiple litter boxes',
          'Week 5: Territory marking is normal - neutering helps with bucks',
          'Week 6: Consistency - same routine and reward every day',
          'Patience: Some rabbits need longer than others'
        ]
      },
      {
        id: 'rabbit-handling-training',
        title: 'Gentle Handling and Medical Training (Week 2-8)',
        description: 'Accustoming to necessary handling for care and vet visits',
        duration: '15-20 minutes',
        repetitions: 'Daily',
        difficulty: 'Hard',
        materials: ['Towel', 'Treats', 'Nail clippers', 'Brush'],
        steps: [
          'Basic rule: Never grab rabbits by the neck or ears!',
          'Phase 1: Can touch everywhere - paws, ears, belly',
          'Phase 2: Practice brief lifting - support chest and hindquarters',
          'Phase 3: Towel training for safe restraint at vet',
          'Phase 4: Accept nail clipping - build up very slowly',
          'Phase 5: Tolerate brushing - especially important for long-haired breeds',
          'Phase 6: Establish carrier as positive place',
          'If stressed: Stop immediately, rabbits can have heart attacks!'
        ]
      }
    ],
    tips: [
      'Rabbits are prey animals - never force or frighten',
      'Neutering/spaying helps with house training and behavior',
      'Social animals - single rabbits need more human attention',
      'Never hold on back - puts them in shock paralysis'
    ],
    expectedResults: 'After 8-12 weeks you have a house-trained rabbit that accepts basic handling and interacts relaxed with humans.'
  },

  // GUINEA PIG TRAINING
  {
    id: 'guinea-pig-socialization',
    title: 'Guinea Pig Socialization and Care Training',
    description: 'Basic training for guinea pigs - handling, socialization and care',
    category: 'Basic Training',
    difficulty: 'Beginner',
    duration: '6-8 weeks',
    species: ['Meerschweinchen', 'Guinea Pig'],
    ageGroups: ['6 weeks+', 'Adult'],
    exercises: [
      {
        id: 'guinea-pig-handling',
        title: 'Gentle Handling Training (Week 1-6)',
        description: 'Accustoming to human contact and necessary care',
        duration: '10-15 minutes',
        repetitions: 'Daily',
        difficulty: 'Easy',
        materials: ['Towel', 'Treats (vegetables)', 'Quiet environment'],
        steps: [
          'Week 1: Slowly put hand in cage, offer treat',
          'Week 2: Gentle petting when animal is relaxed',
          'Week 3: Practice brief lifting - use both hands',
          'Week 4: Longer holding on lap with towel',
          'Week 5: Care handling - check nails, check fur',
          'Week 6: Establish routine for regular health checks',
          'Important: Never grab from above - frightens prey animals',
          'If panic: Hold securely but don\'t squeeze'
        ]
      }
    ],
    tips: [
      'Guinea pigs are very social - never keep alone',
      'Avoid loud noises and quick movements',
      'Regular care is important - especially nails and hair'
    ],
    expectedResults: 'After 6-8 weeks your guinea pigs accept handling for care and show less fear of human contact.'
  }
]; 