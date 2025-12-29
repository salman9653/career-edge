import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { unstable_cache } from "next/cache";
import type { Applicant, Job } from "@/lib/types";

export const getCandidateApplicationsServer = unstable_cache(
  async (candidateId: string) => {
    try {
      if (!candidateId) return [];

      // Use Collection Group Query to find all applicant documents for this candidate
      // This is much more efficient than iterating through all jobs
      const applicantsQuery = adminDb
        .collectionGroup("applicants")
        .where("candidateId", "==", candidateId);

      const applicantsSnap = await applicantsQuery.get();

      if (applicantsSnap.empty) {
        return [];
      }

      // Fetch corresponding job details in parallel
      const applicationsPromises = applicantsSnap.docs.map(async (docSnap) => {
        const applicationData = docSnap.data();
        // The parent of the applicant doc is the 'applicants' collection,
        // and its parent is the 'jobs' document.
        // jobRef path: jobs/{jobId}/applicants/{candidateId} -> parent.parent
        const jobRef = docSnap.ref.parent.parent;

        if (!jobRef) {
          console.error("Job ref not found for application", docSnap.ref.path);
          return null;
        }

        const jobSnap = await jobRef.get();
        if (!jobSnap.exists) {
          return null; // Job might be deleted
        }

        const jobData = jobSnap.data() as Job;

        // Transform Admin Type to Client Type (timestamps mainly)
        const application = {
          id: docSnap.id,
          ...applicationData,
          appliedAt: applicationData.appliedAt?.toDate
            ? applicationData.appliedAt.toDate().toISOString()
            : applicationData.appliedAt,
          // Handle other timestamps if necessary
        } as unknown as Applicant;

        return {
          jobId: jobSnap.id,
          jobData: {
            ...jobData,
            id: jobSnap.id,
            createdAt: jobData.createdAt?.toDate
              ? jobData.createdAt.toDate().toISOString()
              : jobData.createdAt,
          } as unknown as Job,
          application,
        };
      });

      const results = await Promise.all(applicationsPromises);
      return results.filter(
        (item): item is NonNullable<typeof item> => item !== null
      );
    } catch (error) {
      console.error("Error fetching candidate applications (server):", error);
      throw new Error("Failed to fetch candidate applications");
    }
  },
  ["candidate-applications-server"],
  { revalidate: 60, tags: ["applications"] }
);

export const getCompanyDashboardStatsServer = unstable_cache(
  async (companyId: string) => {
    try {
      if (!companyId)
        return { totalJobs: 0, activeJobs: 0, totalApplicants: 0 };

      const jobsQuery = adminDb
        .collection("jobs")
        .where("companyId", "==", companyId);
      const jobsSnap = await jobsQuery.get();

      const jobs = jobsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const activeJobs = jobs.filter(
        (j) => (j as any).status === "Live"
      ).length;

      // Fetch applicants count for each job
      // Using a batched approach or parallel queries
      const applicantCountsPromises = jobs.map(async (job) => {
        const applicantsSnap = await adminDb
          .collection(`jobs/${job.id}/applicants`)
          .count()
          .get();
        return applicantsSnap.data().count;
      });

      const counts = await Promise.all(applicantCountsPromises);
      const totalApplicants = counts.reduce((a, b) => a + b, 0);

      return {
        totalJobs: jobs.length,
        activeJobs,
        totalApplicants,
      };
    } catch (error) {
      console.error("Error fetching company stats (server):", error);
      return { totalJobs: 0, activeJobs: 0, totalApplicants: 0 };
    }
  },
  ["company-stats-server"],
  { revalidate: 60, tags: ["company_stats"] }
);

import { getJobsServer } from "./jobs";

export async function fetchCandidateDashboardDataServer(userId: string) {
  if (!userId) {
    return {
      applications: [],
      stats: {
        totalApplications: 0,
        activeJobs: 0,
        pendingSchedules: 0,
        attemptedAssessments: 0,
      },
    };
  }

  const [applications, allJobs] = await Promise.all([
    getCandidateApplicationsServer(userId),
    getJobsServer(),
  ]);

  const dashboardApps = applications.map((app) => {
    const applicant = app.application;
    const job = app.jobData; // app.jobData is already fetched for each app

    // Enrich schedules with round info
    const enrichedSchedules = (applicant.schedules || []).map((schedule) => {
      const round = job.rounds?.find((r) => r.id === schedule.roundId);
      return {
        ...schedule,
        roundName: round?.name || `Round ${schedule.roundId + 1}`,
        roundType: round?.type || "unknown",
      };
    });

    return {
      jobId: app.jobId,
      jobTitle: job.title,
      status: applicant.status,
      appliedAt: applicant.appliedAt,
      schedules: enrichedSchedules,
    };
  });

  let pendingSchedulesCount = 0;
  let attemptedAssessmentsCount = 0;

  dashboardApps.forEach((app) => {
    if (app.schedules) {
      app.schedules.forEach((sch: any) => {
        if (sch.status === "Pending") pendingSchedulesCount++;
        if (sch.status === "Attempted" || sch.status === "Completed")
          attemptedAssessmentsCount++;
      });
    }
  });

  return {
    applications: dashboardApps,
    stats: {
      totalApplications: applications.length,
      activeJobs: allJobs.length,
      pendingSchedules: pendingSchedulesCount,
      attemptedAssessments: attemptedAssessmentsCount,
    },
  };
}
