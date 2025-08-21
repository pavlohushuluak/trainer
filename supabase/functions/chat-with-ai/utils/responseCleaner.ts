/**
 * Response Cleaner Utility
 * Removes markdown formatting from AI responses to ensure plain text output
 */

export function cleanMarkdownFormatting(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let cleaned = text;

  // Remove bold formatting (**text** or __text__)
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/__(.*?)__/g, '$1');

  // Remove italic formatting (*text* or _text_)
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
  cleaned = cleaned.replace(/_(.*?)_/g, '$1');

  // Remove code formatting (`text`)
  cleaned = cleaned.replace(/`(.*?)`/g, '$1');

  // Remove strikethrough formatting (~~text~~)
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1');

  // Remove markdown links [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove markdown headers (# ## ### etc.)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // Remove markdown list markers (- * +)
  cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, '');

  // Remove numbered list markers (1. 2. etc.) - but be more careful not to remove content
  cleaned = cleaned.replace(/^[\s]*(\d+\.)\s+/gm, '$1 ');

  // Remove blockquote markers (>)
  cleaned = cleaned.replace(/^>\s+/gm, '');

  // Remove horizontal rules (--- or ***)
  cleaned = cleaned.replace(/^[-*]{3,}$/gm, '');

  // Clean up extra whitespace that might be left after removing formatting
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n'); // Remove excessive line breaks
  cleaned = cleaned.replace(/^\s+|\s+$/gm, ''); // Trim whitespace from each line

  return cleaned.trim();
}

/**
 * Enhanced cleaning that also handles common AI formatting patterns
 */
export function cleanAIResponse(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let cleaned = cleanMarkdownFormatting(text);

  // Remove any remaining markdown-like patterns that might be common in AI responses
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1'); // Double check for bold
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1'); // Double check for italic

  // Remove any bullet points that might have been missed
  cleaned = cleaned.replace(/^[\s]*[•◦‣⁃]\s+/gm, '');

  // Remove any numbered lists that might have been missed - but preserve content
  cleaned = cleaned.replace(/^[\s]*([0-9]+\))\s+/gm, '$1 ');

  // Clean up any remaining formatting artifacts
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleaned = cleaned.replace(/^\s+|\s+$/gm, '');

  return cleaned.trim();
}
