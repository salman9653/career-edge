'use server';
/**
 * @fileOverview A Genkit flow for generating interview questions.
 */

import { ai } from '@/ai/genkit';
import { 
    GenerateAiQuestionsInputSchema, 
    GenerateAiQuestionsOutputSchema, 
    GenerateAiQuestionsInput, 
    GenerateAiQuestionsOutput 
} from './generate-ai-questions-flow-types';

export async function generateAiQuestions(
  input: GenerateAiQuestionsInput
): Promise<GenerateAiQuestionsOutput> {
  const { output } = await generateQuestionsPrompt(input);
  if (!output) {
      throw new Error('Failed to generate questions. AI model returned no output.');
  }
  return output;
}

const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: { schema: GenerateAiQuestionsInputSchema },
  output: { schema: GenerateAiQuestionsOutputSchema },
  prompt: `You are an expert hiring manager tasked with creating interview questions. Generate {{numQuestions}} questions for a "{{jobTitle}}" position.

The questions should be of **{{difficulty}}** difficulty and focus on these key skills: {{#each keySkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.

The questions must be of type: **{{questionType}}**.

- For "mcq" type, provide 4 options and specify the correct answer.
- For "subjective" type, provide a brief summary of the expected answer.

Assign relevant categories to each question.
`,
});
