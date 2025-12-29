import { z } from 'zod';

export const GenerateResumeSchema = z.object({
  resumeName: z.string().min(1, 'Resume name is required'),
  jobDescription: z.string().min(10, 'Job description must be at least 10 characters').min(1, 'Job description is required'),
  userDetails: z.string().optional(), // JSON string if manual
  useProfileData: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),
});

export const RenameResumeSchema = z.object({
    newName: z.string().min(1, 'Name cannot be empty'),
});
