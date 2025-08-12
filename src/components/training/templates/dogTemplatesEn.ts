import { PlanTemplate } from '../templateTypes';

export const dogTemplatesEn: PlanTemplate[] = [
  // PUPPY BASIC TRAINING
  {
    id: 'puppy-basics',
    title: 'Puppy Basic Course (8-16 weeks)',
    description: 'Professional puppy training - Building trust, basic obedience and social competence',
    category: 'Basic Training',
    difficulty: 'Beginner',
    duration: '8-12 weeks',
    species: ['Hund', 'Dog'],
    ageGroups: ['0-6 months', 'Puppy'],
    exercises: [
      {
        id: 'name-conditioning',
        title: 'Name Conditioning',
        description: 'Building a positive association with the name',
        duration: '3-5 minutes per session',
        repetitions: '8-10 short sessions daily',
        difficulty: 'Easy',
        materials: ['Soft mini treats', 'Quiet room'],
        steps: [],
        goal: 'Your puppy should find their name the most wonderful thing ever and always become attentive immediately when you call them. This is the foundation for all further training.',
        shortDescription: 'Positive name association as the foundation of all communication',
        stepByStepGuide: {
          step1: 'Say your puppy\'s name in a friendly, cheerful tone (not too excited!) and wait for their reaction.',
          step2: 'IMMEDIATELY when they look at you even briefly → say "YES!" and demand their full attention.',
          step3: 'Give treat and briefly praise. 2-3 second pause, then repeat - maximum 5 repetitions per session.',
          errorCorrection: 'Ignoring you? → Move closer, become more interesting (not louder!), possibly use better treats. Never call the name multiple times in a row.',
          speciesAdaptation: 'For shy puppies: Speak quieter and keep more distance. For hyper puppies: Become calmer and wait until they are relaxed.'
        },
        repetitionSchedule: {
          dailyPractice: '3-5 minutes per session',
          frequency: '8-10 sessions daily (every 1-2 hours)',
          trainingDuration: '2 weeks for first success, 4 weeks for perfection',
          note: 'Only practice when calm & motivated - no force!'
        },
        requiredTools: {
          equipment: ['Soft mini treats (pea-sized)', 'Positive voice', 'Patience'],
          location: 'Quiet room without distraction',
          timeframe: 'When puppy is awake and attentive',
          speciesAdaptation: 'For fearful dogs: Even smaller steps and plan more time'
        },
        learningTips: [
          'Never use name as "No" or for recall - only for positive attention',
          'After 1 week practice with light distractions (other rooms, garden)',
          'Keep a "name success list" - note daily reaction time',
          'All family members must do the same training'
        ],
        commonMistakes: [
          'Calling the name multiple times in a row',
          'Becoming too excited or too loud',
          'Using name for negative situations',
          'Too long sessions (puppies tire quickly)',
          'Impatience when progress is slow'
        ]
      },
      {
        id: 'impulse-control-waiting',
        title: 'Impulse Control - Patiently waiting before the bowl',
        description: 'Building self-control and patience',
        duration: '5-10 minutes per meal',
        repetitions: 'At every feeding (3-4 times daily)',
        difficulty: 'Medium',
        materials: ['Food bowl', 'Usual puppy food'],
        steps: [],
        goal: 'Your puppy learns self-control and that good things come to those who can wait. This prevents later begging and demanding behavior.',
        shortDescription: 'Fundamental training for impulse control and patience',
        stepByStepGuide: {
          step1: 'Fill the bowl with food and hold it at chest height while the puppy stands in front of you.',
          step2: 'Lower the bowl SLOWLY toward the floor. If puppy rushes forward → immediately raise bowl again.',
          step3: 'Only when puppy stays sitting and waits, put the bowl down and give the release word "TAKE" or "OK".',
          errorCorrection: 'Jumps forward → immediately raise bowl, wait 5 seconds, then try again. Never scold, just be consistent.',
          speciesAdaptation: 'For very impatient breeds (e.g. Terriers): Smaller steps, for calm breeds (e.g. Retrievers): Faster progression possible'
        },
        repetitionSchedule: {
          dailyPractice: '5-10 minutes per meal',
          frequency: 'At every feeding (3-4 times daily)',
          trainingDuration: 'Week 1: 3-5 seconds, Week 2-3: 10-15 seconds, Week 4: 20-30 seconds',
          note: 'The food itself is the reward - no additional treats needed'
        },
        requiredTools: {
          equipment: ['Food bowl', 'Usual puppy food', 'Lots of patience'],
          location: 'Usual feeding place',
          timeframe: 'At all meals',
          speciesAdaptation: 'For food-obsessed breeds: Stay especially consistent'
        },
        learningTips: [
          'Consistency is the key - never give in when they jump forward',
          'Always use the same release word',
          'Never use "SIT" as release',
          'Success: Puppy automatically sits before every bowl'
        ],
        commonMistakes: [
          'Giving up when they jump forward initially',
          'Scolding instead of staying consistent',
          'Different rules at different meals',
          'Increasing wait time too quickly'
        ]
      },
      {
        id: 'recall-foundation',
        title: 'Life-Saving Recall "HERE"',
        description: 'Building the most important command of all',
        duration: '10-15 minutes per session',
        repetitions: '3-4 sessions daily in various situations',
        difficulty: 'Medium',
        materials: ['10 meter long line', 'Jackpot treats'],
        steps: [],
        goal: 'Building the most important command of all. Your dog should always and immediately come to you, no matter what seems more interesting. This can save lives.',
        shortDescription: 'The life-saving command for absolute safety',
        stepByStepGuide: {
          step1: 'NEVER call "HERE" if you\'re not 100% sure he will come! Only start when the puppy is already running to you.',
          step2: 'If he comes to you → exuberant praise + 3-5 jackpot treats + extensive petting. He should feel like he missed the best thing.',
          step3: 'Reward EVERY coming to you, even if he was slow or distracted. The arrival is the success!',
          errorCorrection: 'If he doesn\'t come → go to him (don\'t call again!) and lead him back friendly. Never scold if he comes late.',
          speciesAdaptation: 'For hunting dogs: Extra exciting rewards. For shy dogs: Don\'t praise too exuberantly.'
        },
        repetitionSchedule: {
          dailyPractice: '10-15 minutes per session',
          frequency: '3-4 sessions daily in various situations',
          trainingDuration: 'Week 1-2: Home, Week 3-4: Garden with leash, Week 5-6: With distraction',
          note: 'After 4 weeks, 9 out of 10 calls should be successful'
        },
        requiredTools: {
          equipment: ['10 meter long line', 'Jackpot treats (especially tasty!)', 'Possibly squeaky toy'],
          location: 'Phase 1: Home, Phase 2: fenced garden, Phase 3: controlled outdoor areas',
          timeframe: 'When puppy is attentive but not overexcited',
          speciesAdaptation: 'For sighthounds: Especially good treats, as less food-motivated'
        },
        learningTips: [
          'Practice "Here" even when he\'s already with you - reinforces positive association',
          'Make yourself more interesting than the environment',
          'Vary the rewards - sometimes treat, sometimes play, sometimes petting',
          'Success test: 9 out of 10 calls should be successful'
        ],
        commonMistakes: [
          'Calling "HERE" when unsure if he will come',
          'Calling multiple times in a row',
          'Scolding when he comes slowly',
          'Using recall only for negative things (end of walk)',
          'Practicing without leash too early'
        ]
      },
      {
        id: 'leash-walking-foundation',
        title: 'Relaxed Walks - Leash Walking',
        description: 'Leash walking without pulling',
        duration: '15-20 minutes per walk',
        repetitions: 'Apply consistently on every walk',
        difficulty: 'Medium',
        materials: ['2 meter lead', 'Well-fitting harness'],
        steps: [],
        goal: 'Relaxed walks without your arm falling off! Your puppy learns that he only moves forward when the leash is loose. Pulling leads to stopping.',
        shortDescription: 'Foundation for relaxed walks without pulling',
        stepByStepGuide: {
          step1: 'Establish BASIC RULE: Tight leash = Stop like a tree, loose leash = Continue walking. You become a predictable "traffic light system".',
          step2: 'If puppy pulls → You stop IMMEDIATELY (no warning!). Wait until leash becomes loose.',
          step3: 'As soon as leash is loose → say "GOOD!" and immediately continue walking. Reward loose leash every 5-10 steps with treat.',
          errorCorrection: 'If he pulls very hard → simply turn around and walk in opposite direction. He learns: Pulling leads away from goal.',
          speciesAdaptation: 'For very energetic breeds: Let them romp for 5 minutes before walk. For fearful dogs: More patience and positive reinforcement.'
        },
        repetitionSchedule: {
          dailyPractice: '15-20 minutes per walk',
          frequency: 'Apply consistently on every walk',
          trainingDuration: 'First 2 weeks are crucial. After 4 weeks: 15-minute relaxed walks',
          note: 'First walks take longer - this is normal and important for learning process'
        },
        requiredTools: {
          equipment: ['2 meter lead (NO flexi-leads!)', 'Well-fitting harness or wide collar', 'Small treats in pocket'],
          location: 'Start in quiet environment, then increase',
          timeframe: 'At all walk times',
          speciesAdaptation: 'For large breeds: Start early, as harder to correct later'
        },
        learningTips: [
          'Patience is the key - quality before speed',
          'Vary tempo - sometimes slow, sometimes brisk, but never rush',
          'Use direction changes to demand attention',
          'Reward walking beside you, not just stopping'
        ],
        commonMistakes: [
          'Jerking, pulling or scolding - only reinforces pulling',
          'Giving in "just this once"',
          'Too long sessions for young puppies',
          'Using flexi-leads (teaches pulling)',
          'Giving up after first difficult walks'
        ]
      },
      {
        id: 'place-training',
        title: 'The Safe Resting Place "ON YOUR PLACE"',
        description: 'Building a safe retreat',
        duration: '10-15 minutes per session',
        repetitions: '4-5 sessions daily + as needed for calming',
        difficulty: 'Medium',
        materials: ['Dog blanket or cushion', 'Treats'],
        steps: [],
        goal: 'Your puppy gets his own "safe haven" - a place to relax where he is never disturbed. At the same time, he learns to come to rest on command.',
        shortDescription: 'A safe retreat for relaxation and rest',
        stepByStepGuide: {
          step1: 'Place blanket in quiet corner where puppy can observe the action. Say "ON YOUR PLACE" and lure with treat onto blanket.',
          step2: 'As soon as all 4 paws are on blanket → say "GOOD!" + give treat + gently pet. He should associate positive feelings with the place.',
          step3: 'Gradually increase duration: Day 1-3: release immediately, Day 4-7: wait 10 seconds, Week 2: 1 minute, Week 3: 5 minutes.',
          errorCorrection: 'If he stands up before release → calmly lead back without scolding. Possibly introduced command too early → go back one step.',
          speciesAdaptation: 'For restless breeds: Longer acclimation time. For dogs with separation anxiety: Especially important for emotional stability.'
        },
        repetitionSchedule: {
          dailyPractice: '10-15 minutes per session',
          frequency: '4-5 sessions daily + as needed for calming',
          trainingDuration: 'Week 1: Building, Week 2-3: Increase duration, Week 4: Independent use',
          note: 'Always release with "OK" or "FREE" from place - never fetch yourself'
        },
        requiredTools: {
          equipment: ['Washable dog blanket or cushion', 'Treats', 'Possibly long-lasting chew item'],
          location: 'Quiet corner with overview of the action',
          timeframe: 'When visitors, when cooking, or when he\'s overexcited',
          speciesAdaptation: 'Adapt material to breed: Large dogs need larger, more stable places'
        },
        learningTips: [
          'SAFE ZONE: On his place he is NEVER scolded or disturbed',
          'Later this will be his favorite relaxation spot - for life!',
          'When overwhelmed, he can go there independently',
          'Also use for everyday situations: visitors, cooking, etc.'
        ],
        commonMistakes: [
          'Using the place for punishment or time-outs',
          'Disturbing him when he lies there voluntarily',
          'Increasing wait time too quickly',
          'Forgetting to release him',
          'Choosing unsuitable location (too loud, too secluded)'
        ]
      }
    ],
    tips: [
      'TIMING IS EVERYTHING: Reward exactly at the right moment - 1 second too late = wrong message',
      'SHORT SESSIONS: Puppies can only concentrate for 3-5 minutes - rather often than long',
      'POSITIVE REINFORCEMENT: One praise is 10x more effective than any punishment',
      'FAMILY RULES: ALL family members must apply the same commands and rules',
      'SLEEP IS SACRED: Puppies need 18-20 hours sleep daily - tired puppies learn nothing',
      'SOCIALIZATION COMES FIRST: Positive experiences with people, animals and environment shape for life',
      'HAVE PATIENCE: Every puppy learns at his own pace - comparisons with others are pointless'
    ],
    expectedResults: 'After 8-12 weeks you have a well-socialized puppy who knows his name, has basic impulse control, walks on loose leash and shows reliable recall. The foundation for all further training is laid and you have built a trusting relationship.'
  },

  // ADULT DOG BEHAVIORAL TRAINING
  {
    id: 'adult-behavior',
    title: 'Behavioral Training for Adult Dogs',
    description: 'Correct problem behaviors and develop leadership qualities - for dogs 1 year and older',
    category: 'Behavior',
    difficulty: 'Advanced',
    duration: '12-16 weeks',
    species: ['Hund', 'Dog'],
    ageGroups: ['1-3 years', 'Adult'],
    exercises: [
      {
        id: 'leadership-exercises',
        title: 'Leadership Exercises "I DECIDE" (Week 1-4)',
        description: 'Establish clear hierarchy without dominance theory - through resource control',
        duration: '20-30 minutes',
        repetitions: 'Daily in everyday situations',
        difficulty: 'Hard',
        materials: ['Treats', 'Toys', 'Consistency'],
        steps: [
          'Rule 1: All resources belong to you - food, toys, attention, access to rooms',
          'Dog must "ask" for everything - through sit, eye contact or other desired behaviors',
          'Completely ignore pushy behavior - no attention for begging, jumping, whining',
          'Immediately reward calm, waiting behavior',
          'Doors: You always go first, dog waits until release',
          'Feeding: Dog waits at least 30 seconds before bowl',
          'Toys: You start and end the game, not the dog',
          'After 4 weeks: Dog automatically orients to you for all decisions'
        ]
      },
      {
        id: 'frustration-tolerance',
        title: 'Frustration Tolerance Training (Week 3-8)',
        description: 'Building emotional stability and calmness in stressful situations',
        duration: '15-25 minutes',
        repetitions: '2 times daily',
        difficulty: 'Hard',
        materials: ['Various treats', 'Distractions', 'Timer'],
        steps: [
          'Level 1: Treat in closed fist - dog must wait until you open',
          'Completely ignore scratching, barking, jumping',
          'Only open when dog sits and waits calmly (start with 3 seconds)',
          'Level 2: Place treat on floor, cover with hand',
          'Level 3: Place treat, say "WAIT", slowly step away',
          'Level 4: Practice wait command in exciting situations (other dogs, joggers)',
          'Gradually increase wait time and distraction over 6 weeks',
          'If mistakes: End exercise immediately, 5 minute break, then easier level'
        ]
      },
      {
        id: 'anti-aggression-protocol',
        title: 'Anti-Aggression Protocol (Week 5-12)',
        description: 'Professional handling of aggression against people or dogs',
        duration: '30-45 minutes',
        repetitions: 'Daily, controlled situations',
        difficulty: 'Hard',
        materials: ['Muzzle (for safety)', 'Long leash', 'High-quality treats', 'Helper'],
        steps: [
          'IMPORTANT: Always consult professional trainer for serious aggression!',
          'Phase 1: Determine trigger distance - distance where dog is still relaxed',
          'Conditioning: Trigger appears = super treat comes (not for behavior!)',
          'Gradually reduce distance over weeks, only when dog is relaxed',
          'Build alternative behavior: "LOOK AT ME" when trigger appears',
          'Never force dog to approach - always respect his pace',
          'If setbacks: Immediately greater distance, slow down training',
          'Measure success through body language: loose tail, relaxed ears, voluntary approach'
        ]
      }
    ],
    tips: [
      'A dog needs a sovereign partner, not a buddy',
      'Consistency is more important than perfection - rather 10 minutes every day than once 2 hours',
      'For behavioral problems: Always find the cause first, then treat the symptom',
      'Have patience - behavioral changes need 6-8 weeks to become stable',
      'Seek professional help for: Aggression, separation anxiety, extreme fear'
    ],
    expectedResults: 'After 12-16 weeks you have a balanced, respectful dog who recognizes you as a leader, can handle frustration and remains controllable even in difficult situations.'
  },

  // SENIOR DOG SPECIALIZED CARE
  {
    id: 'senior-dog-wellness',
    title: 'Senior Dog Wellness & Maintenance Training (7+ years)',
    description: 'Age-appropriate training for older dogs - maintaining mobility, mental fitness and quality of life',
    category: 'Senior Training',
    difficulty: 'Beginner',
    duration: 'Permanent/Lifelong',
    species: ['Hund', 'Dog'],
    ageGroups: ['7+ years', 'Senior'],
    exercises: [
      {
        id: 'cognitive-stimulation',
        title: 'Cognitive Stimulation & Dementia Prevention (daily)',
        description: 'Mental fitness exercises to prevent dementia and maintain brain function',
        duration: '10-15 minutes',
        repetitions: '2-3 times daily',
        difficulty: 'Easy',
        materials: ['Snuffle mat', 'Intelligence toys', 'Treat hiding places', 'New routes'],
        steps: [
          'Daily new sniffing tasks: Treats in various hiding places',
          'Practice known commands in new order - challenges the brain',
          'Learn new, simple tricks: "Wave", "Roll over", "Walk backwards"',
          'Vary walking routes - new smells and impressions work like brain training',
          'Rotate intelligence toys - different tasks every 3 days',
          'Promote social contacts - meet other friendly dogs',
          'If performance declines: Simplify tasks, don\'t give up',
          'Success: Dog stays curious and able to learn into old age'
        ]
      },
      {
        id: 'mobility-maintenance',
        title: 'Mobility Maintenance & Joint Protection (daily)',
        description: 'Gentle movement exercises to prevent joint stiffness and maintain muscles',
        duration: '15-20 minutes',
        repetitions: 'Daily, adapted to daily form',
        difficulty: 'Easy',
        materials: ['Ramps instead of stairs', 'Orthopedic dog bed', 'Warm blankets', 'Pain medication if needed'],
        steps: [
          'Warm-up phase: 5 minutes slow walking before every activity',
          'Joint-friendly movement: Swimming is ideal, otherwise short walks',
          'Passive movement: Gentle massage and moving joints',
          'No more jumping or abrupt direction changes',
          'For arthritis: Heat before movement, cold after activity',
          'Weight control essential - every extra kilo stresses joints',
          'Non-slip surfaces in the home',
          'If pain: Immediately pause, consult vet'
        ]
      },
      {
        id: 'comfort-care',
        title: 'Comfort Care & Quality of Life (daily)',
        description: 'Special care for senior dogs to relieve discomfort and increase well-being',
        duration: '20-30 minutes',
        repetitions: 'Daily, adapted to needs',
        difficulty: 'Easy',
        materials: ['Soft brushes', 'Special shampoo', 'Nail clippers', 'Dental care', 'Warm compress'],
        steps: [
          'Daily coat care: Prevent matting, promote skin health',
          'Regular dental check: Tartar leads to heart problems',
          'Clip nails more often: less activity = slower wear',
          'Check eyes and ears daily: Recognize age-related problems early',
          'Warm, soft resting places: Relieve arthritis pain',
          'Adapt food: smaller portions, easier to digest',
          'Maintain routine: Senior dogs need security and predictability',
          'More attention and cuddle time - emotional needs increase'
        ]
      }
    ],
    tips: [
      'Senior dogs are like elderly people - they deserve respect and special care',
      'Pain is often hidden - watch for subtle signs: less activity, stiffness, behavioral changes',
      'Regular vet checks (every 6 months) are vital for seniors',
      'Never give up when dog becomes slower - adapt, don\'t stop',
      'Quality of life is more important than lifespan - pain-free, happy years count'
    ],
    expectedResults: 'Your senior dog stays mobile, mentally fit and pain-free longer. Quality of life is maximized and age-related problems are recognized and treated early. Many dogs can remain active and happy well into old age.'
  }
]; 