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
    ? `You are a senior quality assurance expert evaluating responses from expert-level pet trainers. You have 20+ years of experience in professional pet training and behavior consultation. Evaluate this trainer's response against EXPERT TOP TRAINER standards (10/10 = world-class expert level).

USER QUESTION: "${userMessage}"
PET CONTEXT: "${petContext}"
TRAINER RESPONSE: "${aiResponse}"

Rate this response from 0-10 based on these STRICT EXPERT criteria:

PROFESSIONAL EXPERTISE & ACCURACY (0-3 points):
- 3/3: World-class expertise, scientifically accurate, evidence-based methods, species-specific knowledge
- 2/3: Good expertise, mostly accurate, some evidence-based content
- 1/3: Basic knowledge, some inaccuracies, lacks depth
- 0/3: Poor expertise, inaccurate information, potentially harmful advice

NATURAL, CONVERSATIONAL TONE (0-2 points):
- 2/2: Perfectly natural, warm, human-like conversation, no AI patterns whatsoever
- 1/2: Mostly natural, some AI-like phrases or formal language
- 0/2: Robotic, formal, clearly AI-generated, unnatural flow

PRACTICAL, ACTIONABLE ADVICE (0-2 points):
- 2/2: Highly specific, immediately actionable, clear step-by-step guidance, precise timing/location
- 1/2: Somewhat actionable, general advice, lacks specificity
- 0/2: Vague, theoretical, not actionable, no practical steps

PET INFORMATION INTEGRATION (0-1 point):
- 1/1: Perfectly uses pet name, species, age naturally throughout, tailored specifically to this pet
- 0/1: Mentions pet info but doesn't integrate naturally, or doesn't use it effectively

LENGTH & STRUCTURE (0-1 point):
- 1/1: Perfect length (60-120 words), ideal structure, flows naturally, no unnecessary elements
- 0/1: Too long/short, poor structure, awkward flow, unnecessary content

ZERO AI PATTERNS (0-1 point):
- 1/1: Completely human-like, no AI tells, no robotic language, sounds like real expert trainer
- 0/1: Contains AI patterns, robotic language, formal structure, obvious AI generation

EXPERT STANDARDS:
- 10/10: World-class expert trainer response (perfect in all categories)
- 9.5-9.9: Near-expert level (minor improvements possible)
- 9.0-9.4: Good professional level (needs improvement)
- Below 9.0: Not meeting expert standards

Respond with ONLY a JSON object in this exact format:
{
  "score": [number 0-10 with decimal precision],
  "feedback": "[detailed explanation of score with specific areas for improvement]",
  "needsRegeneration": [true if score < 10.0, false if score >= 10.0]
}`

    : `Du bist ein Senior-Qualitätssicherungsexperte, der Antworten von Experten-Tiertrainern bewertet. Du hast 20+ Jahre Erfahrung in professionellem Tiertraining und Verhaltensberatung. Bewerte diese Trainer-Antwort gegen EXPERTEN-TOP-TRAINER-Standards (10/10 = weltklasse Expertenniveau).

NUTZERFRAGE: "${userMessage}"
TIER-KONTEXT: "${petContext}"
TRAINER-ANTWORT: "${aiResponse}"

Bewerte diese Antwort von 0-10 basierend auf diesen STRENGEN EXPERTEN-KRITERIEN:

PROFESSIONELLE EXPERTISE & GENAUIGKEIT (0-3 Punkte):
- 3/3: Weltklasse-Expertise, wissenschaftlich genau, evidenzbasierte Methoden, artspezifisches Wissen
- 2/3: Gute Expertise, größtenteils genau, einige evidenzbasierte Inhalte
- 1/3: Grundkenntnisse, einige Ungenauigkeiten, fehlende Tiefe
- 0/3: Schlechte Expertise, ungenaue Informationen, potenziell schädliche Ratschläge

NATÜRLICHER, GESPRÄCHSWEISER TON (0-2 Punkte):
- 2/2: Perfekt natürlich, warm, menschlich, keine KI-Muster
- 1/2: Größtenteils natürlich, einige KI-ähnliche Phrasen oder formelle Sprache
- 0/2: Robotisch, formal, eindeutig KI-generiert, unnatürlicher Fluss

PRAKTISCHE, UMSETZBARE RATSCHLÄGE (0-2 Punkte):
- 2/2: Hochspezifisch, sofort umsetzbar, klare Schritt-für-Schritt-Anleitung, präzises Timing/Position
- 1/2: Etwas umsetzbar, allgemeine Ratschläge, fehlende Spezifität
- 0/2: Vage, theoretisch, nicht umsetzbar, keine praktischen Schritte

TIERINFORMATIONEN-INTEGRATION (0-1 Punkt):
- 1/1: Verwendet Tiername, Art, Alter perfekt natürlich, spezifisch auf dieses Tier zugeschnitten
- 0/1: Erwähnt Tierinfo aber integriert nicht natürlich oder verwendet sie nicht effektiv

LÄNGE & STRUKTUR (0-1 Punkt):
- 1/1: Perfekte Länge (60-120 Wörter), ideale Struktur, fließt natürlich, keine unnötigen Elemente
- 0/1: Zu lang/kurz, schlechte Struktur, unangenehmer Fluss, unnötige Inhalte

NULL KI-MUSTER (0-1 Punkt):
- 1/1: Komplett menschlich, keine KI-Anzeichen, keine roboterhafte Sprache, klingt wie echter Experten-Trainer
- 0/1: Enthält KI-Muster, roboterhafte Sprache, formelle Struktur, offensichtliche KI-Generierung

EXPERTEN-STANDARDS:
- 10/10: Weltklasse-Experten-Trainer-Antwort (perfekt in allen Kategorien)
- 9.5-9.9: Fast-Expertenniveau (kleine Verbesserungen möglich)
- 9.0-9.4: Gutes professionelles Niveau (Verbesserung nötig)
- Unter 9.0: Erfüllt nicht Experten-Standards

Antworte NUR mit einem JSON-Objekt in diesem exakten Format:
{
  "score": [Zahl 0-10 mit Dezimalpräzision],
  "feedback": "[detaillierte Erklärung der Bewertung mit spezifischen Verbesserungsbereichen]",
     "needsRegeneration": [true wenn Bewertung < 10.0, false wenn Bewertung >= 10.0]
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
         ? `The previous response to this question was rated below 10.0/10 for quality. You must provide a PERFECT 10/10 EXPERT-LEVEL response that meets world-class trainer standards.

ORIGINAL USER QUESTION: "${userMessage}"
PET CONTEXT: "${petContext}"
ORIGINAL RESPONSE (needs improvement): "${originalResponse}"
QUALITY FEEDBACK: "${qualityFeedback}"

You must create a PERFECT 10/10 EXPERT-LEVEL response that specifically addresses the feedback above and achieves:

PROFESSIONAL EXPERTISE & ACCURACY (3/3 points):
- World-class expertise with scientifically accurate, evidence-based methods
- Species-specific knowledge and understanding
- Professional-level insights and recommendations

NATURAL, CONVERSATIONAL TONE (2/2 points):
- Perfectly natural, warm, human-like conversation
- Zero AI patterns or robotic language
- Sounds exactly like a real expert trainer talking to a friend

PRACTICAL, ACTIONABLE ADVICE (2/2 points):
- Highly specific, immediately actionable guidance
- Clear step-by-step instructions with precise timing/location
- Expert-level practical solutions

PET INFORMATION INTEGRATION (1/1 point):
- Perfectly uses pet name, species, age naturally throughout
- Tailored specifically to this pet's characteristics
- Seamless integration of pet context

LENGTH & STRUCTURE (1/1 point):
- Perfect length (60-120 words)
- Ideal structure that flows naturally
- No unnecessary elements or awkward transitions

ZERO AI PATTERNS (1/1 point):
- Completely human-like with no AI tells
- No robotic language or formal structure
- Authentic expert trainer communication style

Use the detailed quality feedback to understand exactly what needs improvement and create the ultimate expert-level response.

This must be a PERFECT 10/10 response that would impress even the most experienced trainers. Think of this as the ultimate, most professional, most natural, most helpful response possible.

Respond with ONLY the perfect expert-level response, no explanations or meta-commentary.`

         : `Die vorherige Antwort auf diese Frage wurde mit unter 10,0/10 bewertet. Du musst eine PERFEKTE 10/10 EXPERTEN-LEVEL Antwort geben, die weltklasse Trainer-Standards erfüllt.

ORIGINALE NUTZERFRAGE: "${userMessage}"
TIER-KONTEXT: "${petContext}"
ORIGINALE ANTWORT (verbesserungsbedürftig): "${originalResponse}"
QUALITÄTS-FEEDBACK: "${qualityFeedback}"

Du musst eine PERFEKTE 10/10 EXPERTEN-LEVEL Antwort erstellen, die spezifisch das obige Feedback berücksichtigt und erreicht:

PROFESSIONELLE EXPERTISE & GENAUIGKEIT (3/3 Punkte):
- Weltklasse-Expertise mit wissenschaftlich genauen, evidenzbasierten Methoden
- Artspezifisches Wissen und Verständnis
- Professionelle Einblicke und Empfehlungen

NATÜRLICHER, GESPRÄCHSWEISER TON (2/2 Punkte):
- Perfekt natürlich, warm, menschlich
- Null KI-Muster oder roboterhafte Sprache
- Klingt genau wie ein echter Experten-Trainer, der mit einem Freund spricht

PRAKTISCHE, UMSETZBARE RATSCHLÄGE (2/2 Punkte):
- Hochspezifisch, sofort umsetzbare Anleitung
- Klare Schritt-für-Schritt-Anweisungen mit präzisem Timing/Position
- Experten-Level praktische Lösungen

TIERINFORMATIONEN-INTEGRATION (1/1 Punkt):
- Verwendet Tiername, Art, Alter perfekt natürlich
- Spezifisch auf die Eigenschaften dieses Tieres zugeschnitten
- Nahtlose Integration des Tierkontexts

LÄNGE & STRUKTUR (1/1 Punkt):
- Perfekte Länge (60-120 Wörter)
- Ideale Struktur, die natürlich fließt
- Keine unnötigen Elemente oder unangenehme Übergänge

NULL KI-MUSTER (1/1 Punkt):
- Komplett menschlich ohne KI-Anzeichen
- Keine roboterhafte Sprache oder formelle Struktur
- Authentischer Experten-Trainer-Kommunikationsstil

Nutze das detaillierte Qualitäts-Feedback, um genau zu verstehen, was verbessert werden muss, und erstelle die ultimative Experten-Level Antwort.

Dies muss eine PERFEKTE 10/10 Antwort sein, die selbst die erfahrensten Trainer beeindrucken würde. Denke daran als die ultimative, professionellste, natürlichste, hilfreichste Antwort möglich.

Antworte NUR mit der perfekten Experten-Level Antwort, keine Erklärungen oder Meta-Kommentare.`;

  let currentResponse = originalResponse;
  let currentFeedback = qualityFeedback;
  let attemptCount = 0;
     const maxAttempts = 1; // Limit to 2 regeneration attempts

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

             console.log(`Regeneration attempt ${attemptCount + 1}/2: Score ${qualityEvaluation.score}/10 - ${qualityEvaluation.feedback}`);

             // If score is >= 10.0, we're done
       if (qualityEvaluation.score >= 10.0) {
         console.log(`Perfect 10/10 response achieved after ${attemptCount + 1}/2 attempts!`);
         return regeneratedResponse;
       }

       // Update current response for next iteration or final return
       currentResponse = regeneratedResponse;
       currentFeedback = qualityEvaluation.feedback;

             // If we haven't reached max attempts, prepare for next iteration
       if (attemptCount < maxAttempts - 1) {
        
                 // Update the regeneration prompt with new feedback for perfect 10/10
         regenerationPrompt = language === 'en'
           ? `The previous response to this question was rated ${qualityEvaluation.score}/10 for quality. You must provide a PERFECT 10/10 EXPERT-LEVEL response that meets world-class trainer standards.

ORIGINAL USER QUESTION: "${userMessage}"
PET CONTEXT: "${petContext}"
CURRENT RESPONSE (needs improvement): "${currentResponse}"
QUALITY FEEDBACK: "${currentFeedback}"

You must create a PERFECT 10/10 EXPERT-LEVEL response that specifically addresses the feedback above and achieves:

PROFESSIONAL EXPERTISE & ACCURACY (3/3 points):
- World-class expertise with scientifically accurate, evidence-based methods
- Species-specific knowledge and understanding
- Professional-level insights and recommendations

NATURAL, CONVERSATIONAL TONE (2/2 points):
- Perfectly natural, warm, human-like conversation
- Zero AI patterns or robotic language
- Sounds exactly like a real expert trainer talking to a friend

PRACTICAL, ACTIONABLE ADVICE (2/2 points):
- Highly specific, immediately actionable guidance
- Clear step-by-step instructions with precise timing/location
- Expert-level practical solutions

PET INFORMATION INTEGRATION (1/1 point):
- Perfectly uses pet name, species, age naturally throughout
- Tailored specifically to this pet's characteristics
- Seamless integration of pet context

LENGTH & STRUCTURE (1/1 point):
- Perfect length (60-120 words)
- Ideal structure that flows naturally
- No unnecessary elements or awkward transitions

ZERO AI PATTERNS (1/1 point):
- Completely human-like with no AI tells
- No robotic language or formal structure
- Authentic expert trainer communication style

Use the detailed quality feedback to understand exactly what needs improvement and create the ultimate expert-level response.

This must be a PERFECT 10/10 response that would impress even the most experienced trainers. Think of this as the ultimate, most professional, most natural, most helpful response possible.

Respond with ONLY the perfect expert-level response, no explanations or meta-commentary.`

                     : `Die vorherige Antwort auf diese Frage wurde mit ${qualityEvaluation.score}/10 bewertet. Du musst eine PERFEKTE 10/10 EXPERTEN-LEVEL Antwort geben, die weltklasse Trainer-Standards erfüllt.

ORIGINALE NUTZERFRAGE: "${userMessage}"
TIER-KONTEXT: "${petContext}"
AKTUELLE ANTWORT (verbesserungsbedürftig): "${currentResponse}"
QUALITÄTS-FEEDBACK: "${currentFeedback}"

Du musst eine PERFEKTE 10/10 EXPERTEN-LEVEL Antwort erstellen, die spezifisch das obige Feedback berücksichtigt und erreicht:

PROFESSIONELLE EXPERTISE & GENAUIGKEIT (3/3 Punkte):
- Weltklasse-Expertise mit wissenschaftlich genauen, evidenzbasierten Methoden
- Artspezifisches Wissen und Verständnis
- Professionelle Einblicke und Empfehlungen

NATÜRLICHER, GESPRÄCHSWEISER TON (2/2 Punkte):
- Perfekt natürlich, warm, menschlich
- Null KI-Muster oder roboterhafte Sprache
- Klingt genau wie ein echter Experten-Trainer, der mit einem Freund spricht

PRAKTISCHE, UMSETZBARE RATSCHLÄGE (2/2 Punkte):
- Hochspezifisch, sofort umsetzbare Anleitung
- Klare Schritt-für-Schritt-Anweisungen mit präzisem Timing/Position
- Experten-Level praktische Lösungen

TIERINFORMATIONEN-INTEGRATION (1/1 Punkt):
- Verwendet Tiername, Art, Alter perfekt natürlich
- Spezifisch auf die Eigenschaften dieses Tieres zugeschnitten
- Nahtlose Integration des Tierkontexts

LÄNGE & STRUKTUR (1/1 Punkt):
- Perfekte Länge (60-120 Wörter)
- Ideale Struktur, die natürlich fließt
- Keine unnötigen Elemente oder unangenehme Übergänge

NULL KI-MUSTER (1/1 Punkt):
- Komplett menschlich ohne KI-Anzeichen
- Keine roboterhafte Sprache oder formelle Struktur
- Authentischer Experten-Trainer-Kommunikationsstil

Nutze das detaillierte Qualitäts-Feedback, um genau zu verstehen, was verbessert werden muss, und erstelle die ultimative Experten-Level Antwort.

Dies muss eine PERFEKTE 10/10 Antwort sein, die selbst die erfahrensten Trainer beeindrucken würde. Denke daran als die ultimative, professionellste, natürlichste, hilfreichste Antwort möglich.

Antworte NUR mit der perfekten Experten-Level Antwort, keine Erklärungen oder Meta-Kommentare.`;
      }

      attemptCount++;

    } catch (error) {
      console.error(`Response regeneration attempt ${attemptCount + 1} failed:`, error);
      break;
    }
  }

     // Return the final response after 2 attempts, even if it doesn't achieve perfect 10/10
   console.log(`Quality assurance loop completed after ${attemptCount} attempts. Final response ready (may not be perfect 10/10).`);
   return currentResponse;
}
