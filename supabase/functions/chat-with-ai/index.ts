
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

import { processPlanCreationFromResponse, removePlanCreationFromResponse, cleanupFailedPlanCreation, createTrainingPlan, createFallbackPlan } from './utils/planCreation.ts';
import { getPetContext } from "./utils/petContext.ts";
import { generateSystemPrompt } from "./utils/systemPrompt.ts";
import { getChatHistory, saveChatMessages, getCompleteChatHistory } from "./utils/chatHistory.ts";
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
import { cleanAIResponse } from "./utils/responseCleaner.ts";
import { evaluateResponseQuality, regenerateResponse } from "./utils/qualityAssurance.ts";

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
    `Hello! I'm ${trainerName}, your pet trainer. I'm currently busy but can give you some quick tips.`,
    `That's an interesting question! As ${trainerName}, I recommend: Patience and positive reinforcement are the key to any training.`,
    `Thank you for your message! I can tell you: Consistency in training is very important.`,
    `As ${trainerName}, I advise you: Short, regular training sessions (5-10 min) are often more effective than long sessions.`
  ] : [
    `Hallo! Ich bin ${trainerName}, dein Tiertrainer. Ich bin momentan beschäftigt, kann dir aber trotzdem grundlegende Tipps geben.`,
    `Das ist eine interessante Frage! Als ${trainerName} empfehle ich dir: Geduld und positive Verstärkung sind bei jedem Training das A und O.`,
    `Danke für deine Nachricht! Ich kann dir sagen: Konstanz beim Training ist sehr wichtig.`,
    `Als ${trainerName} rate ich dir: Kurze, regelmäßige Trainingseinheiten (5-10 Min) sind oft effektiver als lange Sessions.`
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
      return `${randomResponse}\n\nFor your pet: Reward desired behavior immediately and ignore unwanted behavior instead of punishing.${specificAdvice}\n\nNote: This is a quick response. Please try again in a few minutes for more detailed advice.`;
    }
    
    return `${randomResponse}\n\nBasic rule: Positive reinforcement works better than punishment for all animals.${specificAdvice}\n\nNote: This is a quick response. Please try again later for more detailed guidance.`;
  } else {
    if (petContext) {
      return `${randomResponse}\n\nFür dein Tier gilt: Belohne erwünschtes Verhalten sofort und ignoriere unerwünschtes Verhalten, anstatt zu bestrafen.${specificAdvice}\n\nHinweis: Dies ist eine kurze Antwort. Bitte versuche es in wenigen Minuten erneut für eine detailliertere Beratung.`;
    }
    
    return `${randomResponse}\n\nGrundregel: Positive Verstärkung funktioniert bei allen Tieren besser als Bestrafung.${specificAdvice}\n\nHinweis: Dies ist eine kurze Antwort. Bitte versuche es später erneut für eine detailliertere Beratung.`;
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

    const { message, sessionId, petId, petProfile, trainerName, createPlan, language } = requestBody;
    
    // Check if this is a plan creation request
    const continuationPhrases = [
      // English phrases
      'please continue our previous conversation',
      'continue our conversation',
      'continue the conversation',
      'let\'s continue',
      'go on',
      'continue',
      // German phrases
      'bitte fahre mit unserem vorherigen chat fort',
      'fahre mit unserem gespräch fort',
      'setze unser gespräch fort',
      'lass uns weitermachen',
      'mach weiter',
      'fortsetzen',
      'weitermachen',
      'fahre fort'
    ];
    const isContinuationRequest = continuationPhrases.some(phrase => 
      message.toLowerCase().includes(phrase)
    );
    const isPlanCreationRequest = message && message.startsWith('Create plan::') && !isContinuationRequest;
    const planReason = isPlanCreationRequest ? message.substring(13) : null; // Remove "Create plan::" prefix
    
    console.log('🔍 Plan creation detection:', {
      originalMessage: message,
      isPlanCreationRequest,
      planReason,
      messageStartsWith: message?.startsWith('Create plan::'),
      isContinuationRequest,
      detectedContinuationPhrase: continuationPhrases.find(phrase => 
        message.toLowerCase().includes(phrase)
      )
    });
    
    // Debug: Log the entire request body to see what's being received
    console.log('📨 Request body received:', {
      messageLength: message?.length,
      sessionId,
      petId,
      hasPetProfile: !!petProfile,
      petProfileName: petProfile?.name,
      petProfileSpecies: petProfile?.species,
      trainerName,
      language,
      hasCreatePlan: !!createPlan,
      isPlanCreationRequest,
      planReason: planReason?.substring(0, 50) + '...'
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

    // Use provided petProfile if available, otherwise fetch from database
    let petContext = "";
    let petData: any = null;
    
    if (petProfile && petProfile.id) {
      // Use the provided petProfile data
      petData = petProfile;
      
      // Build pet context from provided data
      let contextParts: string[] = [];
      
      // Basic info with enhanced detail
      contextParts.push(petProfile.name);
      
      // Age calculation with months precision for young animals
      let ageInfo = '';
      if (petProfile.age) {
        ageInfo = `${petProfile.age}J`;
      } else if (petProfile.birth_date) {
        const birthDate = new Date(petProfile.birth_date);
        const now = new Date();
        const ageInMonths = Math.floor((now.getTime() - birthDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        
        if (years === 0) {
          ageInfo = `${ageInMonths}M`; // Show months for animals under 1 year
        } else if (months === 0) {
          ageInfo = `${years}J`;
        } else {
          ageInfo = `${years}J${months}M`;
        }
      }
      if (ageInfo) contextParts.push(ageInfo);
      
      // Species and breed with enhanced info
      const speciesBreed = petProfile.species + (petProfile.breed ? `/${petProfile.breed}` : '');
      contextParts.push(speciesBreed);
      
      // Behavior focus - keep full text for better AI understanding
      if (petProfile.behavior_focus) {
        contextParts.push(`Fokus: ${petProfile.behavior_focus}`);
      }
      
      // Notes - keep more detail for context
      if (petProfile.notes) {
        contextParts.push(`Notizen: ${petProfile.notes}`);
      }
      
      // Enhanced context with development stage indicators
      const ageInMonths = petProfile.age ? petProfile.age * 12 : 
        (petProfile.birth_date ? Math.floor((Date.now() - new Date(petProfile.birth_date).getTime()) / (30.44 * 24 * 60 * 60 * 1000)) : 0);
      
      if (ageInMonths <= 6) {
        contextParts.push('Entwicklungsphase: Welpe/Jungtier');
      } else if (ageInMonths <= 18) {
        contextParts.push('Entwicklungsphase: Junghund/Adoleszent');
      } else if (ageInMonths <= 84) {
        contextParts.push('Entwicklungsphase: Erwachsen');
      } else {
        contextParts.push('Entwicklungsphase: Senior');
      }
      
      petContext = contextParts.join(', ');
      
      console.log('🐾 Using provided petProfile data:', {
        petName: petProfile.name,
        species: petProfile.species,
        breed: petProfile.breed,
        age: petProfile.age,
        context: petContext
      });
    } else if (petId) {
      // Fallback to database fetch if no petProfile provided
      const petContextResult = await getPetContext(supabaseClient, petId, userData.user.id);
      petContext = petContextResult.petContext;
      petData = petContextResult.petData;
      
      console.log('🐾 Fetched pet data from database:', {
        petId,
        context: petContext
      });
    }
    
    // Fetch chat history
    const rawChatHistory = await getChatHistory(supabaseClient, sessionId);
    const chatHistory = getCompleteChatHistory(rawChatHistory);
    
    console.log('📚 Sending complete chat history to GPT:', {
      totalMessages: chatHistory.length,
      sessionId: sessionId,
      hasHistory: chatHistory.length > 0
    });

    let aiResponse;

    // ENHANCED OPENAI INTEGRATION WITH COMPREHENSIVE ERROR HANDLING
    if (!openAIApiKey) {
      aiResponse = getFallbackResponse(message, trainerName, petContext, userLanguage);
      // Clean up any markdown formatting from the fallback response
      aiResponse = cleanAIResponse(aiResponse);
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
        const enhancedSystemPrompt = generateSystemPrompt(trainerName, petContext, isNewPet, petData, userLanguage as 'en' | 'de');
        
        // Log pet information being sent to AI
        console.log('🐾 Pet information for AI:', {
          petContext,
          petDataName: petData?.name,
          petDataSpecies: petData?.species,
          petDataBreed: petData?.breed,
          petDataAge: petData?.age,
          isNewPet,
          language: userLanguage
        });

        // For plan creation requests, modify the message to instruct AI to create a plan
        let processedMessage = message;
        if (isPlanCreationRequest && planReason) {
          processedMessage = `Create plan::${planReason}`;
          console.log('🔧 Plan creation detected, processed message:', processedMessage);
        }

        const messages = [
          {
            role: 'system',
            content: enhancedSystemPrompt
          },
          ...chatHistory,
          { role: 'user', content: processedMessage }
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

        // Clean up any markdown formatting from the AI response
        aiResponse = cleanAIResponse(aiResponse);

        console.log('✅ OpenAI response received and cleaned successfully');

        // QUALITY ASSURANCE: Evaluate and potentially regenerate the response
        if (!isPlanCreationRequest) { // Only apply QA to normal chat responses
          try {
            console.log('🔍 Starting quality assurance evaluation...');
            
            const qualityEvaluation = await evaluateResponseQuality(
              message,
              aiResponse,
              petContext,
              userLanguage as 'en' | 'de',
              openAIApiKey
            );

            console.log('📊 Quality evaluation result:', {
              score: qualityEvaluation.score,
              feedback: qualityEvaluation.feedback,
              needsRegeneration: qualityEvaluation.needsRegeneration
            });

                         if (qualityEvaluation.needsRegeneration) {
               console.log('🔄 Response quality below 10.0, starting continuous quality assurance loop...');
              
              const regeneratedResponse = await regenerateResponse(
                message,
                aiResponse,
                petContext,
                userLanguage as 'en' | 'de',
                openAIApiKey,
                enhancedSystemPrompt,
                chatHistory,
                qualityEvaluation.feedback
              );

              // Clean up the regenerated response
              aiResponse = cleanAIResponse(regeneratedResponse);
              
              console.log('✅ Continuous quality assurance loop completed - final response ready');
                         } else {
               console.log('✅ Response quality meets perfect standards (score:', qualityEvaluation.score, ')');
             }
          } catch (qaError) {
            console.error('❌ Quality assurance failed, using original response:', qaError);
            // Continue with original response if QA fails - always ensure user gets a response
            aiResponse = aiResponse || userLanguage === 'en' 
              ? "I apologize, but I'm having trouble generating a response right now. Please try asking your question again."
              : "Entschuldigung, aber ich habe gerade Schwierigkeiten, eine Antwort zu generieren. Bitte versuche deine Frage noch einmal zu stellen.";
          }
        }
        } catch (openaiError) {
          console.error('❌ OpenAI call failed:', openaiError);
          
          // Handle timeout specifically - try fallback model
          if (openaiError.message.includes('timeout')) {
            console.log('🔄 Timeout detected, trying GPT-4o as fallback...');
            try {
              const fallbackResponse = await callOpenAIStreaming(messages, openAIApiKey, true); // Use GPT-4o
              aiResponse = fallbackResponse;
              // Clean up any markdown formatting from the fallback model response
              aiResponse = cleanAIResponse(aiResponse);
              console.log('✅ Fallback model (GPT-4o) succeeded and cleaned');
              
              // QUALITY ASSURANCE for fallback response
              if (!isPlanCreationRequest) {
                try {
                  console.log('🔍 Starting quality assurance evaluation for fallback response...');
                  
                  const qualityEvaluation = await evaluateResponseQuality(
                    message,
                    aiResponse,
                    petContext,
                    userLanguage as 'en' | 'de',
                    openAIApiKey
                  );

                  console.log('📊 Fallback quality evaluation result:', {
                    score: qualityEvaluation.score,
                    feedback: qualityEvaluation.feedback,
                    needsRegeneration: qualityEvaluation.needsRegeneration
                  });

                                   if (qualityEvaluation.needsRegeneration) {
                   console.log('🔄 Fallback response quality below 10.0, starting continuous quality assurance loop...');
                    
                    const regeneratedResponse = await regenerateResponse(
                      message,
                      aiResponse,
                      petContext,
                      userLanguage as 'en' | 'de',
                      openAIApiKey,
                      enhancedSystemPrompt,
                      chatHistory,
                      qualityEvaluation.feedback
                    );

                    aiResponse = cleanAIResponse(regeneratedResponse);
                    console.log('✅ Continuous quality assurance loop completed for fallback - final response ready');
                  }
                } catch (qaError) {
                  console.error('❌ Quality assurance for fallback failed:', qaError);
                  // Ensure fallback response is still available even if QA fails
                  aiResponse = aiResponse || userLanguage === 'en' 
                    ? "I apologize, but I'm having trouble generating a response right now. Please try asking your question again."
                    : "Entschuldigung, aber ich habe gerade Schwierigkeiten, eine Antwort zu generieren. Bitte versuche deine Frage noch einmal zu stellen.";
                }
              }
            } catch (fallbackError) {
              console.error('❌ Fallback model also failed:', fallbackError);
              aiResponse = userLanguage === 'en' 
                ? "I apologize, but I'm taking too long to respond. Please try asking your question again, or try a simpler request."
                : "Entschuldigung, aber ich brauche zu lange für eine Antwort. Bitte versuche deine Frage noch einmal zu stellen oder eine einfachere Anfrage.";
              // Clean up any markdown formatting from the timeout response
              aiResponse = cleanAIResponse(aiResponse);
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

        // Handle plan creation requests specifically
        if (isPlanCreationRequest && planReason) {
          try {
            console.log('📝 Processing plan creation request for reason:', planReason.substring(0, 100) + '...');
            
            // First, try to extract plan from AI response if it contains [PLAN_CREATION] blocks
            let planData = await processPlanCreationFromResponse(aiResponse, userLanguage as 'en' | 'de', openAIApiKey);
            
            // If no plan found in response, create one using fallback
            if (!planData) {
              console.log('🔄 No plan found in AI response, creating fallback plan...');
              planData = await createFallbackPlan(
                planReason, 
                userLanguage as 'en' | 'de', 
                openAIApiKey,
                {
                  pets: petData ? [{
                    id: petId,
                    name: petData.name,
                    species: petData.species,
                    breed: petData.breed,
                    ageYears: petData.age,
                    focus: petData.behavior_focus
                  }] : [],
                  lastActivePetId: petId,
                  user: {
                    goals: [planReason]
                  }
                }
              );
            }
            
            if (planData) {
              // Save the plan to the database
              await createTrainingPlan(supabaseClient, userData.user.id, petId, planData, openAIApiKey);
              
              console.log('✅ Plan created and saved successfully:', planData.title);
              
              // Clean up the response to remove [PLAN_CREATION] blocks and show success message
              aiResponse = removePlanCreationFromResponse(aiResponse, planData.title, userLanguage as 'en' | 'de', false);
              // Clean up any markdown formatting from the response
              aiResponse = cleanAIResponse(aiResponse);
            } else {
              throw new Error('Failed to create plan data');
            }
          } catch (planError) {
            console.error('❌ Plan creation failed:', planError);
            // Clean up failed plan creation from response
            aiResponse = cleanupFailedPlanCreation(aiResponse, userLanguage as 'en' | 'de');
            // Clean up any markdown formatting from the response
            aiResponse = cleanAIResponse(aiResponse);
          }
        } else {
          // Normal chat - check if AI response contains plan creation blocks
          const planData = await processPlanCreationFromResponse(aiResponse, userLanguage as 'en' | 'de', openAIApiKey);
          if (planData) {
            console.log('📝 Found plan creation in normal chat response');
            await createTrainingPlan(supabaseClient, userData.user.id, petId, planData, openAIApiKey);
            aiResponse = removePlanCreationFromResponse(aiResponse, planData.title, userLanguage as 'en' | 'de', false);
            // Clean up any markdown formatting from the response
            aiResponse = cleanAIResponse(aiResponse);
          } else {
            console.log('💬 Processing normal chat message - no plan creation');
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
        
        // Clean up any markdown formatting from the fallback response
        aiResponse = cleanAIResponse(aiResponse);
      }
    }

    // Save chat messages asynchronously (don't block response)
    saveChatMessages(supabaseClient, sessionId, userData.user.id, message, aiResponse, { total_tokens: 0 }).catch(error => {
      console.error('DB save failed but continuing:', error);
    });

    // Update usage tracking for free users (don't block response)
    const updateUsageTracking = async () => {
      try {
        // Check if user has active subscription
        const { data: subscriberData } = await supabaseClient
          .from('subscribers')
          .select('subscribed, subscription_status')
          .eq('user_id', userData.user.id)
          .maybeSingle();

        // Only increment usage for free users
        if (!subscriberData?.subscribed && subscriberData?.subscription_status !== 'active') {
          // Get current usage first, then increment
          const { data: currentUsage } = await supabaseClient
            .from('subscribers')
            .select('questions_num')
            .eq('user_id', userData.user.id)
            .single();

          const newUsage = (currentUsage?.questions_num || 0) + 1;
          
          const { error: updateError } = await supabaseClient
            .from('subscribers')
            .update({ 
              questions_num: newUsage,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userData.user.id);

          if (updateError) {
            console.error('❌ Error updating chat usage:', updateError);
          } else {
            console.log('✅ Chat usage incremented successfully');
          }
        }
      } catch (error) {
        console.error('❌ Error in usage tracking:', error);
      }
    };

    // Run usage tracking asynchronously
    updateUsageTracking().catch(error => {
      console.error('Usage tracking failed but continuing:', error);
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
