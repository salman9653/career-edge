'use server';
/**
 * @fileOverview A career chat AI agent that provides advice to candidates and companies.
 *
 * - careerChat - A function that handles the career chat conversation.
 */

import {ai} from '@/ai/genkit';
import {
  CareerChatInput,
  CareerChatInputSchema,
  CareerChatOutput,
  CareerChatOutputSchema,
} from './career-chat-flow-types';

export async function careerChat(
  input: CareerChatInput
): Promise<CareerChatOutput> {
  const {output} = await careerChatPrompt(input);
  return output!;
}

const careerChatPrompt = ai.definePrompt({
  name: 'careerChatPrompt',
  input: {schema: CareerChatInputSchema},
  output: {schema: CareerChatOutputSchema},
  prompt: `You are Career AI, a helpful and friendly AI assistant for job seekers and hiring managers. Your goal is to provide concise, relevant, and encouraging advice.

You are chatting with {{userName}}, who is a {{userRole}}.

Keep your responses brief and to the point.

Conversation History:
{{#each history}}
  {{#if (eq role 'user')}}
    User: {{text}}
  {{/if}}
  {{#if (eq role 'model')}}
    AI: {{text}}
  {{/if}}
{{/each}}

User's new message:
{{{message}}}`,
});
