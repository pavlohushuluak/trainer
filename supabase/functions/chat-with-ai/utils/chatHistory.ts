
export async function getChatHistory(supabaseClient: any, sessionId: string) {
  const { data: chatHistory } = await supabaseClient
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
    // Removed limit to get ALL chat history

  return chatHistory || [];
}

// Function to get complete chat history (no summarization)
export function getCompleteChatHistory(messages: any[]): any[] {
  // Return all messages without summarization
  return messages;
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
      
      // Update session timestamp to reflect latest activity
      try {
        const { error: updateError } = await supabaseClient
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', sessionId);
          
        if (updateError) {
          console.warn('⚠️ Could not update session timestamp:', updateError);
        } else {
          console.log('✅ Session timestamp updated');
        }
      } catch (timestampError) {
        console.warn('⚠️ Error updating session timestamp:', timestampError);
      }
    }
  } catch (error) {
    console.error('❌ Critical error in saveChatMessages:', error);
    // Don't throw - we still want to return the response to user
  }
}
