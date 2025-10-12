import type { Job, Applicant, Round } from './types';

// Let's define some standard rounds to reuse
const defaultRounds: Round[] = [
    { id: 1, name: 'New Applicant', type: 'application' },
    { id: 2, name: 'Screening', type: 'screening' },
    { id: 3, name: 'Technical Assessment', type: 'assessment' },
    { id: 4, name: 'Manager Interview', type: 'live interview' },
    { id: 5, name: 'Offer', type: 'offer' },
];

// Helper to generate applicants
const generateApplicants = (count: number, jobId: string): any[] => {
    const applicants = [];
    for (let i = 1; i <= count; i++) {
        const applicantId = `appl_${jobId}_${i}`;
        const stageId = (i % 5) + 1; // Distribute applicants across 5 stages
        applicants.push({
            id: applicantId,
            candidateName: `Applicant ${jobId.slice(-1)}-${i}`,
            candidateEmail: `applicant${jobId.slice(-1)}${i}@example.com`,
            appliedAt: new Date(2024, 5, Math.floor(Math.random() * 20) + 1).toISOString(),
            status: 'In-progress',
            currentStageId: stageId,
        });
    }
    return applicants;
};

export const mockAtsJobs: Job[] = [
    {
        id: 'job1',
        title: 'Senior Frontend Developer',
        companyId: 'comp1',
        status: 'Live',
        rounds: defaultRounds,
        applicants: generateApplicants(25, 'job1'),
        createdBy: 'user1',
        createdByName: 'Admin User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Job description for Senior Frontend Developer.',
        location: 'Remote',
        type: 'Full-time',
        preference: 'Remote',
        recruiter: { id: 'recruiter1', name: 'John Doe' },
        workExperience: '5-7 years',
        salary: { min: 20, max: 30 },
        positions: 2,
        datePosted: new Date().toISOString(),
    },
    {
        id: 'job2',
        title: 'Data Scientist',
        companyId: 'comp1',
        status: 'Live',
        rounds: [
            { id: 1, name: 'Application', type: 'application' },
            { id: 2, name: 'Initial Screening', type: 'screening' },
            { id: 3, name: 'Data Challenge', type: 'coding assessment' },
            { id: 4, name: 'Final Interview', type: 'live interview' },
            { id: 5, name: 'Offer Stage', type: 'offer' },
        ],
        applicants: generateApplicants(15, 'job2'),
        createdBy: 'user1',
        createdByName: 'Admin User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Job description for Data Scientist.',
        location: 'New York, NY',
        type: 'Full-time',
        preference: 'Hybrid',
        recruiter: { id: 'recruiter2', name: 'Jane Smith' },
        workExperience: '3-5 years',
        salary: { min: 25, max: 35 },
        positions: 1,
        datePosted: new Date().toISOString(),
    },
    {
        id: 'job3',
        title: 'Cloud Solutions Architect',
        companyId: 'comp1',
        status: 'On-hold',
        rounds: defaultRounds,
        applicants: generateApplicants(12, 'job3'),
        createdBy: 'user1',
        createdByName: 'Admin User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Job description for Cloud Solutions Architect.',
        location: 'San Francisco, CA',
        type: 'Contract',
        preference: 'On-site',
        recruiter: { id: 'recruiter1', name: 'John Doe' },
        workExperience: '7+ years',
        salary: { min: 30, max: 45 },
        positions: 1,
        datePosted: new Date().toISOString(),
    },
];

// Augment applicant data to be more realistic for deep dive
export const getApplicantDetails = (applicantId: string) => {
    const jobId = applicantId.split('_')[1];
    const applicantIndex = parseInt(applicantId.split('_')[2]);
    const job = mockAtsJobs.find(j => j.id === jobId);
    const applicant = job?.applicants?.find(a => a.id === applicantId);

    if (!job || !applicant) return null;

    return {
        ...applicant,
        jobTitle: job.title,
        resumeUrl: '/path/to/dummy-resume.pdf',
        roundHistory: job.rounds.filter(r => r.id < applicant.currentStageId).map(r => ({
            roundName: r.name,
            status: 'Passed',
            completedOn: new Date(2024, 5, 20 + applicantIndex - r.id).toISOString(),
            score: r.type === 'assessment' ? 70 + Math.floor(Math.random() * 25) : undefined,
        })),
        notes: [
            { author: 'Jane Smith', text: 'Strong resume, good experience with React.', date: new Date(2024, 5, 20).toISOString() },
            { author: 'John Doe', text: 'Screening call went well, good communication skills.', date: new Date(2024, 5, 22).toISOString() },
        ]
    }
}
