

import type { LucideIcon } from 'lucide-react';

export interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
}

export interface Company {
    id: string;
    name: string;
    logoUrl: string;
    dataAiHint: string;
}

export interface ApplicantRoundResult {
    roundId: number;
    status: 'Passed' | 'Failed' | 'Pending';
    score?: number;
    completedAt?: string;
    answers?: { questionId: string; answer: string }[];
    timeTaken?: number;
    startedAt?: string;
    feedback?: {
        rating: number;
        comment: string;
        submittedAt: string;
    };
}

export interface Schedule {
    roundId: number;
    status: 'Pending' | 'Attempted' | 'Completed';
    scheduledAt: string;
    dueDate: string;
}
  
export interface Applicant {
    id: string;
    candidateId: string;
    candidateName: string;
    avatarUrl?: string;
    candidateEmail: string;
    resumeUrl?: string;
    appliedAt: any;
    status: 'Submitted' | 'Screening Passed' | 'Screening Failed' | 'In Progress' | 'Hired' | 'Rejected';
    activeRoundIndex: number;
    roundResults: ApplicantRoundResult[];
    schedules?: Schedule[];
}
  
export interface Job {
    id: string;
    title: string;
    description: string;
    companyId: string;
    location: string;
    type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
    preference: 'Remote' | 'On-site' | 'Hybrid';
    recruiter: {
        id: string;
        name: string;
    };
    workExperience: string;
    salary: {
        min: number;
        max: number;
    };
    positions: number;
    datePosted: string;
    status: 'Live' | 'Draft' | 'Closed' | 'Archived' | 'On-hold';
    applicants?: Applicant[]; 
    rounds: Round[];
    createdBy: string;
    createdByName: string;
    createdAt: any;
    updatedAt: any;
}

export interface Question {
    id: string;
    question: string;
    type: 'mcq' | 'subjective' | 'code' | 'screening';
    category: string[];
    difficulty: 1 | 2 | 3;
    createdAt: string | null;
    status: 'active' | 'inactive';
    libraryType: 'library' | 'custom';
    addedBy: string;
    addedByName: string;
    // Subjective
    answerSummary?: string;
    // MCQ
    options?: string[];
    correctAnswer?: string;
    // Screening
    acceptableAnswer?: string[];
    isStrict?: boolean;
    // Coding
    functionName?: string;
    boilerplate?: string;
    examples?: { input: string; output: string; explanation?: string }[];
    constraints?: string;
    testCases?: { input: string; output: string }[];
}

export interface PlanFeature {
    name: string;
    label: string;
    limit?: string;
}

export interface Price {
    currency: string;
    amount: number;
    cycle: 'monthly' | 'yearly';
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    type: 'company' | 'candidate' | 'company-enterprise';
    prices: Price[];
    features: PlanFeature[];
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'coupon' | 'offer';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  status: 'active' | 'inactive' | 'expired';
  validFrom: string | null;
  validUntil: string | null;
  applicablePlans: string[];
  createdAt: string;
}

export interface CompanySize {
    size: string;
    employees: string;
}

export interface Socials {
    linkedin?: string;
    twitter?: string;
    naukri?: string;
    glassdoor?: string;
}

export interface CompanyDetails {
    companyType?: string;
    foundedYear?: string;
    tags?: string[];
    benefits?: string[];
}

export interface Assessment {
    id: string;
    name: string;
    assessmentType: string;
    description?: string;
    questionIds: string[];
    createdBy: string;
    createdByName: string;
    createdAt: any;
}

export interface AiInterview {
    id: string;
    companyId: string;
    name: string;
    jobTitle: string;
    jobDescription: string;
    keySkills: string[];
    intro: string;
    outro: string;
    questions: {
        question: string;
        followUps: string[];
    }[];
    createdBy: string;
    createdByName: string;
    createdAt: any;
    duration: number;
    questionCount: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    tone: 'Formal' | 'Conversational' | 'Technical';
}

export interface Round {
    id: number;
    name: string;
    type: string;
    assessmentId?: string;
    assessmentName?: string;
    aiInterviewId?: string;
    aiInterviewName?: string;
    selectionCriteria?: number;
    questions?: Question[];
    questionIds?: string[];
    autoProceed?: boolean;
}
