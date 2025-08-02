
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

import { createTrainingPlan, processPlanCreationFromResponse, removePlanCreationFromResponse, cleanupFailedPlanCreation } from "./utils/planCreation.ts";
import { getPetContext } from "./utils/petContext.ts";
import { generateSystemPrompt } from "./utils/systemPrompt.ts";
import { getChatHistory, saveChatMessages, summarizeChatHistory } from "./utils/chatHistory.ts";
import { callOpenAI } from "./utils/openai.ts";
import { callOpenAIStreaming, processStreamingResponse } from "./utils/openaiStreaming.ts";
import { 
  generateProactiveQuestions, 
  generateContextualTips, 
  generateProgressReminders, 
  generateSmartExerciseSuggestions,
  analyzeConversationContext 
} from "./utils/chatIntelligence.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Team von AI Tiertrainern
const trainerTeam = [
  { firstName: "Marc", lastName: "W.", specialty: "Hunde, Grundgehorsam" },
  { firstName: "Lisa", lastName: "M.", specialty: "Katzen, Verhaltensprobleme" },
  { firstName: "Tom", lastName: "B.", specialty: "Hunde, Aggression" },
  { firstName: "Anna", lastName: "K.", specialty: "Welpen, Sozialisation" },
  { firstName: "Max", lastName: "S.", specialty: "Exotische Tiere" },
  { firstName: "Nina", lastName: "H.", specialty: "Pferde, Training" },
  { firstName: "Paul", lastName: "L.", specialty: "Alte Tiere, Rehabilitation" }
];

// Fallback responses wenn OpenAI nicht verfügbar ist
const getFallbackResponse = (message: string, trainerName: string, petContext: string) => {
  const responses = [
    `Hallo! Ich bin ${trainerName}, dein Tiertrainer. ⏱️ Mein KI-System ist momentan überlastet, aber ich kann dir trotzdem grundlegende Tipps geben.`,
    `Das ist eine interessante Frage! Als ${trainerName} empfehle ich dir: 🎯 Geduld und positive Verstärkung sind bei jedem Training das A und O.`,
    `Danke für deine Nachricht! 💭 Obwohl mein vollständiges KI-System gerade überlastet ist, kann ich dir sagen: Konstanz beim Training ist sehr wichtig.`,
    `Als ${trainerName} rate ich dir: ⭐ Kurze, regelmäßige Trainingseinheiten (5-10 Min) sind oft effektiver als lange Sessions.`
  ];
  
  // Check for specific training topics and provide targeted advice
  const lowerMessage = message.toLowerCase();
  let specificAdvice = '';
  
  if (lowerMessage.includes('aggression') || lowerMessage.includes('beißen')) {
    specificAdvice = '\n\n🚨 Bei Aggressionsproblemen: Nie bestrafen, sondern professionelle Hilfe suchen und das Tier aus der Stresssituation nehmen.';
  } else if (lowerMessage.includes('stubenrein') || lowerMessage.includes('unsauber')) {
    specificAdvice = '\n\n🏠 Stubenreinheit: Regelmäßige Gassi-Zeiten, sofort nach dem Fressen/Schlafen rausgehen, bei Erfolg belohnen.';
  } else if (lowerMessage.includes('leine') || lowerMessage.includes('ziehen')) {
    specificAdvice = '\n\n🦮 Leinentraining: Stehenbleiben wenn gezogen wird, nur weitergehen bei lockerer Leine, Leckerlis als Belohnung.';
  } else if (lowerMessage.includes('bellen') || lowerMessage.includes('laut')) {
    specificAdvice = '\n\n🔇 Gegen Bellen: Ursache verstehen, Alternativverhalten trainieren, nie zurückschreien.';
  }
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  if (petContext) {
    return `${randomResponse}\n\n🐾 Für dein Tier gilt: Belohne erwünschtes Verhalten sofort und ignoriere unerwünschtes Verhalten, anstatt zu bestrafen.${specificAdvice}\n\n💡 *Hinweis: Dies ist eine verkürzte Antwort. Unser vollständiges KI-System ist momentan überlastet - bitte versuche es in wenigen Minuten erneut für eine detailliertere Beratung.*`;
  }
  
  return `${randomResponse}\n\n🎓 Grundregel: Positive Verstärkung funktioniert bei allen Tieren besser als Bestrafung.${specificAdvice}\n\n💡 *Hinweis: Dies ist eine verkürzte Antwort. Unser vollständiges KI-System ist momentan überlastet.*`;
};

serve(async (req) => {
  // ENHANCED CORS HANDLING
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    // STAGE 1: Request Analysis
    const requestInfo = {
      method: req.method,
      url: req.url,
      contentType: req.headers.get('content-type'),
      userAgent: req.headers.get('user-agent'),
      origin: req.headers.get('origin'),
      hasAuth: !!req.headers.get('authorization'),
      timestamp: Date.now()
    };
    
    // STAGE 2: Authentication Diagnosis
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error('❌ CRITICAL: No authorization header found');
      throw new Error("Authentication required - no auth header");
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Enhanced user authentication with detailed logging
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error('❌ USER AUTH FAILED:', {
        error: userError,
        hasUserData: !!userData,
        hasUser: !!userData?.user,
        tokenValid: !userError
      });
      throw new Error(`User authentication failed: ${userError?.message || 'Invalid token'}`);
    }

    // STAGE 3: Request Body Analysis
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (bodyError) {
      console.error('❌ BODY PARSING FAILED:', bodyError);
      throw new Error('Invalid request body format');
    }

    const { message, sessionId, petId, trainerName, createPlan } = requestBody;

    // Handle plan creation if requested
    if (createPlan && createPlan.title && createPlan.steps) {
      await createTrainingPlan(supabaseClient, userData.user.id, petId, createPlan);
    }

    // Get pet context
    const { petContext, petData } = await getPetContext(supabaseClient, petId, userData.user.id);

    // Get chat history und optimieren
    const rawChatHistory = await getChatHistory(supabaseClient, sessionId);
    const chatHistory = summarizeChatHistory(rawChatHistory);

    let aiResponse;

    // ENHANCED OPENAI INTEGRATION WITH COMPREHENSIVE ERROR HANDLING
    if (!openAIApiKey) {
      aiResponse = getFallbackResponse(message, trainerName, petContext);
    } else {
      try {
        // Check if this is a new pet (first conversation EVER with this pet)
        const { data: petChatHistory, error: petHistoryError } = await supabaseClient
          .from('chat_sessions')
          .select('id')
          .eq('pet_id', petId)
          .eq('user_id', userData.user.id);
        
        const totalPetSessions = petChatHistory?.length || 0;
        const isNewPet = totalPetSessions === 0;

        // Enhanced context analysis
        const conversationAnalysis = analyzeConversationContext(rawChatHistory, petData);

        // Generate contextual tips and suggestions
        const contextualTips = generateContextualTips(petData, message);
        const proactiveQuestions = generateProactiveQuestions(petData, isNewPet);
        const progressReminders = generateProgressReminders(petData);
        const exerciseSuggestions = generateSmartExerciseSuggestions(petData);

        // Generate enhanced system prompt with intelligence context
        let enhancedSystemPrompt = generateSystemPrompt(trainerName, petContext, isNewPet, petData);
        
        // Add conversation context if available
        if (conversationAnalysis.hasDiscussedToday.length > 0) {
          enhancedSystemPrompt += `\n\nVORHERIGE GESPRÄCHSTHEMEN HEUTE: ${conversationAnalysis.hasDiscussedToday.join(', ')}\n`;
        }
        
        if (conversationAnalysis.needsAttention.length > 0) {
          enhancedSystemPrompt += `\nWICHTIGE HINWEISE: ${conversationAnalysis.needsAttention.join(', ')}\n`;
        }

        // Add proactive elements if new conversation or appropriate
        if (isNewPet && proactiveQuestions.length > 0) {
          enhancedSystemPrompt += `\nPROAKTIVE FRAGEN FÜR NEUES GESPRÄCH: Du könntest fragen: "${proactiveQuestions[0]}"\n`;
        }

        if (contextualTips) {
          enhancedSystemPrompt += `\nKONTEXTUELLE TIPPS: ${contextualTips}\n`;
        }

        const messages = [
          {
            role: 'system',
            content: enhancedSystemPrompt
          },
          ...chatHistory,
          { role: 'user', content: message }
        ];

        // ENHANCED OpenAI Call with detailed logging
        const streamingStartTime = Date.now();
        
        const streamingResponse = await callOpenAIStreaming(messages, openAIApiKey);
        
        const responseStartTime = Date.now();
        aiResponse = await processStreamingResponse(streamingResponse);

        // Enhanced plan creation handling with robust error recovery
        const planData = processPlanCreationFromResponse(aiResponse);
        if (planData) {
          try {
            await createTrainingPlan(supabaseClient, userData.user.id, petId, planData);
            aiResponse = removePlanCreationFromResponse(aiResponse, planData.title);
          } catch (planError) {
            console.error('❌ Error creating plan from AI response:', planError);
            // Clean up any failed plan creation blocks and provide user-friendly feedback
            aiResponse = cleanupFailedPlanCreation(aiResponse);
            aiResponse += "\n\n💭 Beim Erstellen des Trainingsplans gab es ein Problem, aber ich kann dir trotzdem gerne dabei helfen! Lass uns das Schritt für Schritt angehen.";
          }
        } else {
          // Check if there were any incomplete plan creation attempts and clean them up
          if (aiResponse.includes('[PLAN_CREATION]')) {
            aiResponse = cleanupFailedPlanCreation(aiResponse);
          }
        }
        
      } catch (openaiError) {
        console.error('❌ OPENAI API COMPLETE FAILURE:', {
          errorType: openaiError instanceof Error ? openaiError.constructor.name : 'Unknown',
          errorMessage: openaiError instanceof Error ? openaiError.message : 'Unknown error',
          errorStack: openaiError instanceof Error ? openaiError.stack : 'No stack trace',
          timestamp: new Date().toISOString()
        });
        
        // ENHANCED FALLBACK WITH ERROR CONTEXT
        const errorContext = openaiError instanceof Error ? openaiError.message : 'Unbekannter Fehler';
        aiResponse = getFallbackResponse(message, trainerName, petContext);
        
        // Add error note to response for debugging
        aiResponse += `\n\n💡 *Debug-Info: OpenAI-Service temporär nicht verfügbar (${errorContext.substring(0, 50)}...)*`;
      }
    }

    // Save chat messages (don't await - continue even if DB fails)
    saveChatMessages(supabaseClient, sessionId, userData.user.id, message, aiResponse, { total_tokens: 0 })
      .catch(error => console.error('DB save failed but continuing:', error));
    
    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error in chat-with-ai function:', error);
    
    // Determine error type for better user feedback
    let errorMessage = 'Chat temporarily unavailable';
    let userMessage = 'Entschuldigung, der Chat ist momentan nicht verfügbar. Bitte versuche es später erneut.';
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication') || error.message.includes('not authenticated')) {
        errorMessage = 'Authentication failed';
        userMessage = 'Bitte melden Sie sich erneut an.';
      } else if (error.message.includes('OpenAI') || error.message.includes('API')) {
        errorMessage = 'AI service unavailable';
        userMessage = 'Der TierTrainer ist gerade überlastet. Bitte versuchen Sie es in wenigen Minuten erneut.';
      }
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      response: userMessage
    }), {
      status: 200, // Return 200 so the frontend can show the fallback message
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
