import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Import utilities from chat-with-ai
import { createTrainingPlan, createFallbackPlan } from './utils/planCreation.ts';
import { callOpenAIStreaming } from './utils/openaiStreaming.ts';
import { cleanStructuredResponse } from './utils/responseCleaner.ts';
import { getUserLanguage, getFallbackLanguage } from './utils/languageSupport.ts';
import { getPetContext } from './utils/petContext.ts';

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

// Professional trainer team for personalized responses
const trainerTeam = [
  { firstName: "Marc", lastName: "W.", specialty: "Hunde, Grundgehorsam", experience: "15 Jahre" },
  { firstName: "Lisa", lastName: "M.", specialty: "Katzen, Verhaltensprobleme", experience: "12 Jahre" },
  { firstName: "Tom", lastName: "B.", specialty: "Hunde, Aggression", experience: "18 Jahre" },
  { firstName: "Anna", lastName: "K.", specialty: "Welpen, Sozialisation", experience: "10 Jahre" },
  { firstName: "Max", lastName: "S.", specialty: "Exotische Tiere", experience: "14 Jahre" },
  { firstName: "Nina", lastName: "H.", specialty: "Pferde, Training", experience: "16 Jahre" },
  { firstName: "Paul", lastName: "L.", specialty: "Alte Tiere, Rehabilitation", experience: "20 Jahre" }
];

// Natural, conversational prompts for human-like analysis
const getSystemPrompt = (trainerName: string, petData: any, language: string = "de") => {
  // Build natural pet context
  let petContextSection = "";
  if (petData) {
    const ageInfo = petData.age ? `${petData.age} years` : 
      (petData.birth_date ? `${Math.floor((Date.now() - new Date(petData.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years` : "");
    
    petContextSection = language === "en" 
      ? `\n\nI know this is ${petData.name}, a ${petData.species}${petData.breed ? ` (${petData.breed})` : ""} who's about ${ageInfo} old. ${petData.behavior_focus ? `They're currently working on ${petData.behavior_focus}.` : ""} ${petData.notes ? `I also know that ${petData.notes}` : ""}`
      : `\n\nIch weiß, das ist ${petData.name}, ein ${petData.species}${petData.breed ? ` (${petData.breed})` : ""} der etwa ${ageInfo} alt ist. ${petData.behavior_focus ? `Sie arbeiten derzeit an ${petData.behavior_focus}.` : ""} ${petData.notes ? `Ich weiß auch, dass ${petData.notes}` : ""}`;
  }

  const basePrompt = language === "en" 
    ? `Hi, I'm ${trainerName}. I've been working with animals for over 15 years, and I love helping pet owners understand their companions better.

When I look at this image, I'll share what I see in a natural, conversational way - just like I would if we were sitting together and you showed me this photo. I'll tell you what I notice about their body language, how they seem to be feeling, and give you some practical tips that might help.

I won't use any fancy formatting or technical jargon - just clear, friendly advice from someone who's been there.${petContextSection}`
    : `Hallo, ich bin ${trainerName}. Ich arbeite seit über 15 Jahren mit Tieren und helfe gerne Tierhaltern dabei, ihre Begleiter besser zu verstehen.

Wenn ich mir dieses Bild ansehe, teile ich mit dir, was ich sehe - ganz natürlich und gesprächig, so als würden wir zusammen sitzen und du mir dieses Foto zeigen. Ich erzähle dir, was ich an ihrer Körpersprache bemerke, wie sie sich zu fühlen scheinen, und gebe dir praktische Tipps, die helfen könnten.

Ich verwende keine komplizierte Formatierung oder Fachjargon - nur klare, freundliche Ratschläge von jemandem, der schon viel Erfahrung gesammelt hat.${petContextSection}`;

  return basePrompt;
};

// Natural user prompts for conversational analysis
const getUserPrompt = (petName: string, petSpecies: string, petData: any, language: string = "de") => {
  return language === "en"
    ? `Can you take a look at this photo of ${petName}? I'd love to hear what you see - their body language, how they seem to be feeling, and any tips you might have for working with them.`
    : `Kannst du dir dieses Foto von ${petName} ansehen? Ich würde gerne hören, was du siehst - ihre Körpersprache, wie sie sich zu fühlen scheinen, und alle Tipps, die du für die Arbeit mit ihnen haben könntest.`;
};

// Enhanced mood detection with more nuanced categories
const detectMood = (analysisText: string, language: string = "de") => {
  const lowerText = analysisText.toLowerCase();
  
  const moodKeywords = language === "en" 
    ? {
        relaxed: ["relaxed", "calm", "peaceful", "content", "at ease", "comfortable"],
        attentive: ["attentive", "focused", "alert", "engaged", "curious", "interested"],
        excited: ["excited", "enthusiastic", "energetic", "playful", "happy", "lively"],
        anxious: ["anxious", "nervous", "worried", "uncertain", "tentative", "cautious"],
        stressed: ["stressed", "tense", "agitated", "uncomfortable", "distressed"],
        confident: ["confident", "assured", "bold", "self-assured", "comfortable"]
      }
    : {
        entspannt: ["entspannt", "ruhig", "gelassen", "zufrieden", "behaglich", "komfortabel"],
        aufmerksam: ["aufmerksam", "fokussiert", "wachsam", "engagiert", "neugierig", "interessiert"],
        aufgeregt: ["aufgeregt", "begeistert", "energisch", "verspielt", "fröhlich", "lebhaft"],
        ängstlich: ["ängstlich", "nervös", "besorgt", "unsicher", "zögerlich", "vorsichtig"],
        gestresst: ["gestresst", "angespannt", "unruhig", "unbehaglich", "verstört"],
        selbstbewusst: ["selbstbewusst", "sicher", "mutig", "selbstsicher", "komfortabel"]
      };

  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return mood;
    }
  }
  
  return language === "en" ? "attentive" : "aufmerksam"; // Default
};

// Enhanced recommendations based on mood
const getRecommendation = (mood: string, language: string = "de") => {
  const recommendations = language === "en"
    ? {
        relaxed: "Perfect time for gentle training or simply enjoying quiet bonding moments together.",
        attentive: "Ideal for introducing new exercises or working on focus and concentration skills.",
        excited: "Great energy for active play sessions or high-energy training activities!",
        anxious: "Focus on building confidence through gentle, predictable interactions and positive reinforcement.",
        stressed: "Prioritize creating a calm, safe environment and avoid pushing training boundaries right now.",
        confident: "Excellent opportunity to challenge with new skills or more advanced training exercises."
      }
    : {
        entspannt: "Perfekter Zeitpunkt für sanftes Training oder einfach ruhige Momente der Verbindung genießen.",
        aufmerksam: "Ideal für neue Übungen oder Arbeit an Fokus- und Konzentrationsfähigkeiten.",
        aufgeregt: "Tolle Energie für aktive Spielsessions oder energiegeladene Trainingsaktivitäten!",
        ängstlich: "Fokus auf Vertrauensaufbau durch sanfte, vorhersehbare Interaktionen und positive Verstärkung.",
        gestresst: "Priorisiere eine ruhige, sichere Umgebung und vermeide es, Trainingsgrenzen jetzt zu überschreiten.",
        selbstbewusst: "Ausgezeichnete Gelegenheit für neue Fähigkeiten oder fortgeschrittene Trainingsübungen."
      };

  return recommendations[mood] || (language === "en" 
    ? "I recommend observing the current behavior and adjusting training accordingly." 
    : "Ich empfehle, das aktuelle Verhalten zu beobachten und das Training entsprechend anzupassen.");
};

// Enhanced plan creation using the proper utility function
async function createTrainingPlanFromAnalysis(
  supabaseClient: any,
  userId: string,
  petId: string | null,
  petName: string,
  petSpecies: string,
  analysisResult: any,
  userLanguage: string = "de",
  petData?: any
) {
  try {
    console.log("📝 Creating personalized training plan from image analysis for:", petName);

    // Build the user message for plan creation
    const userMessage = userLanguage === "en"
      ? `I just looked at a photo of ${petName} and here's what I noticed: ${analysisResult.summary_text}
        
They seem to be in a ${analysisResult.mood_estimation} mood, and I think ${analysisResult.recommendation}
        
Can you help me create a training plan that would work well for them right now? I want it to feel natural and build on what I observed.`
      : `Ich habe mir gerade ein Foto von ${petName} angesehen und hier ist, was mir aufgefallen ist: ${analysisResult.summary_text}
        
Sie scheinen in einer ${analysisResult.mood_estimation} Stimmung zu sein, und ich denke ${analysisResult.recommendation}
        
Kannst du mir helfen, einen Trainingsplan zu erstellen, der gut für sie funktionieren würde? Ich möchte, dass er sich natürlich anfühlt und auf dem aufbaut, was ich beobachtet habe.`;

    // Prepare memory context for the plan creation
    const memoryContext = {
      pets: petData ? [{
        id: petId || undefined,
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        ageYears: petData.age,
        focus: petData.behavior_focus
      }] : [],
      lastActivePetId: petId || undefined,
      user: {
        goals: [`Training based on image analysis showing ${analysisResult.mood_estimation} mood`]
      }
    };

    console.log("🚀 Creating plan using createFallbackPlan utility...");
    console.log("📝 Language:", userLanguage);
    console.log("📝 Pet data:", petData ? "Available" : "Not available");
    console.log("📝 Memory context:", memoryContext);

    // Use the createFallbackPlan utility which handles all the complex logic
    const planData = await createFallbackPlan(
      userMessage,
      userLanguage as 'en' | 'de',
      openAIApiKey,
      memoryContext
    );

    if (!planData) {
      console.error("❌ Failed to create plan using createFallbackPlan");
       return null;
     }

    console.log("✅ Plan created successfully using createFallbackPlan:", {
          title: planData.title,
      stepsCount: planData.steps.length
    });

    // Use the createTrainingPlan utility to save to database
    const createdPlan = await createTrainingPlan(
      supabaseClient,
      userId,
      petId,
      planData,
      openAIApiKey
    );

    console.log("✅ Training plan saved to database successfully");
    return createdPlan;
  } catch (error) {
    console.error("❌ Error creating training plan from analysis:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { image, petName, petSpecies, language = "de", createPlan = false, userId, petId, petProfile } = await req.json();
    
    if (!image) {
      throw new Error(language === "en" ? "No image provided" : "Kein Bild bereitgestellt");
    }

    // Get user's language preference and pet data
    let userLanguage = "de";
    let petData = null;
    
    console.log("🌍 Language detection - Input language:", language);
    console.log("🌍 Language detection - User ID:", userId);
    console.log("📋 Pet profile data received:", petProfile ? "Yes" : "No");
    
    if (userId) {
      try {
        const supabaseClient = createClient(supabaseUrl!, supabaseServiceKey!);
        
        // Get user language preference
        const userEmail = (await supabaseClient.auth.getUser(userId)).data.user?.email;
        console.log("🌍 Language detection - User email:", userEmail);
        
        if (userEmail) {
          const dbLanguage = await getUserLanguage(supabaseClient, userEmail);
          console.log("🌍 Language detection - DB language:", dbLanguage);
          userLanguage = getFallbackLanguage(language || dbLanguage);
          console.log("🌍 Language detection - Final language:", userLanguage);
        } else {
          console.log("🌍 Language detection - No user email found, using provided language");
          userLanguage = getFallbackLanguage(language);
        }
        
        // Use provided petProfile data if available, otherwise fetch from database
        if (petProfile && petProfile.id) {
          console.log("✅ Using provided pet profile data:", {
            name: petProfile.name,
            species: petProfile.species,
            breed: petProfile.breed,
            age: petProfile.age,
            behavior_focus: petProfile.behavior_focus
          });
          petData = petProfile;
        } else if (petId) {
          console.log("🔍 Fetching detailed pet data from database...");
          const petContextResult = await getPetContext(supabaseClient, petId, userId);
          petData = petContextResult.petData;
          
          if (petData) {
            console.log("✅ Pet data retrieved from database:", {
              name: petData.name,
              species: petData.species,
              breed: petData.breed,
              age: petData.age,
              behavior_focus: petData.behavior_focus
            });
          } else {
            console.log("⚠️ No pet data found for petId:", petId);
          }
        }
      } catch (error) {
        console.log("Could not fetch user language or pet data, using provided values");
        console.log("🌍 Language detection - Error:", error.message);
        userLanguage = getFallbackLanguage(language);
        console.log("🌍 Language detection - Fallback language:", userLanguage);
      }
    } else {
      console.log("🌍 Language detection - No user ID, using provided language");
      userLanguage = getFallbackLanguage(language);
      console.log("🌍 Language detection - Final language:", userLanguage);
    }

    // Select a trainer for personalized response
    const selectedTrainer = trainerTeam[Math.floor(Math.random() * trainerTeam.length)];
    const trainerName = `${selectedTrainer.firstName} ${selectedTrainer.lastName}`;

    // Generate system and user prompts with detailed pet data
    const systemPrompt = getSystemPrompt(trainerName, petData, userLanguage);
    const userPrompt = getUserPrompt(petName, petSpecies, petData, userLanguage);

    console.log("🔍 Starting image analysis with trainer:", trainerName);

    // Call OpenAI for analysis
    const messages = [
          {
            role: "system",
        content: systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
            text: userPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
    ];

    const analysisText = await callOpenAIStreaming(messages, openAIApiKey!, false);
    
    if (!analysisText) {
      throw new Error(userLanguage === "en" ? "Failed to analyze image" : "Bildanalyse fehlgeschlagen");
    }

    // Clean up the analysis text
    const cleanedAnalysis = cleanStructuredResponse(analysisText);

    // Detect mood and generate recommendation
    const detectedMood = detectMood(cleanedAnalysis, userLanguage);
    const recommendation = getRecommendation(detectedMood, userLanguage);

         const result: any = {
      summary_text: cleanedAnalysis,
       mood_estimation: detectedMood,
       recommendation: recommendation,
      trainer_name: trainerName,
      trainer_specialty: selectedTrainer.specialty,
      confidence_level: userLanguage === "en" ? "high" : "hoch",
      original_image: image, // Store the original image for plan creation
      pet_data_used: petData ? {
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        age: petData.age,
        behavior_focus: petData.behavior_focus,
        development_stage: petData.age ? 
          (petData.age <= 0.5 ? "puppy/kitten" : 
           petData.age <= 1.5 ? "young adult" : 
           petData.age <= 7 ? "adult" : "senior") : "unknown"
      } : null
    };

    // Create training plan if requested
    if (createPlan && userId && petId) {
      console.log("🎯 Creating training plan from image analysis...");
      console.log("📋 Plan creation parameters:", {
        userId,
        petId,
        petName,
        petSpecies,
        hasPetData: !!petData,
        userLanguage,
        mood: detectedMood,
        recommendation
      });
      
      try {
        const supabaseClient = createClient(supabaseUrl!, supabaseServiceKey!);
        
        // Enhanced plan creation with better error handling
        const createdPlan = await createTrainingPlanFromAnalysis(
          supabaseClient,
          userId,
          petId,
          petName,
          petSpecies,
          result,
          userLanguage,
          petData
        );
        
        if (createdPlan) {
          console.log("✅ Training plan created successfully:", {
            planId: createdPlan.id,
            planTitle: createdPlan.title,
            stepsCount: createdPlan.steps?.length || 0
          });
          
          result.created_plan = createdPlan;
          result.plan_creation_success = true;
          result.plan_message = userLanguage === "en" 
            ? `I've created a personalized training plan called "${createdPlan.title}" based on this analysis. You can find it in your dashboard under Training Plans.`
            : `Ich habe basierend auf dieser Analyse einen personalisierten Trainingsplan namens "${createdPlan.title}" erstellt. Du findest ihn in deinem Dashboard unter Trainingspläne.`;
          
          // Add plan details for frontend
          result.plan_details = {
            id: createdPlan.id,
            title: createdPlan.title,
            description: createdPlan.description,
            steps_count: createdPlan.steps?.length || 0,
            created_at: createdPlan.created_at
          };
        } else {
          console.error("❌ Plan creation failed");
          result.plan_creation_error = userLanguage === "en" 
            ? "Failed to create training plan - please try again" 
            : "Trainingsplan konnte nicht erstellt werden - bitte versuche es erneut";
        }
      } catch (planError) {
        console.error("❌ Error creating training plan:", planError);
        result.plan_creation_error = userLanguage === "en" 
          ? `Failed to create training plan: ${planError.message}` 
          : `Trainingsplan konnte nicht erstellt werden: ${planError.message}`;
        result.plan_creation_details = {
          error: planError.message,
          stack: planError.stack
        };
      }
    } else if (createPlan) {
      console.log("⚠️ Plan creation requested but missing required parameters:", {
        hasUserId: !!userId,
        hasPetId: !!petId,
        createPlan
      });
      result.plan_creation_error = userLanguage === "en" 
        ? "Cannot create plan: Missing user ID or pet ID" 
        : "Plan kann nicht erstellt werden: Benutzer-ID oder Tier-ID fehlt";
    }

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error in analyze-animal-image function:", error);
    
    const errorMessage = language === "en" ? "Image analysis failed" : "Bildanalyse fehlgeschlagen";
    return new Response(JSON.stringify({
      error: errorMessage,
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
