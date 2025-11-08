

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
    functionName?: { [language: string]: string };
    boilerplate?: { [language: string]: string };
    examples?: { input: string; output: string; }[];
    constraints?: string[];
    testCases?: { input: string; output: string; sample: boolean }[];
    hints?: string[];
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
    github?: string;
    twitter?: string;
    linkedin?: string;
    naukri?: string;
    glassdoor?: string;
    indeed?: string;
}

export interface CompanyDetails {
    companyType?: string;
    foundedYear?: string;
    tags?: string[];
    benefits?: string[];
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

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  type: 'NEW_APPLICATION' | 'STATUS_UPDATE';
  message: string;
  link: string;
  isRead: boolean;
  createdAt: any;
  jobId?: string;
  jobTitle?: string;
  applicantCount?: number;
  newApplicantNames?: string[];
  originalIds?: string[];
}

export interface ResumeAnalysisResult {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  analyzedAt: any;
  overallScore: number;
  summary: string;
  ratings: {
    skills: number;
    experience: number;
    qualifications: number;
  };
  pros: string[];
  cons: string[];
  improvements: string[];
}

export interface GeneratedResume {
  id: string;
  userId: string;
  name: string;
  markdownContent: string;
  pdfDataUri?: string;
  jobDescription: string;
  createdAt: any;
  input: {
      jobDescription: string;
      userDetails: any;
      hasExistingResume: boolean;
  };
}

export interface Resume {
    name: string;
    size: number;
    type: string;
    updatedAt: any; // Firestore Timestamp
    data: string; // Base64 data URI
}

export interface Employment {
    id: string;
    designation: string;
    company: string;
    employmentType: string;
    isCurrent: boolean;
    startDate: string;
    endDate: string | null;
    jobProfile: string;
    ctc: {
        amount: number;
        currency: 'INR' | 'USD';
    };
    skillsUsed: string[];
}

export interface Education {
    id: string;
    level: 'Class 10th' | 'Class 12th' | 'Graduation/Diploma' | 'Masters/Post-Graduations' | 'Doctorate/PhD';
    isPrimary?: boolean;
    // For 10th/12th
    board?: string;
    school?: string;
    passingYear?: number;
    marks?: number; // as percentage
    // For higher education
    university?: string;
    course?: string;
    specialization?: string;
    courseType?: 'Full time' | 'Part time' | 'Correspondence/Distance learning';
    startYear?: number;
    endYear?: number;
    gradingSystem?: string;
}

export interface Project {
    id: string;
    projectTitle: string;
    projectUrl?: string;
    taggedWith?: string; // employment or education id
    clientName?: string;
    projectStatus: 'in progress' | 'finished';
    workedFrom: { month: number; year: number; };
    workedTill?: { month: number; year: number; };
    projectDetails: string;
    skillsUsed: string[];
}


export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    role: 'candidate' | 'company' | 'admin' | 'manager' | 'adminAccountManager';
    phone: string;
    displayImageUrl: string | null;
    emailVerified: boolean;
    applications?: number;
    createdAt?: string | null;
    status?: string;
    subscription?: string;
    favourite_jobs?: string[];
    // Company specific
    companySize?: CompanySize;
    website?: string;
    socials?: Socials;
    helplinePhone?: string;
    helplineEmail?: string;
    company_uid?: string;
    designation?: string;
    permissions_role?: string;
    aboutCompany?: string;
    companyType?: string;
    foundedYear?: string;
    tags?: string[];
    benefits?: string[];
    // Candidate specific
    jobTitle?: string;
    currentCompany?: string;
    address?: string;
    workStatus?: 'fresher' | 'experienced';
    experience?: string;
    noticePeriod?: string;
    currentSalary?: string;
    resume?: Resume | null;
    hasResume?: boolean;
    profileSummary?: string;
    keySkills?: string[];
    employment?: Employment[];
    education?: Education[];
    projects?: Project[];
    portfolio?: string;
    linkedin?: string; // DEPRECATED: use socials.linkedin instead
    naukri?: string; // DEPRECATED: use socials.naukri instead
    github?: string; // DEPRECATED: use socials.github instead
    gender?: string;
    maritalStatus?: string;
    dob?: string;
    permanentAddress?: {
      address: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
    };
    languages?: {
      language: string;
      proficiency: string;
      canRead: boolean;
      canWrite: boolean;
      canSpeak: boolean;
    }[];
}
