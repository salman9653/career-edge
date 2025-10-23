
'use server';
/**
 * @fileOverview A Genkit flow for generating an ATS-friendly resume.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateAtsResumeInputSchema,
  GenerateAtsResumeOutputSchema,
  type GenerateAtsResumeInput,
  type GenerateAtsResumeOutput,
} from './generate-ats-resume-flow-types';

export async function generateAtsResume(
  input: GenerateAtsResumeInput
): Promise<GenerateAtsResumeOutput> {
  const { output } = await generateResumePrompt(input);
  if (!output) {
    throw new Error('Failed to generate resume. AI model returned no output.');
  }
  return output;
}

const generateResumePrompt = ai.definePrompt({
  name: 'generateAtsResumePrompt',
  input: { schema: GenerateAtsResumeInputSchema },
  output: { schema: GenerateAtsResumeOutputSchema },
  prompt: `You are an expert resume writer specializing in creating ATS-friendly resumes tailored for specific job descriptions.
Your task is to generate a professional resume in Markdown format.

**Candidate Details:**
\`\`\`json
{{{userDetails}}}
\`\`\`

{{#if existingResumeDataUri}}
**Existing Resume (for reference):**
{{media url=existingResumeDataUri}}
Use the existing resume to extract work history, education, and other relevant details, but rewrite and rephrase them to be more impactful and ATS-friendly.
{{/if}}

**Target Job Description:**
\`\`\`
{{{jobDescription}}}
\`\`\`

**Instructions:**
1.  Analyze the Candidate Details, Existing Resume (if provided), and the Target Job Description.
2.  Synthesize this information to create a new, tailored resume.
3.  The output must be in well-structured Markdown.
4.  The resume should include standard sections like: Contact Information, Summary/Objective, Skills, Work Experience, Education, and Projects (if applicable).
5.  Emphasize skills and experience from the candidate's background that are most relevant to the job description. Use keywords from the job description naturally.
6.  Quantify achievements in the work experience section wherever possible (e.g., "Increased performance by 15%").
7.  Ensure the final output is clean, professional, and easy to parse for an Applicant Tracking System (ATS).
`,
});
