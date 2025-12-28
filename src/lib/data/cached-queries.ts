import { unstable_cache } from 'next/cache';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Job, Company } from '@/lib/types';

// Cache tags for granular invalidation
export const CACHE_TAGS = {
  JOBS: 'jobs',
  COMPANIES: 'companies',
  CANDIDATES: 'candidates',
} as const;

// Cached function to get all jobs
export const getCachedJobs = unstable_cache(
  async () => {
    const jobsCollection = collection(db, 'jobs');
    const snapshot = await getDocs(jobsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
  },
  ['all-jobs'],
  { revalidate: 60, tags: [CACHE_TAGS.JOBS] }
);

// Cached function to get a single job by ID
export const getCachedJob = unstable_cache(
  async (id: string) => {
    const jobDoc = doc(db, 'jobs', id);
    const snapshot = await getDoc(jobDoc);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Job;
  },
  ['job-by-id'],
  { revalidate: 60, tags: [CACHE_TAGS.JOBS] }
);

// Cached function to get all companies
export const getCachedCompanies = unstable_cache(
  async () => {
    const usersCollection = collection(db, 'users');
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs
      .filter(doc => doc.data().role === 'company')
      .map(doc => ({ id: doc.id, ...doc.data() } as Company));
  },
  ['all-companies'],
  { revalidate: 3600, tags: [CACHE_TAGS.COMPANIES] }
);
