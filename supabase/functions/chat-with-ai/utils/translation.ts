/**
 * Translation utility for training plans and steps
 * Uses OpenAI to translate German text to English
 */

export async function translateToEnglish(
  germanText: string,
  openAIApiKey: string,
  context: 'title' | 'description' = 'description'
): Promise<string> {
  try {
    if (!germanText || !germanText.trim()) {
      return '';
    }

    // Prepare the prompt based on context
    const systemPrompt = context === 'title'
      ? `You are a professional translator specializing in pet training content. 
         Translate the following German training plan or step title to English. 
         Keep it concise, professional, and suitable for pet training context.
         Return only the translated text without quotes or additional formatting.`
      : `You are a professional translator specializing in pet training content. 
         Translate the following German training plan or step description to English. 
         Maintain the professional tone and training context. 
         Return only the translated text without quotes or additional formatting.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: germanText
          }
        ],
        max_completion_tokens: context === 'title' ? 150 : 600,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI translation API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim();

    if (!translatedText) {
      console.error('No translation returned from OpenAI');
      throw new Error('No translation returned');
    }

    console.log(`✅ Translation successful: "${germanText}" -> "${translatedText}"`);
    return translatedText;

  } catch (error) {
    console.error('Translation error:', error);
    // Return empty string on error - the database will handle null values
    return '';
  }
}

/**
 * Translate training plan data to English
 */
export async function translatePlanData(
  planData: {
    title: string;
    description?: string;
    steps: Array<{
      title: string;
      description: string;
      points?: number;
    }>;
  },
  openAIApiKey: string
): Promise<{
  title_en: string;
  description_en: string;
  steps_en: Array<{
    title_en: string;
    description_en: string;
  }>;
}> {
  try {
    console.log('🔄 Starting translation process for plan data...');

    // Translate plan title and description
    const [titleEn, descriptionEn] = await Promise.all([
      translateToEnglish(planData.title, openAIApiKey, 'title'),
      planData.description 
        ? translateToEnglish(planData.description, openAIApiKey, 'description')
        : Promise.resolve('')
    ]);

    // Translate all steps
    const stepsEnPromises = planData.steps.map(async (step) => {
      const [stepTitleEn, stepDescriptionEn] = await Promise.all([
        translateToEnglish(step.title, openAIApiKey, 'title'),
        translateToEnglish(step.description, openAIApiKey, 'description')
      ]);

      return {
        title_en: stepTitleEn,
        description_en: stepDescriptionEn
      };
    });

    const stepsEn = await Promise.all(stepsEnPromises);

    console.log('✅ Translation process completed successfully');

    return {
      title_en: titleEn,
      description_en: descriptionEn,
      steps_en: stepsEn
    };

  } catch (error) {
    console.error('❌ Translation process failed:', error);
    
    // Return empty strings on error
    return {
      title_en: '',
      description_en: '',
      steps_en: planData.steps.map(() => ({
        title_en: '',
        description_en: ''
      }))
    };
  }
} 