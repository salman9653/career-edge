/**
 * @fileOverview Types for the AI Question Generation Flow
 */

import { z } from 'genkit';

export const GenerateAiQuestionsInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job the candidate is applying for.'),
  keySkills: z.array(z.string()).describe('A list of key skills to probe during the interview.'),
  questionType: z.enum(['mcq', 'subjective']).describe('The type of questions to generate.'),
  numQuestions: z.number().int().min(1).max(10).describe('The number of questions to generate.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the questions.'),
});
export type GenerateAiQuestionsInput = z.infer<typeof GenerateAiQuestionsInputSchema>;

// Unified schema for both question types
const QuestionSchema = z.object({
    question: z.string().describe("The statement of the question."),
    type: z.enum(['mcq', 'subjective']),
    category: z.array(z.string()).describe("A list of relevant categories for the question."),
    // Fields for MCQ
    options: z.array(z.string()).min(4).max(4).optional().describe("An array of 4 possible answers for an MCQ. Should be null for subjective questions."),
    correctAnswer: z.string().optional().describe("The correct answer from the options array. Should be null for subjective questions."),
    // Field for Subjective
    answerSummary: z.string().optional().describe("A brief summary of what a good answer should contain. Should be null for MCQs."),
});

export const GenerateAiQuestionsOutputSchema = z.object({
    questions: z.array(QuestionSchema)
});
export type GenerateAiQuestionsOutput = z.infer<typeof GenerateAiQuestionsOutputSchema>;
