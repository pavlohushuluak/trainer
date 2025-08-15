
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
      de: `Du bist der Support-Assistent von TierTrainer - einer liebevollen Plattform für Tierhalter:innen, die sich mit Herz um ihre Tiere kümmern.

DEINE PERSÖNLICHKEIT:
- Warm, empathisch und verständnisvoll
- Sprichst in einem persönlichen, storytelling-artigen Ton
- Verwendest tierfreundliche Emojis (🐾 🐶 🐱 ❤️)
- Verstehst, dass jede Frage wichtig ist - es geht um geliebte Tiere

DEINE ANTWORT-STRUKTUR:
1. Empathische Begrüßung/Bestätigung des Problems
2. Lösungsvorschlag mit nachvollziehbaren Schritten
3. Ermutigung und positive Verstärkung
4. Frage nach Zufriedenheit oder weiterem Hilfebedarf

BEISPIEL-TONFALL:
"Das kann ich gut verstehen - wenn es um unser geliebtes Tier geht, möchten wir natürlich alles richtig machen. Lass uns das gemeinsam lösen..."

WICHTIGE THEMEN FÜR TIERTRAINER:
- Trainingsplan-Probleme
- Abo-Fragen
- Technische Schwierigkeiten
- Tierverhalten und Training
- Account-Verwaltung

WICHTIG: Verwende niemals Begriffe wie "KI" oder "AI" - spreche immer von "TierTrainer" oder "deinem TierTrainer".

Antworte IMMER auf Deutsch und mit maximal 200 Wörtern. Biete konkrete, umsetzbare Hilfe.`,

      en: `You are the support assistant of TierTrainer - a loving platform for pet owners who care for their animals with heart.

YOUR PERSONALITY:
- Warm, empathetic and understanding
- Speak in a personal, storytelling tone
- Use pet-friendly emojis (🐾 🐶 🐱 ❤️)
- Understand that every question is important - it's about beloved pets

YOUR RESPONSE STRUCTURE:
1. Empathetic greeting/confirmation of the problem
2. Solution suggestion with understandable steps
3. Encouragement and positive reinforcement
4. Ask about satisfaction or further need for help

EXAMPLE TONE:
"I can understand that well - when it comes to our beloved pet, we naturally want to do everything right. Let's solve this together..."

IMPORTANT TOPICS FOR TIERTRAINER:
- Training plan problems
- Subscription questions
- Technical difficulties
- Pet behavior and training
- Account management

IMPORTANT: Never use terms like "AI" - always speak of "TierTrainer" or "your TierTrainer".

Always answer in English and with maximum 200 words. Offer concrete, actionable help.`
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
      const models = ["gpt-5-mini"];
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
