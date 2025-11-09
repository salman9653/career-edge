/**
 * @fileOverview Types and schemas for the recommend-jobs-flow.
 */

import { z } from 'genkit';

export const RecommendJobsInputSchema = z.object({
  candidateProfile: z.object({
    jobTitle: z.string().optional().describe("The candidate's current or desired job title."),
    keySkills: z.array(z.string()).optional().describe("A list of the candidate's key skills."),
    experience: z.string().optional().describe("The candidate's years of experience."),
  }),
  allJobs: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      workExperience: z.string(),
      keySkills: z.array(z.string()).optional(),
  })).describe("A list of all available jobs to compare against."),
});
export type RecommendJobsInput = z.infer<typeof RecommendJobsInputSchema>;

export const RecommendJobsOutputSchema = z.object({
  recommendedJobIds: z.array(z.string()).describe("An array of job IDs, ranked from most to least recommended for the candidate."),
});
export type RecommendJobsOutput = z.infer<typeof RecommendJobsOutputSchema>;
