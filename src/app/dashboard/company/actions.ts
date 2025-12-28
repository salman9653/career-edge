'use server';

import { getJobsByCompany } from '@/lib/data/jobs';
import { getJobApplicants } from '@/lib/data/applications';

export interface CompanyDashboardStats {
    totalJobs: number;
    activeJobs: number;
    totalApplicants: number;
}

export async function fetchCompanyDashboardStats(companyId: string): Promise<CompanyDashboardStats> {
    try {
        if (!companyId) {
            return {
                totalJobs: 0,
                activeJobs: 0,
                totalApplicants: 0
            };
        }

        const jobs = await getJobsByCompany(companyId);
        
        // Fetch applicants for each job in parallel
        const applicantPromises = jobs.map(async (job) => {
            const applicants = await getJobApplicants(job.id);
            return applicants.length;
        });

        const applicantsCounts = await Promise.all(applicantPromises);
        const totalApplicants = applicantsCounts.reduce((acc, count) => acc + count, 0);

        return {
            totalJobs: jobs.length,
            activeJobs: jobs.filter(j => j.status === 'Live').length,
            totalApplicants
        };

    } catch (error) {
        console.error("Error fetching company dashboard stats:", error);
        throw new Error("Failed to fetch dashboard stats");
    }
}
