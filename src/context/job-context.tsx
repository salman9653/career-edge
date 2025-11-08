
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, onSnapshot, Unsubscribe, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Job, Applicant } from '@/lib/types';
import { useSession } from '@/hooks/use-session';

interface JobContextType {
    jobs: Job[];
    loading: boolean;
    error: Error | null;
}

export const JobContext = createContext<JobContextType>({
    jobs: [],
    loading: true,
    error: null,
});

export const JobProvider = ({ children }: { children: ReactNode }) => {
    const { session } = useSession();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let unsubscribe: Unsubscribe = () => {};

        if (session?.uid) {
            let q;
            const jobsCol = collection(db, 'jobs');

            if(session.role === 'company' || session.role === 'manager') {
                const companyId = session.role === 'company' ? session.uid : session.company_uid;
                 if (!companyId) {
                    setLoading(false);
                    return;
                }
                q = query(jobsCol, where('companyId', '==', companyId));
            } else if (session.role === 'candidate') {
                 q = query(jobsCol, where('status', '==', 'Live'));
            } else if (session.role === 'admin' || session.role === 'adminAccountManager') {
                q = query(jobsCol);
            }
             else {
                 setLoading(false);
                 return;
            }
            
            unsubscribe = onSnapshot(q, async (snapshot) => {
                const jobListPromises = snapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    let applicants: Applicant[] = [];

                    // Fetch applicants only if user is a company/manager or admin
                    if(session.role === 'company' || session.role === 'manager' || session.role === 'admin' || session.role === 'adminAccountManager') {
                         const applicantsColRef = collection(db, 'jobs', doc.id, 'applicants');
                         const applicantsSnapshot = await getDocs(applicantsColRef);
                         applicants = applicantsSnapshot.docs.map(applicantDoc => ({
                             id: applicantDoc.id,
                             ...applicantDoc.data()
                         } as Applicant));
                    }

                    return {
                        id: doc.id,
                        ...data,
                        applicants,
                    } as Job;
                });

                const jobList = await Promise.all(jobListPromises);

                setJobs(jobList);
                setLoading(false);
            }, (err) => {
                console.error("Error fetching jobs:", err);
                setError(err);
                setLoading(false);
            });
        } else {
             setLoading(false);
        }

        return () => unsubscribe();
    }, [session]);

    return (
        <JobContext.Provider value={{ jobs, loading, error }}>
            {children}
        </JobContext.Provider>
    );
};
