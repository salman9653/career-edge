import 'server-only';
import { adminDb } from '@/lib/firebase/admin';
import type { Job } from '@/lib/types';

export async function getJobsByCompanyArray(companyId: string): Promise<Job[]> {
  try {
    const jobsRef = adminDb.collection('jobs');
    const snapshot = await jobsRef.where('companyId', '==', companyId).get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
       createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
       updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt,
    } as Job));
  } catch (error) {
    console.error(`Error fetching jobs for company ${companyId}:`, error);
    throw new Error('Failed to fetch company jobs');
  }
}

export async function getJobs(): Promise<Job[]> {
    try {
        const jobsRef = adminDb.collection('jobs');
        const snapshot = await jobsRef.orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : doc.data().updatedAt,
        } as Job));
    } catch (error) {
        console.error("Error fetching all jobs:", error);
        return [];
    }
}
