export async function callOpenAIStreaming(messages: any[], openAIApiKey: string) {
  const startTime = Date.now();
  
  // ENHANCED API KEY VALIDATION
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API Key not configured in Supabase secrets');
  }
  
  if (!openAIApiKey.startsWith('sk-')) {
    throw new Error('OpenAI API Key format invalid - must start with sk-');
  }

  // REQUEST ANALYSIS
  
  // ENHANCED REQUEST BODY
  const requestBody = {
    model: 'gpt-4o-mini',
    messages: messages,
    temperature: 0.5,
    max_tokens: 450, // Dramatisch erhöht für vollständige Antworten
    top_p: 0.9,
    frequency_penalty: 0.1,
    presence_penalty: 0.1,
    stream: true
  };
  

  // ENHANCED TIMEOUT WITH RETRY
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, 20000); // Erhöhtes Timeout

  try {
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'TierTrainer24-EdgeFunction/1.0'
      },
      signal: abortController.signal,
      body: JSON.stringify(requestBody),
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

    return response;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('OpenAI request timeout (20s) - please try again');
    }
    
    // RE-THROW WITH ENHANCED ERROR INFO
    if (error instanceof Error) {
      throw new Error(`OpenAI API call failed: ${error.message}`);
    } else {
      throw new Error('OpenAI API call failed with unknown error');
    }
  }
}

export async function processStreamingResponse(response: Response): Promise<string> { 
  
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body available for streaming');
  }

  const decoder = new TextDecoder();
  let fullResponse = '';
  let buffer = '';
  let chunkCount = 0;
  const startTime = Date.now();

  try {
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      chunkCount++;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer
      
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === '' || trimmedLine === 'data: [DONE]') continue;
        
        if (trimmedLine.startsWith('data: ')) {
          try {
            const jsonStr = trimmedLine.slice(6); // Remove 'data: ' prefix
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              fullResponse += content;
            }
            
            // Log any errors in the response
            if (parsed.error) {
              throw new Error(`OpenAI streaming error: ${parsed.error.message || 'Unknown error'}`);
            }
            
          } catch (parseError) {
          }
        }
      }
    }
  } catch (error) {
    throw error;
  } finally {
    reader.releaseLock();
  }

  const processingTime = Date.now() - startTime;
  
  if (fullResponse.length === 0) {
    throw new Error('OpenAI returned empty response');
  }
  
  
  return fullResponse;
}