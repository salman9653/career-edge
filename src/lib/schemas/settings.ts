import { z } from 'zod';

export const ThemePreferencesSchema = z.object({
  themeMode: z.enum(['light', 'dark', 'system']).optional(),
  themeColor: z.string().optional(),
});

export const WhatsNewSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
});

export const AboutPlatformSchema = z.object({
  version: z.string().min(1, 'Version is required'),
  content: z.string().min(1, 'Content cannot be empty'),
});

export const ContactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  phoneAvailable: z.string().optional(),
});

export const FeedbackSchema = z.object({
  feedbackContent: z.string(),
  rating: z.number().min(0, 'Rating is required'),
  feedbackBy: z.string().min(1, 'User information is missing'),
  feedbackByName: z.string().min(1, 'User information is missing'),
}).refine(data => data.feedbackContent || data.rating > 0, {
    message: "Please provide a rating or feedback content.",
    path: ["feedbackContent"],
});

export const PolicySchema = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
});

export const TermsSchema = z.object({
    content: z.string().min(1, 'Content cannot be empty'),
});
