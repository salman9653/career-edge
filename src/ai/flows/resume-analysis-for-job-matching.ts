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
});

export type AnalyzeResumeForJobMatchingInput = z.infer<
  typeof AnalyzeResumeForJobMatchingInputSchema
>;

const AnalyzeResumeForJobMatchingOutputSchema = z.object({
  skills: z.array(z.string()).describe('List of skills identified in the resume.'),
  experienceSummary:
    z.string().describe('Summary of the candidate\'s work experience.'),
  qualificationsSummary:
    z.string().describe('Summary of the candidate\'s qualifications.'),
  matchScore: z
    .number()
    .describe('A score indicating how well the resume matches the job description.'),
  reasoning: z
    .string()
    .describe('Reasoning for match score based on skills, experience, and qualifications.'),
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
  prompt: `You are an AI resume analysis tool designed to help recruiters quickly assess candidate suitability for a job.

  Analyze the following resume and determine the candidate's skills, experience, and qualifications.
  Then, compare these against the provided job description and determine a match score (0-100) and a reasoning for the score.

  Resume: {{media url=resumeDataUri}}
  Job Description: {{{jobDescription}}}

  Provide the skills, experience summary, qualifications summary, match score, and reasoning in the output.`,
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
