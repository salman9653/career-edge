import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Applicant } from '@/lib/types';

/**
 * Get all applicants for a specific job
 */
export async function getJobApplicants(jobId: string): Promise<Applicant[]> {
  try {
    const applicantsCollection = collection(db, 'jobs', jobId, 'applicants');
    const snapshot = await getDocs(applicantsCollection);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Applicant));
  } catch (error) {
    console.error(`Error fetching applicants for job ${jobId}:`, error);
    throw new Error('Failed to fetch job applicants');
  }
}

/**
 * Get a specific applicant for a job
 */
export async function getJobApplicant(jobId: string, applicantId: string): Promise<Applicant | null> {
  try {
    const applicantDoc = doc(db, 'jobs', jobId, 'applicants', applicantId);
    const snapshot = await getDoc(applicantDoc);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as Applicant;
  } catch (error) {
    console.error(`Error fetching applicant ${applicantId} for job ${jobId}:`, error);
    throw new Error('Failed to fetch applicant');
  }
}

/**
 * Get all applications for a specific candidate
 */
export async function getCandidateApplications(candidateId: string) {
  try {
    // Get all jobs
    const jobsSnapshot = await getDocs(collection(db, 'jobs'));
    
    const applications = [];
    
    // Check each job for the candidate's application
    for (const jobDoc of jobsSnapshot.docs) {
      const applicantDoc = doc(db, 'jobs', jobDoc.id, 'applicants', candidateId);
      const applicantSnapshot = await getDoc(applicantDoc);
      
      if (applicantSnapshot.exists()) {
        applications.push({
          jobId: jobDoc.id,
          jobData: jobDoc.data(),
          application: {
            id: applicantSnapshot.id,
            ...applicantSnapshot.data()
          }
        });
      }
    }
    
    return applications;
  } catch (error) {
    console.error(`Error fetching applications for candidate ${candidateId}:`, error);
    throw new Error('Failed to fetch candidate applications');
  }
}

/**
 * Get applicants filtered by status
 */
export async function getApplicantsByStatus(jobId: string, status: string): Promise<Applicant[]> {
  try {
    const applicants = await getJobApplicants(jobId);
    return applicants.filter(applicant => applicant.status === status);
  } catch (error) {
    console.error(`Error fetching applicants by status for job ${jobId}:`, error);
    throw new Error('Failed to fetch applicants by status');
  }
}
