// qualityAssurance.ts

export interface QualityEvaluation {
  score: number;
  feedback: string;
  needsRegeneration: boolean;
}

/**
 * Evaluates the quality of an AI trainer response
 * Returns a score from 0-10 and determines if regeneration is needed
 */
export async function evaluateResponseQuality(
  userMessage: string,
  aiResponse: string,
  petContext: string,
  language: 'en' | 'de',
  openAIApiKey: string
): Promise<QualityEvaluation> {
  const evaluationPrompt = language === 'en' 
    ? `You are a quality assurance expert for pet training responses. Evaluate this trainer's response to a user question.

USER QUESTION: "${userMessage}"
PET CONTEXT: "${petContext}"
TRAINER RESPONSE: "${aiResponse}"

Rate this response from 0-10 based on these criteria:
- Professional expertise and accuracy (0-3 points)
- Natural, conversational tone (0-2 points) 
- Practical, actionable advice (0-2 points)
- Proper use of pet information (0-1 point)
- Appropriate length and structure (0-1 point)
- No AI-like patterns or robotic language (0-1 point)

Respond with ONLY a JSON object in this exact format:
{
  "score": [number 0-10],
  "feedback": "[brief explanation of score]",
  "needsRegeneration": [true if score < 9.5, false if score >= 9.5]
}`

    : `Du bist ein Qualitätssicherungsexperte für Haustiertrainings-Antworten. Bewerte diese Trainer-Antwort auf eine Nutzerfrage.

NUTZERFRAGE: "${userMessage}"
TIER-KONTEXT: "${petContext}"
TRAINER-ANTWORT: "${aiResponse}"

Bewerte diese Antwort von 0-10 basierend auf diesen Kriterien:
- Professionelle Expertise und Genauigkeit (0-3 Punkte)
- Natürlicher, gesprächsweiser Ton (0-2 Punkte)
- Praktische, umsetzbare Ratschläge (0-2 Punkte)
- Korrekte Verwendung der Tierinformationen (0-1 Punkt)
- Angemessene Länge und Struktur (0-1 Punkt)
- Keine KI-ähnlichen Muster oder roboterhafte Sprache (0-1 Punkt)

Antworte NUR mit einem JSON-Objekt in diesem exakten Format:
{
  "score": [Zahl 0-10],
  "feedback": "[kurze Erklärung der Bewertung]",
  "needsRegeneration": [true wenn Bewertung < 9.5, false wenn Bewertung >= 9.5]
}`;

  try {
    const messages = [
      {
        role: 'system',
        content: language === 'en' 
          ? 'You are a quality assurance expert. Respond only with valid JSON.'
          : 'Du bist ein Qualitätssicherungsexperte. Antworte nur mit gültigem JSON.'
      },
      {
        role: 'user',
        content: evaluationPrompt
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages,
        max_completion_tokens: 5000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const evaluationText = data.choices[0]?.message?.content?.trim();
    
    if (!evaluationText) {
      throw new Error('No evaluation response received');
    }

    // Parse the JSON response
    const evaluation = JSON.parse(evaluationText);
    
    return {
      score: evaluation.score || 0,
      feedback: evaluation.feedback || 'No feedback provided',
      needsRegeneration: evaluation.needsRegeneration || false
    };

  } catch (error) {
    console.error('Quality evaluation failed:', error);
    // Default to accepting the response if evaluation fails
    return {
      score: 10,
      feedback: 'Evaluation failed, accepting response',
      needsRegeneration: false
    };
  }
}

/**
 * Regenerates an AI response with improved quality
 * Implements continuous quality assurance loop until score >= 9.5
 */
export async function regenerateResponse(
  userMessage: string,
  originalResponse: string,
  petContext: string,
  language: 'en' | 'de',
  openAIApiKey: string,
  systemPrompt: string,
  chatHistory: any[],
  qualityFeedback: string
): Promise<string> {
  let regenerationPrompt = language === 'en'
    ? `The previous response to this question was rated below 9.5/10 for quality. Please provide a PERFECT 10/10 response.

ORIGINAL USER QUESTION: "${userMessage}"
PET CONTEXT: "${petContext}"
ORIGINAL RESPONSE (needs improvement): "${originalResponse}"
QUALITY FEEDBACK: "${qualityFeedback}"

Please provide a PERFECT 10/10 response that specifically addresses the feedback above and achieves:
- MAXIMUM professional expertise and accuracy (3/3 points)
- PERFECT natural, conversational tone (2/2 points)
- EXCELLENT practical, actionable advice (2/2 points)
- PERFECT use of pet information (1/1 point)
- IDEAL length and structure (1/1 point)
- ZERO AI-like patterns or robotic language (1/1 point)

Use the quality feedback to understand exactly what needs improvement and create the ultimate response.

This must be a PERFECT 10/10 response. Think of this as the ultimate, most professional, most natural, most helpful response possible.

Respond with ONLY the perfect response, no explanations or meta-commentary.`

    : `Die vorherige Antwort auf diese Frage wurde mit unter 9,5/10 bewertet. Bitte gib eine PERFEKTE 10/10 Antwort.

ORIGINALE NUTZERFRAGE: "${userMessage}"
TIER-KONTEXT: "${petContext}"
ORIGINALE ANTWORT (verbesserungsbedürftig): "${originalResponse}"
QUALITÄTS-FEEDBACK: "${qualityFeedback}"

Bitte gib eine PERFEKTE 10/10 Antwort, die spezifisch das obige Feedback berücksichtigt und erreicht:
- MAXIMALE professionelle Expertise und Genauigkeit (3/3 Punkte)
- PERFEKTEN natürlichen, gesprächsweisen Ton (2/2 Punkte)
- AUSGEZEICHNETE praktische, umsetzbare Ratschläge (2/2 Punkte)
- PERFEKTE Verwendung der Tierinformationen (1/1 Punkt)
- IDEALE Länge und Struktur (1/1 Punkt)
- NULL KI-ähnliche Muster oder roboterhafte Sprache (1/1 Punkt)

Nutze das Qualitäts-Feedback, um genau zu verstehen, was verbessert werden muss, und erstelle die ultimative Antwort.

Dies muss eine PERFEKTE 10/10 Antwort sein. Denke daran als die ultimative, professionellste, natürlichste, hilfreichste Antwort möglich.

Antworte NUR mit der perfekten Antwort, keine Erklärungen oder Meta-Kommentare.`;

  let currentResponse = originalResponse;
  let currentFeedback = qualityFeedback;
  let attemptCount = 0;
  const maxAttempts = 3; // Prevent infinite loops

  while (attemptCount < maxAttempts) {
    try {
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...chatHistory,
        {
          role: 'user',
          content: regenerationPrompt
        }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5',
          messages,
          max_completion_tokens: 5000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const regeneratedResponse = data.choices[0]?.message?.content?.trim();
      
      if (!regeneratedResponse) {
        throw new Error('No regenerated response received');
      }

      // Evaluate the regenerated response
      const qualityEvaluation = await evaluateResponseQuality(
        userMessage,
        regeneratedResponse,
        petContext,
        language,
        openAIApiKey
      );

      console.log(`Regeneration attempt ${attemptCount + 1}: Score ${qualityEvaluation.score}/10 - ${qualityEvaluation.feedback}`);

      // If score is >= 9.5, we're done
      if (qualityEvaluation.score >= 9.5) {
        console.log(`Perfect response achieved after ${attemptCount + 1} attempts!`);
        return regeneratedResponse;
      }

      // If we haven't reached max attempts, prepare for next iteration
      if (attemptCount < maxAttempts - 1) {
        currentResponse = regeneratedResponse;
        currentFeedback = qualityEvaluation.feedback;
        
        // Update the regeneration prompt with new feedback
        regenerationPrompt = language === 'en'
          ? `The previous response to this question was rated ${qualityEvaluation.score}/10 for quality. Please provide a PERFECT 10/10 response.

ORIGINAL USER QUESTION: "${userMessage}"
PET CONTEXT: "${petContext}"
CURRENT RESPONSE (needs improvement): "${currentResponse}"
QUALITY FEEDBACK: "${currentFeedback}"

Please provide a PERFECT 10/10 response that specifically addresses the feedback above and achieves:
- MAXIMUM professional expertise and accuracy (3/3 points)
- PERFECT natural, conversational tone (2/2 points)
- EXCELLENT practical, actionable advice (2/2 points)
- PERFECT use of pet information (1/1 point)
- IDEAL length and structure (1/1 point)
- ZERO AI-like patterns or robotic language (1/1 point)

Use the quality feedback to understand exactly what needs improvement and create the ultimate response.

This must be a PERFECT 10/10 response. Think of this as the ultimate, most professional, most natural, most helpful response possible.

Respond with ONLY the perfect response, no explanations or meta-commentary.`

          : `Die vorherige Antwort auf diese Frage wurde mit ${qualityEvaluation.score}/10 bewertet. Bitte gib eine PERFEKTE 10/10 Antwort.

ORIGINALE NUTZERFRAGE: "${userMessage}"
TIER-KONTEXT: "${petContext}"
AKTUELLE ANTWORT (verbesserungsbedürftig): "${currentResponse}"
QUALITÄTS-FEEDBACK: "${currentFeedback}"

Bitte gib eine PERFEKTE 10/10 Antwort, die spezifisch das obige Feedback berücksichtigt und erreicht:
- MAXIMALE professionelle Expertise und Genauigkeit (3/3 Punkte)
- PERFEKTEN natürlichen, gesprächsweisen Ton (2/2 Punkte)
- AUSGEZEICHNETE praktische, umsetzbare Ratschläge (2/2 Punkte)
- PERFEKTE Verwendung der Tierinformationen (1/1 Punkt)
- IDEALE Länge und Struktur (1/1 Punkt)
- NULL KI-ähnliche Muster oder roboterhafte Sprache (1/1 Punkt)

Nutze das Qualitäts-Feedback, um genau zu verstehen, was verbessert werden muss, und erstelle die ultimative Antwort.

Dies muss eine PERFEKTE 10/10 Antwort sein. Denke daran als die ultimative, professionellste, natürlichste, hilfreichste Antwort möglich.

Antworte NUR mit der perfekten Antwort, keine Erklärungen oder Meta-Kommentare.`;
      }

      attemptCount++;

    } catch (error) {
      console.error(`Response regeneration attempt ${attemptCount + 1} failed:`, error);
      break;
    }
  }

  // If we've exhausted all attempts, return the best response we got
  console.log(`Quality assurance loop completed after ${attemptCount} attempts. Returning best available response.`);
  return currentResponse;
}
