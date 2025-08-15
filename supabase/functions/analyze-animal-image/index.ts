import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { image, petName, petSpecies, language: language1 = "de" } = await req.json();
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
      if (keywords.some((keyword)=>analysisText.toLowerCase().includes(keyword))) {
        detectedMood = mood;
        break;
      }
    }
    // Generate a training recommendation based on the mood
    const recommendations = currentPrompts.recommendations;
    const recommendation = recommendations[detectedMood] || (language1 === "en" ? "I recommend observing the current behavior and adjusting training accordingly." : "Ich empfehle, das aktuelle Verhalten zu beobachten und das Training entsprechend anzupassen.");
    const result = {
      summary_text: analysisText,
      mood_estimation: detectedMood,
      recommendation: recommendation,
      followup_suggestion: currentPrompts.followupSuggestion,
      confidence_level: language1 === "en" ? "high" : "hoch"
    };
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
