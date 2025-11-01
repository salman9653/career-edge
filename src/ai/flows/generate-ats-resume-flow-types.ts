

/**
 * @fileOverview Types for the AI ATS-Friendly Resume Generation Flow
 */

import { z } from 'genkit';

export const GenerateAtsResumeInputSchema = z.object({
  jobDescription: z.string().describe('The full job description the resume should be tailored for.'),
  userDetails: z.string().describe('A JSON string containing the candidate\'s details like name, contact, skills, experience, education, etc.'),
  existingResumeDataUri: z.string().optional().describe("An optional existing resume file, as a data URI, for content extraction."),
});
export type GenerateAtsResumeInput = z.infer<typeof GenerateAtsResumeInputSchema>;


export const GenerateAtsResumeOutputSchema = z.object({
    markdownContent: z.string().describe("The generated ATS-friendly resume content in Markdown format."),
});
export type GenerateAtsResumeOutput = z.infer<typeof GenerateAtsResumeOutputSchema>;


// Type for storing the generated resume in Firestore
export interface GeneratedResume {
    id: string;
    userId: string;
    name: string;
    markdownContent: string;
    pdfDataUri?: string; // To be generated later
    jobDescription: string;
    createdAt: any;
    input: {
        jobDescription: string;
        userDetails: any;
        hasExistingResume: boolean;
    };
}
