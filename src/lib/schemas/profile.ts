import { z } from 'zod';

// Utility for date string validation
const dateStringSchema = z.string().refine(val => !isNaN(Date.parse(val)), {
  message: "Invalid date format",
});

export const EmploymentSchema = z.object({
  designation: z.string().min(1, 'Designation is required'),
  company: z.string().min(1, 'Company name is required'),
  employmentType: z.string().min(1, 'Employment type is required'),
  ctc: z.object({
    amount: z.number().min(0),
    currency: z.enum(['INR', 'USD']),
  }),
  skillsUsed: z.array(z.string()),
  jobProfile: z.string().max(4000, 'Job profile must be under 4000 characters'),
  isCurrent: z.boolean(),
  startDate: dateStringSchema,
  endDate: dateStringSchema.nullable().optional(),
});

export const EducationSchema = z.object({
  level: z.string().min(1, 'Education level is required'),
  board: z.string().optional(),
  school: z.string().optional(),
  university: z.string().optional(),
  course: z.string().optional(),
  specialization: z.string().optional(),
  passingYear: z.number().optional(),
  marks: z.number().min(0).max(100).optional(),
  startYear: z.number().optional(),
  endYear: z.number().optional(),
  gradingSystem: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

export const ProjectSchema = z.object({
  projectTitle: z.string().min(1, 'Project title is required'),
  projectUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  taggedWith: z.string().optional(),
  skillsUsed: z.array(z.string()),
  clientName: z.string().optional(),
  projectStatus: z.enum(['in progress', 'finished']),
  workedFrom: z.object({
    month: z.number().min(1).max(12),
    year: z.number(),
  }),
  workedTill: z.object({
    month: z.number().min(1).max(12),
    year: z.number(),
  }).optional(),
  projectDetails: z.string().max(1000, 'Project details must be under 1000 characters'),
});

export const KeySkillsSchema = z.object({
  skills: z.array(z.string()).min(1, 'Add at least one skill'),
});

export const SocialsSchema = z.object({
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
  portfolio: z.string().url('Invalid Portfolio URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
});

export const ProfileDetailsSchema = z.object({
    headline: z.string().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
});

export const PersonalDetailsSchema = z.object({
    dob: dateStringSchema.optional(),
    gender: z.string().optional(),
    maritalStatus: z.string().optional(),
    languages: z.array(z.object({
        language: z.string(),
        proficiency: z.string(),
        canRead: z.boolean(),
        canWrite: z.boolean(),
        canSpeak: z.boolean()
    })).optional()
});
