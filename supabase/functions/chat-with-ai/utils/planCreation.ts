
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { translatePlanData } from "./translation.ts";

export async function createTrainingPlan(
  supabaseClient: any,
  userId: string,
  petId: string | null,
  planData: {
    title: string;
    description?: string;
    steps: Array<{
      title: string;
      description: string;
      points?: number;
    }>;
  },
  openAIApiKey?: string
) {
  // Translate plan data to English if OpenAI key is available
  let translatedData;
  if (openAIApiKey) {
    try {
      console.log('🔄 Starting translation process for training plan...');
      translatedData = await translatePlanData(planData, openAIApiKey);
    } catch (translationError) {
      console.error('❌ Translation failed, continuing without translations:', translationError);
      translatedData = {
        title_en: '',
        description_en: '',
        steps_en: planData.steps.map(() => ({ title_en: '', description_en: '' }))
      };
    }
  }

  // Create training plan with English translations
  const { data: planResult, error: planError } = await supabaseClient
    .from('training_plans')
    .insert([{
      user_id: userId,
      pet_id: petId,
      title: planData.title,
      title_en: translatedData?.title_en || null,
      description: planData.description || '',
      description_en: translatedData?.description_en || null,
      status: 'in_progress'
    }])
    .select()
    .single();

  if (planError) {
    console.error('Error creating plan:', planError);
    throw new Error('Fehler beim Erstellen des Trainingsplans');
  }

  // Create training steps with English translations
  const steps = planData.steps.map((step: any, index: number) => ({
    training_plan_id: planResult.id,
    step_number: index + 1,
    title: step.title,
    title_en: translatedData?.steps_en[index]?.title_en || null,
    description: step.description,
    description_en: translatedData?.steps_en[index]?.description_en || null,
    points_reward: step.points || 10
  }));

  const { error: stepsError } = await supabaseClient
    .from('training_steps')
    .insert(steps);

  if (stepsError) {
    console.error('Error creating steps:', stepsError);
    throw new Error('Fehler beim Erstellen der Trainingsschritte');
  }

  // Initialize user rewards if not exists
  await supabaseClient
    .from('user_rewards')
    .upsert({
      user_id: userId,
      total_points: 0
    });

  return planResult;
}

export function processPlanCreationFromResponse(aiResponse: string, userLanguage: string = 'de') {
  console.log('🔍 Searching for plan creation in AI response...');
  console.log('🌍 User language preference:', userLanguage);
  
  const planMatch = aiResponse.match(/\[PLAN_CREATION\](.*?)\[\/PLAN_CREATION\]/s);
  if (planMatch) {
    console.log('✅ Found plan creation block');
    try {
      // Clean the JSON content from formatting artifacts
      const jsonContent = planMatch[1]
        .trim()
        .replace(/```json|```/g, '') // Remove code block markers
        .replace(/"""/g, '') // Remove triple quotes
        .replace(/^\s*```\s*$/gm, '') // Remove standalone code block lines
        .trim();
      
      console.log('📝 Extracted JSON content:', jsonContent.substring(0, 200) + '...');
      
      // Validate JSON structure before parsing
      if (!jsonContent.includes('"title"') || !jsonContent.includes('"steps"')) {
        console.warn('⚠️ Plan creation block missing required fields (title or steps)');
        return null;
      }
      
      const planData = JSON.parse(jsonContent);
      console.log('✅ Successfully parsed plan data:', {
        title: planData.title,
        stepsCount: planData.steps?.length || 0
      });
      
      // Validate plan structure
      if (!planData.title || !planData.steps || !Array.isArray(planData.steps)) {
        console.warn('⚠️ Invalid plan structure:', planData);
        return null;
      }
      
      // Ensure minimum plan requirements
      if (planData.steps.length === 0) {
        console.warn('⚠️ Plan has no steps');
        return null;
      }
      
      // Validate each step has required fields
      for (let i = 0; i < planData.steps.length; i++) {
        const step = planData.steps[i];
        if (!step.title || !step.description) {
          console.warn(`⚠️ Step ${i + 1} missing required fields:`, step);
          return null;
        }
      }
      
      // Ensure title and description are not empty - temporarily less strict
      if (!planData.title.trim() || planData.title.trim().length < 2) {
        console.warn('⚠️ Plan title is too short or empty');
        return null;
      }
      
      // Validate step titles and descriptions - temporarily less strict
      for (let i = 0; i < planData.steps.length; i++) {
        const step = planData.steps[i];
        if (!step.title.trim() || step.title.trim().length < 2) {
          console.warn(`⚠️ Step ${i + 1} title is too short or empty`);
          return null;
        }
        if (!step.description.trim() || step.description.trim().length < 5) {
          console.warn(`⚠️ Step ${i + 1} description is too short or empty`);
          return null;
        }
      }
      
      // Language validation based on user preference instead of word detection
      const allContent = `${planData.title} ${planData.description || ''} ${planData.steps.map(s => `${s.title} ${s.description}`).join(' ')}`.toLowerCase();
      
      // Define expected language patterns based on user preference
      const expectedLanguagePatterns = {
        de: {
          expectedWords: ['schritt', 'trainingsplan', 'übung', 'kommando', 'leckerli', 'belohnung', 'sitz', 'platz', 'bei', 'fuß', 'hier', 'aus', 'bleib', 'warte', 'nein', 'brav', 'gut', 'super', 'prima', 'toll', 'fein', 'richtig', 'falsch', 'verboten', 'erlaubt', 'darf', 'muss', 'soll', 'kann', 'möchte', 'will', 'sollte', 'könnte', 'würde', 'hätte', 'wäre', 'wird', 'wurde', 'geworden', 'gemacht', 'getan', 'gegeben', 'genommen', 'gebracht', 'gekommen', 'gegangen', 'gestanden', 'gesessen', 'gelegen', 'geblieben', 'gewartet', 'gehört', 'gesehen', 'gefühlt', 'gedacht', 'gewusst', 'gekonnt', 'gemocht', 'gewollt', 'gesollt', 'gedurft', 'gemusst'],
          forbiddenWords: ['step', 'training', 'plan', 'exercise', 'command', 'treat', 'reward', 'house', 'leash', 'sit', 'down', 'stay', 'come', 'heel', 'here', 'out', 'wait', 'no', 'good', 'yes', 'okay', 'right', 'wrong', 'forbidden', 'allowed', 'can', 'must', 'should', 'would', 'could', 'might', 'will', 'would', 'have', 'has', 'had', 'been', 'done', 'made', 'given', 'taken', 'brought', 'come', 'gone', 'stood', 'sat', 'lain', 'stayed', 'waited', 'heard', 'seen', 'felt', 'thought', 'known', 'could', 'liked', 'wanted', 'should', 'allowed', 'required']
        },
        en: {
          expectedWords: ['step', 'training', 'plan', 'exercise', 'command', 'treat', 'reward', 'house', 'leash', 'sit', 'down', 'stay', 'come', 'heel', 'here', 'out', 'wait', 'no', 'good', 'yes', 'okay', 'right', 'wrong', 'forbidden', 'allowed', 'can', 'must', 'should', 'would', 'could', 'might', 'will', 'would', 'have', 'has', 'had', 'been', 'done', 'made', 'given', 'taken', 'brought', 'come', 'gone', 'stood', 'sat', 'lain', 'stayed', 'waited', 'heard', 'seen', 'felt', 'thought', 'known', 'could', 'liked', 'wanted', 'should', 'allowed', 'required'],
          forbiddenWords: ['schritt', 'trainingsplan', 'übung', 'kommando', 'leckerli', 'belohnung', 'sitz', 'platz', 'bei', 'fuß', 'hier', 'aus', 'bleib', 'warte', 'nein', 'brav', 'gut', 'super', 'prima', 'toll', 'fein', 'richtig', 'falsch', 'verboten', 'erlaubt', 'darf', 'muss', 'soll', 'kann', 'möchte', 'will', 'sollte', 'könnte', 'würde', 'hätte', 'wäre', 'wird', 'wurde', 'geworden', 'gemacht', 'getan', 'gegeben', 'genommen', 'gebracht', 'gekommen', 'gegangen', 'gestanden', 'gesessen', 'gelegen', 'geblieben', 'gewartet', 'gehört', 'gesehen', 'gefühlt', 'gedacht', 'gewusst', 'gekonnt', 'gemocht', 'gewollt', 'gesollt', 'gedurft', 'gemusst']
        }
      };
      
      const languagePatterns = expectedLanguagePatterns[userLanguage as keyof typeof expectedLanguagePatterns] || expectedLanguagePatterns.de;
      
      // Check for forbidden words (words from the wrong language)
      const forbiddenWordsFound = languagePatterns.forbiddenWords.filter(word => allContent.includes(word));
      
      if (forbiddenWordsFound.length > 0) {
        console.warn('⚠️ Forbidden words detected in plan content - rejecting plan');
        console.warn('Forbidden words found:', forbiddenWordsFound);
        console.warn('Expected language:', userLanguage);
        console.warn('Plan content:', allContent.substring(0, 200));
        return null;
      }
      
      // Log language validation for debugging
      console.log('🔍 Language validation results:', {
        expectedLanguage: userLanguage,
        forbiddenWordsFound: forbiddenWordsFound.length,
        planTitle: planData.title,
        planContent: allContent.substring(0, 100)
      });
      
      console.log('✅ Plan validation successful, returning plan data');
      return planData;
    } catch (error) {
      console.error('❌ Error parsing plan creation data:', error);
      console.error('❌ Raw content that failed to parse:', planMatch[1].substring(0, 500));
      return null;
    }
  } else {
    console.log('❌ No plan creation block found in response');
    // Check if there might be a malformed plan creation attempt
    if (aiResponse.includes('PLAN_CREATION') || aiResponse.includes('training plan') || aiResponse.includes('Trainingsplan')) {
      console.log('⚠️ Response mentions plan creation but no proper tags found');
    }
  }
  return null;
}

export function removePlanCreationFromResponse(aiResponse: string, planTitle: string, language: string = 'de') {
  // Clean the response from formatting artifacts before replacement
  const cleanedResponse = aiResponse
    .replace(/"""/g, '') // Remove triple quotes
    .replace(/```json|```/g, '') // Remove code block markers
    .replace(/^\s*```\s*$/gm, ''); // Remove standalone code block lines
  
  // Language-specific success messages
  const successMessages = {
    de: `\n\n✅ **Trainingsplan erfolgreich erstellt!**\n\nIch habe "${planTitle}" als strukturiertes Projekt für euch angelegt. Du findest es in deinem Dashboard unter "Trainingspläne". Dort kannst du jeden Tag eure Fortschritte abhaken und Punkte sammeln! 🏆\n\nMöchtest du noch Fragen zum Plan oder brauchst du zusätzliche Tipps? 😊`,
    en: `\n\n✅ **Training Plan Successfully Created!**\n\nI've set up "${planTitle}" as a structured project for you. You can find it in your dashboard under "Training Plans". There you can check off your progress every day and collect points! 🏆\n\nDo you have any questions about the plan or need additional tips? 😊`
  };
  
  const successMessage = successMessages[language as keyof typeof successMessages] || successMessages.de;
    
  return cleanedResponse.replace(/\[PLAN_CREATION\].*?\[\/PLAN_CREATION\]/s, successMessage);
}

export function cleanupFailedPlanCreation(aiResponse: string, language: string = 'de') {
  // Clean formatting artifacts first
  let cleanedResponse = aiResponse
    .replace(/"""/g, '') // Remove triple quotes
    .replace(/```json|```/g, '') // Remove code block markers
    .replace(/^\s*```\s*$/gm, ''); // Remove standalone code block lines
  
  // Remove any incomplete or failed plan creation blocks
  cleanedResponse = cleanedResponse.replace(/\[PLAN_CREATION\].*?\[\/PLAN_CREATION\]/s, '');
  
  // Also remove any standalone plan creation blocks that might be malformed
  cleanedResponse = cleanedResponse.replace(/\[PLAN_CREATION\].*$/s, '');
  cleanedResponse = cleanedResponse.replace(/^.*\[\/PLAN_CREATION\]/s, '');
  
  // Language-specific fallback messages
  const fallbackMessages = {
    de: "\n\n😊 Entschuldige, beim Erstellen des Trainingsplans gab es ein kleines Problem. Lass mich das nochmal für dich versuchen - magst du mir kurz sagen, woran ihr arbeiten möchtet?",
    en: "\n\n😊 Sorry, there was a small problem creating the training plan. Let me try again for you - could you briefly tell me what you'd like to work on?"
  };
  
  const fallbackMessage = fallbackMessages[language as keyof typeof fallbackMessages] || fallbackMessages.de;
  
  // If the response is now empty or very short, provide a fallback
  if (cleanedResponse.trim().length < 20) {
    return fallbackMessage;
  }
  
  return cleanedResponse;
}
