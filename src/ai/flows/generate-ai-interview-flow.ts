'use server';
/**
 * @fileOverview A Genkit flow for generating structured AI interviews.
 * 
 * - generateAiInterview - The main function that orchestrates the interview generation.
 */

import { ai } from '@/ai/genkit';
import { GenerateAiInterviewInputSchema, GenerateAiInterviewOutputSchema, GenerateAiInterviewInput, GenerateAiInterviewOutput } from './generate-ai-interview-flow-types';

export async function generateAiInterview(
  input: GenerateAiInterviewInput
): Promise<GenerateAiInterviewOutput> {
  const { output } = await generateInterviewPrompt(input);
  if (!output) {
      throw new Error('Failed to generate interview. AI model returned no output.');
  }
  return output;
}

const generateInterviewPrompt = ai.definePrompt({
  name: 'generateInterviewPrompt',
  input: { schema: GenerateAiInterviewInputSchema },
  output: { schema: GenerateAiInterviewOutputSchema },
  prompt: `You are an expert hiring manager and AI assistant. Your task is to generate a complete, structured interview script based on the provided job details.

The interview should be for the role of: **{{jobTitle}}**.

**Job Description:**
\`\`\`
{{jobDescription}}
\`\`\`

**Key Skills to Probe:**
{{#each keySkills}}
- {{this}}
{{/each}}

The total interview should last approximately **{{duration}} minutes**. Based on this duration and the difficulty, generate an appropriate number of questions (e.g., 5-7 for a 20-minute medium interview).

The interview tone should be **{{tone}}**.
The question difficulty should be **{{difficulty}}**.

Please generate the following structured output:
1.  **Intro Script:** A welcoming message for the candidate.
2.  **Interview Questions:** A list of questions. Each question should also have 2-3 potential follow-up questions to probe for more detail.
3.  **Outro Script:** A closing message to thank the candidate and explain the next steps.

Ensure the questions are a good mix of behavioral, situational, and technical, tailored to the job description and key skills.
`,
});
