// Enhanced chat intelligence for proactive and personalized support

export function generateProactiveQuestions(petData: any, isNewPet: boolean): string[] {
  if (!petData) return [];
  
  const questions = [];
  const ageInMonths = petData.age ? petData.age * 12 : 
    (petData.birth_date ? Math.floor((Date.now() - new Date(petData.birth_date).getTime()) / (30.44 * 24 * 60 * 60 * 1000)) : 0);

  // Age-specific proactive questions
  if (ageInMonths <= 6) {
    questions.push(
      `Wie läuft die Stubenreinheit bei ${petData.name}?`,
      `Hat ${petData.name} schon alle wichtigen Impfungen erhalten?`,
      `Wie reagiert ${petData.name} auf andere Hunde oder Menschen?`
    );
  } else if (ageInMonths <= 18) {
    questions.push(
      `Zeigt ${petData.name} schon typisches Teenager-Verhalten wie Ignorieren von Kommandos?`,
      `Wie ist das Leinentraining bei ${petData.name} gelaufen?`,
      `Hat ${petData.name} Probleme mit der Impulskontrolle?`
    );
  }

  // Breed-specific questions
  const breed = petData.breed?.toLowerCase() || '';
  if (breed.includes('schäfer') || breed.includes('shepherd')) {
    questions.push(
      `Zeigt ${petData.name} schon Hüteverhalten?`,
      `Wie lastet ihr ${petData.name} mental aus?`
    );
  }

  // Behavior focus specific
  if (petData.behavior_focus?.includes('stubenrein')) {
    questions.push(
      `Gab es in letzter Zeit Fortschritte bei der Stubenreinheit?`,
      `Habt ihr feste Zeiten für die Gassirunden etabliert?`
    );
  }

  return questions;
}

export function generateContextualTips(petData: any, userMessage: string): string {
  if (!petData) return '';
  
  const message = userMessage.toLowerCase();
  const ageInMonths = petData.age ? petData.age * 12 : 
    (petData.birth_date ? Math.floor((Date.now() - new Date(petData.birth_date).getTime()) / (30.44 * 24 * 60 * 60 * 1000)) : 0);

  let contextualTip = '';

  // Weather/seasonal tips
  const now = new Date();
  const month = now.getMonth();
  
  if (month >= 11 || month <= 1) { // Winter
    contextualTip += `\n🌨️ Winter-Tipp für ${petData.name}: Bei Kälte kürzere, aber häufigere Spaziergänge. Pfoten nach dem Gassi gehen checken!`;
  } else if (month >= 5 && month <= 8) { // Summer
    contextualTip += `\n☀️ Sommer-Tipp für ${petData.name}: Heißen Asphalt vermeiden! Hand-Test: Wenn zu heiß für deine Hand, dann auch für ${petData.name}s Pfoten.`;
  }

  // Age-specific contextual advice
  if (ageInMonths <= 6 && message.includes('training')) {
    contextualTip += `\n🐾 Welpen-Erinnerung: ${petData.name} kann sich nur 5-10 Minuten konzentrieren. Kurze, häufige Sessions sind ideal!`;
  }

  // Breed-specific contextual advice
  const breed = petData.breed?.toLowerCase() || '';
  if (breed.includes('schäfer') && message.includes('langeweile')) {
    contextualTip += `\n🧠 Schäferhund-Tipp: ${petData.name} braucht mentale Herausforderungen! Futterspiele, Suchspiele oder Tricks lernen.`;
  }

  return contextualTip;
}

export function generateProgressReminders(petData: any): string[] {
  if (!petData) return [];
  
  const reminders = [];
  const ageInMonths = petData.age ? petData.age * 12 : 
    (petData.birth_date ? Math.floor((Date.now() - new Date(petData.birth_date).getTime()) / (30.44 * 24 * 60 * 60 * 1000)) : 0);

  // Age-based reminders
  if (ageInMonths <= 6) {
    reminders.push(
      `Welpenzeit ist Prägezeit! Täglich neue, positive Erfahrungen sammeln.`,
      `Beißhemmung trainieren: Quietschen wenn ${petData.name} zu fest beißt.`
    );
  } else if (ageInMonths <= 18) {
    reminders.push(
      `Pubertät bei ${petData.name}: Geduld haben, Kommandos werden oft "vergessen".`,
      `Jetzt ist die perfekte Zeit für Impulskontrolle-Training!`
    );
  }

  // Behavior focus reminders
  if (petData.behavior_focus?.includes('stubenrein')) {
    reminders.push(
      `Stubenreinheit: Regelmäßigkeit ist der Schlüssel! Feste Zeiten helfen ${petData.name}.`
    );
  }

  return reminders;
}

export function generateSmartExerciseSuggestions(petData: any): string[] {
  if (!petData) return [];
  
  const suggestions = [];
  const ageInMonths = petData.age ? petData.age * 12 : 
    (petData.birth_date ? Math.floor((Date.now() - new Date(petData.birth_date).getTime()) / (30.44 * 24 * 60 * 60 * 1000)) : 0);
  
  const breed = petData.breed?.toLowerCase() || '';
  const species = petData.species?.toLowerCase() || '';

  // Age-appropriate exercises
  if (ageInMonths <= 6) {
    suggestions.push(
      'Name-Spiel: ${petData.name} soll bei Namensruf zu dir kommen (mit Leckerli belohnen)',
      'Sitz-Übung: Hand mit Leckerli über ${petData.name}s Kopf führen',
      'Sozialisierung: Verschiedene Oberflächen erkunden lassen'
    );
  } else if (ageInMonths <= 18) {
    suggestions.push(
      'Impulskontrolle: "Warten" vor dem Fressnapf',
      'Rückruf-Training: ${petData.name} in sicherer Umgebung ohne Leine rufen',
      'Leinentraining: Bei Zug stehenbleiben, bei lockerer Leine belohnen'
    );
  }

  // Breed-specific exercises
  if (breed.includes('schäfer')) {
    suggestions.push(
      'Nasenarbeit: Leckerlis verstecken und ${petData.name} suchen lassen',
      'Objektsuche: Lieblingsspielzeug verstecken',
      'Grundgehorsam unter Ablenkung trainieren'
    );
  } else if (breed.includes('retriever')) {
    suggestions.push(
      'Apportieren: Mit ${petData.name}s Lieblingsspielzeug',
      'Wassergewöhnung falls noch nicht erfolgt',
      'Dummy-Training für geistige Auslastung'
    );
  }

  // Species-specific exercises for cats
  if (species.includes('katze')) {
    suggestions.push(
      'Clickertraining: Sitz und Pfote geben',
      'Intelligenzspielzeug mit Leckerlis',
      'Vertikale Klettermöglichkeiten nutzen'
    );
  }

  return suggestions;
}

export function analyzeConversationContext(chatHistory: any[], petData: any): {
  hasDiscussedToday: string[];
  suggestedFollowUps: string[];
  needsAttention: string[];
} {
  const hasDiscussedToday = [];
  const suggestedFollowUps = [];
  const needsAttention = [];

  if (!chatHistory || chatHistory.length === 0) {
    return { hasDiscussedToday, suggestedFollowUps, needsAttention };
  }

  // Analyze recent conversation topics
  const recentMessages = chatHistory.slice(-10); // Last 10 messages
  const conversationText = recentMessages.map(m => m.content).join(' ').toLowerCase();

  // Check for discussed topics
  if (conversationText.includes('stubenrein') || conversationText.includes('unsauber')) {
    hasDiscussedToday.push('Stubenreinheit');
    suggestedFollowUps.push('Wie sind die Fortschritte mit der Stubenreinheit?');
  }

  if (conversationText.includes('bellen') || conversationText.includes('laut')) {
    hasDiscussedToday.push('Bellverhalten');
    suggestedFollowUps.push('Hat sich das Bellverhalten verbessert?');
  }

  if (conversationText.includes('leine') || conversationText.includes('ziehen')) {
    hasDiscussedToday.push('Leinentraining');
    suggestedFollowUps.push('Wie läuft das Leinentraining?');
  }

  // Check for issues that need attention
  if (conversationText.includes('aggression') || conversationText.includes('beißen')) {
    needsAttention.push('Aggressionsverhalten - professionelle Hilfe empfohlen');
  }

  if (conversationText.includes('angst') || conversationText.includes('ängstlich')) {
    needsAttention.push('Angstverhalten - behutsames Training notwendig');
  }

  return { hasDiscussedToday, suggestedFollowUps, needsAttention };
}