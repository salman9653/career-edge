'use client';

import React, { createContext, useMemo, ReactNode } from 'react';
import { orderBy } from 'firebase/firestore';
import type { GeneratedResume } from '@/ai/flows/generate-ats-resume-flow-types';
import { useSession } from '@/hooks/use-session';
import { useFirestoreCollection } from '@/hooks/use-firestore';

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

    const collectionPath = useMemo(() => 
        session?.uid ? `users/${session.uid}/generated-resumes` : '', 
    [session?.uid]);

    const constraints = useMemo(() => 
        collectionPath ? [orderBy('createdAt', 'desc')] : [], 
    [collectionPath]);

    const { data: resumes, loading, error } = useFirestoreCollection<GeneratedResume>({
        collectionPath,
        constraints,
        disabled: !collectionPath,
    });

    return (
        <GeneratedResumeContext.Provider value={{ resumes, loading, error }}>
            {children}
        </GeneratedResumeContext.Provider>
    );
};
