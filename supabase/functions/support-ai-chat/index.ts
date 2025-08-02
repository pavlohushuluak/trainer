
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

  try {
    logStep("Support AI Chat function started");

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { message, ticketId, userId, chatHistory } = await req.json();
    
    logStep("Chat request received", { ticketId, userId, messageLength: message?.length });

    // Empathisches System-Prompt für TierTrainer-Support
    const systemPrompt = `Du bist der Support-Assistent von TierTrainer - einer liebevollen Plattform für Tierhalter:innen, die sich mit Herz um ihre Tiere kümmern.

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

Antworte IMMER auf Deutsch und mit maximal 200 Wörtern. Biete konkrete, umsetzbare Hilfe.`;

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

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      logStep("OpenAI API error", { status: openaiResponse.status, error: errorData });
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const aiResponse = await openaiResponse.json();
    const aiMessage = aiResponse.choices[0]?.message?.content;

    if (!aiMessage) {
      throw new Error("No response from OpenAI");
    }

    logStep("AI response received", { responseLength: aiMessage.length });

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
        message: aiMessage,
        message_type: 'text',
        metadata: { 
          model: "gpt-4",
          tokens_used: aiResponse.usage?.total_tokens 
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
      message: aiMessage,
      showSatisfactionRequest: true
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in support-ai-chat", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false,
      message: "Entschuldigung, ich kann momentan nicht antworten. Unser menschliches Team übernimmt gerne für dich! 🐾"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
