"use server";

export interface CompanyDashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplicants: number;
}

import { getCompanyDashboardStatsServer } from "@/lib/data/server/applications";

export async function fetchCompanyDashboardStats(
  companyId: string
): Promise<CompanyDashboardStats> {
  try {
    if (!companyId) {
      return {
        totalJobs: 0,
        activeJobs: 0,
        totalApplicants: 0,
      };
    }

    return await getCompanyDashboardStatsServer(companyId);
  } catch (error) {
    console.error("Error fetching company dashboard stats:", error);
    throw new Error("Failed to fetch dashboard stats");
  }
}
