export async function callOpenAIStreaming(messages, openAIApiKey, useFallbackModel = false) {
  const startTime = Date.now();
  // ENHANCED API KEY VALIDATION
  if (!openAIApiKey) {
    throw new Error('OpenAI API Key not configured in Supabase secrets');
  }
  if (!openAIApiKey.startsWith('sk-')) {
    throw new Error('OpenAI API Key format invalid - must start with sk-');
  }
  // REQUEST ANALYSIS
  const model = 'gpt-5-mini';
  console.log('📊 Request analysis:', {
    model: model,
    messageCount: messages.length,
    totalTokens: messages.reduce((sum, msg)=>sum + (msg.content?.length || 0), 0),
    maxCompletionTokens: 2500
  });
  // ENHANCED REQUEST BODY
  const requestBody = {
    model: model,
    messages: messages,
    max_completion_tokens: 2500
  };
  // ENHANCED TIMEOUT WITH RETRY
  const abortController = new AbortController();
  const timeoutId = setTimeout(()=>{
    console.log('⚠️ OpenAI request timeout triggered after 45 seconds');
    abortController.abort();
  }, 45000); // Increased timeout to 45 seconds for better reliability
  try {
    console.log('🚀 Starting OpenAI API call...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'TierTrainer24-EdgeFunction/1.0'
      },
      signal: abortController.signal,
      body: JSON.stringify(requestBody)
    });
    clearTimeout(timeoutId);
    console.log('✅ OpenAI API call completed successfully');
    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.text();
      } catch (parseError) {
        errorDetails = 'Unable to parse error response';
      }
      // SPECIFIC ERROR HANDLING
      if (response.status === 401) {
        throw new Error('OpenAI API Key invalid or expired - please check your API key');
      } else if (response.status === 429) {
        throw new Error('OpenAI API rate limit exceeded - please try again later');
      } else if (response.status === 500) {
        throw new Error('OpenAI API internal error - please try again later');
      } else {
        throw new Error(`OpenAI API error ${response.status}: ${errorDetails}`);
      }
    }
    // Process the response to get the actual content
    const aiMessage = await processStreamingResponse(response);
    const processingTime = Date.now() - startTime;
    console.log(`OpenAI response received in ${processingTime}ms`);
    return aiMessage;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('OpenAI request timeout (45s) - please try again');
    }
    // RE-THROW WITH ENHANCED ERROR INFO
    if (error instanceof Error) {
      throw new Error(`OpenAI API call failed: ${error.message}`);
    } else {
      throw new Error('OpenAI API call failed with unknown error');
    }
  }
}
export async function processStreamingResponse(response) {
  try {
    // Parse the response as JSON (non-streaming)
    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;
    if (!aiMessage || aiMessage.trim() === '') {
      throw new Error('OpenAI returned empty response');
    }
    return aiMessage;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to process OpenAI response: ${error.message}`);
    } else {
      throw new Error('Failed to process OpenAI response');
    }
  }
}
