import { collection, getDocs, doc, getDoc, query, where, orderBy, limit, Query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Job } from '@/lib/types';

/**
 * Server-safe function to get all jobs
 */
export async function getJobs(): Promise<Job[]> {
  try {
    const jobsCollection = collection(db, 'jobs');
    const snapshot = await getDocs(jobsCollection);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Job));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw new Error('Failed to fetch jobs');
  }
}

/**
 * Server-safe function to get a single job by ID
 */
export async function getJob(id: string): Promise<Job | null> {
  try {
    const jobDoc = doc(db, 'jobs', id);
    const snapshot = await getDoc(jobDoc);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as Job;
  } catch (error) {
    console.error(`Error fetching job ${id}:`, error);
    throw new Error('Failed to fetch job');
  }
}

/**
 * Get jobs by company ID
 */
export async function getJobsByCompany(companyId: string): Promise<Job[]> {
  try {
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('companyId', '==', companyId)
    );
    
    const snapshot = await getDocs(jobsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Job));
  } catch (error) {
    console.error(`Error fetching jobs for company ${companyId}:`, error);
    throw new Error('Failed to fetch company jobs');
  }
}

/**
 * Get live/active jobs
 */
export async function getLiveJobs(): Promise<Job[]> {
  try {
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('status', '==', 'Live')
    );
    
    const snapshot = await getDocs(jobsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Job));
  } catch (error) {
    console.error('Error fetching live jobs:', error);
    throw new Error('Failed to fetch live jobs');
  }
}

/**
 * Get recent jobs (last N jobs)
 */
export async function getRecentJobs(limitCount: number = 10): Promise<Job[]> {
  try {
    const jobsQuery = query(
      collection(db, 'jobs'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(jobsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Job));
  } catch (error) {
    console.error('Error fetching recent jobs:', error);
    throw new Error('Failed to fetch recent jobs');
  }
}
