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
// Function to parse training content and extract structured sections
function parseTrainingContent(content: string) {
  const sections = {
    exerciseGoal: '',
    stepByStepGuide: '',
    repetitionDuration: '',
    requiredTools: '',
    learningTips: '',
    commonMistakes: ''
  };

  if (!content) return sections;

  // Split content into lines and clean them
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  let currentSection = '';
  let sectionContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();
    
    // Check for section headers
    if (lowerLine.includes('exercise goal:') || lowerLine.includes('übungsziel:')) {
      // Save previous section content
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection as keyof typeof sections] = sectionContent.join('\n').trim();
      }
      currentSection = 'exerciseGoal';
      sectionContent = [];
      // Get the content after the colon
      const afterColon = line.substring(line.indexOf(':') + 1).trim();
      if (afterColon) {
        sectionContent.push(afterColon);
      }
      continue;
    }
    
    if (lowerLine.includes('step-by-step guide:') || lowerLine.includes('schritt-für-schritt-anleitung:')) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection as keyof typeof sections] = sectionContent.join('\n').trim();
      }
      currentSection = 'stepByStepGuide';
      sectionContent = [];
      const afterColon = line.substring(line.indexOf(':') + 1).trim();
      if (afterColon) {
        sectionContent.push(afterColon);
      }
      continue;
    }
    
    if (lowerLine.includes('🔁 repetition & duration:') || lowerLine.includes('🔁 wiederholung & dauer:')) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection as keyof typeof sections] = sectionContent.join('\n').trim();
      }
      currentSection = 'repetitionDuration';
      sectionContent = [];
      const afterColon = line.substring(line.indexOf(':') + 1).trim();
      if (afterColon) {
        sectionContent.push(afterColon);
      }
      continue;
    }
    
    if (lowerLine.includes('🧰 required tools & framework:') || lowerLine.includes('🧰 benötigte tools & rahmenbedingungen:')) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection as keyof typeof sections] = sectionContent.join('\n').trim();
      }
      currentSection = 'requiredTools';
      sectionContent = [];
      const afterColon = line.substring(line.indexOf(':') + 1).trim();
      if (afterColon) {
        sectionContent.push(afterColon);
      }
      continue;
    }
    
    if (lowerLine.includes('🧠 learning tips & motivation:') || lowerLine.includes('🧠 lerntipps & motivation:')) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection as keyof typeof sections] = sectionContent.join('\n').trim();
      }
      currentSection = 'learningTips';
      sectionContent = [];
      const afterColon = line.substring(line.indexOf(':') + 1).trim();
      if (afterColon) {
        sectionContent.push(afterColon);
      }
      continue;
    }
    
    if (lowerLine.includes('🚩 avoid common mistakes:') || lowerLine.includes('🚩 häufige fehler vermeiden:')) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection as keyof typeof sections] = sectionContent.join('\n').trim();
      }
      currentSection = 'commonMistakes';
      sectionContent = [];
      const afterColon = line.substring(line.indexOf(':') + 1).trim();
      if (afterColon) {
        sectionContent.push(afterColon);
      }
      continue;
    }
    
    // If we're in a section, add the line to the current section content
    if (currentSection && line) {
      sectionContent.push(line);
    }
  }

  // Save the last section
  if (currentSection && sectionContent.length > 0) {
    sections[currentSection as keyof typeof sections] = sectionContent.join('\n').trim();
  }

  return sections;
}

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
       ? `You are a pet training expert. Based on the image analysis provided, create a COMPLETELY UNIQUE training plan tailored to the pet's current state and needs.
        
        IMPORTANT: Return ONLY the JSON object, no additional text before or after. Use this exact format:
        {
          "title": "Custom Training Plan for ${petName}: [Unique Title Based on Analysis]",
          "description": "Detailed description of the training approach based on the pet's current state and needs",
          "steps": [
            {
              "title": "Module 1: [Unique Title]",
              "description": "Exercise Goal: [Detailed, specific goal like 'Bella will learn to signal when she needs to go outside to relieve herself, establishing a consistent house training routine']\n\nStep-by-Step Guide: [Numbered steps with specific details like '1. Establish a schedule for feeding and potty breaks (every 2-3 hours). 2. Take Bella outside immediately after meals, naps, and playtime. 3. Use a specific phrase like 'Go potty' when you take her outside. 4. Reward her with treats and praise immediately after she goes outside. 5. If she has an accident indoors, clean it up without scolding her and take her outside right after.']\n\n🔁 Repetition & Duration:\nDaily Exercise: [specific time like '5-10 minutes (potty breaks)']\nFrequency: [specific frequency like 'Every 2-3 hours']\nTraining Duration: [specific duration like '2 weeks or longer as needed']\n⚠️ [Important note like 'Consistency is key; don't skip scheduled breaks']\n\n🧰 Required Tools & Framework:\nEquipment: [specific items like 'leash, treats, designated potty area']\nLocation: [specific location like 'backyard or designated outdoor spot']\nTiming: [specific timing like 'every 2-3 hours']\nSpecies Adaptation: [specific notes like 'Be patient; puppies may take longer to learn']\n\n🧠 Learning Tips & Motivation:\n• [specific tip like 'Always celebrate her successes with treats and praise']\n• [specific tip like 'Be patient and provide frequent potty breaks']\n• [specific tip like 'Keep a consistent schedule to help her learn when to expect potty time']\n• [specific tip like 'Use a designated area to help her associate that spot with going potty']\n\n🚩 Avoid Common Mistakes:\n❌ [specific mistake like 'Don't scold her for accidents; it can create fear']\n❌ [specific mistake like 'Avoid irregular schedules which can confuse her']\n❌ [specific mistake like 'Don't forget to supervise her indoors, especially after meals']\n❌ [specific mistake like 'Never punish her for going in the house; redirecting is key']"
            },
            {
              "title": "Module 2: [Unique Title]",
              "description": "Completely different module with unique content, techniques, and progression from the previous module. Use the same detailed structured format as above with specific, actionable content."
            },
            {
              "title": "Module 3: [Unique Title]",
              "description": "Advanced module building on previous progress with new challenges and techniques. Use the same detailed structured format as above with specific, actionable content."
            }
          ]
        }
        
        IMPORTANT: 
        - Each module must be UNIQUE and different from any template
        - Generate specific, detailed content based on the pet's current state from the analysis
        - Include detailed step-by-step instructions with numbered steps
        - Make each module progressively more challenging
        - Never use generic template content
        - Use only English
        - Structure each step description with clear sections using this EXACT format:
          * Exercise Goal: Detailed, specific goal (like the example provided)
          * Step-by-Step Guide: Numbered steps with specific details
          * 🔁 Repetition & Duration: Specific times, frequencies, and durations
          * 🧰 Required Tools & Framework: Specific equipment, locations, timing, and species notes
          * 🧠 Learning Tips & Motivation: Specific, actionable tips with bullet points
          * 🚩 Avoid Common Mistakes: Specific mistakes to avoid with ❌ symbols
        - IMPORTANT: All sections must be included within the "description" field as a single string, not as separate JSON properties
        - CRITICAL: Do not add any text before or after the JSON object. Return ONLY the JSON.
        - Make the content as detailed and specific as the example provided in the user's request.`
             : `Du bist ein Haustier-Trainingsexperte. Basierend auf der bereitgestellten Bildanalyse erstelle einen KOMPLETT EINZIGARTIGEN Trainingsplan, der auf den aktuellen Zustand und die Bedürfnisse des Haustiers zugeschnitten ist.
        
        WICHTIG: Gib NUR das JSON-Objekt zurück, keine zusätzlichen Texte davor oder danach. Verwende dieses exakte Format:
        {
          "title": "Individueller Trainingsplan für ${petName}: [Einzigartiger Titel basierend auf Analyse]",
          "description": "Detaillierte Beschreibung des Trainingsansatzes basierend auf dem aktuellen Zustand und den Bedürfnissen des Haustiers",
          "steps": [
            {
              "title": "Modul 1: [Einzigartiger Titel]",
              "description": "Übungsziel: [Detailliertes, spezifisches Ziel wie 'Bella wird lernen, zu signalisieren, wenn sie nach draußen muss, um eine konsistente Hauserziehung zu etablieren']\n\nSchritt-für-Schritt-Anleitung: [Nummerierte Schritte mit spezifischen Details wie '1. Etabliere einen Zeitplan für Fütterung und Toilettengänge (alle 2-3 Stunden). 2. Nimm Bella sofort nach Mahlzeiten, Nickerchen und Spielzeit nach draußen. 3. Verwende eine spezifische Phrase wie 'Mach Pipi' wenn du sie nach draußen nimmst. 4. Belohne sie sofort mit Leckerlis und Lob nach dem Toilettengang. 5. Bei einem Unfall drinnen, räume es ohne Schimpfen auf und nimm sie sofort nach draußen.']\n\n🔁 Wiederholung & Dauer:\nTägliche Übung: [spezifische Zeit wie '5-10 Minuten (Toilettengänge)']\nHäufigkeit: [spezifische Häufigkeit wie 'Alle 2-3 Stunden']\nTrainingsdauer: [spezifische Dauer wie '2 Wochen oder länger nach Bedarf']\n⚠️ [Wichtiger Hinweis wie 'Konsistenz ist der Schlüssel; keine geplanten Pausen auslassen']\n\n🧰 Benötigte Tools & Rahmenbedingungen:\nAusrüstung: [spezifische Gegenstände wie 'Leine, Leckerlis, ausgewiesener Toilettenbereich']\nOrt: [spezifischer Ort wie 'Garten oder ausgewiesener Außenbereich']\nZeitpunkt: [spezifischer Zeitpunkt wie 'alle 2-3 Stunden']\nArtanpassung: [spezifische Hinweise wie 'Sei geduldig; Welpen brauchen länger zum Lernen']\n\n🧠 Lerntipps & Motivation:\n• [spezifischer Tipp wie 'Feiere immer ihre Erfolge mit Leckerlis und Lob']\n• [spezifischer Tipp wie 'Sei geduldig und biete häufige Toilettengänge an']\n• [spezifischer Tipp wie 'Halte einen konsistenten Zeitplan ein, um ihr zu helfen zu lernen, wann sie mit Toilettenzeit rechnen kann']\n• [spezifischer Tipp wie 'Verwende einen ausgewiesenen Bereich, um ihr zu helfen, diesen Ort mit dem Toilettengang zu verbinden']\n\n🚩 Häufige Fehler vermeiden:\n❌ [spezifischer Fehler wie 'Schimpfe nicht bei Unfällen; das kann Angst erzeugen']\n❌ [spezifischer Fehler wie 'Vermeide unregelmäßige Zeitpläne, die sie verwirren können']\n❌ [spezifischer Fehler wie 'Vergiss nicht, sie drinnen zu beaufsichtigen, besonders nach Mahlzeiten']\n❌ [spezifischer Fehler wie 'Bestrafe sie niemals für das Gehen im Haus; Umleitung ist der Schlüssel']"
            },
            {
              "title": "Modul 2: [Einzigartiger Titel]",
              "description": "Komplett anderes Modul mit einzigartigem Inhalt, Techniken und Fortschritt vom vorherigen Modul. Verwende das gleiche detaillierte strukturierte Format wie oben mit spezifischem, umsetzbarem Inhalt."
            },
            {
              "title": "Modul 3: [Einzigartiger Titel]",
              "description": "Fortgeschrittenes Modul, das auf dem vorherigen Fortschritt aufbaut mit neuen Herausforderungen und Techniken. Verwende das gleiche detaillierte strukturierte Format wie oben mit spezifischem, umsetzbarem Inhalt."
            }
          ]
        }
        
        WICHTIG:
        - Jedes Modul muss EINZIGARTIG und anders als jede Vorlage sein
        - Generiere spezifischen, detaillierten Inhalt basierend auf dem aktuellen Zustand des Haustiers aus der Analyse
        - Enthält detaillierte Schritt-für-Schritt-Anweisungen mit nummerierten Schritten
        - Mache jedes Modul progressiv herausfordernder
        - Verwende niemals generischen Vorlagen-Inhalt
        - Verwende nur Deutsch
        - Strukturiere jede Schrittbeschreibung mit klaren Abschnitten:
          * Übungsziel: Detailliertes, spezifisches Ziel (wie im bereitgestellten Beispiel)
          * Schritt-für-Schritt-Anleitung: Nummerierte Schritte mit spezifischen Details
          * 🔁 Wiederholung & Dauer: Spezifische Zeiten, Häufigkeiten und Dauern
          * 🧰 Benötigte Tools & Rahmenbedingungen: Spezifische Ausrüstung, Orte, Zeitpunkte und Artenhinweise
          * 🧠 Lerntipps & Motivation: Spezifische, umsetzbare Tipps mit Aufzählungspunkten
          * 🚩 Häufige Fehler vermeiden: Spezifische Fehler zu vermeiden mit ❌ Symbolen
        - WICHTIG: Alle Abschnitte müssen innerhalb des "description" Feldes als einzelner String enthalten sein, nicht als separate JSON-Eigenschaften
        - KRITISCH: Füge keinen Text vor oder nach dem JSON-Objekt hinzu. Gib NUR das JSON zurück.
        - Mache den Inhalt so detailliert und spezifisch wie das Beispiel in der Benutzeranfrage.`;

         const userPrompt = userLanguage === "en"
       ? `Based on this image analysis of ${petName} (${petSpecies}):
        
        Analysis: ${analysisResult.summary_text}
        Mood: ${analysisResult.mood_estimation}
        Recommendation: ${analysisResult.recommendation}
        
        Create a personalized training plan that addresses the pet's current state and needs. Make it as detailed and specific as possible, with numbered steps, specific times, frequencies, and actionable advice. Follow the exact format provided in the system prompt.`
       : `Basierend auf dieser Bildanalyse von ${petName} (${petSpecies}):
        
        Analyse: ${analysisResult.summary_text}
        Stimmung: ${analysisResult.mood_estimation}
        Empfehlung: ${analysisResult.recommendation}
        
        Erstelle einen personalisierten Trainingsplan, der den aktuellen Zustand und die Bedürfnisse des Haustiers berücksichtigt. Mache ihn so detailliert und spezifisch wie möglich, mit nummerierten Schritten, spezifischen Zeiten, Häufigkeiten und umsetzbaren Ratschlägen. Folge dem exakten Format, das im System-Prompt bereitgestellt wird.`;

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
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI plan creation API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const planContent = data.choices?.[0]?.message?.content?.trim();

    if (!planContent) {
      console.error("No plan content returned from OpenAI");
      return null;
    }

    // Try to extract JSON from the response
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

    // Create training steps with structured content
    const steps = planData.steps.map((step: any, index: number) => {
      const parsedSections = parseTrainingContent(step.description);
      
      // Debug logging to verify parsing
      console.log(`📋 Step ${index + 1} parsing results:`, {
        exerciseGoal: parsedSections.exerciseGoal ? '✅ Found' : '❌ Missing',
        stepByStepGuide: parsedSections.stepByStepGuide ? '✅ Found' : '❌ Missing',
        repetitionDuration: parsedSections.repetitionDuration ? '✅ Found' : '❌ Missing',
        requiredTools: parsedSections.requiredTools ? '✅ Found' : '❌ Missing',
        learningTips: parsedSections.learningTips ? '✅ Found' : '❌ Missing',
        commonMistakes: parsedSections.commonMistakes ? '✅ Found' : '❌ Missing'
      });
      
      return {
        training_plan_id: planResult.id,
        step_number: index + 1,
        title: step.title,
        title_en: null,
        description: step.description,
        description_en: null,
        points_reward: step.points || 15,
        is_ai_generated: true,
        // Structured sections
        exercise_goal: parsedSections.exerciseGoal || null,
        exercise_goal_en: null,
        step_by_step_guide: parsedSections.stepByStepGuide || null,
        step_by_step_guide_en: null,
        repetition_duration: parsedSections.repetitionDuration || null,
        repetition_duration_en: null,
        required_tools: parsedSections.requiredTools || null,
        required_tools_en: null,
        learning_tips: parsedSections.learningTips || null,
        learning_tips_en: null,
        common_mistakes: parsedSections.commonMistakes || null,
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

    console.log("✅ Training plan created successfully from image analysis");
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
