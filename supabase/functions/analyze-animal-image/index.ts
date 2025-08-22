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
               "description": "Exercise Goal: [What the pet should learn]\\n\\nStep-by-Step Guide: [Detailed instructions]\\n\\nRepetition & Duration: [time/frequency]\\n\\nRequired Tools & Framework: [equipment and setup]\\n\\nLearning Tips & Motivation: [encouraging advice]\\n\\nAvoid Common Mistakes: [what to watch out for]"
             },
             {
               "title": "Module 2: [Unique Title]",
               "description": "Completely different module with unique content, techniques, and progression from the previous module. Use the same structured format as above."
             },
             {
               "title": "Module 3: [Unique Title]",
               "description": "Advanced module building on previous progress with new challenges and techniques. Use the same structured format as above."
             }
           ]
         }
         
         Requirements:
         - Each module must be UNIQUE and different from any template
         - Generate specific content based on the analysis and training goal
         - Include detailed step-by-step instructions
         - Make each module progressively more challenging
         - Never use generic template content
         - Use only English
         - Structure each step description with clear sections using this EXACT format:
           * Exercise Goal: What the pet should learn
           * Step-by-Step Guide: Detailed instructions
           * Repetition & Duration: How often and how long
           * Required Tools & Framework: Equipment and setup needed
           * Learning Tips & Motivation: Helpful advice and encouragement
           * Avoid Common Mistakes: What to watch out for
         - All sections must be included within the "description" field as a single string
         - Return ONLY the JSON object`
      : `Du bist ein erfahrener Tiertrainer mit über 20 Jahren Erfahrung. Erstelle einen KOMPLETT EINZIGARTIGEN Trainingsplan basierend auf der Bildanalyse.
         
         WICHTIG: Gib NUR das JSON-Objekt zurück, keine zusätzlichen Texte davor oder danach. Verwende dieses exakte Format:
         {
           "title": "Personalisierten Trainingsplan: [Einzigartiger Titel basierend auf Analyse]",
           "description": "Detaillierte Beschreibung des spezifischen Trainingsansatzes und der Ziele basierend auf dem aktuellen Zustand des Tieres",
           "steps": [
             {
               "title": "Modul 1: [Einzigartiger Titel]",
               "description": "Übungsziel: [Was das Tier lernen soll]\\n\\nSchritt-für-Schritt-Anleitung: [Detaillierte Anweisungen]\\n\\nWiederholung & Dauer: [Zeit/Häufigkeit]\\n\\nBenötigte Tools & Framework: [Ausrüstung und Setup]\\n\\nLerntipps & Motivation: [Ermutigende Ratschläge]\\n\\nHäufige Fehler vermeiden: [Worauf zu achten ist]"
             },
             {
               "title": "Modul 2: [Einzigartiger Titel]",
               "description": "Komplett anderes Modul mit einzigartigem Inhalt, Techniken und Fortschritt vom vorherigen Modul. Verwende das gleiche strukturierte Format wie oben."
             },
             {
               "title": "Modul 3: [Einzigartiger Titel]",
               "description": "Fortgeschrittenes Modul, das auf dem vorherigen Fortschritt aufbaut mit neuen Herausforderungen und Techniken. Verwende das gleiche strukturierte Format wie oben."
             }
           ]
         }
         
         Anforderungen:
         - Jedes Modul muss EINZIGARTIG und anders als jede Vorlage sein
         - Generiere spezifischen Inhalt basierend auf der Analyse und dem Trainingsziel
         - Enthält detaillierte Schritt-für-Schritt-Anweisungen
         - Mache jedes Modul progressiv herausfordernder
         - Verwende niemals generischen Vorlagen-Inhalt
         - Verwende nur Deutsch
         - Strukturiere jede Schrittbeschreibung mit klaren Abschnitten:
           * Übungsziel: Was das Tier lernen soll
           * Schritt-für-Schritt-Anleitung: Detaillierte Anweisungen
           * Wiederholung & Dauer: Wie oft und wie lange
           * Benötigte Tools & Framework: Ausrüstung und Setup
           * Lerntipps & Motivation: Hilfreiche Ratschläge und Ermutigung
           * Häufige Fehler vermeiden: Worauf zu achten ist
         - Alle Abschnitte müssen innerhalb des "description" Feldes als einzelner String enthalten sein
         - Gib NUR das JSON-Objekt zurück`;

    const userPrompt = userLanguage === "en"
      ? `Based on this image analysis of ${petName} (${petSpecies}):
         
         Analysis: ${analysisResult.summary_text}
         Mood: ${analysisResult.mood_estimation}
         Recommendation: ${analysisResult.recommendation}
         
         Create a personalized training plan that addresses the pet's current state and needs.`
      : `Basierend auf dieser Bildanalyse von ${petName} (${petSpecies}):
         
         Analyse: ${analysisResult.summary_text}
         Stimmung: ${analysisResult.mood_estimation}
         Empfehlung: ${analysisResult.recommendation}
         
         Erstelle einen personalisierten Trainingsplan, der den aktuellen Zustand und die Bedürfnisse des Haustiers berücksichtigt.`;

    console.log("🚀 Sending plan creation request to OpenAI...");
    
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

    const planContent = await callOpenAIStreaming(messages, openAIApiKey!, false);
    
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
    
    if (userId) {
      try {
        const supabaseClient = createClient(supabaseUrl!, supabaseServiceKey!);
        
        // Get user language preference
        const userEmail = (await supabaseClient.auth.getUser(userId)).data.user?.email;
        if (userEmail) {
          const dbLanguage = await getUserLanguage(supabaseClient, userEmail);
          userLanguage = getFallbackLanguage(language || dbLanguage);
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
        userLanguage = language;
      }
    } else {
      userLanguage = language;
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
      try {
        const supabaseClient = createClient(supabaseUrl!, supabaseServiceKey!);
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
          result.created_plan = createdPlan;
          result.plan_creation_success = true;
          result.plan_message = userLanguage === "en" 
            ? "I've created a personalized training plan based on this analysis. You can find it in your dashboard under Training Plans."
            : "Ich habe basierend auf dieser Analyse einen personalisierten Trainingsplan erstellt. Du findest ihn in deinem Dashboard unter Trainingspläne.";
        }
      } catch (planError) {
        console.error("Error creating plan:", planError);
        result.plan_creation_error = userLanguage === "en" 
          ? "Failed to create training plan" 
          : "Trainingsplan konnte nicht erstellt werden";
      }
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
