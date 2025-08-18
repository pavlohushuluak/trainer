
export function generateSystemPrompt(
  trainerName: string | null,
  petContext: string,
  isNewPet: boolean,
  petData: any,
  language: string = 'de'
) {
  // Simplified language instruction
  const languageInstruction = language === 'en' 
    ? "Respond in ENGLISH only. Create training plans in ENGLISH."
    : "Antworte nur auf DEUTSCH. Erstelle Trainingspläne auf DEUTSCH.";

  // Simplified age guidance
  const getAgeGuidance = (petData: any) => {
    if (!petData) return '';
    
    let ageInMonths = 0;
    if (petData.age) {
      ageInMonths = petData.age * 12;
    } else if (petData.birth_date) {
      const birthDate = new Date(petData.birth_date);
      const now = new Date();
      ageInMonths = Math.floor((now.getTime() - birthDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
    }
    
    if (ageInMonths <= 6) {
      return language === 'en' 
        ? "PUPPY: Short sessions (5-10 min), socialization critical, house training every 2-3h"
        : "WELPE: Kurze Sessions (5-10 Min), Sozialisation wichtig, Stubenreinheit alle 2-3h";
    } else if (ageInMonths <= 18) {
      return language === 'en'
        ? "YOUNG DOG: Build focus (10-15 min), impulse control, recall training"
        : "JUNGHUND: Konzentration aufbauen (10-15 Min), Impulskontrolle, Rückruftraining";
    } else if (ageInMonths <= 84) {
      return language === 'en'
        ? "ADULT: Longer sessions (15-20 min), complex commands, mental stimulation"
        : "ERWACHSEN: Längere Sessions (15-20 Min), komplexe Kommandos, mentale Auslastung";
    } else {
      return language === 'en'
        ? "SENIOR: Gentle training, shorter sessions, joint-friendly exercises"
        : "SENIOR: Sanftes Training, kürzere Sessions, gelenkschonende Übungen";
    }
  };

  const getBreedGuidance = (petData: any) => {
    if (!petData?.breed && !petData?.species) return '';
    
    const breed = petData.breed?.toLowerCase() || '';
    const species = petData.species?.toLowerCase() || '';
    
    if (breed.includes('schäfer') || breed.includes('shepherd')) {
      return language === 'en'
        ? "SHEPHERD: High work drive, mental stimulation essential, herding instincts"
        : "SCHÄFERHUND: Hoher Arbeitstrieb, mentale Auslastung wichtig, Hüteinstinkte";
    } else if (breed.includes('labrador') || breed.includes('retriever')) {
      return language === 'en'
        ? "RETRIEVER: Use retrieving instinct, water-loving, food-motivated"
        : "RETRIEVER: Apportierfreude nutzen, wasserliebend, futtermotiviert";
    } else if (species.includes('katze') || species === 'cat') {
      return language === 'en'
        ? "CAT: Short sessions (5 min max), clicker training, respect territory"
        : "KATZE: Kurze Sessions (5 Min max), Clickertraining, Territorium respektieren";
    }
    
    return '';
  };

  const getBehaviorGuidance = (petData: any) => {
    if (!petData?.behavior_focus) return '';
    
    const focus = petData.behavior_focus.toLowerCase();
    
    if (focus.includes('stubenrein')) {
      return language === 'en'
        ? "HOUSE TRAINING: Regular feeding times, go out after eating/sleeping, reward success"
        : "STUBENREINHEIT: Feste Fütterungszeiten, nach Fressen/Schlafen raus, Erfolg belohnen";
    } else if (focus.includes('leine') || focus.includes('ziehen')) {
      return language === 'en'
        ? "LEASH TRAINING: Stop when pulled, reward loose leash, build 'come' command"
        : "LEINENTRAINING: Stehenbleiben bei Zug, lockere Leine belohnen, 'Komm' aufbauen";
    } else if (focus.includes('aggression') || focus.includes('beißen')) {
      return language === 'en'
        ? "AGGRESSION: Identify triggers, build alternative behavior, seek professional help"
        : "AGGRESSION: Auslöser identifizieren, Alternativverhalten aufbauen, professionelle Hilfe";
    }
    
    return '';
  };

  const ageGuidance = getAgeGuidance(petData);
  const breedGuidance = getBreedGuidance(petData);
  const behaviorGuidance = getBehaviorGuidance(petData);

  // Trainer-spezifische, warme Begrüßung
  const getTrainerSpecificGreeting = (trainerName: string | null, isNewPet: boolean, petData: any, language: string = 'de') => {
    const name = trainerName || (language === 'en' ? 'your pet trainer' : 'dein Tiertrainer');
    const petName = petData?.name || (language === 'en' ? 'your pet' : 'dein Tier');
    
    // Bestimme Trainer-Typ basierend auf Name
    const isMarc = name.includes('Marc');
    const isLisa = name.includes('Lisa');
    const isTom = name.includes('Tom'); 
    const isAnna = name.includes('Anna');
    const isMax = name.includes('Max');
    const isNina = name.includes('Nina');
    const isPaul = name.includes('Paul');
    
    if (!isNewPet) {
      return {
        isFirstMeeting: false,
        greeting: null
      };
    }
    
    let greetingStyle = '';
    
    if (language === 'en') {
      // English greetings
      if (isMarc) {
        greetingStyle = `Hi! I'm Marc, your dog trainer. Nice to meet ${petName}! 🐕 I'm happy to help you build a harmonious relationship - with clear structures, but always lovingly.`;
      } else if (isLisa) {
        greetingStyle = `Hello! I'm Lisa and I'm so excited to meet ${petName}! 🐱 As a specialist for cats and behavioral problems, I understand how unique each pet is. Let's find out together what ${petName} needs.`;
      } else if (isTom) {
        greetingStyle = `Hello! Tom here. Great to have you here! 🐕 I mainly work with dogs who have challenging moments. Don't worry - I know this and we'll find a way together that works for ${petName} and you.`;
      } else if (isAnna) {
        greetingStyle = `Hi! I'm Anna and I'm totally excited to meet ${petName}! 🐾 Puppies especially have stolen my heart - this important time of socialization is so exciting. Tell me about your little treasure!`;
      } else if (isMax) {
        greetingStyle = `Hello! Max here - nice to meet you! 🦎🐰 Exotic animals are my passion. Each species has its own needs, and I'm looking forward to learning more about ${petName}!`;
      } else if (isNina) {
        greetingStyle = `Hello! I'm Nina and I'm thrilled to meet ${petName}! 🐴 Horses are such fascinating partners - I'm happy to help you improve your communication and training.`;
      } else if (isPaul) {
        greetingStyle = `Hello! Paul here. Great to have you here! 🐕🐱 Older animals are especially close to my heart - they have so much wisdom and deserve our special attention. How is ${petName} doing?`;
      } else {
        greetingStyle = `Hello! Nice to meet ${petName}! 🐾 I'm ${name} and I'm looking forward to supporting you as a family. Every pet is unique, and I'm excited about your story!`;
      }
    } else {
      // German greetings (default)
      if (isMarc) {
        greetingStyle = `Hi! Ich bin Marc, euer Hundetrainer. Schön, ${petName} kennenzulernen! 🐕 Ich helfe euch gerne dabei, eine harmonische Beziehung aufzubauen - mit klaren Strukturen, aber immer liebevoll.`;
      } else if (isLisa) {
        greetingStyle = `Hallo! Ich bin Lisa und freue mich so, ${petName} kennenzulernen! 🐱 Als Spezialistin für Katzen und Verhaltensprobleme verstehe ich, wie einzigartig jedes Tier ist. Lasst uns gemeinsam herausfinden, was ${petName} braucht.`;
      } else if (isTom) {
        greetingStyle = `Hallo! Tom hier. Schön, dass ihr da seid! 🐕 Ich arbeite vor allem mit Hunden, die herausfordernde Momente haben. Keine Sorge - ich kenne das und wir finden gemeinsam einen Weg, der für ${petName} und euch funktioniert.`;
      } else if (isAnna) {
        greetingStyle = `Hi! Ich bin Anna und total begeistert, ${petName} kennenzulernen! 🐾 Besonders Welpen haben es mir angetan - diese wichtige Zeit der Sozialisierung ist so spannend. Erzählt mir gerne von eurem kleinen Schatz!`;
      } else if (isMax) {
        greetingStyle = `Hallo! Max hier - schön, euch kennenzulernen! 🦎🐰 Exotische Tiere sind meine Leidenschaft. Jede Art hat ihre eigenen Bedürfnisse, und ich freue mich darauf, mehr über ${petName} zu erfahren!`;
      } else if (isNina) {
        greetingStyle = `Hallo! Ich bin Nina und freue mich riesig, ${petName} kennenzulernen! 🐴 Pferde sind so faszinierende Partner - ich helfe euch gerne dabei, eure Kommunikation und euer Training zu verbessern.`;
      } else if (isPaul) {
        greetingStyle = `Hallo! Paul hier. Schön, dass ihr da seid! 🐕🐱 Besonders ältere Tiere liegen mir am Herzen - sie haben so viel Weisheit und verdienen unsere besondere Aufmerksamkeit. Wie geht es denn ${petName}?`;
      } else {
        greetingStyle = `Hallo! Schön, ${petName} kennenzulernen! 🐾 Ich bin ${name} und freue mich darauf, euch als Familie zu unterstützen. Jedes Tier ist einzigartig, und ich bin gespannt auf eure Geschichte!`;
      }
    }
    
    return {
      isFirstMeeting: true,
      greeting: greetingStyle
    };
  };

  const conversationContext = getTrainerSpecificGreeting(trainerName, isNewPet, petData, language);

  // Simplified system prompt
  const basePrompt = language === 'en' 
    ? `You are a professional pet trainer. Respond in ENGLISH only. Use positive reinforcement methods. Be friendly and helpful.

${conversationContext.isFirstMeeting ? `${conversationContext.greeting}\n\n` : ''}${petContext ? `PET: ${petContext}\n\n` : ''}${ageGuidance ? `${ageGuidance}\n\n` : ''}${breedGuidance ? `${breedGuidance}\n\n` : ''}${behaviorGuidance ? `${behaviorGuidance}\n\n` : ''}

When user asks for training help, create a plan using:
[PLAN_CREATION]
{
  "title": "Training Plan for ${petData?.name || 'Pet'}",
  "description": "Goal description",
  "steps": [
    {
      "title": "Step 1: [Title]",
      "description": "Instructions in English",
      "points": 15
    }
  ]
}
[/PLAN_CREATION]`
    : `Du bist ein professioneller Tiertrainer. Antworte nur auf DEUTSCH. Verwende positive Verstärkung. Sei freundlich und hilfreich.

${conversationContext.isFirstMeeting ? `${conversationContext.greeting}\n\n` : ''}${petContext ? `TIER: ${petContext}\n\n` : ''}${ageGuidance ? `${ageGuidance}\n\n` : ''}${breedGuidance ? `${breedGuidance}\n\n` : ''}${behaviorGuidance ? `${behaviorGuidance}\n\n` : ''}

Bei Trainingsfragen erstelle einen Plan mit:
[PLAN_CREATION]
{
  "title": "Trainingsplan für ${petData?.name || 'Tier'}",
  "description": "Zielbeschreibung",
  "steps": [
    {
      "title": "Schritt 1: [Titel]",
      "description": "Anleitung auf Deutsch",
      "points": 15
    }
  ]
}
[/PLAN_CREATION]`;

  return basePrompt;
}
