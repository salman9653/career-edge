import { z } from 'zod';

export const JobPostingSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  type: z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']),
  recruiter: z.string().min(1, 'Recruiter is required'),
  description: z.string().min(1, 'Job description is required'),
  preference: z.enum(['Remote', 'On-site', 'Hybrid']),
  location: z.string().optional(),
  positions: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => val > 0, 'At least 1 position is required'),
  workExperience: z.string().min(1, 'Work experience is required'),
  minSalary: z.union([z.string(), z.number()]).transform(val => Number(val)),
  maxSalary: z.union([z.string(), z.number()]).transform(val => Number(val)),
  keySkills: z.array(z.string()).optional(),
}).refine(data => {
  if (data.preference !== 'Remote' && !data.location) {
    return false;
  }
  return true;
}, {
  message: "Location is required for On-site/Hybrid jobs",
  path: ["location"]
});

export const ScreeningQuestionSchema = z.object({
  question: z.string().min(1, 'Question text is required'),
  type: z.enum(['text', 'yes_no', 'multiple_choice']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
});
