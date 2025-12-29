'use client';

import React, { createContext, useMemo, ReactNode } from 'react';
import { collection, where, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Job, Applicant } from '@/lib/types';
import { useSession } from '@/hooks/use-session';
import { useFirestoreCollection, useFirestoreTransformer } from '@/hooks/use-firestore';

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
    const { session, loading: sessionLoading } = useSession();

    const isAdmin = useMemo(() => 
        session?.role === 'admin' || session?.role === 'adminAccountManager', 
    [session?.role]);

    const isCompanyOrManager = useMemo(() => 
        session?.role === 'company' || session?.role === 'manager', 
    [session?.role]);

    const transformer = useFirestoreTransformer(async (id: string, data: DocumentData): Promise<Job> => {
        let applicants: Applicant[] = [];

        // Fetch applicants only if user is a company/manager or admin
        if (isCompanyOrManager || isAdmin) {
            try {
                const applicantsColRef = collection(db, 'jobs', id, 'applicants');
                const applicantsSnapshot = await getDocs(applicantsColRef);
                applicants = applicantsSnapshot.docs.map(applicantDoc => ({
                    id: applicantDoc.id,
                    ...applicantDoc.data()
                } as Applicant));
            } catch (err) {
                console.warn(`Failed to fetch applicants for job ${id}`, err);
            }
        }

        return {
            id: id,
            ...data,
            applicants,
        } as Job;
    }, [isAdmin, isCompanyOrManager]);

    const constraints = useMemo(() => {
        if (!session?.uid) return [];
        
        if (isCompanyOrManager) {
            const companyId = session.role === 'company' ? session.uid : session.company_uid;
            if (!companyId) return [];
            return [where('companyId', '==', companyId)];
        } else if (session.role === 'candidate') {
            return [where('status', '==', 'Live')];
        }
        return [];
    }, [session, isCompanyOrManager]);

    const isDisabled = useMemo(() => {
        if (sessionLoading) return true;
        if (!session?.uid) return true;
        if (isCompanyOrManager) {
            return !(session.role === 'company' ? session.uid : session.company_uid);
        }
        return false;
    }, [session, sessionLoading, isCompanyOrManager]);

    const { data: jobs, loading, error } = useFirestoreCollection<Job>({
        collectionPath: 'jobs',
        constraints,
        transformer,
        disabled: isDisabled,
    });

    return (
        <JobContext.Provider value={{ jobs, loading, error }}>
            {children}
        </JobContext.Provider>
    );
};
