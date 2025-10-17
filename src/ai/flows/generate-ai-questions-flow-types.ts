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


const McqQuestionSchema = z.object({
    question: z.string().describe("The statement of the multiple-choice question."),
    type: z.literal('mcq'),
    category: z.array(z.string()).describe("A list of relevant categories for the question."),
    options: z.array(z.string()).min(4).max(4).describe("An array of 4 possible answers."),
    correctAnswer: z.string().describe("The correct answer from the options array."),
});

const SubjectiveQuestionSchema = z.object({
    question: z.string().describe("The statement of the subjective question."),
    type: z.literal('subjective'),
    category: z.array(z.string()).describe("A list of relevant categories for the question."),
    answerSummary: z.string().describe("A brief summary of what a good answer should contain."),
});

export const GenerateAiQuestionsOutputSchema = z.object({
    questions: z.array(z.union([McqQuestionSchema, SubjectiveQuestionSchema]))
});
export type GenerateAiQuestionsOutput = z.infer<typeof GenerateAiQuestionsOutputSchema>;
