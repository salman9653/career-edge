import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { UserProfile } from '@/lib/types';

/**
 * Server-safe function to get all companies
 */
export async function getCompanies(): Promise<UserProfile[]> {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'company')
    );
    
    const snapshot = await getDocs(usersQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as unknown as UserProfile));
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw new Error('Failed to fetch companies');
  }
}

/**
 * Server-safe function to get a single company by ID
 */
export async function getCompany(id: string): Promise<UserProfile | null> {
  try {
    const userDoc = doc(db, 'users', id);
    const snapshot = await getDoc(userDoc);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    if (data.role !== 'company') {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...data
    } as unknown as UserProfile;
  } catch (error) {
    console.error(`Error fetching company ${id}:`, error);
    throw new Error('Failed to fetch company');
  }
}

/**
 * Get company with their active jobs
 */
export async function getCompanyWithJobs(id: string) {
  try {
    const company = await getCompany(id);
    
    if (!company) {
      return null;
    }
    
    // Fetch company's jobs
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('companyId', '==', id)
    );
    
    const jobsSnapshot = await getDocs(jobsQuery);
    const jobs = jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      ...company,
      jobs
    };
  } catch (error) {
    console.error(`Error fetching company with jobs ${id}:`, error);
    throw new Error('Failed to fetch company with jobs');
  }
}
