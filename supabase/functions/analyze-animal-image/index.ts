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

// Enhanced system prompts for professional, humanistic analysis
const getSystemPrompt = (trainerName: string, petData: any, language: string = "de") => {
  // Build detailed pet context for the system prompt
  let petContextSection = "";
  if (petData) {
    const ageInfo = petData.age ? `${petData.age} years` : 
      (petData.birth_date ? `${Math.floor((Date.now() - new Date(petData.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years` : "");
    
    const developmentStage = petData.age ? 
      (petData.age <= 0.5 ? "puppy/kitten" : 
       petData.age <= 1.5 ? "young adult" : 
       petData.age <= 7 ? "adult" : "senior") : "";
    
    petContextSection = language === "en" 
      ? `\n\nPET BACKGROUND INFORMATION:
Name: ${petData.name}
Species: ${petData.species}
Breed: ${petData.breed || "Mixed"}
Age: ${ageInfo}
Development Stage: ${developmentStage}
Behavior Focus: ${petData.behavior_focus || "General training"}
Notes: ${petData.notes || "None provided"}

Use this detailed information to provide more personalized and accurate analysis. Consider the pet's age, breed characteristics, and any specific behavioral focus areas when interpreting the image.`
      : `\n\nTIER-HINTERGRUNDINFORMATIONEN:
Name: ${petData.name}
Art: ${petData.species}
Rasse: ${petData.breed || "Mischling"}
Alter: ${ageInfo}
Entwicklungsphase: ${developmentStage}
Verhaltensfokus: ${petData.behavior_focus || "Allgemeines Training"}
Notizen: ${petData.notes || "Keine angegeben"}

Verwende diese detaillierten Informationen für eine personalisiertere und genauere Analyse. Berücksichtige das Alter des Tieres, Rassenmerkmale und spezifische Verhaltensfokus-Bereiche bei der Interpretation des Bildes.`;
  }

  const basePrompt = language === "en" 
    ? `You are ${trainerName}, a highly experienced pet trainer and behavior expert with over 15 years of experience working with animals of all species.

Your approach is warm, empathetic, and professional. You speak directly to pet owners as a trusted coach and friend, never as an AI or system.

IMPORTANT GUIDELINES:
- Use natural, conversational language without quotation marks or special formatting
- Speak in first person as a trainer, sharing your observations and insights
- Focus on the positive aspects and potential of the animal
- Provide specific, actionable recommendations based on what you observe
- Never make medical diagnoses or health claims
- Use tentative language like "appears to be", "seems to indicate", "might suggest"
- Be encouraging and supportive, emphasizing the human-animal bond
- Consider the pet's specific characteristics (age, breed, behavior focus) in your analysis

ANALYSIS STRUCTURE:
1. Warm, empathetic observation of what you see in the image
2. Assessment of the animal's likely emotional state and body language
3. Specific, positive recommendations for training or interaction
4. Encouraging conclusion that builds confidence

Remember: You're not just analyzing an image - you're helping a pet owner understand and connect with their companion.${petContextSection}`
    : `Du bist ${trainerName}, ein hoch erfahrener Tiertrainer und Verhaltensexperte mit über 15 Jahren Erfahrung im Umgang mit Tieren aller Arten.

Dein Ansatz ist warmherzig, einfühlsam und professionell. Du sprichst direkt mit Tierhaltern als vertrauter Coach und Freund, niemals als KI oder System.

WICHTIGE RICHTLINIEN:
- Verwende natürliche, gesprächige Sprache ohne Anführungszeichen oder besondere Formatierung
- Sprich in der Ich-Form als Trainer und teile deine Beobachtungen und Erkenntnisse mit
- Konzentriere dich auf die positiven Aspekte und das Potenzial des Tieres
- Gib spezifische, umsetzbare Empfehlungen basierend auf deinen Beobachtungen
- Stelle niemals medizinische Diagnosen oder Gesundheitsaussagen
- Verwende vorsichtige Sprache wie "wirkt", "scheint zu zeigen", "könnte darauf hindeuten"
- Sei ermutigend und unterstützend, betone die Mensch-Tier-Beziehung
- Berücksichtige die spezifischen Merkmale des Tieres (Alter, Rasse, Verhaltensfokus) in deiner Analyse

ANALYSE-STRUKTUR:
1. Warme, einfühlsame Beobachtung dessen, was du im Bild siehst
2. Einschätzung des wahrscheinlichen emotionalen Zustands und der Körpersprache
3. Spezifische, positive Empfehlungen für Training oder Interaktion
4. Ermutigender Abschluss, der Vertrauen aufbaut

Denk daran: Du analysierst nicht nur ein Bild - du hilfst einem Tierhalter dabei, seinen Begleiter zu verstehen und eine Verbindung aufzubauen.${petContextSection}`;

  return basePrompt;
};

// Enhanced user prompts for better analysis
const getUserPrompt = (petName: string, petSpecies: string, petData: any, language: string = "de") => {
  // Build detailed pet context for the user prompt
  let petContextInfo = "";
  if (petData) {
    const ageInfo = petData.age ? `${petData.age} years old` : 
      (petData.birth_date ? `${Math.floor((Date.now() - new Date(petData.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old` : "");
    
    petContextInfo = language === "en"
      ? `\n\nAdditional Pet Information:
- Age: ${ageInfo}
- Breed: ${petData.breed || "Mixed"}
- Current Training Focus: ${petData.behavior_focus || "General behavior"}
- Special Notes: ${petData.notes || "None"}

Please consider this background information when analyzing the image.`
      : `\n\nZusätzliche Tierinformationen:
- Alter: ${ageInfo}
- Rasse: ${petData.breed || "Mischling"}
- Aktueller Trainingsfokus: ${petData.behavior_focus || "Allgemeines Verhalten"}
- Besondere Notizen: ${petData.notes || "Keine"}

Bitte berücksichtige diese Hintergrundinformationen bei der Bildanalyse.`;
  }

  return language === "en"
    ? `Please analyze this image of ${petName} (${petSpecies}) with your professional expertise. 

Share your observations about their body language, emotional state, and what this might tell us about their current needs or readiness for training. 

Focus on being encouraging and providing specific, actionable insights that will help their owner understand and work with them effectively.${petContextInfo}`
    : `Bitte analysiere dieses Bild von ${petName} (${petSpecies}) mit deiner professionellen Expertise.

Teile deine Beobachtungen über ihre Körpersprache, den emotionalen Zustand und was uns das über ihre aktuellen Bedürfnisse oder ihre Bereitschaft für Training sagen könnte.

Konzentriere dich darauf, ermutigend zu sein und spezifische, umsetzbare Erkenntnisse zu liefern, die dem Halter helfen, das Tier zu verstehen und effektiv mit ihm zu arbeiten.${petContextInfo}`;
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

// Enhanced plan creation using OpenAI (similar to chat-with-ai)
async function createTrainingPlanFromAnalysis(
  supabaseClient: any,
  userId: string,
  petId: string | null,
  petName: string,
  petSpecies: string,
  analysisResult: any,
  userLanguage: string = "de"
) {
  try {
    console.log("📝 Creating personalized training plan from image analysis for:", petName);

    // Create a comprehensive prompt for plan creation
     const systemPrompt = userLanguage === "en" 
      ? `You are a senior pet training expert with 20+ years of experience. Create a COMPLETELY UNIQUE training plan based on the image analysis provided.
         
         IMPORTANT: Return ONLY the JSON object, no additional text before or after. Use this exact format:
         {
           "title": "Personalized Training Plan: [Unique Title Based on Analysis]",
           "description": "Detailed description of the specific training approach and goals based on the pet's current state",
           "steps": [
             {
               "title": "Module 1: [Unique Title]",
               "description": "[Write a natural, flowing description that includes: what the pet should learn, detailed step-by-step instructions, how often and how long to practice, what equipment is needed, encouraging tips and motivation, and what to avoid. Write this as a natural paragraph, not with rigid section headers.]"
             },
             {
               "title": "Module 2: [Unique Title]",
               "description": "[Completely different module with unique content, techniques, and progression from the previous module. Write as a natural, flowing paragraph covering all the same elements but with different approaches.]"
             },
             {
               "title": "Module 3: [Unique Title]",
               "description": "[Advanced module building on previous progress with new challenges and techniques. Write as a natural, flowing paragraph covering all the same elements but with more advanced approaches.]"
             }
           ]
         }
         
         Requirements:
         - Each module must be COMPLETELY UNIQUE and different from any template
         - Generate specific content based on the analysis and training goal
         - Write descriptions as natural, flowing paragraphs - NO rigid section headers
         - Include all necessary information: goals, instructions, duration, equipment, tips, and what to avoid
         - Make each module progressively more challenging
         - Never use generic template content or rigid formatting
         - Use only English
         - Write in a warm, encouraging, professional tone
         - Return ONLY the JSON object`
      : `Du bist ein erfahrener Tiertrainer mit über 20 Jahren Erfahrung. Erstelle einen KOMPLETT EINZIGARTIGEN Trainingsplan basierend auf der Bildanalyse.
          
          WICHTIG: Gib NUR das JSON-Objekt zurück, keine zusätzlichen Texte davor oder danach. Verwende dieses exakte Format:
         {
           "title": "Personalisierten Trainingsplan: [Einzigartiger Titel basierend auf Analyse]",
           "description": "Detaillierte Beschreibung des spezifischen Trainingsansatzes und der Ziele basierend auf dem aktuellen Zustand des Tieres",
           "steps": [
             {
               "title": "Modul 1: [Einzigartiger Titel]",
               "description": "[Schreibe eine natürliche, fließende Beschreibung, die enthält: was das Tier lernen soll, detaillierte Schritt-für-Schritt-Anweisungen, wie oft und wie lange zu üben, welche Ausrüstung benötigt wird, ermutigende Tipps und Motivation, und was zu vermeiden ist. Schreibe dies als natürlichen Absatz, nicht mit starren Abschnittsüberschriften.]"
             },
             {
               "title": "Modul 2: [Einzigartiger Titel]",
               "description": "[Komplett anderes Modul mit einzigartigem Inhalt, Techniken und Fortschritt vom vorherigen Modul. Schreibe als natürlichen, fließenden Absatz, der alle gleichen Elemente abdeckt, aber mit anderen Ansätzen.]"
             },
             {
               "title": "Modul 3: [Einzigartiger Titel]",
               "description": "[Fortgeschrittenes Modul, das auf dem vorherigen Fortschritt aufbaut mit neuen Herausforderungen und Techniken. Schreibe als natürlichen, fließenden Absatz, der alle gleichen Elemente abdeckt, aber mit fortgeschritteneren Ansätzen.]"
             }
           ]
         }
         
         Anforderungen:
         - Jedes Modul muss KOMPLETT EINZIGARTIG und anders als jede Vorlage sein
         - Generiere spezifischen Inhalt basierend auf der Analyse und dem Trainingsziel
         - Schreibe Beschreibungen als natürliche, fließende Absätze - KEINE starren Abschnittsüberschriften
         - Enthält alle notwendigen Informationen: Ziele, Anweisungen, Dauer, Ausrüstung, Tipps und was zu vermeiden ist
         - Mache jedes Modul progressiv herausfordernder
         - Verwende niemals generischen Vorlagen-Inhalt oder starre Formatierung
         - Verwende nur Deutsch
         - Schreibe in einem warmen, ermutigenden, professionellen Ton
         - Gib NUR das JSON-Objekt zurück`;

         const userPrompt = userLanguage === "en"
       ? `Based on this image analysis of ${petName} (${petSpecies}):
        
        Analysis: ${analysisResult.summary_text}
        Mood: ${analysisResult.mood_estimation}
        Recommendation: ${analysisResult.recommendation}
         Pet Data: ${analysisResult.pet_data_used ? JSON.stringify(analysisResult.pet_data_used) : "No pet data available"}
        
         Create a completely unique, personalized training plan that addresses the pet's current state and needs. The plan should be tailored specifically to this pet's characteristics, current mood, and training goals. Make each module genuinely unique with different approaches, techniques, and progression.`
       : `Basierend auf dieser Bildanalyse von ${petName} (${petSpecies}):
        
        Analyse: ${analysisResult.summary_text}
        Stimmung: ${analysisResult.mood_estimation}
        Empfehlung: ${analysisResult.recommendation}
         Tierdaten: ${analysisResult.pet_data_used ? JSON.stringify(analysisResult.pet_data_used) : "Keine Tierdaten verfügbar"}
        
         Erstelle einen komplett einzigartigen, personalisierten Trainingsplan, der den aktuellen Zustand und die Bedürfnisse des Haustiers berücksichtigt. Der Plan sollte speziell auf die Merkmale dieses Tieres, die aktuelle Stimmung und die Trainingsziele zugeschnitten sein. Mache jedes Modul wirklich einzigartig mit verschiedenen Ansätzen, Techniken und Fortschritten.`;

         console.log("🚀 Sending plan creation request to OpenAI...");
    console.log("📝 Language:", userLanguage);
    console.log("📝 Pet data:", petData ? "Available" : "Not available");
    console.log("📝 System prompt language:", userLanguage === "en" ? "English" : "German");
    console.log("📝 User prompt language:", userLanguage === "en" ? "English" : "German");
    
    const messages = [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
    ];

    // Add timeout protection for plan creation
    const planCreationPromise = callOpenAIStreaming(messages, openAIApiKey!, false);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Plan creation timeout after 30 seconds')), 30000)
    );

    const planContent = await Promise.race([planCreationPromise, timeoutPromise]);

     if (!planContent) {
       console.error("No plan content returned from OpenAI");
       return null;
     }

    // Extract JSON from the response
     const jsonMatch = planContent.match(/\{[\s\S]*\}/);
     if (!jsonMatch) {
      console.error("No JSON found in plan response");
       return null;
     }

     const planData = JSON.parse(jsonMatch[0]);

         // Validate the plan structure
     if (!planData.title || !planData.steps || !Array.isArray(planData.steps) || planData.steps.length === 0) {
      console.error("Invalid plan structure");
       return null;
     }
     
     console.log("✅ Plan structure is valid!");

    // Add language information to plan data for debugging
    console.log("📝 Plan data language check:", {
      title: planData.title,
      description: planData.description?.substring(0, 100) + "...",
      stepsCount: planData.steps.length,
      expectedLanguage: userLanguage
    });

    // Use the createTrainingPlan utility from chat-with-ai
    const createdPlan = await createTrainingPlan(
      supabaseClient,
      userId,
      petId,
      planData,
      openAIApiKey
    );

    console.log("✅ Training plan created successfully from image analysis");
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
    const { image, petName, petSpecies, language = "de", createPlan = false, userId, petId } = await req.json();
    
    if (!image) {
      throw new Error(language === "en" ? "No image provided" : "Kein Bild bereitgestellt");
    }

    // Get user's language preference and pet data
    let userLanguage = "de";
    let petData = null;
    
    console.log("🌍 Language detection - Input language:", language);
    console.log("🌍 Language detection - User ID:", userId);
    
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
        
        // Get detailed pet data if petId is provided
        if (petId) {
          console.log("🔍 Fetching detailed pet data for analysis...");
          const petContextResult = await getPetContext(supabaseClient, petId, userId);
          petData = petContextResult.petData;
          
          if (petData) {
            console.log("✅ Pet data retrieved:", {
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
          userLanguage
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
          console.error("❌ Plan creation returned null, trying fallback plan...");
          
          // Try fallback plan creation
          try {
            const fallbackPlan = await createFallbackPlan(
              `Image analysis for ${petName}: ${result.summary_text}`,
              userLanguage as 'en' | 'de',
              openAIApiKey,
              {
                pets: petData ? [{
                  id: petId,
                  name: petData.name,
                  species: petData.species,
                  breed: petData.breed,
                  ageYears: petData.age,
                  focus: petData.behavior_focus
                }] : [],
                lastActivePetId: petId,
                user: {
                  goals: [`Training based on image analysis: ${result.mood_estimation} mood, ${result.recommendation}`]
                }
              }
            );
            
            if (fallbackPlan) {
              console.log("✅ Fallback plan created successfully");
              const createdFallbackPlan = await createTrainingPlan(
                supabaseClient,
                userId,
                petId,
                fallbackPlan,
                openAIApiKey
              );
              
              if (createdFallbackPlan) {
                result.created_plan = createdFallbackPlan;
                result.plan_creation_success = true;
                result.plan_message = userLanguage === "en" 
                  ? `I've created a training plan called "${createdFallbackPlan.title}" based on this analysis. You can find it in your dashboard under Training Plans.`
                  : `Ich habe basierend auf dieser Analyse einen Trainingsplan namens "${createdFallbackPlan.title}" erstellt. Du findest ihn in deinem Dashboard unter Trainingspläne.`;
                
                result.plan_details = {
                  id: createdFallbackPlan.id,
                  title: createdFallbackPlan.title,
                  description: createdFallbackPlan.description,
                  steps_count: fallbackPlan.steps.length,
                  created_at: createdFallbackPlan.created_at,
                  is_fallback: true
                };
              }
            } else {
              console.error("❌ Fallback plan creation also failed");
              result.plan_creation_error = userLanguage === "en" 
                ? "Failed to create training plan - please try again" 
                : "Trainingsplan konnte nicht erstellt werden - bitte versuche es erneut";
            }
          } catch (fallbackError) {
            console.error("❌ Fallback plan creation failed:", fallbackError);
            result.plan_creation_error = userLanguage === "en" 
              ? "Failed to create training plan - please try again" 
              : "Trainingsplan konnte nicht erstellt werden - bitte versuche es erneut";
          }
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
