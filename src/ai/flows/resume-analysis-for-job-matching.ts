'use server';
/**
 * @fileOverview Analyzes a resume to identify skills, experience, and qualifications
 * to determine the best-matching job postings for the candidate.
 *
 * - analyzeResumeForJobMatching - A function that handles the resume analysis process.
 * - AnalyzeResumeForJobMatchingInput - The input type for the analyzeResumeForJobMatching function.
 * - AnalyzeResumeForJobMatchingOutput - The return type for the analyzeResumeForJobMatching function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeForJobMatchingInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobDescription: z.string().describe('The job description to match the resume against.'),
  jobTitle: z.string().describe('The title of the job.'),
});

export type AnalyzeResumeForJobMatchingInput = z.infer<
  typeof AnalyzeResumeForJobMatchingInputSchema
>;

const AnalyzeResumeForJobMatchingOutputSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('A score from 0-100 indicating how well the resume matches the job description.'),
  summary: z.string().describe("A brief, one-paragraph summary of the candidate's suitability for the role."),
  ratings: z.object({
    skills: z.number().min(0).max(100).describe("A score from 0-100 for how well the candidate's skills match the job requirements."),
    experience: z.number().min(0).max(100).describe("A score from 0-100 based on the relevance and duration of the candidate's experience."),
    qualifications: z.number().min(0).max(100).describe("A score from 0-100 for the candidate's educational and other qualifications.")
  }),
  pros: z.array(z.string()).describe("A list of 3-5 key strengths or positive points from the resume that align with the job."),
  cons: z.array(z.string()).describe("A list of 3-5 potential weaknesses or areas where the resume is lacking for this specific role."),
  improvements: z.array(z.string()).describe("A list of 3-5 actionable suggestions for how the candidate could improve their resume to be a better fit for this job."),
});


export type AnalyzeResumeForJobMatchingOutput = z.infer<
  typeof AnalyzeResumeForJobMatchingOutputSchema
>;

export async function analyzeResumeForJobMatching(
  input: AnalyzeResumeForJobMatchingInput
): Promise<AnalyzeResumeForJobMatchingOutput> {
  return analyzeResumeForJobMatchingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResumeForJobMatchingPrompt',
  input: {schema: AnalyzeResumeForJobMatchingInputSchema},
  output: {schema: AnalyzeResumeForJobMatchingOutputSchema},
  prompt: `You are an expert career coach and resume analyst. Your task is to provide a detailed, constructive analysis of a resume for a specific job.

Analyze the provided resume against the job description for the role of **{{jobTitle}}**.

**Resume:** 
{{media url=resumeDataUri}}

**Job Description:**
\`\`\`
{{{jobDescription}}}
\`\`\`

Based on your analysis, provide a structured breakdown. Be critical but encouraging. Your scores should be realistic.

1.  **Overall Score:** A single score from 0 to 100 representing the overall match.
2.  **Summary:** A concise paragraph summarizing the candidate's fit.
3.  **Ratings Breakdown:** Score the resume on a scale of 0-100 for each of these three categories: Skills, Experience, and Qualifications.
4.  **Pros:** List 3-5 specific strengths of the resume in relation to the job.
5.  **Cons:** List 3-5 specific areas where the resume is weak or mismatched for the role.
6.  **Improvements:** Provide 3-5 concrete, actionable suggestions for how the candidate could tailor their resume to better fit this job description.
`,
});

const analyzeResumeForJobMatchingFlow = ai.defineFlow(
  {
    name: 'analyzeResumeForJobMatchingFlow',
    inputSchema: AnalyzeResumeForJobMatchingInputSchema,
    outputSchema: AnalyzeResumeForJobMatchingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
