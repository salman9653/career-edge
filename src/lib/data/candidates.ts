import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { UserProfile } from '@/lib/types';

/**
 * Server-safe function to get all candidates
 */
export async function getCandidates(): Promise<UserProfile[]> {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'candidate')
    );
    
    const snapshot = await getDocs(usersQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as unknown as UserProfile));
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw new Error('Failed to fetch candidates');
  }
}

/**
 * Server-safe function to get a single candidate by ID
 */
export async function getCandidate(id: string): Promise<UserProfile | null> {
  try {
    const userDoc = doc(db, 'users', id);
    const snapshot = await getDoc(userDoc);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    if (data.role !== 'candidate') {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...data
    } as unknown as UserProfile;
  } catch (error) {
    console.error(`Error fetching candidate ${id}:`, error);
    throw new Error('Failed to fetch candidate');
  }
}

/**
 * Get candidate profile with additional data
 */
export async function getCandidateProfile(id: string) {
  try {
    const candidate = await getCandidate(id);
    
    if (!candidate) {
      return null;
    }
    
    // TODO: Fetch additional data like resumes, applications, etc.
    // This can be extended as needed
    
    return {
      ...candidate,
      // Additional data can be added here
    };
  } catch (error) {
    console.error(`Error fetching candidate profile ${id}:`, error);
    throw new Error('Failed to fetch candidate profile');
  }
}
