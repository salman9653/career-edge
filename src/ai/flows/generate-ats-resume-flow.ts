
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
Your task is to generate a professional resume in Markdown format using ONLY the information provided, inspired by the provided example's layout.

**Candidate Details (in JSON format):**
\`\`\`json
{{{userDetails}}}
\`\`\`
This JSON contains the ONLY source of truth for the candidate's details. It may include fields like: name, email, phone, address, profileSummary, keySkills (array), employment (array of objects), education (array of objects), projects (array of objects), socials (object), and portfolio.

{{#if existingResumeDataUri}}
**Existing Resume (for reference):**
{{media url=existingResumeDataUri}}
Use the existing resume file ONLY to extract and understand the context of the work history, education, and other details. The primary source of information is the Candidate Details JSON.
{{/if}}

**Target Job Description:**
\`\`\`
{{{jobDescription}}}
\`\`\`

**CRITICAL INSTRUCTIONS:**
1.  **Strict Data Adherence:** You MUST ONLY use the data provided in the 'Candidate Details' JSON and the optional 'Existing Resume'. DO NOT invent, create, or hallucinate any new work experiences, educational qualifications, projects, or skills.
2.  **Synthesize, Don't Fabricate:** Your role is to analyze, rephrase, and format the GIVEN information to be more impactful and tailor it to the target job description. Use keywords from the job description naturally, but only in the context of the provided experience.
3.  **ATS-Friendly Markdown Format:** The output MUST be in well-structured Markdown. Create a two-column layout for the header. The left column should have the candidate's full name in large, bold text, followed by their job title. The right column should have their contact details (email, phone, LinkedIn, address).
4.  **Standard Sections:** Structure the resume with the following standard sections, using horizontal rules to separate them:
    - **Profile Summary:** A concise, impactful summary.
    - **Work Experience:** For each job, list the title, company, dates, and responsibilities as bullet points. Quantify achievements where possible (e.g., "Increased performance by 15%").
    - **Education:** List degrees, universities, and graduation years.
    - **Projects:** Detail personal or professional projects.
    - **Skills:** Categorize skills (e.g., "Languages," "Frameworks/Libraries," "Tools").
5.  **Professional Tone:** The language must be professional, clear, and action-oriented.
`,
});
