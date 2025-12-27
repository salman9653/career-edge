
import type { Job, Company, Applicant, Question, AiInterview } from './types';

export interface CrmCandidate {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    avatarUrl: string;
    tags: string[];
    lastContact: string;
    source: string;
}

export const mockCompanies: Company[] = [
  { id: 'comp1', name: 'Innovate Inc.', logoUrl: 'https://picsum.photos/seed/10/100/100', dataAiHint: 'company logo' },
  { id: 'comp2', name: 'DataDriven Co.', logoUrl: 'https://picsum.photos/seed/11/100/100', dataAiHint: 'company logo' },
  { id: 'comp3', name: 'CloudWorks', logoUrl: 'https://picsum.photos/seed/12/100/100', dataAiHint: 'company logo' },
];

export const mockApplicants: Applicant[] = [
  {
    id: 'appl1',
    candidateId: 'user_alice',
    candidateName: 'Alice Johnson',
    avatarUrl: 'https://picsum.photos/seed/20/100/100',
    candidateEmail: 'alice.j@example.com',
    resumeUrl: '/path/to/resume1.pdf',
    appliedAt: '2024-05-20T10:00:00Z',
    activeRoundIndex: 0,
    status: 'In Progress',
    roundResults: []
  },
  {
    id: 'appl2',
    candidateId: 'user_bob',
    candidateName: 'Bob Williams',
    avatarUrl: 'https://picsum.photos/seed/21/100/100',
    candidateEmail: 'bob.w@example.com',
    resumeUrl: '/path/to/resume2.pdf',
    appliedAt: '2024-05-19T14:30:00Z',
    activeRoundIndex: 0,
    status: 'In Progress',
    roundResults: []
  },
  {
    id: 'appl3',
    candidateId: 'user_charlie',
    candidateName: 'Charlie Brown',
    avatarUrl: 'https://picsum.photos/seed/22/100/100',
    candidateEmail: 'charlie.b@example.com',
    resumeUrl: '/path/to/resume3.pdf',
    appliedAt: '2024-05-21T09:00:00Z',
    activeRoundIndex: 0,
    status: 'In Progress',
    roundResults: []
  },
];

export const mockJobs: Job[] = [
  {
    id: 'job1',
    title: 'Senior Frontend Developer',
    companyId: 'comp1',
    location: 'Remote',
    type: 'Full-time',
    description: 'We are looking for an experienced Frontend Developer to join our team. You will be responsible for building the client-side of our web applications.',
    applicants: [
        {
            id: 'appl1',
            candidateId: 'user_alice',
            candidateName: 'Alice Johnson',
            avatarUrl: 'https://picsum.photos/seed/20/100/100',
            candidateEmail: 'alice.j@example.com',
            resumeUrl: '/path/to/resume1.pdf',
            appliedAt: '2024-05-20T10:00:00Z',
            activeRoundIndex: 0,
            status: 'In Progress',
            roundResults: []
        },
        {
            id: 'appl3',
            candidateId: 'user_charlie',
            candidateName: 'Charlie Brown',
            avatarUrl: 'https://picsum.photos/seed/22/100/100',
            candidateEmail: 'charlie.b@example.com',
            resumeUrl: '/path/to/resume3.pdf',
            appliedAt: '2024-05-21T09:00:00Z',
            activeRoundIndex: 0,
            status: 'In Progress',
            roundResults: []
        }
    ],
    datePosted: '2024-05-15T09:00:00Z',
    status: 'Live',
    rounds: [],
    createdBy: 'user1',
    createdByName: 'Admin User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preference: 'Remote',
    recruiter: { id: 'recruiter1', name: 'John Doe' },
    workExperience: '5-7 years',
    salary: { min: 20, max: 30 },
    positions: 2,
  },
  {
    id: 'job2',
    title: 'Data Scientist',
    companyId: 'comp2',
    location: 'New York, NY',
    type: 'Full-time',
    description: 'Join our data science team to work on challenging problems in machine learning and predictive modeling. Experience with Python and SQL is a must.',
    applicants: [
        {
            id: 'appl2',
            candidateId: 'user_bob',
            candidateName: 'Bob Williams',
            avatarUrl: 'https://picsum.photos/seed/21/100/100',
            candidateEmail: 'bob.w@example.com',
            resumeUrl: '/path/to/resume2.pdf',
            appliedAt: '2024-05-19T14:30:00Z',
            activeRoundIndex: 0,
            status: 'In Progress',
            roundResults: []
        }
    ],
    datePosted: '2024-05-18T11:00:00Z',
    status: 'Live',
    rounds: [],
    createdBy: 'user1',
    createdByName: 'Admin User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preference: 'Hybrid',
    recruiter: { id: 'recruiter2', name: 'Jane Smith' },
    workExperience: '3-5 years',
    salary: { min: 25, max: 35 },
    positions: 1,

  },
  {
    id: 'job3',
    title: 'Cloud Solutions Architect',
    companyId: 'comp3',
    location: 'San Francisco, CA',
    type: 'Contract',
    description: 'Design and implement cloud-based solutions for our enterprise customers. AWS or Azure certification is highly desirable.',
    applicants: [],
    datePosted: '2024-05-12T16:00:00Z',
    status: 'On-hold',
    rounds: [],
    createdBy: 'user1',
    createdByName: 'Admin User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preference: 'On-site',
    recruiter: { id: 'recruiter1', name: 'John Doe' },
    workExperience: '7+ years',
    salary: { min: 30, max: 45 },
    positions: 1,
  },
  {
    id: 'job4',
    title: 'UX/UI Designer',
    companyId: 'comp1',
    location: 'Remote',
    type: 'Part-time',
    description: 'Create amazing user experiences. The ideal candidate should have an eye for clean and artful design, possess superior UI skills and be able to translate high-level requirements into interaction flows and artifacts.',
    applicants: [
        {
            id: 'appl1',
            candidateId: 'user_alice',
            candidateName: 'Alice Johnson',
            avatarUrl: 'https://picsum.photos/seed/20/100/100',
            candidateEmail: 'alice.j@example.com',
            resumeUrl: '/path/to/resume1.pdf',
            appliedAt: '2024-05-20T10:00:00Z',
            activeRoundIndex: 0,
            status: 'In Progress',
            roundResults: []
        },
        {
            id: 'appl2',
            candidateId: 'user_bob',
            candidateName: 'Bob Williams',
            avatarUrl: 'https://picsum.photos/seed/21/100/100',
            candidateEmail: 'bob.w@example.com',
            resumeUrl: '/path/to/resume2.pdf',
            appliedAt: '2024-05-19T14:30:00Z',
            activeRoundIndex: 0,
            status: 'In Progress',
            roundResults: []
        },
        {
            id: 'appl3',
            candidateId: 'user_charlie',
            candidateName: 'Charlie Brown',
            avatarUrl: 'https://picsum.photos/seed/22/100/100',
            candidateEmail: 'charlie.b@example.com',
            resumeUrl: '/path/to/resume3.pdf',
            appliedAt: '2024-05-21T09:00:00Z',
            activeRoundIndex: 0,
            status: 'In Progress',
            roundResults: []
        }
    ],
    datePosted: '2024-05-20T08:00:00Z',
    status: 'Live',
    rounds: [],
    createdBy: 'user1',
    createdByName: 'Admin User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preference: 'Remote',
    recruiter: { id: 'recruiter3', name: 'Emily White' },
    workExperience: '3-5 years',
    salary: { min: 15, max: 25 },
    positions: 1,
  },
];

export const mockQuestions: Question[] = [
    { id: 'q1', question: 'What is your greatest strength?', type: 'subjective', category: ['Behavioral'], difficulty: 1, createdAt: '2024-05-01T10:00:00Z', status: 'active', libraryType: 'library', addedBy: 'admin', addedByName: 'Admin' },
    { id: 'q2', question: 'Explain promises in JavaScript.', type: 'subjective', category: ['Technical', 'JavaScript'], difficulty: 2, createdAt: '2024-05-02T11:30:00Z', status: 'active', libraryType: 'library', addedBy: 'admin', addedByName: 'Admin' },
    { id: 'q3', question: 'Describe a challenging project you worked on.', type: 'subjective', category: ['Experience', 'Behavioral'], difficulty: 2, createdAt: '2024-05-03T14:00:00Z', status: 'inactive', libraryType: 'library', addedBy: 'admin', addedByName: 'Admin' },
    { id: 'q4', question: 'What is the difference between SQL and NoSQL databases?', type: 'subjective', category: ['Technical', 'Databases'], difficulty: 3, createdAt: '2024-05-04T09:00:00Z', status: 'active', libraryType: 'library', addedBy: 'admin', addedByName: 'Admin' },
    { id: 'q5', question: 'Solve the "Two Sum" problem.', type: 'code', category: ['Algorithms', 'Coding'], difficulty: 1, createdAt: '2024-05-05T16:20:00Z', status: 'active', libraryType: 'library', addedBy: 'admin', addedByName: 'Admin' },
    { id: 'q6', question: 'Which of these is a JavaScript framework?', type: 'mcq', options: ['React', 'Laravel', 'Django'], correctAnswer: 'React', category: ['Technical', 'JavaScript'], difficulty: 1, createdAt: '2024-05-06T13:00:00Z', status: 'inactive', libraryType: 'library', addedBy: 'admin', addedByName: 'Admin' },
    { id: 'q7', question: 'Design a system for a URL shortener.', type: 'subjective', category: ['System Design'], difficulty: 3, createdAt: '2024-05-07T10:45:00Z', status: 'active', libraryType: 'library', addedBy: 'admin', addedByName: 'Admin' },
];

export const mockAiInterviews: AiInterview[] = [
    {
        id: 'ai_int_1',
        companyId: 'comp1',
        name: 'Frontend Developer - Initial Screening',
        jobTitle: 'Frontend Developer',
        jobDescription: 'Description here',
        keySkills: ['React', 'TypeScript'],
        intro: 'Hello',
        outro: 'Thanks',
        questions: [],
        createdBy: 'user1',
        createdByName: 'John Doe',
        createdAt: '2024-05-10T10:00:00Z',
        duration: 15,
        questionCount: 5,
        difficulty: 'Medium',
        tone: 'Conversational',
    },
    {
        id: 'ai_int_2',
        companyId: 'comp2',
        name: 'Data Scientist - Behavioral',
        jobTitle: 'Data Scientist',
        jobDescription: 'Description here',
        keySkills: ['Python', 'SQL'],
        intro: 'Hello',
        outro: 'Thanks',
        questions: [],
        createdBy: 'user2',
        createdByName: 'Jane Smith',
        createdAt: '2024-05-12T11:30:00Z',
        duration: 20,
        questionCount: 7,
        difficulty: 'Medium',
        tone: 'Formal',
    },
    {
        id: 'ai_int_3',
        companyId: 'comp1',
        name: 'Senior Backend Engineer - Technical',
        jobTitle: 'Backend Engineer',
        jobDescription: 'Description here',
        keySkills: ['Node.js', 'AWS'],
        intro: 'Hello',
        outro: 'Thanks',
        questions: [],
        createdBy: 'user1',
        createdByName: 'John Doe',
        createdAt: '2024-05-15T09:00:00Z',
        duration: 30,
        questionCount: 8,
        difficulty: 'Hard',
        tone: 'Technical',
    },
];

const firstNames = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Michael', 'Sarah', 'David', 'Laura'];
const lastNames = ['Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez'];
const locations = ['New York, NY', 'San Francisco, CA', 'Austin, TX', 'Chicago, IL', 'Remote', 'London, UK', 'Berlin, Germany'];
const allTags = ['Top Talent', 'Relocation', 'Senior', 'Junior', 'React', 'Node.js', 'Python', 'Java', 'Cloud', 'DevOps', 'Product Manager'];

export const mockCrmCandidates: CrmCandidate[] = Array.from({ length: 100 }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const tags = Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => allTags[Math.floor(Math.random() * allTags.length)]);
    
    return {
        id: `crm_${i + 1}`,
        name: name,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        avatarUrl: `https://picsum.photos/seed/${30 + i}/100/100`,
        tags: [...new Set(tags)], // Ensure unique tags
        lastContact: new Date(2024, Math.floor(Math.random() * 5), Math.floor(Math.random() * 28) + 1).toISOString(),
        source: ['LinkedIn', 'Referral', 'Past Applicant', 'Sourced'][Math.floor(Math.random() * 4)],
    };
});
