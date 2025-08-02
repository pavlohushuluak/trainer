
export async function getChatHistory(supabaseClient: any, sessionId: string) {
  const { data: chatHistory } = await supabaseClient
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(5); // Optimiert: Genau 5 Messages für OpenAI

  return chatHistory || [];
}

// Neue Funktion: Chat History zusammenfassen
export function summarizeChatHistory(messages: any[]): any[] {
  if (messages.length <= 5) return messages;
  
  // Behalte die letzten 3 Messages vollständig
  const recentMessages = messages.slice(-3);
  
  // Fasse ältere Messages zusammen
  const olderMessages = messages.slice(0, -3);
  const userQuestions = olderMessages.filter(m => m.role === 'user');
  const aiResponses = olderMessages.filter(m => m.role === 'assistant');
  
  if (userQuestions.length > 0) {
    const summaryMessage = {
      role: 'assistant',
      content: `Zusammenfassung vorheriger Gespräche: ${userQuestions.length} Fragen zu Themen wie ${userQuestions.slice(-2).map(q => q.content.substring(0, 30)).join(', ')}...`
    };
    
    return [summaryMessage, ...recentMessages];
  }
  
  return recentMessages;
}

export async function saveChatMessages(
  supabaseClient: any,
  sessionId: string,
  userId: string,
  userMessage: string,
  aiResponse: string,
  tokensUsed: any
) {
  console.log('💾 Saving chat messages to DB...', { sessionId, userId });
  
  try {
    // For temp sessions, try to create a real session first
    if (sessionId.startsWith('temp-')) {
      console.log('🔄 Converting temp session to real session:', sessionId);
      
      try {
        const { data: realSession, error: sessionError } = await supabaseClient
          .from('chat_sessions')
          .insert({
            user_id: userId,
            title: `Chat Session ${new Date().toLocaleTimeString()}`,
          })
          .select()
          .single();

        if (realSession && !sessionError) {
          console.log('✅ Real session created:', realSession.id);
          sessionId = realSession.id; // Use real session ID for messages
        } else {
          console.warn('⚠️ Could not create real session, using temp ID:', sessionError);
          // Continue with temp session - messages will still be saved
        }
      } catch (sessionCreateError) {
        console.warn('⚠️ Session creation failed, continuing with temp session:', sessionCreateError);
      }
    }

    // Save user message
    const { error: userError } = await supabaseClient.from('chat_messages').insert({
      session_id: sessionId,
      user_id: userId,
      role: 'user',
      content: userMessage,
      tokens_used: tokensUsed?.prompt_tokens || 0
    });

    if (userError) {
      console.error('❌ Error saving user message:', userError);
    }

    // Save AI response
    const { error: aiError } = await supabaseClient.from('chat_messages').insert({
      session_id: sessionId,
      user_id: userId,
      role: 'assistant',
      content: aiResponse,
      tokens_used: tokensUsed?.completion_tokens || 0
    });

    if (aiError) {
      console.error('❌ Error saving AI message:', aiError);
    }

    if (!userError && !aiError) {
      console.log('✅ Chat messages saved successfully');
    }
  } catch (error) {
    console.error('❌ Critical error in saveChatMessages:', error);
    // Don't throw - we still want to return the response to user
  }
}
