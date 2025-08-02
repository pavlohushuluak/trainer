
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
  }
) {
  const { data: planResult, error: planError } = await supabaseClient
    .from('training_plans')
    .insert([{
      user_id: userId,
      pet_id: petId,
      title: planData.title,
      description: planData.description || '',
      status: 'in_progress'
    }])
    .select()
    .single();

  if (planError) {
    console.error('Error creating plan:', planError);
    throw new Error('Fehler beim Erstellen des Trainingsplans');
  }

  // Create training steps
  const steps = planData.steps.map((step: any, index: number) => ({
    training_plan_id: planResult.id,
    step_number: index + 1,
    title: step.title,
    description: step.description,
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

export function processPlanCreationFromResponse(aiResponse: string) {
  const planMatch = aiResponse.match(/\[PLAN_CREATION\](.*?)\[\/PLAN_CREATION\]/s);
  if (planMatch) {
    try {
      // Clean the JSON content from formatting artifacts
      const jsonContent = planMatch[1]
        .trim()
        .replace(/```json|```/g, '') // Remove code block markers
        .replace(/"""/g, '') // Remove triple quotes
        .replace(/^\s*```\s*$/gm, '') // Remove standalone code block lines
        .trim();
      
      // Validate JSON structure before parsing
      if (!jsonContent.includes('"title"') || !jsonContent.includes('"steps"')) {
        console.warn('⚠️ Plan creation block missing required fields');
        return null;
      }
      
      const planData = JSON.parse(jsonContent);
      
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
      
      return planData;
    } catch (error) {
      console.error('❌ Error parsing plan creation data:', error);
      return null;
    }
  }
  return null;
}

export function removePlanCreationFromResponse(aiResponse: string, planTitle: string) {
  // Clean the response from formatting artifacts before replacement
  const cleanedResponse = aiResponse
    .replace(/"""/g, '') // Remove triple quotes
    .replace(/```json|```/g, '') // Remove code block markers
    .replace(/^\s*```\s*$/gm, ''); // Remove standalone code block lines
    
  return cleanedResponse.replace(/\[PLAN_CREATION\].*?\[\/PLAN_CREATION\]/s, 
    `\n\n✅ **Trainingsplan erfolgreich erstellt!**\n\nIch habe "${planTitle}" als strukturiertes Projekt für euch angelegt. Du findest es in deinem Dashboard unter "Trainingspläne". Dort kannst du jeden Tag eure Fortschritte abhaken und Punkte sammeln! 🏆\n\nMöchtest du noch Fragen zum Plan oder brauchst du zusätzliche Tipps? 😊`);
}

export function cleanupFailedPlanCreation(aiResponse: string) {
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
  
  // If the response is now empty or very short, provide a fallback
  if (cleanedResponse.trim().length < 20) {
    return "\n\n😊 Entschuldige, beim Erstellen des Trainingsplans gab es ein kleines Problem. Lass mich das nochmal für dich versuchen - magst du mir kurz sagen, woran ihr arbeiten möchtet?";
  }
  
  return cleanedResponse;
}
