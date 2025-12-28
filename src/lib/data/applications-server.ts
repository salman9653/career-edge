import 'server-only';
import { adminDb } from '@/lib/firebase/admin';
import type { ApplicationWithDetails, Job, Company, Applicant } from '@/lib/types';
import { getJobsByCompanyArray } from './jobs-server';

export async function getCandidateApplicationsServer(candidateId: string): Promise<ApplicationWithDetails[]> {
  try {
     const jobsRef = adminDb.collection('jobs');
     const jobsSnap = await jobsRef.get(); // Fetch ALL jobs (Expensive if many jobs)
     
     const applications: ApplicationWithDetails[] = [];
     
     // Process in chunks or parallel
     const promises = jobsSnap.docs.map(async (jobDoc) => {
         const applicantRef = jobDoc.ref.collection('applicants').doc(candidateId);
         const applicantSnap = await applicantRef.get();
         
         if (applicantSnap.exists) {
             const jobData = jobDoc.data() as Job;
             const companyId = jobData.companyId;
             let companyDetails: Company | null = null;
             
             if (companyId) {
                 const companyDoc = await adminDb.collection('companies').doc(companyId).get();
                 if (companyDoc.exists) {
                     companyDetails = { id: companyDoc.id, ...companyDoc.data() } as Company;
                 }
             }

             applications.push({
                 id: jobDoc.id,
                 ...jobData,
                 createdAt: jobData.createdAt?.toDate ? jobData.createdAt.toDate() : jobData.createdAt,
                 updatedAt: jobData.updatedAt?.toDate ? jobData.updatedAt.toDate() : jobData.updatedAt,
                 companyDetails,
                 applicantData: {
                     id: applicantSnap.id,
                     ...applicantSnap.data(),
                     appliedAt: applicantSnap.data()?.appliedAt?.toDate ? applicantSnap.data()?.appliedAt.toDate() : applicantSnap.data()?.appliedAt,
                 } as unknown as Applicant
             });
         }
     });
     
     await Promise.all(promises);
     
     return applications;

  } catch (error) {
    console.error(`Error fetching candidate applications:`, error);
    return [];
  }
}

export async function getSavedJobsServer(userId: string): Promise<ApplicationWithDetails[]> {
    try {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) return [];
        
        const userData = userDoc.data();
        const favouriteJobs = userData?.favourite_jobs || [];
        
        if (favouriteJobs.length === 0) return [];
        
        const jobs: ApplicationWithDetails[] = [];
        
        for (const jobId of favouriteJobs) {
            const jobDoc = await adminDb.collection('jobs').doc(jobId).get();
            if (jobDoc.exists) {
                const jobData = jobDoc.data() as Job;
                 const companyId = jobData.companyId;
                 let companyDetails: Company | null = null;
                 
                 if (companyId) {
                     const companyDoc = await adminDb.collection('companies').doc(companyId).get();
                     if (companyDoc.exists) {
                         companyDetails = { id: companyDoc.id, ...companyDoc.data() } as Company;
                     }
                 }
                 
                jobs.push({
                    id: jobDoc.id,
                    ...jobData,
                    createdAt: jobData.createdAt?.toDate ? jobData.createdAt.toDate() : jobData.createdAt,
                    updatedAt: jobData.updatedAt?.toDate ? jobData.updatedAt.toDate() : jobData.updatedAt,
                    companyDetails,
                    applicantData: null as unknown as Applicant // Saved jobs are not applications
                });
            }
        }
        return jobs;
    } catch (error) {
        console.error("Error fetching saved jobs:", error);
        return [];
    }
}
