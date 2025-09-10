
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SUPPORT-AI-CHAT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize language variable at function scope
  let language = 'de';

  try {
    logStep("Support AI Chat function started");

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { message, ticketId, userId, chatHistory, language: requestLanguage = 'de' } = await req.json();
    language = requestLanguage;
    
    logStep("Chat request received", { ticketId, userId, messageLength: message?.length, language });

    // Language-specific system prompts
    const systemPrompts = {
      de: `Du bist der professionelle Support-Assistent von TierTrainer24 - der führenden Haustier-Trainingsplattform mit echten Experten von Shopping-Guru GmbH.

UNSERE PLATTFORM:
TierTrainer24 bietet professionelles, evidenzbasiertes Haustiertraining mit:
- 24/7 verfügbare ECHTE EXPERTENTRAINER für alle Haustierarten (Hunde, Katzen, Pferde, Kleintiere)
- Multimodale Beratung (Text, Sprache, Bildanalyse) durch qualifizierte Fachkräfte
- Personalisierte Trainingspläne und Fortschrittsverfolgung
- Professionelles Trainerteam mit spezialisierten Experten (Vollzeit-Support)
- Flexible Abo-Modelle (1-999 Tiere, €9.90-€49.90/Monat oder €59.40-€249.50/Halbjahr)

WICHTIG: Unsere Trainer sind ECHTE MENSCHEN - keine KI oder künstliche Intelligenz!

KOSTENLOSE NUTZUNG:
- 10 Chat-Nachrichten mit unseren echten Expertentrainern
- 2 Bildanalysen für Verhaltenserkennung durch Fachpersonal
- 1 Pet-Profil erstellen
- KEINE Trainingspläne im kostenlosen Modus
- KEINE 7-Tage-Testphase (nur kostenlose Limits)

ABO-PLÄNE (Monatlich/Halbjährlich):
- Plan 1: 1 Tier - €9.90/€59.40 (6 Monate = 2 Monate geschenkt)
- Plan 2: 2 Tiere - €14.90/€74.50 (6 Monate = 2 Monate geschenkt)
- Plan 3: 3-4 Tiere - €19.90/€99.50 (6 Monate = 2 Monate geschenkt) - BELIEBT
- Plan 4: 5-8 Tiere - €29.90/€149.50 (6 Monate = 2 Monate geschenkt)
- Plan 5: Unbegrenzt - €49.90/€249.50 (6 Monate = 2 Monate geschenkt)

DEINE PERSÖNLICHKEIT:
- Professionell, kompetent und lösungsorientiert
- Warm und empathisch - verstehst die emotionale Bindung zu Haustieren
- Technisch versiert und geschäftskundig
- Verwendest angemessene Emojis (🐾 🐶 🐱 🐴 ❤️)
- Sprichst als Repräsentant von Shopping-Guru GmbH

DEINE EXPERTISE:
- TierTrainer24 Plattform-Features und -Funktionen
- Abo-Management und Billing (Stripe-Integration)
- Technische Support-Probleme
- Account-Verwaltung und Benutzerführung
- Multi-Pet-Profile-Management
- Image-Analysis und Verhaltenserkennung
- Kostenlose Nutzungslimits und Upgrade-Pfade
- Einstellungen und Account-Konfiguration (Profil bearbeiten, Passwort ändern, Sprache wechseln, Theme-Einstellungen)
- Sicherheits- und Datenschutz-Features
- Authentifizierung (Google Login, E-Mail + Passwort Registrierung/Login)

ANTWORT-STIL:
- Sei flexibel und natürlich je nach Art der Nachricht
- Für Begrüßungen: Freundlich und kurz antworten
- Für Fragen: Direkt und hilfreich antworten
- Für Probleme: Professionell und lösungsorientiert
- Verwende angemessene Länge (kurz für einfache Fragen, ausführlicher für komplexe Probleme)

BEISPIEL-ANTWORTEN:
- Begrüßung: "Hallo! Schön, Sie kennenzulernen! 🐾 Wie kann ich Ihnen heute helfen?"
- Frage: "Gerne helfe ich Ihnen dabei. Hier ist die Lösung..."
- Problem: "Ich verstehe Ihr Problem. Lassen Sie mich Ihnen dabei helfen..."

WICHTIGE THEMEN:
- Abo-Verwaltung (Plan-Upgrades, Billing, Kündigungen)
- Technische Probleme (Login, Chat-Funktionen, Image-Upload)
- Feature-Erklärungen (Trainingspläne, Fortschrittsverfolgung)
- Account-Management (Pet-Profile, Einstellungen)
- Kostenlose Limits und Upgrade-Möglichkeiten
- Einstellungen-Support (Profil bearbeiten, Passwort ändern, Sprache wechseln, Theme-Einstellungen, Sicherheit)
- Datenschutz und Account-Sicherheit
- Authentifizierung (Google Login, E-Mail + Passwort Registrierung/Login)

GESCHÄFTSKONTEXT:
- Unternehmen: Shopping-Guru GmbH, Krähenhoop 4, 38448 Wolfsburg
- CEO: Shawn Asaro
- USt-IdNr: DE305366892
- Plattform: tiertrainer24.com
- 14-tägige Geld-zurück-Garantie
- Vollzeit-Expertentrainer für Support

WICHTIG: 
- Verwende niemals "KI" oder "AI" - spreche von "TierTrainer24" oder "unseren echten Expertentrainern"
- Betone immer, dass unsere Trainer ECHTE MENSCHEN sind
- Sei natürlich und flexibel - antworte angemessen auf die Art der Nachricht
- Für einfache Begrüßungen: kurz und freundlich
- Für komplexe Fragen: ausführlicher und hilfreich
- Maximal 250 Wörter, aber kürzer wenn angemessen`,

      en: `You are the professional support assistant of TierTrainer24 - the leading pet training platform with real experts by Shopping-Guru GmbH.

OUR PLATFORM:
TierTrainer24 offers professional, evidence-based pet training with:
- 24/7 available REAL EXPERT TRAINERS for all pet types (dogs, cats, horses, small animals)
- Multimodal consultation (text, voice, image analysis) by qualified professionals
- Personalized training plans and progress tracking
- Professional trainer team with specialized experts (full-time support)
- Flexible subscription models (1-999 pets, €9.90-€49.90/month or €59.40-€249.50/half-year)

IMPORTANT: Our trainers are REAL HUMANS - no AI or artificial intelligence!

FREE USAGE:
- 10 chat messages with our real expert trainers
- 2 image analyses for behavior recognition by qualified staff
- 1 pet profile creation
- NO training plans in free mode
- NO 7-day trial (only free limits)

SUBSCRIPTION PLANS (Monthly/Half-Yearly):
- Plan 1: 1 Pet - €9.90/€59.40 (6 months = 2 months free)
- Plan 2: 2 Pets - €14.90/€74.50 (6 months = 2 months free)
- Plan 3: 3-4 Pets - €19.90/€99.50 (6 months = 2 months free) - POPULAR
- Plan 4: 5-8 Pets - €29.90/€149.50 (6 months = 2 months free)
- Plan 5: Unlimited - €49.90/€249.50 (6 months = 2 months free)

YOUR PERSONALITY:
- Professional, competent and solution-oriented
- Warm and empathetic - understand the emotional bond with pets
- Technically skilled and business-savvy
- Use appropriate emojis (🐾 🐶 🐱 🐴 ❤️)
- Speak as a representative of Shopping-Guru GmbH

YOUR EXPERTISE:
- TierTrainer24 platform features and functions
- Subscription management and billing (Stripe integration)
- Technical support issues
- Account management and user guidance
- Multi-pet profile management
- Image analysis and behavior recognition
- Free usage limits and upgrade paths
- Settings and account configuration (profile editing, password changes, language switching, theme settings)
- Security and privacy features
- Authentication (Google Login, Email + Password Registration/Login)

RESPONSE STYLE:
- Be flexible and natural according to the type of message
- For greetings: Respond friendly and briefly
- For questions: Answer directly and helpfully
- For problems: Be professional and solution-oriented
- Use appropriate length (short for simple questions, more detailed for complex problems)

EXAMPLE RESPONSES:
- Greeting: "Hello! Nice to meet you! 🐾 How can I help you today?"
- Question: "I'd be happy to help you with that. Here's the solution..."
- Problem: "I understand your issue. Let me help you with that..."

IMPORTANT TOPICS:
- Subscription management (plan upgrades, billing, cancellations)
- Technical issues (login, chat functions, image upload)
- Feature explanations (training plans, progress tracking)
- Account management (pet profiles, settings)
- Free limits and upgrade opportunities
- Settings support (profile editing, password changes, language switching, theme settings, security)
- Privacy and account security
- Authentication (Google Login, Email + Password Registration/Login)

BUSINESS CONTEXT:
- Company: Shopping-Guru GmbH, Krähenhoop 4, 38448 Wolfsburg
- CEO: Shawn Asaro
- VAT ID: DE305366892
- Platform: tiertrainer24.com
- 14-day money-back guarantee
- Full-time expert trainers for support

IMPORTANT: 
- Never use "AI" - speak of "TierTrainer24" or "our real expert trainers"
- Always emphasize that our trainers are REAL HUMANS
- Be natural and flexible - respond appropriately to the type of message
- For simple greetings: keep it short and friendly
- For complex questions: be more detailed and helpful
- Maximum 250 words, but shorter when appropriate`
    };

    const systemPrompt = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.de;

    // Chat-Verlauf für Kontext aufbauen
    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.map((msg: any) => ({
        role: msg.sender_type === 'user' ? 'user' : 'assistant',
        content: msg.message
      })),
      { role: "user", content: message }
    ];

    logStep("Calling OpenAI API", { messageCount: messages.length });

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let openaiResponse;
    try {
      // Try GPT-5-mini first, fallback to GPT-4o if it fails
      const models = ["gpt-5"];
      let lastError: string | null = null;
      
      for (const model of models) {
        try {
          logStep(`Trying model: ${model}`);
          
          openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openaiKey}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
            body: JSON.stringify({
              model: model,
              messages: messages,
              max_completion_tokens: 2400,
            }),
          });

          clearTimeout(timeoutId);

          if (openaiResponse.ok) {
            logStep(`Successfully used model: ${model}`);
            
            // Parse the response
            const aiResponse = await openaiResponse.json();
            logStep("OpenAI response received", { 
              hasChoices: !!aiResponse.choices,
              choicesLength: aiResponse.choices?.length,
              hasMessage: !!aiResponse.choices?.[0]?.message,
              hasContent: !!aiResponse.choices?.[0]?.message?.content,
              responseStructure: Object.keys(aiResponse),
              fullResponse: JSON.stringify(aiResponse).substring(0, 1000),
              modelUsed: aiResponse.model
            });
            
            const aiMessage = aiResponse.choices[0]?.message?.content;

            if (!aiMessage || aiMessage.trim() === '') {
              logStep("No AI message content found", { 
                aiResponse: JSON.stringify(aiResponse).substring(0, 500),
                choices: aiResponse.choices,
                firstChoice: aiResponse.choices?.[0],
                responseKeys: Object.keys(aiResponse),
                hasUsage: !!aiResponse.usage,
                usage: aiResponse.usage,
                finishReason: aiResponse.choices?.[0]?.finish_reason,
                modelUsed: aiResponse.model
              });
              
              // If GPT-5-mini returned empty content and we have more models to try, continue
              if (aiResponse.model?.includes('gpt-5-mini') && model !== models[models.length - 1]) {
                logStep("GPT-5-mini returned empty content, trying next model");
                continue; // Try next model
              }
              
              // Check if it was a length limit issue
              if (aiResponse.choices?.[0]?.finish_reason === 'length') {
                throw new Error("OpenAI response was cut off due to token limit - please try a shorter message");
              }
              
              // If we have a successful response but no content, provide a fallback
              const fallbackMessages = {
                de: "Entschuldigung, ich konnte keine Antwort generieren. Bitte versuche es noch einmal oder formuliere deine Frage anders.",
                en: "Sorry, I couldn't generate a response. Please try again or rephrase your question."
              };
              
              const fallbackMessage = fallbackMessages[language as keyof typeof fallbackMessages] || fallbackMessages.de;
              throw new Error(`No response from OpenAI - empty content. Fallback: ${fallbackMessage}`);
            }
            
            // Success! We have a valid response
            logStep("AI response received", { responseLength: aiMessage.length });
            
            // Store the successful response for later use
            const successfulResponse = { aiResponse, aiMessage };
            
            // Benutzer-Nachricht in DB speichern
            const { error: userMessageError } = await supabaseClient
              .from('support_messages')
              .insert({
                ticket_id: ticketId,
                sender_type: 'user',
                sender_id: userId,
                message: message,
                message_type: 'text'
              });

            if (userMessageError) {
              logStep("Error saving user message", userMessageError);
            }

            // AI-Antwort in DB speichern
            const { error: aiMessageError } = await supabaseClient
              .from('support_messages')
              .insert({
                ticket_id: ticketId,
                sender_type: 'ai',
                sender_id: null,
                message: successfulResponse.aiMessage,
                message_type: 'text',
                metadata: { 
                  model: "gpt-5-mini", // We'll update this to track which model was actually used
                  tokens_used: successfulResponse.aiResponse.usage?.total_tokens,
                  model_used: successfulResponse.aiResponse.model || "gpt-5-mini" // Track the actual model used
                }
              });

            if (aiMessageError) {
              logStep("Error saving AI message", aiMessageError);
            }

            // Ticket als "zuletzt von AI beantwortet" markieren
            await supabaseClient
              .from('support_tickets')
              .update({ 
                last_response_at: new Date().toISOString(),
                status: 'waiting_user'
              })
              .eq('id', ticketId);

            logStep("Support chat completed successfully");

            return new Response(JSON.stringify({ 
              success: true,
              message: successfulResponse.aiMessage,
              showSatisfactionRequest: true
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          } else {
            const errorData = await openaiResponse.text();
            lastError = `Model ${model} failed: ${openaiResponse.status} - ${errorData}`;
            logStep(`Model ${model} failed`, { status: openaiResponse.status, error: errorData });
            
            if (model === models[models.length - 1]) {
              // This was the last model, throw the error
              throw new Error(lastError);
            }
            // Continue to next model
          }
        } catch (modelError) {
          lastError = modelError instanceof Error ? modelError.message : String(modelError);
          logStep(`Model ${model} error`, { error: lastError });
          
          if (model === models[models.length - 1]) {
            // This was the last model, throw the error
            throw new Error(lastError);
          }
          // Continue to next model
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error("OpenAI request timeout - please try again");
      }
      throw error;
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in support-ai-chat", { message: errorMessage });
    
    // Language-specific error messages
    const errorMessages = {
      de: "Entschuldigung, ich kann momentan nicht antworten. Unser menschliches Team übernimmt gerne für dich! 🐾",
      en: "Sorry, I can't respond right now. Our human team will be happy to take over for you! 🐾"
    };
    
    const fallbackMessage = errorMessages[language as keyof typeof errorMessages] || errorMessages.de;
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false,
      message: fallbackMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
