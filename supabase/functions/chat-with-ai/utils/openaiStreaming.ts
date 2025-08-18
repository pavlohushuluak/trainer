export async function callOpenAIStreaming(messages, openAIApiKey, useFallbackModel = false) {
  const startTime = Date.now();
  
  // Quick API key validation
  if (!openAIApiKey?.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API Key');
  }
  
  // Use faster model by default
  const model = useFallbackModel ? 'gpt-4o' : 'gpt-4o-mini';
  
  const requestBody = {
    model: model,
    messages: messages,
    max_tokens: 1500, // Reduced for faster responses
    temperature: 0.7, // Slightly more focused
    stream: false // Disable streaming for faster response
  };
  
  // Reduced timeout for faster failure detection
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, 25000); // Reduced to 25 seconds
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      signal: abortController.signal,
      body: JSON.stringify(requestBody)
    });
    clearTimeout(timeoutId);
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
