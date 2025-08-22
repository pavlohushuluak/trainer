/**
 * Professional Response Cleaner Utility
 * Intelligently removes markdown formatting while preserving text structure and readability
 */

export function cleanMarkdownFormatting(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let cleaned = text;

  // Remove bold formatting (**text** or __text__) - preserve content
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/__(.*?)__/g, '$1');

  // Remove italic formatting (*text* or _text_) - preserve content
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
  cleaned = cleaned.replace(/_(.*?)_/g, '$1');

  // Remove inline code formatting (`text`) - preserve content
  cleaned = cleaned.replace(/`(.*?)`/g, '$1');

  // Remove strikethrough formatting (~~text~~) - preserve content
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1');

  // Remove markdown links [text](url) -> keep only the text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove markdown headers (# ## ### etc.) - preserve the text content
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // Remove markdown list markers (- * +) - preserve the content
  cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, '');

  // Handle numbered lists more carefully - preserve the numbering and content
  cleaned = cleaned.replace(/^[\s]*(\d+\.)\s+/gm, '$1 ');

  // Remove blockquote markers (>) - preserve the quoted content
  cleaned = cleaned.replace(/^>\s+/gm, '');

  // Remove horizontal rules (--- or ***) - replace with single line break
  cleaned = cleaned.replace(/^[-*]{3,}$/gm, '');

  // Remove any remaining bullet point symbols
  cleaned = cleaned.replace(/^[\s]*[•◦‣⁃]\s+/gm, '');

  // Remove any remaining numbered list patterns with parentheses
  cleaned = cleaned.replace(/^[\s]*([0-9]+\))\s+/gm, '$1 ');

  // Clean up excessive whitespace while preserving structure
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n'); // Reduce multiple line breaks to double
  cleaned = cleaned.replace(/^\s+|\s+$/gm, ''); // Trim whitespace from each line

  return cleaned.trim();
}

/**
 * Professional AI Response Cleaner
 * Enhanced cleaning that preserves letter structure and readability
 */
export function cleanAIResponse(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let cleaned = cleanMarkdownFormatting(text);

  // Additional cleaning for AI-specific patterns while preserving structure
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1'); // Final check for bold
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1'); // Final check for italic

  // Remove any remaining bullet points that might have been missed
  cleaned = cleaned.replace(/^[\s]*[•◦‣⁃]\s+/gm, '');

  // Remove any remaining numbered lists that might have been missed
  cleaned = cleaned.replace(/^[\s]*([0-9]+\))\s+/gm, '$1 ');

  // Preserve paragraph structure - ensure proper spacing
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n'); // Maintain double line breaks for paragraphs
  cleaned = cleaned.replace(/^\s+|\s+$/gm, ''); // Trim whitespace from each line

  // Ensure proper sentence spacing
  cleaned = cleaned.replace(/([.!?])\s*([A-Z])/g, '$1 $2');

  // Clean up any remaining formatting artifacts
  cleaned = cleaned.replace(/\s+/g, ' '); // Normalize multiple spaces to single space
  cleaned = cleaned.replace(/\n\s+/g, '\n'); // Remove leading spaces after line breaks

  // Final structure preservation
  cleaned = cleaned.replace(/\n\n\n+/g, '\n\n'); // Ensure consistent paragraph breaks
  cleaned = cleaned.replace(/^\s+|\s+$/g, ''); // Final trim

  return cleaned.trim();
}

/**
 * Structure-Preserving Cleaner
 * Advanced cleaning that maintains the professional structure of the response
 */
export function cleanStructuredResponse(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let cleaned = text;

  // Remove markdown formatting while preserving content
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/__(.*?)__/g, '$1');
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
  cleaned = cleaned.replace(/_(.*?)_/g, '$1');
  cleaned = cleaned.replace(/`(.*?)`/g, '$1');
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1');

  // Remove links but keep the text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove headers but preserve the text content
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // Remove list markers but preserve content and structure
  cleaned = cleaned.replace(/^[\s]*[-*+•◦‣⁃]\s+/gm, '');
  cleaned = cleaned.replace(/^[\s]*(\d+\.)\s+/gm, '$1 ');
  cleaned = cleaned.replace(/^[\s]*([0-9]+\))\s+/gm, '$1 ');

  // Remove blockquotes but preserve content
  cleaned = cleaned.replace(/^>\s+/gm, '');

  // Remove horizontal rules
  cleaned = cleaned.replace(/^[-*]{3,}$/gm, '');

  // Preserve professional paragraph structure
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  cleaned = cleaned.replace(/^\s+|\s+$/gm, '');

  // Ensure proper sentence spacing and punctuation
  cleaned = cleaned.replace(/([.!?])\s*([A-Z])/g, '$1 $2');
  cleaned = cleaned.replace(/([.!?])\s*([a-z])/g, '$1 $2');

  // Normalize spacing while preserving structure
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/\n\s+/g, '\n');
  cleaned = cleaned.replace(/\n\n\n+/g, '\n\n');

  // Final cleanup
  cleaned = cleaned.replace(/^\s+|\s+$/g, '');

  return cleaned.trim();
}
