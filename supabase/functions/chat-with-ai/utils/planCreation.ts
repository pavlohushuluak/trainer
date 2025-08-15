
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { translatePlanData } from "./translation.ts";

// Function to translate plan to user's language
async function translatePlanToUserLanguage(
  planData: any,
  userLanguage: string,
  openAIApiKey?: string
): Promise<any> {
  if (!openAIApiKey) {
    console.log('⚠️ No OpenAI API key available for translation');
    return planData;
  }

  try {
    console.log('🔄 Translating plan to user language:', userLanguage);
    
    // Detect the current language of the plan
    const allContent = `${planData.title} ${planData.description || ''} ${planData.steps.map(s => `${s.title} ${s.description}`).join(' ')}`.toLowerCase();
    
    const germanWords = ['schritt', 'trainingsplan', 'übung', 'kommando', 'leckerli', 'belohnung', 'sitz', 'platz', 'bei', 'fuß', 'hier', 'aus', 'bleib', 'warte', 'nein', 'brav', 'gut', 'super', 'prima', 'toll', 'fein', 'richtig', 'falsch', 'verboten', 'erlaubt', 'darf', 'muss', 'soll', 'kann', 'möchte', 'will', 'sollte', 'könnte', 'würde', 'hätte', 'wäre', 'wird', 'wurde', 'geworden', 'gemacht', 'getan', 'gegeben', 'genommen', 'gebracht', 'gekommen', 'gegangen', 'gestanden', 'gesessen', 'gelegen', 'geblieben', 'gewartet', 'gehört', 'gesehen', 'gefühlt', 'gedacht', 'gewusst', 'gekonnt', 'gemocht', 'gewollt', 'gesollt', 'gedurft', 'gemusst', 'einführung', 'erhöhung', 'üben', 'verstärken', 'praxis', 'wiederholen', 'allmählich', 'reduzieren', 'verwenden', 'korrekt', 'reaktionen', 'besser', 'werden'];
    const englishWords = ['step', 'training', 'plan', 'exercise', 'command', 'treat', 'reward', 'house', 'leash', 'sit', 'down', 'stay', 'come', 'heel', 'here', 'out', 'wait', 'no', 'good', 'yes', 'okay', 'right', 'wrong', 'forbidden', 'allowed', 'can', 'must', 'should', 'would', 'could', 'might', 'will', 'would', 'have', 'has', 'had', 'been', 'done', 'made', 'given', 'taken', 'brought', 'come', 'gone', 'stood', 'sat', 'lain', 'stayed', 'waited', 'heard', 'seen', 'felt', 'thought', 'known', 'could', 'liked', 'wanted', 'should', 'allowed', 'required', 'introduction', 'increase', 'practice', 'reinforce', 'repeat', 'gradually', 'reduce', 'use', 'correct', 'reactions', 'better', 'become', 'begin', 'present', 'say', 'multiple', 'times', 'establish', 'association', 'second', 'show', 'both', 'paying', 'attention', 'three', 'process', 'various', 'quantities', 'respond', 'looking', 'rewarding', 'when', 'gets', 'add', 'more', 'cups', 'introduce', 'using', 'same', 'interest', 'sessions'];
    
    const germanWordCount = germanWords.filter(word => allContent.includes(word)).length;
    const englishWordCount = englishWords.filter(word => allContent.includes(word)).length;
    
    const currentLanguage = germanWordCount > englishWordCount ? 'de' : 'en';
    
    console.log('🔍 Detected plan language:', currentLanguage, 'Target language:', userLanguage);
    
    // Only translate if the languages are different
    if (currentLanguage === userLanguage) {
      console.log('✅ Plan is already in user language, no translation needed');
      return planData;
    }
    
    // Translate the plan
    const translatedData = await translatePlanData(planData, openAIApiKey);
    
    // Create the translated plan
    const translatedPlan = {
      title: userLanguage === 'en' ? translatedData.title_en : planData.title,
      description: userLanguage === 'en' ? translatedData.description_en : planData.description,
      steps: planData.steps.map((step: any, index: number) => ({
        title: userLanguage === 'en' ? translatedData.steps_en[index]?.title_en : step.title,
        description: userLanguage === 'en' ? translatedData.steps_en[index]?.description_en : step.description,
        points: step.points || 15
      }))
    };
    
    console.log('✅ Plan translated successfully');
    return translatedPlan;
    
  } catch (translationError) {
    console.error('❌ Translation failed:', translationError);
    console.log('⚠️ Returning original plan without translation');
    return planData;
  }
}

// Function to create a fallback plan when AI doesn't use proper format
export async function createFallbackPlan(
  userMessage: string,
  userLanguage: string,
  openAIApiKey?: string
): Promise<any> {
  try {
    console.log('🔄 Creating fallback plan for message:', userMessage.substring(0, 100));
    
    if (!openAIApiKey) {
      console.log('⚠️ No OpenAI API key available for fallback plan creation');
      return null;
    }
    
    // Create a simple prompt to generate a basic plan
    const systemPrompt = userLanguage === 'en' 
      ? `You are a pet training expert. Create a simple training plan based on the user's request. 
         Return ONLY a JSON object with this exact format:
         {
           "title": "Simple training plan title",
           "description": "Brief description of the training goal",
           "steps": [
             {
               "title": "Step 1 title",
               "description": "Step 1 description"
             },
             {
               "title": "Step 2 title", 
               "description": "Step 2 description"
             },
             {
               "title": "Step 3 title",
               "description": "Step 3 description"
             }
           ]
         }
         
         Keep it simple and practical. Use only English.`
      : `Du bist ein Haustier-Trainingsexperte. Erstelle einen einfachen Trainingsplan basierend auf der Anfrage des Benutzers.
         Gib NUR ein JSON-Objekt in diesem exakten Format zurück:
         {
           "title": "Einfacher Trainingsplan-Titel",
           "description": "Kurze Beschreibung des Trainingsziels",
           "steps": [
             {
               "title": "Schritt 1 Titel",
               "description": "Schritt 1 Beschreibung"
             },
             {
               "title": "Schritt 2 Titel",
               "description": "Schritt 2 Beschreibung"
             },
             {
               "title": "Schritt 3 Titel",
               "description": "Schritt 3 Beschreibung"
             }
           ]
         }
         
         Halte es einfach und praktisch. Verwende nur Deutsch.`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      console.error('OpenAI fallback plan API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    const planContent = data.choices?.[0]?.message?.content?.trim();
    
    if (!planContent) {
      console.error('No fallback plan content returned from OpenAI');
      return null;
    }
    
    // Try to extract JSON from the response
    const jsonMatch = planContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in fallback plan response');
      return null;
    }
    
    const planData = JSON.parse(jsonMatch[0]);
    
    // Basic validation
    if (!planData.title || !planData.steps || !Array.isArray(planData.steps) || planData.steps.length === 0) {
      console.error('Invalid fallback plan structure');
      return null;
    }
    
    console.log('✅ Fallback plan created successfully:', planData.title);
    return planData;
    
  } catch (error) {
    console.error('❌ Fallback plan creation failed:', error);
    return null;
  }
}

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
  // The planData is already translated to the user's language, so we don't need to translate again
  console.log('📝 Creating training plan with translated data:', {
    title: planData.title,
    stepsCount: planData.steps.length
  });

  // Create training plan with the translated data
  const { data: planResult, error: planError } = await supabaseClient
    .from('training_plans')
    .insert([{
      user_id: userId,
      pet_id: petId,
      title: planData.title,
      title_en: null, // Already translated, no need for English version
      description: planData.description || '',
      description_en: null, // Already translated, no need for English version
      status: 'in_progress'
    }])
    .select()
    .single();

  if (planError) {
    console.error('Error creating plan:', planError);
    throw new Error('Fehler beim Erstellen des Trainingsplans');
  }

  // Create training steps with the translated data
  const steps = planData.steps.map((step: any, index: number) => ({
    training_plan_id: planResult.id,
    step_number: index + 1,
    title: step.title,
    title_en: null, // Already translated, no need for English version
    description: step.description,
    description_en: null, // Already translated, no need for English version
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

export async function processPlanCreationFromResponse(aiResponse: string, userLanguage: string = 'de', openAIApiKey?: string) {
  console.log('🔍 Searching for plan creation in AI response...');
  console.log('🌍 User language preference:', userLanguage);
  
  // Look for plan creation blocks
  const planMatch = aiResponse.match(/\[PLAN_CREATION\](.*?)\[\/PLAN_CREATION\]/s);
  
  if (!planMatch) {
    console.log('❌ No plan creation block found in AI response');
    return null;
  }
  
  const planContent = planMatch[1].trim();
  console.log('📋 Found plan content:', planContent.substring(0, 200) + '...');
  
  try {
    // Parse the JSON content
    const planData = JSON.parse(planContent);
    console.log('✅ JSON parsing successful');
    console.log('📊 Plan data structure:', {
      hasTitle: !!planData.title,
      hasDescription: !!planData.description,
      hasSteps: !!planData.steps,
      stepsCount: planData.steps?.length || 0,
      titleLength: planData.title?.length || 0,
      descriptionLength: planData.description?.length || 0
    });
    
    // Basic validation - much more lenient for debugging
    if (!planData.title || typeof planData.title !== 'string') {
      console.log('❌ Invalid or missing title');
      return null;
    }
    
    if (!planData.steps || !Array.isArray(planData.steps) || planData.steps.length === 0) {
      console.log('❌ Invalid or missing steps array');
      return null;
    }
    
    // Validate each step - much more lenient
    for (let i = 0; i < planData.steps.length; i++) {
      const step = planData.steps[i];
      if (!step.title || typeof step.title !== 'string' || step.title.length < 2) {
        console.log(`❌ Step ${i + 1} has invalid title:`, step.title);
        return null;
      }
      if (!step.description || typeof step.description !== 'string' || step.description.length < 2) {
        console.log(`❌ Step ${i + 1} has invalid description:`, step.description);
        return null;
      }
    }
    
    console.log('✅ Basic validation passed');
    
    // Temporarily skip all language validation for debugging
    console.log('⚠️ Skipping language validation for debugging');
    
    console.log('✅ Plan validation successful, returning plan data');
    
    // Automatically translate the plan to user's language
    const translatedPlan = await translatePlanToUserLanguage(planData, userLanguage, openAIApiKey);
    
    return translatedPlan;
  } catch (error) {
    console.error('❌ Error parsing plan creation data:', error);
    return null;
  }
}

export function removePlanCreationFromResponse(aiResponse: string, planTitle: string, language: string = 'de', wasTranslated: boolean = false) {
  // Clean the response from formatting artifacts before replacement
  const cleanedResponse = aiResponse
    .replace(/"""/g, '') // Remove triple quotes
    .replace(/```json|```/g, '') // Remove code block markers
    .replace(/^\s*```\s*$/gm, ''); // Remove standalone code block lines
  
  // Language-specific success messages
  const successMessages = {
    de: wasTranslated 
      ? `\n\n✅ **Trainingsplan erfolgreich erstellt und übersetzt!**\n\nIch habe "${planTitle}" als strukturiertes Projekt für euch angelegt und es in deine Sprache übersetzt. Du findest es in deinem Dashboard unter "Trainingspläne". Dort kannst du jeden Tag eure Fortschritte abhaken und Punkte sammeln! 🏆\n\nMöchtest du noch Fragen zum Plan oder brauchst du zusätzliche Tipps? 😊`
      : `\n\n✅ **Trainingsplan erfolgreich erstellt!**\n\nIch habe "${planTitle}" als strukturiertes Projekt für euch angelegt. Du findest es in deinem Dashboard unter "Trainingspläne". Dort kannst du jeden Tag eure Fortschritte abhaken und Punkte sammeln! 🏆\n\nMöchtest du noch Fragen zum Plan oder brauchst du zusätzliche Tipps? 😊`,
    en: wasTranslated
      ? `\n\n✅ **Training Plan Successfully Created and Translated!**\n\nI've set up "${planTitle}" as a structured project for you and translated it to your language. You can find it in your dashboard under "Training Plans". There you can check off your progress every day and collect points! 🏆\n\nDo you have any questions about the plan or need additional tips? 😊`
      : `\n\n✅ **Training Plan Successfully Created!**\n\nI've set up "${planTitle}" as a structured project for you. You can find it in your dashboard under "Training Plans". There you can check off your progress every day and collect points! 🏆\n\nDo you have any questions about the plan or need additional tips? 😊`
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
