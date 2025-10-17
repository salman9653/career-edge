/**
 * @fileOverview Types and schemas for the AI Interview Editing Flow
 */

import { z } from 'genkit';
import { GenerateAiInterviewInputSchema } from './generate-ai-interview-flow-types';

export const RegenerateQuestionInputSchema = GenerateAiInterviewInputSchema.extend({
  originalQuestion: z.string().describe("The original question to be regenerated."),
});
export type RegenerateQuestionInput = z.infer<typeof RegenerateQuestionInputSchema>;

export const RegenerateQuestionOutputSchema = z.object({
  question: z.string().describe("The new, regenerated question."),
  followUps: z.array(z.string()).describe("A new list of 2-3 potential follow-up questions for the regenerated question."),
});
export type RegenerateQuestionOutput = z.infer<typeof RegenerateQuestionOutputSchema>;

export const RefineToneInputSchema = z.object({
  question: z.string().describe("The question to refine."),
  newTone: z.enum(['Formal', 'Conversational', 'Technical', 'Behavioral', 'Situational']).describe("The desired new tone for the question."),
});
export type RefineToneInput = z.infer<typeof RefineToneInputSchema>;

export const RefineToneOutputSchema = z.object({
  refinedQuestion: z.string().describe("The question with the refined tone."),
});
export type RefineToneOutput = z.infer<typeof RefineToneOutputSchema>;

export const AddFollowUpsInputSchema = GenerateAiInterviewInputSchema.extend({
  question: z.string().describe("The question for which to generate more follow-ups."),
});
export type AddFollowUpsInput = z.infer<typeof AddFollowUpsInputSchema>;

export const AddFollowUpsOutputSchema = z.object({
  followUps: z.array(z.string()).describe("A list of 2-3 new follow-up questions."),
});
export type AddFollowUpsOutput = z.infer<typeof AddFollowUpsOutputSchema>;

export const RegenerateFollowUpsInputSchema = GenerateAiInterviewInputSchema.extend({
  question: z.string().describe("The main question whose follow-ups need regenerating."),
});
export type RegenerateFollowUpsInput = z.infer<typeof RegenerateFollowUpsInputSchema>;

export const RegenerateFollowUpsOutputSchema = z.object({
  followUps: z.array(z.string()).describe("A new list of 2-3 regenerated follow-up questions."),
});
export type RegenerateFollowUpsOutput = z.infer<typeof RegenerateFollowUpsOutputSchema>;

// New Types for Intro/Outro
export const RegenerateIntroInputSchema = GenerateAiInterviewInputSchema;
export type RegenerateIntroInput = z.infer<typeof RegenerateIntroInputSchema>;
export const RegenerateIntroOutputSchema = z.object({
  intro: z.string().describe("A new, welcoming introductory script for the start of the interview."),
});
export type RegenerateIntroOutput = z.infer<typeof RegenerateIntroOutputSchema>;


export const RegenerateOutroInputSchema = GenerateAiInterviewInputSchema;
export type RegenerateOutroInput = z.infer<typeof RegenerateOutroInputSchema>;
export const RegenerateOutroOutputSchema = z.object({
  outro: z.string().describe("A new, concluding script for the end of the interview."),
});
export type RegenerateOutroOutput = z.infer<typeof RegenerateOutroOutputSchema>;
