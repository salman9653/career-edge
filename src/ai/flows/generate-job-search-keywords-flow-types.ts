/**
 * @fileOverview Types for the AI Job Search Keyword Generation Flow
 */

import { z } from 'genkit';

export const GenerateJobSearchKeywordsInputSchema = z.object({
  candidateProfile: z.object({
    jobTitle: z.string().optional().describe("The candidate's current or desired job title."),
    keySkills: z.array(z.string()).optional().describe("A list of the candidate's key skills."),
    profileSummary: z.string().optional().describe("The candidate's profile summary or resume overview."),
  }),
  searchHistory: z.array(z.string()).optional().describe("The user's recent search queries to influence keyword generation."),
});
export type GenerateJobSearchKeywordsInput = z.infer<typeof GenerateJobSearchKeywordsInputSchema>;


export const GenerateJobSearchKeywordsOutputSchema = z.object({
    keywords: z.array(z.string()).describe("A list of 10-15 diverse and relevant keywords, alternative titles, and related technologies for a job search."),
});
export type GenerateJobSearchKeywordsOutput = z.infer<typeof GenerateJobSearchKeywordsOutputSchema>;