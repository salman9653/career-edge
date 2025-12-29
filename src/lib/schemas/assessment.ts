import { z } from 'zod';

export const CreateAssessmentSchema = z.object({
  name: z.string().min(1, 'Assessment name is required').max(100, 'Name too long'),
  assessmentType: z.enum(['mcq', 'subjective', 'code']),
  description: z.string().optional(),
  createdBy: z.string().optional(),
  createdByName: z.string().optional(),
});

export const EditAssessmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  duration: z.number().min(5, 'Duration must be at least 5 minutes').optional(),
  passingScore: z.number().min(0).max(100).optional(),
});

export const QuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['mcq', 'subjective', 'code']),
  options: z.array(z.string()).optional(), // For MCQ
  correctOption: z.number().optional(), // Index for MCQ
  score: z.number().min(1, 'Score must be at least 1'),
});

export const BankQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  type: z.enum(['mcq', 'subjective', 'screening', 'code']),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  category: z.string().min(1, 'Category is required'),
  libraryType: z.enum(['library', 'custom']),
  addedBy: z.string().min(1),
  
  // Type specific
  answerSummary: z.string().min(10, 'Answer summary must be 10+ chars').optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  acceptableAnswer: z.array(z.string()).optional(),
  isStrict: z.boolean().optional(),
  
  // Code specific
  constraints: z.array(z.string()).optional(),
  hints: z.array(z.string()).optional(),
  functionName: z.record(z.string(), z.string()).optional(),
  boilerplate: z.record(z.string(), z.string()).optional(),
  examples: z.array(z.object({ input: z.string(), output: z.string() })).optional(),
  testCases: z.array(z.object({ input: z.string(), output: z.string(), sample: z.boolean() })).optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'subjective' && !data.answerSummary) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Answer summary is required for subjective questions", path: ["answerSummary"] });
  }
  if (data.type === 'mcq') {
    if (!data.options || data.options.length < 2) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least 2 options required", path: ["options"] });
    if (!data.correctAnswer) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Correct answer required", path: ["correctAnswer"] });
  }
  if (data.type === 'screening') {
    if (!data.options || data.options.length < 2) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least 2 options required", path: ["options"] });
    if (!data.acceptableAnswer || data.acceptableAnswer.length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Acceptable answer required", path: ["acceptableAnswer"] });
  }
  if (data.type === 'code') {
    if (!data.functionName || Object.keys(data.functionName).length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Function details required", path: ["functionName"] });
    if (!data.examples || data.examples.length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Examples required", path: ["examples"] });
    if (!data.testCases || data.testCases.length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Test cases required", path: ["testCases"] });
  }
});
