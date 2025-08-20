import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// Function to create training plan from analysis
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
    console.log("📝 Creating training plan from image analysis for:", petName);

              // Create a prompt to generate a training plan based on the analysis
     const systemPrompt = userLanguage === "en" 
       ? `You are a pet training expert. Create a COMPLETELY UNIQUE training plan based on the image analysis provided. 
          Generate personalized content that is tailored to the specific training goal and pet characteristics.
         
         IMPORTANT: Return ONLY the JSON object, no additional text before or after. Use this exact format:
         {
           "title": "Custom Training Plan: [Unique Title]",
           "description": "Detailed description of the specific training approach and goals",
           "steps": [
             {
               "title": "Module 1: [Unique Title]",
               "description": "Exercise Goal: [What the pet should learn]\n\nStep-by-Step Guide: [Detailed instructions]\n\n🔁 Repetition & Duration:\nDaily Exercise: [time]\nFrequency: [how often]\nTraining Duration: [how long]\n⚠️ [Important note]\n\n🧰 Required Tools & Framework:\nEquipment:\n[list of items]\nLocation: [where]\nTiming: [when]\nSpecies Adaptation: [specific notes]\n\n🧠 Learning Tips & Motivation:\n• [tip 1]\n• [tip 2]\n• [tip 3]\n• [tip 4]\n\n🚩 Avoid Common Mistakes:\n❌ [mistake 1]\n❌ [mistake 2]\n❌ [mistake 3]\n❌ [mistake 4]"
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
         
         IMPORTANT: 
         - Each module must be UNIQUE and different from any template
         - Generate specific content based on the training goal
         - Include detailed step-by-step instructions
         - Make each module progressively more challenging
         - Never use generic template content
         - Use only English
         - Structure each step description with clear sections using this EXACT format:
           * Exercise Goal: What the pet should learn
           * Step-by-Step Guide: Detailed instructions
           * 🔁 Repetition & Duration: How often and how long
           * 🧰 Required Tools & Framework: Equipment and setup needed
           * 🧠 Learning Tips & Motivation: Helpful advice and encouragement
           * 🚩 Avoid Common Mistakes: What to watch out for
         - IMPORTANT: All sections must be included within the "description" field as a single string, not as separate JSON properties
         - CRITICAL: Do not add any text before or after the JSON object. Return ONLY the JSON.`
       : `Du bist ein Haustier-Trainingsexperte. Erstelle einen KOMPLETT EINZIGARTIGEN Trainingsplan basierend auf der Bildanalyse.
          Generiere personalisierten Inhalt, der auf das spezifische Trainingsziel und die Tiercharakteristika zugeschnitten ist.
          
          WICHTIG: Gib NUR das JSON-Objekt zurück, keine zusätzlichen Texte davor oder danach. Verwende dieses exakte Format:
         {
           "title": "Individueller Trainingsplan: [Einzigartiger Titel]",
           "description": "Detaillierte Beschreibung des spezifischen Trainingsansatzes und der Ziele",
           "steps": [
             {
               "title": "Modul 1: [Einzigartiger Titel]",
               "description": "Übungsziel: [Was das Tier lernen soll]\n\nSchritt-für-Schritt-Anleitung: [Detaillierte Anweisungen]\n\n🔁 Wiederholung & Dauer:\nTägliche Übung: [Zeit]\nHäufigkeit: [wie oft]\nTrainingsdauer: [wie lange]\n⚠️ [Wichtiger Hinweis]\n\n🧰 Benötigte Tools & Rahmenbedingungen:\nAusrüstung:\n[Liste der Gegenstände]\nOrt: [wo]\nZeitpunkt: [wann]\nArtanpassung: [spezifische Hinweise]\n\n🧠 Lerntipps & Motivation:\n• [Tipp 1]\n• [Tipp 2]\n• [Tipp 3]\n• [Tipp 4]\n\n🚩 Häufige Fehler vermeiden:\n❌ [Fehler 1]\n❌ [Fehler 2]\n❌ [Fehler 3]\n❌ [Fehler 4]"
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
         
         WICHTIG:
         - Jedes Modul muss EINZIGARTIG und anders als jede Vorlage sein
         - Generiere spezifischen Inhalt basierend auf dem Trainingsziel
         - Enthält detaillierte Schritt-für-Schritt-Anweisungen
         - Mache jedes Modul progressiv herausfordernder
         - Verwende niemals generischen Vorlagen-Inhalt
         - Verwende nur Deutsch
         - Strukturiere jede Schrittbeschreibung mit klaren Abschnitten:
           * Übungsziel: Was das Tier lernen soll
           * Schritt-für-Schritt-Anleitung: Detaillierte Anweisungen
           * 🔁 Wiederholung & Dauer: Wie oft und wie lange
           * 🧰 Benötigte Tools & Rahmenbedingungen: Ausrüstung und Setup
           * 🧠 Lerntipps & Motivation: Hilfreiche Ratschläge und Ermutigung
           * 🚩 Häufige Fehler vermeiden: Worauf zu achten ist
         - WICHTIG: Alle Abschnitte müssen innerhalb des "description" Feldes als einzelner String enthalten sein, nicht als separate JSON-Eigenschaften
         - KRITISCH: Füge keinen Text vor oder nach dem JSON-Objekt hinzu. Gib NUR das JSON zurück.`;

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
     console.log("📝 System Prompt Length:", systemPrompt.length);
     console.log("📝 User Prompt:", userPrompt);
     
     const response = await fetch("https://api.openai.com/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${openAIApiKey}`,
         "Content-Type": "application/json",
       },
              body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.8, // Add some creativity for unique content
        }),
     });

    if (!response.ok) {
      console.error("OpenAI plan creation API error:", response.status, response.statusText);
      return null;
    }

         const data = await response.json();
     const planContent = data.choices?.[0]?.message?.content?.trim();

     console.log("📄 Raw OpenAI Response:");
     console.log(planContent);
     console.log("📄 Response Length:", planContent?.length || 0);

     if (!planContent) {
       console.error("No plan content returned from OpenAI");
       return null;
     }

         // Try to extract JSON from the response (matching chat-with-ai approach)
     const jsonMatch = planContent.match(/\{[\s\S]*\}/);
     console.log("🔍 JSON Match Result:", jsonMatch ? "✅ Found" : "❌ Not Found");
     
     if (!jsonMatch) {
       console.error("❌ No JSON found in plan response");
       return null;
     }

     console.log("✅ JSON found!");
     console.log("📄 Extracted JSON Length:", jsonMatch[0].length);
     console.log("📄 Extracted JSON Preview:", jsonMatch[0].substring(0, 500) + "...");

     const planData = JSON.parse(jsonMatch[0]);

         // Validate the plan structure
     console.log("🔍 Validating plan structure...");
     console.log("📄 Plan Title:", planData.title);
     console.log("📄 Plan Steps Count:", planData.steps?.length || 0);
     console.log("📄 Plan Steps Array:", Array.isArray(planData.steps));
     
     if (!planData.title || !planData.steps || !Array.isArray(planData.steps) || planData.steps.length === 0) {
       console.error("❌ Invalid plan structure");
       console.log("📄 Plan Data:", JSON.stringify(planData, null, 2));
       return null;
     }
     
     console.log("✅ Plan structure is valid!");

    // Create training plan in database
    const { data: planResult, error: planError } = await supabaseClient
      .from("training_plans")
      .insert([
        {
          user_id: userId,
          pet_id: petId,
          title: planData.title,
          title_en: null,
          description: planData.description || "",
          description_en: null,
          status: "in_progress",
          is_ai_generated: true,
        },
      ])
      .select()
      .single();

    if (planError) {
      console.error("Error creating plan:", planError);
      return null;
    }

              // Create training steps (simplified - just save with is_ai_generated = true)
     console.log("🔍 Creating training steps...");
     const steps = planData.steps.map((step: any, index: number) => {
       console.log(`📋 Step ${index + 1}: ${step.title}`);
       
       return {
         training_plan_id: planResult.id,
         step_number: index + 1,
         title: step.title,
         title_en: null,
         description: step.description,
         description_en: null,
         points_reward: step.points || 15,
         is_ai_generated: true,
         // Set structured sections to null for now (will be parsed by frontend)
         exercise_goal: null,
         exercise_goal_en: null,
         step_by_step_guide: null,
         step_by_step_guide_en: null,
         repetition_duration: null,
         repetition_duration_en: null,
         required_tools: null,
         required_tools_en: null,
         learning_tips: null,
         learning_tips_en: null,
         common_mistakes: null,
         common_mistakes_en: null
       };
     });

         const { error: stepsError } = await supabaseClient
       .from("training_steps")
       .insert(steps);

     if (stepsError) {
       console.error("Error creating steps:", stepsError);
       return null;
     }

     console.log("✅ Training plan created successfully from image analysis with is_ai_generated = true");
     return planResult;
  } catch (error) {
    console.error("❌ Error creating training plan from analysis:", error);
    return null;
  }
}

serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { image, petName, petSpecies, language: language1 = "de", createPlan = false, userId, petId } = await req.json();
    if (!image) {
      throw new Error(language1 === "en" ? "No image provided" : "Kein Bild bereitgestellt");
    }
    // Language-specific prompts and responses
    const prompts = {
      de: {
        systemPrompt: `Du bist ein erfahrener Tiertrainer und Verhaltensexperte mit 20 Jahren Erfahrung. 
        
        Deine Aufgabe ist es, auf Basis eines hochgeladenen Tierbilds die Körpersprache und den möglichen emotionalen Zustand des Tieres zu analysieren – einfühlsam, verständlich und niemals bewertend.

        Du sprichst IMMER in der Ich-Form als Trainer, niemals als KI oder System.
        
        WICHTIGE FORMATREGELN:
        - Verwende NIEMALS Anführungszeichen in deiner Antwort
        - Schreibe in natürlichen, fließenden Sätzen
        - Keine direkten Zitate oder markierte Begriffe
        - Sprich direkt und persönlich
        
        Wichtige Regeln:
        - Keine medizinischen Diagnosen oder Gesundheitsaussagen
        - Keine absoluten Behauptungen, nutze "wirkt", "scheint", "könnte darauf hindeuten"
        - Empathischer, motivierender Tonfall
        - Konkrete, umsetzbare Empfehlungen
        - Fokus auf das Positive und die Mensch-Tier-Beziehung

        Analysiere das Bild und gib eine strukturierte Antwort zurück mit:
        1. Eine warme, einfühlsame Beschreibung dessen, was du siehst
        2. Eine Einschätzung der wahrscheinlichen Stimmung/des Zustands
        3. Eine konkrete, positive Empfehlung für den nächsten Schritt
        4. Optional einen motivierenden Abschluss

        Beispielstil: Auf dem Bild wirkt ${petName} aufmerksam und leicht angespannt. Die Ohren sind nach vorn gerichtet, der Blick ist fokussiert – das zeigt mir, dass ${petName} wahrscheinlich einen interessanten Reiz wahrgenommen hat. Ich empfehle eine ruhige Übung zur Impulskontrolle...`,
        userPrompt: `Bitte analysiere dieses Bild von ${petName} (${petSpecies}). Gib mir eine einfühlsame Einschätzung der Körpersprache, Stimmung und konkrete Empfehlungen für das Training oder den Umgang. Verwende dabei keine Anführungszeichen und schreibe in natürlichen, fließenden Sätzen.`,
        moodKeywords: {
          entspannt: [
            "entspannt",
            "ruhig",
            "gelassen",
            "zufrieden"
          ],
          aufmerksam: [
            "aufmerksam",
            "fokussiert",
            "konzentriert",
            "wachsam"
          ],
          angespannt: [
            "angespannt",
            "gestresst",
            "nervös",
            "unruhig"
          ],
          verspielt: [
            "verspielt",
            "fröhlich",
            "lebhaft",
            "aktiv"
          ],
          ängstlich: [
            "ängstlich",
            "unsicher",
            "zurückhaltend",
            "schüchtern"
          ]
        },
        recommendations: {
          entspannt: "Perfekter Moment für eine neue, leichte Übung oder einfach gemeinsame Kuschelzeit.",
          aufmerksam: "Ideal für Fokus-Training oder eine kontrollierte Begegnung mit neuen Reizen.",
          angespannt: "Entspannungsübungen und Rückzugsmöglichkeiten wären jetzt hilfreich.",
          verspielt: "Zeit für aktives Spiel oder körperliche Herausforderungen!",
          ängstlich: "Vertrauensbildende Übungen und eine ruhige Umgebung sind wichtig."
        },
        followupSuggestion: "Möchtest du, dass ich dir einen passenden Trainingsplan dafür erstelle?"
      },
      en: {
        systemPrompt: `You are an experienced pet trainer and behavior expert with 20 years of experience.
        
        Your task is to analyze the body language and possible emotional state of the animal based on an uploaded pet image – empathetically, understandably, and never judgmentally.

        You ALWAYS speak in the first person as a trainer, never as AI or a system.
        
        IMPORTANT FORMAT RULES:
        - NEVER use quotation marks in your response
        - Write in natural, flowing sentences
        - No direct quotes or marked terms
        - Speak directly and personally
        
        Important rules:
        - No medical diagnoses or health statements
        - No absolute claims, use "appears", "seems", "might indicate"
        - Empathetic, motivating tone
        - Concrete, actionable recommendations
        - Focus on the positive and the human-animal relationship

        Analyze the image and provide a structured response with:
        1. A warm, empathetic description of what you see
        2. An assessment of the likely mood/state
        3. A concrete, positive recommendation for the next step
        4. Optionally a motivating conclusion

        Example style: In the image, ${petName} appears attentive and slightly tense. The ears are forward, the gaze is focused – this shows me that ${petName} has likely perceived an interesting stimulus. I recommend a calm impulse control exercise...`,
        userPrompt: `Please analyze this image of ${petName} (${petSpecies}). Give me an empathetic assessment of the body language, mood, and concrete recommendations for training or handling. Do not use quotation marks and write in natural, flowing sentences.`,
        moodKeywords: {
          relaxed: [
            "relaxed",
            "calm",
            "peaceful",
            "content"
          ],
          attentive: [
            "attentive",
            "focused",
            "concentrated",
            "alert"
          ],
          tense: [
            "tense",
            "stressed",
            "nervous",
            "restless"
          ],
          playful: [
            "playful",
            "happy",
            "lively",
            "active"
          ],
          anxious: [
            "anxious",
            "uncertain",
            "reserved",
            "shy"
          ]
        },
        recommendations: {
          relaxed: "Perfect moment for a new, light exercise or simply some cuddle time together.",
          attentive: "Ideal for focus training or a controlled encounter with new stimuli.",
          tense: "Relaxation exercises and retreat opportunities would be helpful now.",
          playful: "Time for active play or physical challenges!",
          anxious: "Trust-building exercises and a quiet environment are important."
        },
        followupSuggestion: "Would you like me to create a suitable training plan for this?"
      }
    };
    const currentPrompts = prompts[language1] || prompts.de;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content: currentPrompts.systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: currentPrompts.userPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_completion_tokens: 2000
      })
    });
    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }
    const data = await response.json();
    let analysisText = data.choices[0].message.content;
    // Clean up the analysis text to remove unwanted formatting
    analysisText = analysisText.replace(/^["'`]+|["'`]+$/g, "") // Remove quotes at start/end
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
    // Extract mood estimation from the analysis using language-specific keywords
    const moodKeywords = currentPrompts.moodKeywords;
    let detectedMood = language1 === "en" ? "attentive" : "aufmerksam";
         for (const [mood, keywords] of Object.entries(moodKeywords)){
       if ((keywords as string[]).some((keyword)=>analysisText.toLowerCase().includes(keyword))) {
         detectedMood = mood;
         break;
       }
     }
    // Generate a training recommendation based on the mood
    const recommendations = currentPrompts.recommendations;
    const recommendation = recommendations[detectedMood] || (language1 === "en" ? "I recommend observing the current behavior and adjusting training accordingly." : "Ich empfehle, das aktuelle Verhalten zu beobachten und das Training entsprechend anzupassen.");
         const result: any = {
       summary_text: analysisText,
       mood_estimation: detectedMood,
       recommendation: recommendation,
       followup_suggestion: currentPrompts.followupSuggestion,
       confidence_level: language1 === "en" ? "high" : "hoch"
     };

    // If plan creation is requested, create a training plan
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
          language1
        );
        
        if (createdPlan) {
          result.created_plan = createdPlan;
          result.plan_creation_success = true;
        }
      } catch (planError) {
        console.error("Error creating plan:", planError);
        result.plan_creation_error = "Failed to create training plan";
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
         const errorMessage = language1 === "en" ? "Image analysis failed" : "Bildanalyse fehlgeschlagen";
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
