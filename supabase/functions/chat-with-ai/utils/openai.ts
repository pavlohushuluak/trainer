
export async function callOpenAI(messages: any[], openAIApiKey: string) {
  const startTime = Date.now();
  
  // Calculate payload size for monitoring
  const payloadSize = JSON.stringify(messages).length;

  // AbortController for timeout protection
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, 15000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      signal: abortController.signal,
      body: JSON.stringify({
        model: 'gpt-5',
        messages: messages,
        max_completion_tokens: 5000, // Increased for complete responses
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const totalTime = Date.now() - startTime;

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('🚨 OpenAI request was aborted due to timeout');
      throw new Error('OpenAI request timeout - please try again');
    }
    
    throw error;
  }
}
