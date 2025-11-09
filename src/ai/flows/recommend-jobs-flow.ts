'use server';
/**
 * @fileOverview An AI flow to recommend jobs to a candidate based on their profile.
 * 
 * - recommendJobs - A function that handles the job recommendation logic.
 */

import { ai } from '@/ai/genkit';
import {
  RecommendJobsInputSchema,
  RecommendJobsOutputSchema,
  type RecommendJobsInput,
  type RecommendJobsOutput,
} from './recommend-jobs-flow-types';

export async function recommendJobs(input: RecommendJobsInput): Promise<RecommendJobsOutput> {
    const { output } = await recommendJobsPrompt(input);
    if (!output) {
        throw new Error('Failed to get job recommendations.');
    }
    return output;
}

const recommendJobsPrompt = ai.definePrompt({
    name: 'recommendJobsPrompt',
    input: { schema: RecommendJobsInputSchema },
    output: { schema: RecommendJobsOutputSchema },
    prompt: `You are an expert career advisor and AI recruiter. Your task is to analyze a candidate's profile and recommend the most suitable jobs from a given list.

**Candidate Profile:**
- Job Title: {{candidateProfile.jobTitle}}
- Key Skills: {{#each candidateProfile.keySkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Experience: {{candidateProfile.experience}}

**Available Jobs:**
{{#each allJobs}}
---
Job ID: {{id}}
Title: {{title}}
Required Experience: {{workExperience}}
Description:
\`\`\`
{{{description}}}
\`\`\`
{{/each}}

**Instructions:**
1.  Carefully review the candidate's profile.
2.  Analyze each available job, paying close attention to the title, description, required experience, and skills.
3.  Compare the candidate's profile with each job to determine the level of match.
4.  Return a ranked list of the job IDs that are the best fit for the candidate, from most to least recommended.
5.  Only include jobs that are a reasonably good match. Do not recommend jobs that are clearly unsuitable.
`,
});
