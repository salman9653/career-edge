'use server';
/**
 * @fileOverview Genkit flows for editing and refining AI-generated interviews.
 */

import { ai } from '@/ai/genkit';
import {
  RegenerateQuestionInput,
  RegenerateQuestionInputSchema,
  RegenerateQuestionOutput,
  RegenerateQuestionOutputSchema,
  RefineToneInput,
  RefineToneInputSchema,
  RefineToneOutput,
  RefineToneOutputSchema,
  AddFollowUpsInput,
  AddFollowUpsInputSchema,
  AddFollowUpsOutput,
  AddFollowUpsOutputSchema,
} from './edit-ai-interview-flow-types';

export async function regenerateQuestion(
  input: RegenerateQuestionInput
): Promise<RegenerateQuestionOutput> {
  const { output } = await regenerateQuestionPrompt(input);
  if (!output) throw new Error("Failed to regenerate question.");
  return output;
}

export async function refineTone(
  input: RefineToneInput
): Promise<RefineToneOutput> {
  const { output } = await refineTonePrompt(input);
   if (!output) throw new Error("Failed to refine tone.");
  return output;
}

export async function addFollowUps(
  input: AddFollowUpsInput
): Promise<AddFollowUpsOutput> {
  const { output } = await addFollowUpsPrompt(input);
   if (!output) throw new Error("Failed to add follow-ups.");
  return output;
}

const regenerateQuestionPrompt = ai.definePrompt({
  name: 'regenerateInterviewQuestionPrompt',
  input: { schema: RegenerateQuestionInputSchema },
  output: { schema: RegenerateQuestionOutputSchema },
  prompt: `You are an expert hiring manager. Your task is to regenerate an interview question.
The new question must be different from the original but still probe the same skills.
Generate a new question and 2-3 new follow-up questions based on the provided job context.

Job Title: {{jobTitle}}
Job Description: {{jobDescription}}
Key Skills: {{keySkills}}
Difficulty: {{difficulty}}

Original Question to Regenerate:
"{{originalQuestion}}"

Generate a completely new question and a new set of follow-ups.`,
});

const refineTonePrompt = ai.definePrompt({
  name: 'refineQuestionTonePrompt',
  input: { schema: RefineToneInputSchema },
  output: { schema: RefineToneOutputSchema },
  prompt: `You are an expert copywriter. Your task is to refine the tone of an interview question.

Original Question:
"{{question}}"

Rewrite the question to have a more "{{newTone}}" tone. Only output the refined question text.`,
});

const addFollowUpsPrompt = ai.definePrompt({
  name: 'addFollowUpsPrompt',
  input: { schema: AddFollowUpsInputSchema },
  output: { schema: AddFollowUpsOutputSchema },
  prompt: `You are an expert interviewer. Your task is to generate 2-3 additional, insightful follow-up questions for the given main question, based on the job context.

Job Title: {{jobTitle}}
Job Description: {{jobDescription}}
Key Skills: {{keySkills}}

Main Question:
"{{question}}"

Generate new follow-up questions that probe deeper into the candidate's response to the main question.`,
});
