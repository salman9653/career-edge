/**
 * @fileOverview Types and schemas for the career-chat-flow.
 *
 * - CareerChatInput - The input type for the careerChat function.
 * - CareerChatOutput - The return type for the careerChat function.
 * - CareerChatInputSchema - The Zod schema for the input.
 * - CareerChatOutputSchema - The Zod schema for the output.
 */

import {z} from 'genkit';

export const CareerChatInputSchema = z.object({
  userName: z.string().describe('The name of the user.'),
  userRole: z.enum(['candidate', 'company', 'admin', 'manager']).describe('The role of the user.'),
  message: z.string().describe('The user\'s message.'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        text: z.string(),
      })
    )
    .optional()
    .describe('The conversation history.'),
});
export type CareerChatInput = z.infer<typeof CareerChatInputSchema>;

export const CareerChatOutputSchema = z.object({
  message: z.string().describe('The AI\'s response message.'),
});
export type CareerChatOutput = z.infer<typeof CareerChatOutputSchema>;
