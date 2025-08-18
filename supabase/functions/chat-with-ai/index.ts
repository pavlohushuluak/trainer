
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

import { processPlanCreationFromResponse, removePlanCreationFromResponse, cleanupFailedPlanCreation, createTrainingPlan, createFallbackPlan } from './utils/planCreation.ts';
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
import { getUserLanguage, getFallbackLanguage } from "./utils/languageSupport.ts";

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
const getFallbackResponse = (message: string, trainerName: string, petContext: string, language: string = 'de') => {
  const responses = language === 'en' ? [
    `Hello! I'm ${trainerName}, your pet trainer. ⏱️ My AI system is currently overloaded, but I can still give you basic tips.`,
    `That's an interesting question! As ${trainerName}, I recommend: 🎯 Patience and positive reinforcement are the key to any training.`,
    `Thank you for your message! 💭 Although my full AI system is currently overloaded, I can tell you: Consistency in training is very important.`,
    `As ${trainerName}, I advise you: ⭐ Short, regular training sessions (5-10 min) are often more effective than long sessions.`
  ] : [
    `Hallo! Ich bin ${trainerName}, dein Tiertrainer. ⏱️ Mein KI-System ist momentan überlastet, aber ich kann dir trotzdem grundlegende Tipps geben.`,
    `Das ist eine interessante Frage! Als ${trainerName} empfehle ich dir: 🎯 Geduld und positive Verstärkung sind bei jedem Training das A und O.`,
    `Danke für deine Nachricht! 💭 Obwohl mein vollständiges KI-System gerade überlastet ist, kann ich dir sagen: Konstanz beim Training ist sehr wichtig.`,
    `Als ${trainerName} rate ich dir: ⭐ Kurze, regelmäßige Trainingseinheiten (5-10 Min) sind oft effektiver als lange Sessions.`
  ];
  
  // Check for specific training topics and provide targeted advice
  const lowerMessage = message.toLowerCase();
  let specificAdvice = '';
  
  if (language === 'en') {
    if (lowerMessage.includes('aggression') || lowerMessage.includes('bite')) {
      specificAdvice = '\n\n🚨 For aggression problems: Never punish, but seek professional help and remove the pet from the stressful situation.';
    } else if (lowerMessage.includes('house') || lowerMessage.includes('potty') || lowerMessage.includes('clean')) {
      specificAdvice = '\n\n🏠 House training: Regular walk times, go out immediately after eating/sleeping, reward success.';
    } else if (lowerMessage.includes('leash') || lowerMessage.includes('pull')) {
      specificAdvice = '\n\n🦮 Leash training: Stop when pulled, only continue with loose leash, treats as reward.';
    } else if (lowerMessage.includes('bark') || lowerMessage.includes('loud')) {
      specificAdvice = '\n\n🔇 Against barking: Understand the cause, train alternative behavior, never shout back.';
    }
  } else {
    if (lowerMessage.includes('aggression') || lowerMessage.includes('beißen')) {
      specificAdvice = '\n\n🚨 Bei Aggressionsproblemen: Nie bestrafen, sondern professionelle Hilfe suchen und das Tier aus der Stresssituation nehmen.';
    } else if (lowerMessage.includes('stubenrein') || lowerMessage.includes('unsauber')) {
      specificAdvice = '\n\n🏠 Stubenreinheit: Regelmäßige Gassi-Zeiten, sofort nach dem Fressen/Schlafen rausgehen, bei Erfolg belohnen.';
    } else if (lowerMessage.includes('leine') || lowerMessage.includes('ziehen')) {
      specificAdvice = '\n\n🦮 Leinentraining: Stehenbleiben wenn gezogen wird, nur weitergehen bei lockerer Leine, Leckerlis als Belohnung.';
    } else if (lowerMessage.includes('bellen') || lowerMessage.includes('laut')) {
      specificAdvice = '\n\n🔇 Gegen Bellen: Ursache verstehen, Alternativverhalten trainieren, nie zurückschreien.';
    }
  }
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  if (language === 'en') {
    if (petContext) {
      return `${randomResponse}\n\n🐾 For your pet: Reward desired behavior immediately and ignore unwanted behavior instead of punishing.${specificAdvice}\n\n💡 *Note: This is a shortened response. Our full AI system is currently overloaded - please try again in a few minutes for more detailed advice.*`;
    }
    
    return `${randomResponse}\n\n🎓 Basic rule: Positive reinforcement works better than punishment for all animals.${specificAdvice}\n\n💡 *Note: This is a shortened response. Our full AI system is currently overloaded.*`;
  } else {
    if (petContext) {
      return `${randomResponse}\n\n🐾 Für dein Tier gilt: Belohne erwünschtes Verhalten sofort und ignoriere unerwünschtes Verhalten, anstatt zu bestrafen.${specificAdvice}\n\n💡 *Hinweis: Dies ist eine verkürzte Antwort. Unser vollständiges KI-System ist momentan überlastet - bitte versuche es in wenigen Minuten erneut für eine detailliertere Beratung.*`;
    }
    
    return `${randomResponse}\n\n🎓 Grundregel: Positive Verstärkung funktioniert bei allen Tieren besser als Bestrafung.${specificAdvice}\n\n💡 *Hinweis: Dies ist eine verkürzte Antwort. Unser vollständiges KI-System ist momentan überlastet.*`;
  }
};

serve(async (req) => {
  // ENHANCED CORS HANDLING
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  let userLanguage = 'de'; // Default language

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

    const { message, sessionId, petId, trainerName, createPlan, language } = requestBody;
    
    // Debug: Log the entire request body to see what's being received
    console.log('📨 Request body received:', {
      messageLength: message?.length,
      sessionId,
      petId,
      trainerName,
      language,
      hasCreatePlan: !!createPlan
    });
    
    // Get user's language preference from database using their email
    const userEmail = userData.user.email;
    const dbLanguage = await getUserLanguage(supabaseClient, userEmail);
    
    // Use provided language if available, otherwise use database language, fallback to German
    userLanguage = getFallbackLanguage(language || dbLanguage);
    
    console.log('🌍 Language detection:', {
      providedLanguage: language,
      dbLanguage: dbLanguage,
      finalLanguage: userLanguage,
      userEmail: userEmail
    });

    // Handle plan creation if requested
    if (createPlan && createPlan.title && createPlan.steps) {
      await createTrainingPlan(supabaseClient, userData.user.id, petId, createPlan, openAIApiKey);
    }

    // Parallel data fetching for better performance
    const [petContextResult, rawChatHistory] = await Promise.all([
      getPetContext(supabaseClient, petId, userData.user.id),
      getChatHistory(supabaseClient, sessionId)
    ]);
    
    const { petContext, petData } = petContextResult;
    const chatHistory = summarizeChatHistory(rawChatHistory);

    let aiResponse;

    // ENHANCED OPENAI INTEGRATION WITH COMPREHENSIVE ERROR HANDLING
    if (!openAIApiKey) {
      aiResponse = getFallbackResponse(message, trainerName, petContext, userLanguage);
    } else {
      try {
        // Simplified context gathering
        const { data: petChatHistory } = await supabaseClient
          .from('chat_sessions')
          .select('id')
          .eq('pet_id', petId)
          .eq('user_id', userData.user.id);
        
        const isNewPet = (petChatHistory?.length || 0) === 0;

        // Generate simplified system prompt
        const enhancedSystemPrompt = generateSystemPrompt(trainerName, petContext, isNewPet, petData, userLanguage);

        const messages = [
          {
            role: 'system',
            content: enhancedSystemPrompt
          },
          ...chatHistory,
          { role: 'user', content: message }
        ];

        // ENHANCED OpenAI Call with detailed logging and timeout handling
        const streamingStartTime = Date.now();
        
        // Add timeout for OpenAI call
        const openAITimeout = 30000; // 30 seconds timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('OpenAI request timeout')), openAITimeout);
        });
        
        try {
          console.log('🚀 Attempting OpenAI call with GPT-5-mini...');
          const streamingResponse = await Promise.race([
            callOpenAIStreaming(messages, openAIApiKey, false), // Try GPT-5-mini first
            timeoutPromise
          ]);
        
        const responseStartTime = Date.now();
        aiResponse = streamingResponse;

          console.log('✅ OpenAI response received successfully');
        } catch (openaiError) {
          console.error('❌ OpenAI call failed:', openaiError);
          
          // Handle timeout specifically - try fallback model
          if (openaiError.message.includes('timeout')) {
            console.log('🔄 Timeout detected, trying GPT-4o as fallback...');
            try {
              const fallbackResponse = await callOpenAIStreaming(messages, openAIApiKey, true); // Use GPT-4o
              aiResponse = fallbackResponse;
              console.log('✅ Fallback model (GPT-4o) succeeded');
            } catch (fallbackError) {
              console.error('❌ Fallback model also failed:', fallbackError);
              aiResponse = userLanguage === 'en' 
                ? "I apologize, but I'm taking too long to respond. Please try asking your question again, or try a simpler request."
                : "Entschuldigung, aber ich brauche zu lange für eine Antwort. Bitte versuche deine Frage noch einmal zu stellen oder eine einfachere Anfrage.";
            }
          } else {
            // Use fallback response for other errors
            aiResponse = getFallbackResponse(message, trainerName, petContext, userLanguage);
          }
          
          // Don't continue with plan creation if OpenAI failed
          return new Response(JSON.stringify({ response: aiResponse }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          });
        }

        // Simplified plan creation - only process if AI response contains plan tags
        if (aiResponse.includes('[PLAN_CREATION]')) {
          try {
            const planData = await processPlanCreationFromResponse(aiResponse, userLanguage, openAIApiKey);
            if (planData) {
              await createTrainingPlan(supabaseClient, userData.user.id, petId, planData, openAIApiKey);
              aiResponse = removePlanCreationFromResponse(aiResponse, planData.title, userLanguage, false);
            }
          } catch (planError) {
            aiResponse = cleanupFailedPlanCreation(aiResponse, userLanguage);
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
        aiResponse = getFallbackResponse(message, trainerName, petContext, userLanguage);
        
        // Add error note to response for debugging
        aiResponse += `\n\n💡 *Debug-Info: OpenAI-Service temporär nicht verfügbar (${errorContext.substring(0, 50)}...)*`;
      }
    }

    // Save chat messages asynchronously (don't block response)
    saveChatMessages(supabaseClient, sessionId, userData.user.id, message, aiResponse, { total_tokens: 0 }).catch(error => {
      console.error('DB save failed but continuing:', error);
    });
    
    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error in chat-with-ai function:', error);
    
    // Determine error type for better user feedback
    let errorMessage = 'Chat temporarily unavailable';
    let userMessage = userLanguage === 'en' 
      ? 'Sorry, the chat is currently unavailable. Please try again later.'
      : 'Entschuldigung, der Chat ist momentan nicht verfügbar. Bitte versuche es später erneut.';
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication') || error.message.includes('not authenticated')) {
        errorMessage = 'Authentication failed';
        userMessage = userLanguage === 'en' 
          ? 'Please log in again.'
          : 'Bitte melden Sie sich erneut an.';
      } else if (error.message.includes('OpenAI') || error.message.includes('API')) {
        errorMessage = 'AI service unavailable';
        userMessage = userLanguage === 'en' 
          ? 'The PetTrainer is currently overloaded. Please try again in a few minutes.'
          : 'Der TierTrainer ist gerade überlastet. Bitte versuchen Sie es in wenigen Minuten erneut.';
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
