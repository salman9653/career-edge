
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, onSnapshot, Unsubscribe, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { GeneratedResume } from '@/ai/flows/generate-ats-resume-flow-types';
import { useSession } from '@/hooks/use-session';

interface GeneratedResumeContextType {
    resumes: GeneratedResume[];
    loading: boolean;
    error: Error | null;
}

export const GeneratedResumeContext = createContext<GeneratedResumeContextType>({
    resumes: [],
    loading: true,
    error: null,
});

export const GeneratedResumeProvider = ({ children }: { children: ReactNode }) => {
    const { session } = useSession();
    const [resumes, setResumes] = useState<GeneratedResume[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let unsubscribe: Unsubscribe | undefined;

        if (session?.uid) {
            setLoading(true);
            const resumesColRef = collection(db, 'users', session.uid, 'generated-resumes');
            const q = query(resumesColRef, orderBy('createdAt', 'desc'));
            
            unsubscribe = onSnapshot(q, (snapshot) => {
                const resumeList = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        userId: data.userId,
                        name: data.name,
                        markdownContent: data.markdownContent,
                        jobDescription: data.jobDescription,
                        createdAt: data.createdAt,
                    } as GeneratedResume;
                });
                setResumes(resumeList);
                setLoading(false);
            }, (err) => {
                console.error("Error fetching generated resumes:", err);
                setError(err);
                setLoading(false);
            });
        } else if (!session) {
             setLoading(false);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [session]);

    return (
        <GeneratedResumeContext.Provider value={{ resumes, loading, error }}>
            {children}
        </GeneratedResumeContext.Provider>
    );
};
