// Utility function to parse structured training content and extract sections
export type ParsedTrainingSections = {
  exerciseGoal: string;
  stepByStepGuide: string;
  repetitionDuration: string;
  requiredTools: string;
  learningTips: string;
  commonMistakes: string;
}



export function parseTrainingContent(content: string): ParsedTrainingSections {
  const sections: ParsedTrainingSections = {
    exerciseGoal: "",
    stepByStepGuide: "",
    repetitionDuration: "",
    requiredTools: "",
    learningTips: "",
    commonMistakes: "",
  };
  if (!content || content.trim() === "") return sections;

  // Build a normalized header map (supports synonyms, EN + DE)
  const headerSynonyms: Array<[string, keyof ParsedTrainingSections]> = [
    ["exercise goal", "exerciseGoal"],
    ["übungsziel", "exerciseGoal"],
    ["step-by-step guide", "stepByStepGuide"],
    ["schritt-für-schritt-anleitung", "stepByStepGuide"],
    ["repetition & duration", "repetitionDuration"],
    ["repetition and duration", "repetitionDuration"],
    ["wiederholung & dauer", "repetitionDuration"],
    ["required tools & framework", "requiredTools"],
    ["required tools and framework", "requiredTools"],
    ["benötigte tools & rahmenbedingungen", "requiredTools"],
    ["learning tips & motivation", "learningTips"],
    ["learning tips and motivation", "learningTips"],
    ["lerntipps & motivation", "learningTips"],
    ["avoid common mistakes", "commonMistakes"],
    ["häufige fehler vermeiden", "commonMistakes"],
  ];

  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD") // split accents
      .replace(/[\p{M}]/gu, "") // remove diacritics
      .replace(/^[\p{P}\p{S}\s]+/gu, "") // drop leading emoji/punct/space only
      .replace(/\s+/g, " ")
      .trim();

  const headerMap = new Map<string, keyof ParsedTrainingSections>();
  for (const [label, key] of headerSynonyms) headerMap.set(norm(label), key);

  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let current: keyof ParsedTrainingSections = "exerciseGoal";
  let bucket: string[] = [];

  const save = () => {
    if (bucket.length) {
      sections[current] = bucket.join("\n");
      bucket = [];
    }
  };

  for (const rawLine of lines) {
    // Try to split header + inline content: "[emoji] Title: rest of line"
    // Keep the colon optional; if no colon, we still try to match a pure header line.
    const match = rawLine.match(
      /^\s*([\p{P}\p{S}]*)\s*([^:]+?)(?::\s*(.*))?$/u
    );
    if (match) {
      const titleCandidate = match[2] ?? "";
      const rest = (match[3] ?? "").trim(); // inline content after :

      const key = headerMap.get(norm(titleCandidate));
      if (key) {
        // switch section, save previous
        save();
        current = key;

        // If header had inline content after ":", keep it.
        if (rest) bucket.push(rest);
        continue; // do not treat header line as content
      }
    }

    // Not a header -> normal content
    bucket.push(rawLine);
  }

  save();
  
  // Post-process step-by-step guide to format numbered steps properly
  if (sections.stepByStepGuide) {
    sections.stepByStepGuide = formatStepByStepGuide(sections.stepByStepGuide);
  }

  // Post-process repetition & duration to format titles properly
  if (sections.repetitionDuration) {
    sections.repetitionDuration = formatRepetitionDuration(sections.repetitionDuration);
  }

  // Post-process required tools & framework to format titles properly
  if (sections.requiredTools) {
    sections.requiredTools = formatRequiredTools(sections.requiredTools);
  }

  // Post-process learning tips & motivation to format bullet points properly
  if (sections.learningTips) {
    sections.learningTips = formatLearningTips(sections.learningTips);
  }

  // Post-process common mistakes to format bullet points properly
  if (sections.commonMistakes) {
    sections.commonMistakes = formatCommonMistakes(sections.commonMistakes);
  }

  return sections;
}

// Function to format step-by-step guide with proper line breaks
function formatStepByStepGuide(content: string): string {
  // Split by common step patterns and add line breaks
  return content
    // Add line breaks before numbered steps (1., 2., 3., etc.)
    .replace(/(\d+\.\s)/g, '\n$1')
    // Add line breaks before bullet points
    .replace(/(•\s)/g, '\n$1')
    // Add line breaks before dash points
    .replace(/(-\s)/g, '\n$1')
    // Clean up multiple line breaks
    .replace(/\n\s*\n/g, '\n')
    // Trim leading/trailing whitespace
    .trim();
}

// Function to format repetition & duration with proper line breaks
function formatRepetitionDuration(content: string): string {
  // First, fix any broken "Training Duration" that might be split across lines
  let processedContent = content
    // Fix any other broken patterns
    .replace(/([A-Z][a-z]+)\s*\n\s*([A-Z][a-z]+:)/g, '$1 $2');

  // Split by common repetition patterns and add line breaks
  return processedContent
    // Add line breaks before common repetition titles
    .replace(/(Daily Exercise:)/g, '\n$1')
    .replace(/(Frequency:)/g, '\n$1')
    .replace(/(Training Duration:)/g, '\n$1')
    .replace(/(Weekly Frequency:)/g, '\n$1')
    .replace(/(Session Length:)/g, '\n$1')
    .replace(/(Total Duration:)/g, '\n$1')
    // Add line breaks before warning symbols
    .replace(/(⚠️)/g, '\n$1')
    .replace(/(🚨)/g, '\n$1')
    .replace(/(❗)/g, '\n$1')
    // Add line breaks before semicolons that separate different sections
    .replace(/(;\s*)([A-Z][a-z]+:)/g, '$1\n$2')
    // Clean up multiple line breaks
    .replace(/\n\s*\n/g, '\n')
    // Trim leading/trailing whitespace
    .trim();
}

// Function to format required tools & framework with proper line breaks
function formatRequiredTools(content: string): string {
  // Split by common tools & framework patterns and add line breaks
  return content
    // Add line breaks before common tools titles
    .replace(/(Equipment:)/g, '\n$1')
    .replace(/(Location:)/g, '\n$1')
    .replace(/(Timing:)/g, '\n$1')
    .replace(/(Species Adaptation:)/g, '\n$1')
    .replace(/(Environment:)/g, '\n$1')
    .replace(/(Setup:)/g, '\n$1')
    .replace(/(Materials:)/g, '\n$1')
    .replace(/(Tools:)/g, '\n$1')
    // Add line breaks before semicolons that separate different sections
    .replace(/(;\s*)([A-Z][a-z]+:)/g, '$1\n$2')
    // Clean up multiple line breaks
    .replace(/\n\s*\n/g, '\n')
    // Trim leading/trailing whitespace
    .trim();
}

// Function to format learning tips & motivation with proper line breaks
function formatLearningTips(content: string): string {
  // Split by bullet points and add line breaks
  return content
    // Add line breaks before bullet points
    .replace(/(•\s)/g, '\n$1')
    // Add line breaks before dash points
    .replace(/(-\s)/g, '\n$1')
    // Add line breaks before numbered points
    .replace(/(\d+\.\s)/g, '\n$1')
    // Clean up multiple line breaks
    .replace(/\n\s*\n/g, '\n')
    // Trim leading/trailing whitespace
    .trim();
}

// Function to format common mistakes with proper line breaks
function formatCommonMistakes(content: string): string {
  // Split by bullet points and add line breaks
  return content
    // Add line breaks before bullet points
    .replace(/(•\s)/g, '\n$1')
    // Add line breaks before dash points
    .replace(/(-\s)/g, '\n$1')
    // Add line breaks before numbered points
    .replace(/(\d+\.\s)/g, '\n$1')
    // Add line breaks before ❌ symbols
    .replace(/(❌\s)/g, '\n$1')
    // Clean up multiple line breaks
    .replace(/\n\s*\n/g, '\n')
    // Trim leading/trailing whitespace
    .trim();
}

// Function to prepare training step data for database insertion
export function prepareTrainingStepData(
  stepData: any,
  trainingPlanId: string,
  stepNumber: number,
  userLanguage: string = "de"
) {
  const parsedSections = parseTrainingContent(stepData.description);

  const baseData = {
    training_plan_id: trainingPlanId,
    step_number: stepNumber,
    title: stepData.title,
    title_en: userLanguage === "en" ? stepData.title : null,
    description: stepData.description, // Keep original description for backward compatibility
    description_en: userLanguage === "en" ? stepData.description : null,
    points_reward: stepData.points || 15,
    is_ai_generated: true,
  };

  // Add structured sections based on language
  if (userLanguage === "en") {
    return {
      ...baseData,
      exercise_goal_en: parsedSections.exerciseGoal || null,
      step_by_step_guide_en: parsedSections.stepByStepGuide || null,
      repetition_duration_en: parsedSections.repetitionDuration || null,
      required_tools_en: parsedSections.requiredTools || null,
      learning_tips_en: parsedSections.learningTips || null,
      common_mistakes_en: parsedSections.commonMistakes || null,
    };
  } else {
    return {
      ...baseData,
      exercise_goal: parsedSections.exerciseGoal || null,
      step_by_step_guide: parsedSections.stepByStepGuide || null,
      repetition_duration: parsedSections.repetitionDuration || null,
      required_tools: parsedSections.requiredTools || null,
      learning_tips: parsedSections.learningTips || null,
      common_mistakes: parsedSections.commonMistakes || null,
    };
  }
}
