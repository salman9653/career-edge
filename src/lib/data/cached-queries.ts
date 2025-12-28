import { unstable_cache } from 'next/cache';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Job, Company } from '@/lib/types';

// Cache revalidation tags
export const CACHE_TAGS = {
  JOBS: 'jobs',
  COMPANIES: 'companies',
  CANDIDATES: 'candidates',
};

export const getCachedJobs = unstable_cache(
  async () => {
    const snapshot = await getDocs(collection(db, 'jobs'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
  },
  ['jobs-list'],
  { 
    revalidate: 60, // Cache for 60 seconds
    tags: [CACHE_TAGS.JOBS] 
  }
);

export const getCachedJob = unstable_cache(
  async (id: string) => {
    const docRef = doc(db, 'jobs', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Job;
  },
  ['job-detail'],
  { 
    revalidate: 60,
    tags: [CACHE_TAGS.JOBS] 
  }
);

export const getCachedCompanies = unstable_cache(
  async () => {
    // Queries users collection where role is 'company'
    const q = query(collection(db, 'users'), where('role', '==', 'company'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
  },
  ['companies-list'],
  {
    revalidate: 3600, // Companies don't change often
    tags: [CACHE_TAGS.COMPANIES]
  }
);
