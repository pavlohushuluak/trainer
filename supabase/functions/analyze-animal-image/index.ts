
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, petName, petSpecies } = await req.json();

    if (!image) {
      throw new Error('Kein Bild bereitgestellt');
    }

    const systemPrompt = `Du bist ein erfahrener Tiertrainer und Verhaltensexperte mit 20 Jahren Erfahrung. 
    
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

    Beispielstil: Auf dem Bild wirkt ${petName} aufmerksam und leicht angespannt. Die Ohren sind nach vorn gerichtet, der Blick ist fokussiert – das zeigt mir, dass ${petName} wahrscheinlich einen interessanten Reiz wahrgenommen hat. Ich empfehle eine ruhige Übung zur Impulskontrolle...`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Bitte analysiere dieses Bild von ${petName} (${petSpecies}). Gib mir eine einfühlsame Einschätzung der Körpersprache, Stimmung und konkrete Empfehlungen für das Training oder den Umgang. Verwende dabei keine Anführungszeichen und schreibe in natürlichen, fließenden Sätzen.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    let analysisText = data.choices[0].message.content;

    // Clean up the analysis text to remove unwanted formatting
    analysisText = analysisText
      .replace(/^["'`]+|["'`]+$/g, '') // Remove quotes at start/end
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Extract mood estimation from the analysis (simplified approach)
    const moodKeywords = {
      'entspannt': ['entspannt', 'ruhig', 'gelassen', 'zufrieden'],
      'aufmerksam': ['aufmerksam', 'fokussiert', 'konzentriert', 'wachsam'],
      'angespannt': ['angespannt', 'gestresst', 'nervös', 'unruhig'],
      'verspielt': ['verspielt', 'fröhlich', 'lebhaft', 'aktiv'],
      'ängstlich': ['ängstlich', 'unsicher', 'zurückhaltend', 'schüchtern']
    };

    let detectedMood = 'aufmerksam';
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => analysisText.toLowerCase().includes(keyword))) {
        detectedMood = mood;
        break;
      }
    }

    // Generate a training recommendation based on the mood
    const recommendations = {
      'entspannt': 'Perfekter Moment für eine neue, leichte Übung oder einfach gemeinsame Kuschelzeit.',
      'aufmerksam': 'Ideal für Fokus-Training oder eine kontrollierte Begegnung mit neuen Reizen.',
      'angespannt': 'Entspannungsübungen und Rückzugsmöglichkeiten wären jetzt hilfreich.',
      'verspielt': 'Zeit für aktives Spiel oder körperliche Herausforderungen!',
      'ängstlich': 'Vertrauensbildende Übungen und eine ruhige Umgebung sind wichtig.'
    };

    const result = {
      summary_text: analysisText,
      mood_estimation: detectedMood,
      recommendation: recommendations[detectedMood as keyof typeof recommendations],
      followup_suggestion: 'Möchtest du, dass ich dir einen passenden Trainingsplan dafür erstelle?',
      confidence_level: 'hoch'
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-animal-image function:', error);
    return new Response(JSON.stringify({ 
      error: 'Bildanalyse fehlgeschlagen', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
