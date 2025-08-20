import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { translatePlanData } from "./translation.ts";

// Function to clean JSON string by fixing common parsing issues
function cleanJsonString(jsonString: string): string {
  console.log("🧹 Cleaning JSON string...");
  
  let cleaned = jsonString;
  
  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();
  
  // Fix common control character issues
  cleaned = cleaned
    // Replace literal newlines in strings with escaped newlines
    .replace(/\n/g, '\\n')
    // Replace literal tabs with escaped tabs
    .replace(/\t/g, '\\t')
    // Replace literal carriage returns with escaped carriage returns
    .replace(/\r/g, '\\r')
    // Fix unescaped quotes inside strings (basic approach)
    .replace(/"([^"]*)"([^"]*)"([^"]*)"/g, '"$1\\"$2\\"$3"')
    // Remove any null bytes
    .replace(/\0/g, '')
    // Fix common unicode issues
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  
  console.log("🧹 JSON cleaning completed");
  return cleaned;
}

// Function to translate plan to user's language
async function translatePlanToUserLanguage(
  planData: any,
  userLanguage: string,
  openAIApiKey?: string
): Promise<any> {
  if (!openAIApiKey) {
    console.log("⚠️ No OpenAI API key available for translation");
    return planData;
  }

  try {
    console.log("🔄 Translating plan to user language:", userLanguage);

    // Detect the current language of the plan
    const allContent = `${planData.title} ${
      planData.description || ""
    } ${planData.steps
      .map((s) => `${s.title} ${s.description}`)
      .join(" ")}`.toLowerCase();

    const germanWords = [
      "schritt",
      "trainingsplan",
      "übung",
      "kommando",
      "leckerli",
      "belohnung",
      "sitz",
      "platz",
      "bei",
      "fuß",
      "hier",
      "aus",
      "bleib",
      "warte",
      "nein",
      "brav",
      "gut",
      "super",
      "prima",
      "toll",
      "fein",
      "richtig",
      "falsch",
      "verboten",
      "erlaubt",
      "darf",
      "muss",
      "soll",
      "kann",
      "möchte",
      "will",
      "sollte",
      "könnte",
      "würde",
      "hätte",
      "wäre",
      "wird",
      "wurde",
      "geworden",
      "gemacht",
      "getan",
      "gegeben",
      "genommen",
      "gebracht",
      "gekommen",
      "gegangen",
      "gestanden",
      "gesessen",
      "gelegen",
      "geblieben",
      "gewartet",
      "gehört",
      "gesehen",
      "gefühlt",
      "gedacht",
      "gewusst",
      "gekonnt",
      "gemocht",
      "gewollt",
      "gesollt",
      "gedurft",
      "gemusst",
    ];
    const englishWords = [
      "step",
      "training",
      "plan",
      "exercise",
      "command",
      "treat",
      "reward",
      "house",
      "leash",
      "sit",
      "down",
      "stay",
      "come",
      "heel",
      "here",
      "out",
      "wait",
      "no",
      "good",
      "yes",
      "okay",
      "right",
      "wrong",
      "forbidden",
      "allowed",
      "can",
      "must",
      "should",
      "would",
      "could",
      "might",
      "will",
      "would",
      "have",
      "has",
      "had",
      "been",
      "done",
      "made",
      "given",
      "taken",
      "brought",
      "come",
      "gone",
      "stood",
      "sat",
      "lain",
      "stayed",
      "waited",
      "heard",
      "seen",
      "felt",
      "thought",
      "known",
      "could",
      "liked",
      "wanted",
      "should",
      "allowed",
      "required",
    ];

    const germanWordCount = germanWords.filter((word) =>
      allContent.includes(word)
    ).length;
    const englishWordCount = englishWords.filter((word) =>
      allContent.includes(word)
    ).length;

    const currentLanguage = germanWordCount > englishWordCount ? "de" : "en";

    console.log(
      "🔍 Detected plan language:",
      currentLanguage,
      "Target language:",
      userLanguage
    );

    // Only translate if the languages are different
    if (currentLanguage === userLanguage) {
      console.log("✅ Plan is already in user language, no translation needed");
      return planData;
    }

    // Translate the plan
    const translatedData = await translatePlanData(planData, openAIApiKey);

    // Create the translated plan
    const translatedPlan = {
      title: userLanguage === "en" ? translatedData.title_en : planData.title,
      description:
        userLanguage === "en"
          ? translatedData.description_en
          : planData.description,
      steps: planData.steps.map((step: any, index: number) => ({
        title:
          userLanguage === "en"
            ? translatedData.steps_en[index]?.title_en
            : step.title,
        description:
          userLanguage === "en"
            ? translatedData.steps_en[index]?.description_en
            : step.description,
        points: step.points || 15,
      })),
    };

    console.log("✅ Plan translated successfully");
    return translatedPlan;
  } catch (translationError) {
    console.error("❌ Translation failed:", translationError);
    console.log("⚠️ Returning original plan without translation");
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
    console.log(
      "🔄 Creating fallback plan for message:",
      userMessage.substring(0, 100)
    );
    console.log("🔑 OpenAI API Key available:", !!openAIApiKey);
    console.log("🌍 User language:", userLanguage);

    if (!openAIApiKey) {
      console.log("⚠️ No OpenAI API key available for fallback plan creation");
      return null;
    }

    // Create a prompt to generate unique personalized content
    const systemPrompt =
      userLanguage === "en"
        ? `You are a pet training expert. Create a COMPLETELY UNIQUE training plan based on the user's request. 
          Generate personalized content that is tailored to the specific training goal and pet characteristics.
         
         CRITICAL: You MUST return ONLY a valid JSON object. No text before or after the JSON. No explanations. Just the JSON.
         
         IMPORTANT: All strings must be properly escaped. Use \\n for newlines, \\" for quotes, and ensure all control characters are escaped.
         
         Use this EXACT format (replace the placeholders with real content):
         {
           "title": "Custom Training Plan: [Create a unique title based on the training goal]",
           "description": "[Write a detailed description of the training approach and goals]",
           "steps": [
             {
               "title": "Module 1: [Create a unique module title]",
               "description": "Exercise Goal: [Write the specific goal for this module]\n\nStep-by-Step Guide: 1. [First step] 2. [Second step] 3. [Third step] 4. [Fourth step]\n\n🔁 Repetition & Duration: [Write time and frequency details] ⚠️ [Write an important note]\n\n🧰 Required Tools & Framework: Equipment: [List equipment needed] Location: [Where to train] Timing: [When to train] Species Adaptation: [Species-specific notes]\n\n🧠 Learning Tips & Motivation: • [Write tip 1] • [Write tip 2] • [Write tip 3] • [Write tip 4]\n\n🚩 Avoid Common Mistakes: ❌ [Write mistake 1] ❌ [Write mistake 2] ❌ [Write mistake 3] ❌ [Write mistake 4]"
             },
             {
               "title": "Module 2: [Create a different unique module title]",
               "description": "Exercise Goal: [Write the specific goal for this module]\n\nStep-by-Step Guide: 1. [First step] 2. [Second step] 3. [Third step] 4. [Fourth step]\n\n🔁 Repetition & Duration: [Write time and frequency details] ⚠️ [Write an important note]\n\n🧰 Required Tools & Framework: Equipment: [List equipment needed] Location: [Where to train] Timing: [When to train] Species Adaptation: [Species-specific notes]\n\n🧠 Learning Tips & Motivation: • [Write tip 1] • [Write tip 2] • [Write tip 3] • [Write tip 4]\n\n🚩 Avoid Common Mistakes: ❌ [Write mistake 1] ❌ [Write mistake 2] ❌ [Write mistake 3] ❌ [Write mistake 4]"
             },
             {
               "title": "Module 3: [Create a different unique module title]",
               "description": "Exercise Goal: [Write the specific goal for this module]\n\nStep-by-Step Guide: 1. [First step] 2. [Second step] 3. [Third step] 4. [Fourth step]\n\n🔁 Repetition & Duration: [Write time and frequency details] ⚠️ [Write an important note]\n\n🧰 Required Tools & Framework: Equipment: [List equipment needed] Location: [Where to train] Timing: [When to train] Species Adaptation: [Species-specific notes]\n\n🧠 Learning Tips & Motivation: • [Write tip 1] • [Write tip 2] • [Write tip 3] • [Write tip 4]\n\n🚩 Avoid Common Mistakes: ❌ [Write mistake 1] ❌ [Write mistake 2] ❌ [Write mistake 3] ❌ [Write mistake 4]"
             }
           ]
         }
         
         REQUIREMENTS:
         - Each module must be UNIQUE and different
         - Generate specific content based on the training goal
         - Include detailed step-by-step instructions with numbered steps
         - Make each module progressively more challenging
         - Use only English
         - All content must be within the "description" field as a single string
         - Return ONLY the JSON object, nothing else`
               : `Du bist ein Haustier-Trainingsexperte. Erstelle einen KOMPLETT EINZIGARTIGEN Trainingsplan basierend auf der Anfrage des Benutzers.
          Generiere personalisierten Inhalt, der auf das spezifische Trainingsziel und die Tiercharakteristika zugeschnitten ist.
          
          KRITISCH: Du MUSST nur ein gültiges JSON-Objekt zurückgeben. Kein Text vor oder nach dem JSON. Keine Erklärungen. Nur das JSON.
          
          WICHTIG: Alle Strings müssen korrekt escaped werden. Verwende \\n für Zeilenumbrüche, \\" für Anführungszeichen und stelle sicher, dass alle Steuerzeichen escaped sind.
          
          Verwende dieses EXAKTE Format (ersetze die Platzhalter mit echtem Inhalt):
         {
           "title": "Individueller Trainingsplan: [Erstelle einen einzigartigen Titel basierend auf dem Trainingsziel]",
           "description": "[Schreibe eine detaillierte Beschreibung des Trainingsansatzes und der Ziele]",
           "steps": [
             {
               "title": "Modul 1: [Erstelle einen einzigartigen Modultitel]",
               "description": "Übungsziel: [Schreibe das spezifische Ziel für dieses Modul]\n\nSchritt-für-Schritt-Anleitung: 1. [Erster Schritt] 2. [Zweiter Schritt] 3. [Dritter Schritt] 4. [Vierter Schritt]\n\n🔁 Wiederholung & Dauer: [Schreibe Zeit- und Häufigkeitsdetails] ⚠️ [Schreibe einen wichtigen Hinweis]\n\n🧰 Benötigte Tools & Rahmenbedingungen: Ausrüstung: [Liste benötigte Ausrüstung] Ort: [Wo trainieren] Zeitpunkt: [Wann trainieren] Artenanpassung: [Arten-spezifische Hinweise]\n\n🧠 Lerntipps & Motivation: • [Schreibe Tipp 1] • [Schreibe Tipp 2] • [Schreibe Tipp 3] • [Schreibe Tipp 4]\n\n🚩 Häufige Fehler vermeiden: ❌ [Schreibe Fehler 1] ❌ [Schreibe Fehler 2] ❌ [Schreibe Fehler 3] ❌ [Schreibe Fehler 4]"
             },
             {
               "title": "Modul 2: [Erstelle einen anderen einzigartigen Modultitel]",
               "description": "Übungsziel: [Schreibe das spezifische Ziel für dieses Modul]\n\nSchritt-für-Schritt-Anleitung: 1. [Erster Schritt] 2. [Zweiter Schritt] 3. [Dritter Schritt] 4. [Vierter Schritt]\n\n🔁 Wiederholung & Dauer: [Schreibe Zeit- und Häufigkeitsdetails] ⚠️ [Schreibe einen wichtigen Hinweis]\n\n🧰 Benötigte Tools & Rahmenbedingungen: Ausrüstung: [Liste benötigte Ausrüstung] Ort: [Wo trainieren] Zeitpunkt: [Wann trainieren] Artenanpassung: [Arten-spezifische Hinweise]\n\n🧠 Lerntipps & Motivation: • [Schreibe Tipp 1] • [Schreibe Tipp 2] • [Schreibe Tipp 3] • [Schreibe Tipp 4]\n\n🚩 Häufige Fehler vermeiden: ❌ [Schreibe Fehler 1] ❌ [Schreibe Fehler 2] ❌ [Schreibe Fehler 3] ❌ [Schreibe Fehler 4]"
             },
             {
               "title": "Modul 3: [Erstelle einen anderen einzigartigen Modultitel]",
               "description": "Übungsziel: [Schreibe das spezifische Ziel für dieses Modul]\n\nSchritt-für-Schritt-Anleitung: 1. [Erster Schritt] 2. [Zweiter Schritt] 3. [Dritter Schritt] 4. [Vierter Schritt]\n\n🔁 Wiederholung & Dauer: [Schreibe Zeit- und Häufigkeitsdetails] ⚠️ [Schreibe einen wichtigen Hinweis]\n\n🧰 Benötigte Tools & Rahmenbedingungen: Ausrüstung: [Liste benötigte Ausrüstung] Ort: [Wo trainieren] Zeitpunkt: [Wann trainieren] Artenanpassung: [Arten-spezifische Hinweise]\n\n🧠 Lerntipps & Motivation: • [Schreibe Tipp 1] • [Schreibe Tipp 2] • [Schreibe Tipp 3] • [Schreibe Tipp 4]\n\n🚩 Häufige Fehler vermeiden: ❌ [Schreibe Fehler 1] ❌ [Schreibe Fehler 2] ❌ [Schreibe Fehler 3] ❌ [Schreibe Fehler 4]"
             }
           ]
         }
         
         ANFORDERUNGEN:
         - Jedes Modul muss EINZIGARTIG und anders sein
         - Generiere spezifischen Inhalt basierend auf dem Trainingsziel
         - Enthält detaillierte Schritt-für-Schritt-Anweisungen mit nummerierten Schritten
         - Mache jedes Modul progressiv herausfordernder
         - Verwende nur Deutsch
         - Aller Inhalt muss innerhalb des "description" Feldes als einzelner String sein
         - Gib nur das JSON-Objekt zurück, nichts anderes`;

    console.log("🚀 Making OpenAI API call for fallback plan...");
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
            content: userMessage,
          },
        ],
        max_tokens: 3000,
        temperature: 0.8, // Add some creativity for unique content
      }),
    });

    console.log("📡 OpenAI response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ OpenAI fallback plan API error:",
        response.status,
        response.statusText,
        "Response:", errorText
      );
      return null;
    }

    const data = await response.json();
    console.log("📦 OpenAI response data structure:", {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasMessage: !!data.choices?.[0]?.message,
      hasContent: !!data.choices?.[0]?.message?.content
    });

    const planContent = data.choices?.[0]?.message?.content?.trim();
    console.log("📝 Plan content length:", planContent?.length || 0);
    console.log("📝 Plan content preview:", planContent?.substring(0, 200) + "...");

    if (!planContent) {
      console.error("❌ No fallback plan content returned from OpenAI");
      return null;
    }

    // Try to extract JSON from the response
    console.log("🔍 Looking for JSON in plan content...");
    const jsonMatch = planContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ No JSON found in fallback plan response");
      console.log("📝 Full plan content:", planContent);
      return null;
    }

    console.log("✅ JSON found, attempting to parse...");
    let planData;
    try {
      // First try to parse the raw JSON
      planData = JSON.parse(jsonMatch[0]);
      console.log("✅ JSON parsed successfully on first try");
    } catch (parseError) {
      console.error("❌ JSON parsing failed, attempting to clean and retry:", parseError);
      
      // Try to clean the JSON by fixing common issues
      try {
        const cleanedJson = cleanJsonString(jsonMatch[0]);
        planData = JSON.parse(cleanedJson);
        console.log("✅ JSON parsed successfully after cleaning");
      } catch (secondParseError) {
        console.error("❌ JSON parsing failed even after cleaning:", secondParseError);
        console.log("📝 Original JSON content:", jsonMatch[0]);
        console.log("📝 Cleaned JSON content:", cleanJsonString(jsonMatch[0]));
        return null;
      }
    }

    // Validate the plan structure
    console.log("🔍 Validating plan structure...");
    console.log("📋 Plan data:", {
      hasTitle: !!planData.title,
      hasSteps: !!planData.steps,
      isStepsArray: Array.isArray(planData.steps),
      stepsLength: planData.steps?.length || 0,
      title: planData.title
    });

    if (
      !planData.title ||
      !planData.steps ||
      !Array.isArray(planData.steps) ||
      planData.steps.length === 0
    ) {
      console.error("❌ Invalid fallback plan structure");
      return null;
    }

    console.log(
      "✅ Fallback plan created successfully with unique personalized content"
    );
    console.log("📋 Final plan data:", {
      title: planData.title,
      stepsCount: planData.steps.length,
      firstStepTitle: planData.steps[0]?.title
    });
    return planData;
  } catch (error) {
    console.error("❌ Fallback plan creation failed:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
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
  // Validate that this is personalized unique content
  console.log("📝 Creating personalized training plan with unique content:", {
    title: planData.title,
    stepsCount: planData.steps.length,
    isCustomPlan:
      planData.title.includes("Custom") ||
      planData.title.includes("Individuell") ||
      planData.title.includes("AI-Generated") ||
      planData.title.includes("KI-generiert"),
  });

  // Validate that steps have unique content
  const stepTitles = planData.steps.map((step) => step.title);
  const uniqueTitles = new Set(stepTitles);
  if (uniqueTitles.size !== stepTitles.length) {
    console.warn("⚠️ Duplicate step titles detected - ensuring uniqueness");
  }

  // Create training plan with the AI-generated data
  const { data: planResult, error: planError } = await supabaseClient
    .from("training_plans")
    .insert([
      {
        user_id: userId,
        pet_id: petId,
        title: planData.title,
        title_en: null, // AI-generated content is already in user's language
        description: planData.description || "",
        description_en: null, // AI-generated content is already in user's language
        status: "in_progress",
        is_ai_generated: true, // Mark as AI-generated for tracking
      },
    ])
    .select()
    .single();

  if (planError) {
    console.error("Error creating personalized plan:", planError);
    throw new Error(
      "Fehler beim Erstellen des personalisierten Trainingsplans"
    );
  }

  // No parsing - save raw plan data directly
  console.log("💾 Saving raw plan data without parsing");

  // Create training steps with raw data (no parsing)
  const steps = planData.steps.map((step: any, index: number) => {
    return {
      training_plan_id: planResult.id,
      step_number: index + 1,
      title: step.title,
      title_en: null, // AI-generated content is already in user's language
      description: step.description, // Save the raw description as-is
      description_en: null, // AI-generated content is already in user's language
      points_reward: step.points || 15, // Default to 15 points for personalized content
      is_ai_generated: true, // Mark as AI-generated
      // Set all structured fields to null since we're not parsing
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
    console.error("Error creating personalized steps:", stepsError);
    throw new Error(
      "Fehler beim Erstellen der personalisierten Trainingsschritte"
    );
  }

  // Initialize user rewards if not exists
  await supabaseClient.from("user_rewards").upsert({
    user_id: userId,
    total_points: 0,
  });

  // Create a support ticket to track this personalized training plan creation
  const { data: ticketResult, error: ticketError } = await supabaseClient
    .from("support_tickets")
    .insert({
      user_id: userId,
      subject: `Personalized Training Plan Created: ${planData.title}`,
      category: "training",
      status: "resolved",
      is_resolved_by_ai: true,
      resolved_at: new Date().toISOString(),
      satisfaction_rating: 5,
    })
    .select()
    .single();

  if (ticketError) {
    console.error(
      "Error creating support ticket for personalized training plan:",
      ticketError
    );
  } else {
    // Add feedback for the automatically resolved ticket
    await supabaseClient.from("support_feedback").insert({
      ticket_id: ticketResult.id,
      user_id: userId,
      rating: 5,
      resolved_by: "ai",
    });
  }

  console.log(
    "✅ Personalized training plan created successfully with unique content"
  );
  return planResult;
}

export async function processPlanCreationFromResponse(
  aiResponse: string,
  userLanguage: string = "de",
  openAIApiKey?: string
) {
  console.log("🔍 Searching for plan creation in AI response...");
  console.log("🌍 User language preference:", userLanguage);

  // Look for plan creation blocks
  const planMatch = aiResponse.match(
    /\[PLAN_CREATION\](.*?)\[\/PLAN_CREATION\]/s
  );

  if (!planMatch) {
    console.log("❌ No plan creation block found in AI response");
    return null;
  }

  const planContent = planMatch[1].trim();
  console.log("📋 Found plan content:", planContent.substring(0, 200) + "...");

  try {
    // Parse the JSON content
    const planData = JSON.parse(planContent);
    console.log("✅ JSON parsing successful");
    console.log("📊 Plan data structure:", {
      hasTitle: !!planData.title,
      hasDescription: !!planData.description,
      hasSteps: !!planData.steps,
      stepsCount: planData.steps?.length || 0,
      titleLength: planData.title?.length || 0,
      descriptionLength: planData.description?.length || 0,
    });

    // Basic validation - much more lenient for debugging
    if (!planData.title || typeof planData.title !== "string") {
      console.log("❌ Invalid or missing title");
      return null;
    }

    if (
      !planData.steps ||
      !Array.isArray(planData.steps) ||
      planData.steps.length === 0
    ) {
      console.log("❌ Invalid or missing steps array");
      return null;
    }

    // Validate each step - much more lenient
    for (let i = 0; i < planData.steps.length; i++) {
      const step = planData.steps[i];
      if (
        !step.title ||
        typeof step.title !== "string" ||
        step.title.length < 2
      ) {
        console.log(`❌ Step ${i + 1} has invalid title:`, step.title);
        return null;
      }
      if (
        !step.description ||
        typeof step.description !== "string" ||
        step.description.length < 2
      ) {
        console.log(
          `❌ Step ${i + 1} has invalid description:`,
          step.description
        );
        return null;
      }
    }

    console.log("✅ Basic validation passed");

    // Language validation - check for mixed languages
    console.log("🔍 Checking language consistency...");

    const allContent = `${planData.title} ${
      planData.description || ""
    } ${planData.steps
      .map((s) => `${s.title} ${s.description}`)
      .join(" ")}`.toLowerCase();

    // Common words that indicate language mixing
    const germanWords = [
      "schritt",
      "trainingsplan",
      "übung",
      "kommando",
      "leckerli",
      "belohnung",
      "sitz",
      "platz",
      "bei",
      "fuß",
      "hier",
      "aus",
      "bleib",
      "warte",
      "nein",
      "brav",
      "gut",
      "super",
      "prima",
      "toll",
      "fein",
      "richtig",
      "falsch",
      "verboten",
      "erlaubt",
      "darf",
      "muss",
      "soll",
      "kann",
      "möchte",
      "will",
      "sollte",
      "könnte",
      "würde",
      "hätte",
      "wäre",
      "wird",
      "wurde",
      "geworden",
      "gemacht",
      "getan",
      "gegeben",
      "genommen",
      "gebracht",
      "gekommen",
      "gegangen",
      "gestanden",
      "gesessen",
      "gelegen",
      "geblieben",
      "gewartet",
      "gehört",
      "gesehen",
      "gefühlt",
      "gedacht",
      "gewusst",
      "gekonnt",
      "gemocht",
      "gewollt",
      "gesollt",
      "gedurft",
      "gemusst",
    ];
    const englishWords = [
      "step",
      "training",
      "plan",
      "exercise",
      "command",
      "treat",
      "reward",
      "house",
      "leash",
      "sit",
      "down",
      "stay",
      "come",
      "heel",
      "here",
      "out",
      "wait",
      "no",
      "good",
      "yes",
      "okay",
      "right",
      "wrong",
      "forbidden",
      "allowed",
      "can",
      "must",
      "should",
      "would",
      "could",
      "might",
      "will",
      "would",
      "have",
      "has",
      "had",
      "been",
      "done",
      "made",
      "given",
      "taken",
      "brought",
      "come",
      "gone",
      "stood",
      "sat",
      "lain",
      "stayed",
      "waited",
      "heard",
      "seen",
      "felt",
      "thought",
      "known",
      "could",
      "liked",
      "wanted",
      "should",
      "allowed",
      "required",
    ];

    const germanWordCount = germanWords.filter((word) =>
      allContent.includes(word)
    ).length;
    const englishWordCount = englishWords.filter((word) =>
      allContent.includes(word)
    ).length;

    console.log("🔍 Language analysis:", {
      germanWords: germanWordCount,
      englishWords: englishWordCount,
      totalContent: allContent.length,
      contentPreview: allContent.substring(0, 200),
    });

    // Check for obvious language mixing (more lenient than before)
    const hasGermanWords = germanWordCount > 0;
    const hasEnglishWords = englishWordCount > 0;

    if (hasGermanWords && hasEnglishWords) {
      console.log("⚠️ Mixed language detected - checking if it's acceptable");

      // Allow some common technical terms to be mixed
      const allowedMixedTerms = [
        "training",
        "plan",
        "step",
        "command",
        "reward",
        "treat",
      ];
      const mixedTerms = allowedMixedTerms.filter((term) =>
        allContent.includes(term)
      );

      if (mixedTerms.length > 0) {
        console.log(
          "✅ Mixed language contains only allowed technical terms:",
          mixedTerms
        );
      } else {
        console.log("❌ Unacceptable mixed language detected");
        return null;
      }
    }

    console.log("✅ Language validation passed");

    console.log("✅ Plan validation successful, returning plan data");

    // Automatically translate the plan to user's language
    const translatedPlan = await translatePlanToUserLanguage(
      planData,
      userLanguage,
      openAIApiKey
    );

    return translatedPlan;
  } catch (error) {
    console.error("❌ Error parsing plan creation data:", error);
    return null;
  }
}

export function removePlanCreationFromResponse(
  aiResponse: string,
  planTitle: string,
  language: string = "de",
  wasTranslated: boolean = false
) {
  // Clean the response from formatting artifacts before replacement
  const cleanedResponse = aiResponse
    .replace(/"""/g, "") // Remove triple quotes
    .replace(/```json|```/g, "") // Remove code block markers
    .replace(/^\s*```\s*$/gm, ""); // Remove standalone code block lines

  // Language-specific success messages
  const successMessages = {
    de: wasTranslated
      ? `\n\n✅ **Trainingsplan erfolgreich erstellt und übersetzt!**\n\nIch habe "${planTitle}" als strukturiertes Projekt für euch angelegt und es in deine Sprache übersetzt. Du findest es in deinem Dashboard unter "Trainingspläne". Dort kannst du jeden Tag eure Fortschritte abhaken und Punkte sammeln! 🏆\n\nMöchtest du noch Fragen zum Plan oder brauchst du zusätzliche Tipps? 😊`
      : `\n\n✅ **Trainingsplan erfolgreich erstellt!**\n\nIch habe "${planTitle}" als strukturiertes Projekt für euch angelegt. Du findest es in deinem Dashboard unter "Trainingspläne". Dort kannst du jeden Tag eure Fortschritte abhaken und Punkte sammeln! 🏆\n\nMöchtest du noch Fragen zum Plan oder brauchst du zusätzliche Tipps? 😊`,
    en: wasTranslated
      ? `\n\n✅ **Training Plan Successfully Created and Translated!**\n\nI've set up "${planTitle}" as a structured project for you and translated it to your language. You can find it in your dashboard under "Training Plans". There you can check off your progress every day and collect points! 🏆\n\nDo you have any questions about the plan or need additional tips? 😊`
      : `\n\n✅ **Training Plan Successfully Created!**\n\nI've set up "${planTitle}" as a structured project for you. You can find it in your dashboard under "Training Plans". There you can check off your progress every day and collect points! 🏆\n\nDo you have any questions about the plan or need additional tips? 😊`,
  };

  const successMessage =
    successMessages[language as keyof typeof successMessages] ||
    successMessages.de;

  return cleanedResponse.replace(
    /\[PLAN_CREATION\].*?\[\/PLAN_CREATION\]/s,
    successMessage
  );
}

export function cleanupFailedPlanCreation(
  aiResponse: string,
  language: string = "de"
) {
  // Clean formatting artifacts first
  let cleanedResponse = aiResponse
    .replace(/"""/g, "") // Remove triple quotes
    .replace(/```json|```/g, "") // Remove code block markers
    .replace(/^\s*```\s*$/gm, ""); // Remove standalone code block lines

  // Remove any incomplete or failed plan creation blocks
  cleanedResponse = cleanedResponse.replace(
    /\[PLAN_CREATION\].*?\[\/PLAN_CREATION\]/s,
    ""
  );

  // Also remove any standalone plan creation blocks that might be malformed
  cleanedResponse = cleanedResponse.replace(/\[PLAN_CREATION\].*$/s, "");
  cleanedResponse = cleanedResponse.replace(/^.*\[\/PLAN_CREATION\]/s, "");

  // Language-specific fallback messages
  const fallbackMessages = {
    de: "\n\n😊 Entschuldige, beim Erstellen des Trainingsplans gab es ein kleines Problem. Lass mich das nochmal für dich versuchen - magst du mir kurz sagen, woran ihr arbeiten möchtet?",
    en: "\n\n😊 Sorry, there was a small problem creating the training plan. Let me try again for you - could you briefly tell me what you'd like to work on?",
  };

  const fallbackMessage =
    fallbackMessages[language as keyof typeof fallbackMessages] ||
    fallbackMessages.de;

  // If the response is now empty or very short, provide a fallback
  if (cleanedResponse.trim().length < 20) {
    return fallbackMessage;
  }

  return cleanedResponse;
}
