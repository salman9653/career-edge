/**
 * @fileOverview Types for the AI Interview Generation Flow
 */

import { z } from 'genkit';

export const GenerateAiInterviewInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job the candidate is applying for.'),
  jobDescription: z.string().describe('The full job description.'),
  keySkills: z.array(z.string()).describe('A list of key skills to probe during the interview.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the questions.'),
  tone: z.enum(['Formal', 'Conversational', 'Technical']).describe('The desired tone for the interview questions and scripts.'),
  duration: z.number().describe('The approximate desired duration of the interview in minutes.'),
});
export type GenerateAiInterviewInput = z.infer<typeof GenerateAiInterviewInputSchema>;


export const GenerateAiInterviewOutputSchema = z.object({
    intro: z.string().describe("A welcoming introductory script for the start of the interview."),
    questions: z.array(z.object({
        question: z.string().describe("A single, well-formulated interview question."),
        followUps: z.array(z.string()).describe("A list of 2-3 potential follow-up questions to probe deeper based on the candidate's response.")
    })).describe("The array of generated interview questions."),
    outro: z.string().describe("A concluding script for the end of the interview.")
});
export type GenerateAiInterviewOutput = z.infer<typeof GenerateAiInterviewOutputSchema>;
