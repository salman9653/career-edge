'use server';
/**
 * @fileOverview Genkit flows for enhancing and generating text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schema for enhancing text
const EnhanceTextInputSchema = z.object({
  text: z.string().describe('The original text to enhance.'),
  context: z.string().describe('The context for enhancement (e.g., "job-description", "question-statement").'),
});
type EnhanceTextInput = z.infer<typeof EnhanceTextInputSchema>;

const EnhanceTextOutputSchema = z.object({
  enhancedText: z.string().describe('The rewritten, enhanced text.'),
});
type EnhanceTextOutput = z.infer<typeof EnhanceTextOutputSchema>;

// Schema for generating text
const GenerateTextFromPromptInputSchema = z.object({
  prompt: z.string().describe('The user prompt to generate text from.'),
  context: z.string().describe('The context for text generation (e.g., "job-description", "question-statement").'),
});
type GenerateTextFromPromptInput = z.infer<typeof GenerateTextFromPromptInputSchema>;

const GenerateTextFromPromptOutputSchema = z.object({
  generatedText: z.string().describe('The AI-generated text.'),
});
type GenerateTextFromPromptOutput = z.infer<typeof GenerateTextFromPromptOutputSchema>;


// Exported wrapper for enhancing text
export async function enhanceText(input: EnhanceTextInput): Promise<EnhanceTextOutput> {
  const { output } = await enhanceTextPrompt(input);
  if (!output) throw new Error("Failed to enhance text.");
  return output;
}

// Exported wrapper for generating text
export async function generateTextFromPrompt(input: GenerateTextFromPromptInput): Promise<GenerateTextFromPromptOutput> {
    const { output } = await generateTextFromPromptPrompt(input);
    if (!output) throw new Error("Failed to generate text.");
    return output;
}


const enhanceTextPrompt = ai.definePrompt({
  name: 'enhanceTextPrompt',
  input: { schema: EnhanceTextInputSchema },
  output: { schema: EnhanceTextOutputSchema },
  prompt: `You are an expert copywriter. Your task is to enhance the following text within the given context.
Rewrite the text to be more professional, clear, and engaging.

Context: {{context}}
Original Text:
\`\`\`
{{text}}
\`\`\`

Return only the enhanced text.`,
});

const generateTextFromPromptPrompt = ai.definePrompt({
    name: 'generateTextFromPromptPrompt',
    input: { schema: GenerateTextFromPromptInputSchema },
    output: { schema: GenerateTextFromPromptOutputSchema },
    prompt: `You are an expert content generator. Your task is to generate text based on the user's prompt, tailored to the given context.

Context: {{context}}
User's Prompt:
\`\`\`
{{prompt}}
\`\`\`

Generate the content as requested.`,
});
