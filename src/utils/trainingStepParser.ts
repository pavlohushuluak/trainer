// Utility function to parse structured training content and extract sections
export type ParsedTrainingSections = {
  exerciseGoal: string;
  stepByStepGuide: string;
  repetitionDuration: string;
  requiredTools: string;
  learningTips: string;
  commonMistakes: string;
};

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

  // ✅ Preprocess: insert line breaks before each known section header
  let preProcessed = content
    .replace(/\s*(Exercise Goal:)/gi, "\n$1")
    .replace(/\s*(Step-by-Step Guide:)/gi, "\n$1")
    .replace(/\s*(🔁 Repetition & Duration:)/gi, "\n$1")
    .replace(/\s*(🧰 Required Tools & Framework:)/gi, "\n$1")
    .replace(/\s*(🧠 Learning Tips & Motivation:)/gi, "\n$1")
    .replace(/\s*(🚩 Avoid Common Mistakes:)/gi, "\n$1");

  // Split content into lines and clean them
  const lines = preProcessed
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  let currentSection = "";
  let sectionContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Section detection
    if (lowerLine.startsWith("exercise goal:")) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection as keyof ParsedTrainingSections] = sectionContent.join("\n").trim();
      }
      currentSection = "exerciseGoal";
      sectionContent = [line.substring(line.indexOf(":") + 1).trim()];
      continue;
    }

    if (lowerLine.startsWith("step-by-step guide:")) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection as keyof ParsedTrainingSections] = sectionContent.join("\n").trim();
      }
      currentSection = "stepByStepGuide";
      sectionContent = [line.substring(line.indexOf(":") + 1).trim()];
      continue;
    }

    if (lowerLine.startsWith("🔁 repetition & duration:")) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection as keyof ParsedTrainingSections] = sectionContent.join("\n").trim();
      }
      currentSection = "repetitionDuration";
      sectionContent = [line.substring(line.indexOf(":") + 1).trim()];
      continue;
    }

    if (lowerLine.startsWith("🧰 required tools & framework:")) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection as keyof ParsedTrainingSections] = sectionContent.join("\n").trim();
      }
      currentSection = "requiredTools";
      sectionContent = [line.substring(line.indexOf(":") + 1).trim()];
      continue;
    }

    if (lowerLine.startsWith("🧠 learning tips & motivation:")) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection as keyof ParsedTrainingSections] = sectionContent.join("\n").trim();
      }
      currentSection = "learningTips";
      sectionContent = [line.substring(line.indexOf(":") + 1).trim()];
      continue;
    }

    if (lowerLine.startsWith("🚩 avoid common mistakes:")) {
      if (currentSection && sectionContent.length > 0) {
        sections[currentSection as keyof ParsedTrainingSections] = sectionContent.join("\n").trim();
      }
      currentSection = "commonMistakes";
      sectionContent = [line.substring(line.indexOf(":") + 1).trim()];
      continue;
    }

    // Otherwise, add to current section
    if (currentSection) {
      sectionContent.push(line);
    }
  }

  // Save the last section
  if (currentSection && sectionContent.length > 0) {
    sections[currentSection as keyof ParsedTrainingSections] = sectionContent.join("\n").trim();
  }

  // ✅ Post-process formatting
  if (sections.stepByStepGuide) {
    sections.stepByStepGuide = formatStepByStepGuide(sections.stepByStepGuide);
  }
  if (sections.repetitionDuration) {
    sections.repetitionDuration = formatRepetitionDuration(sections.repetitionDuration);
  }
  if (sections.requiredTools) {
    sections.requiredTools = formatRequiredTools(sections.requiredTools);
  }
  if (sections.learningTips) {
    sections.learningTips = formatLearningTips(sections.learningTips);
  }
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
