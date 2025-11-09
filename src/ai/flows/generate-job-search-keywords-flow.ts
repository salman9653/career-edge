'use server';
/**
 * @fileOverview An AI flow to generate relevant job search keywords from a candidate's profile.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateJobSearchKeywordsInputSchema,
  GenerateJobSearchKeywordsOutputSchema,
  type GenerateJobSearchKeywordsInput,
  type GenerateJobSearchKeywordsOutput,
} from './generate-job-search-keywords-flow-types';

export async function generateJobSearchKeywords(input: GenerateJobSearchKeywordsInput): Promise<GenerateJobSearchKeywordsOutput> {
    const { output } = await generateKeywordsPrompt(input);
    if (!output) {
        throw new Error('Failed to generate job search keywords.');
    }
    return output;
}

const generateKeywordsPrompt = ai.definePrompt({
    name: 'generateJobSearchKeywordsPrompt',
    input: { schema: GenerateJobSearchKeywordsInputSchema },
    output: { schema: GenerateJobSearchKeywordsOutputSchema },
    prompt: `You are an expert career advisor and AI recruiter. Your task is to analyze a candidate's profile and generate a comprehensive list of 10-15 search keywords they can use to find suitable jobs.

**Candidate Profile:**
- Desired Job Title: {{candidateProfile.jobTitle}}
- Key Skills: {{#each candidateProfile.keySkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Profile Summary: {{{candidateProfile.profileSummary}}}

{{#if searchHistory}}
**Candidate's Recent Search History (for context):**
{{#each searchHistory}}
- "{{this}}"
{{/each}}
{{/if}}

**Instructions:**
1.  Analyze the provided profile details and search history.
2.  Generate a diverse list of 10-15 keywords.
3.  Include a mix of:
    - **Direct Job Titles:** (e.g., "Frontend Developer", "Senior Software Engineer")
    - **Alternative or Related Titles:** (e.g., "UI Engineer", "Web Developer", "React Specialist")
    - **Core Technologies & Skills:** (e.g., "react", "typescript", "nodejs")
    - **Related Concepts & Tools:** (e.g., "state management", "CI/CD", "jest", "vite")
4.  Do not include soft skills like "communication" or "teamwork". Focus on technical and role-based terms.
5.  Return ONLY the array of keywords.
`,
});
