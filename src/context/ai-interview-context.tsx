'use client';

import React, { createContext, useMemo, ReactNode } from 'react';
import { where, DocumentData } from 'firebase/firestore';
import type { AiInterview } from '@/lib/types';
import { useSession } from '@/hooks/use-session';
import { useFirestoreCollection, useFirestoreTransformer } from '@/hooks/use-firestore';

interface AiInterviewContextType {
    interviews: AiInterview[];
    loading: boolean;
    error: Error | null;
}

export const AiInterviewContext = createContext<AiInterviewContextType>({
    interviews: [],
    loading: true,
    error: null,
});

export const AiInterviewProvider = ({ children }: { children: ReactNode }) => {
    const { session } = useSession();

    const companyId = useMemo(() => {
        if (!session?.uid) return null;
        if (session.role === 'company') return session.uid;
        if (session.role === 'manager') return session.company_uid;
        return null;
    }, [session]);

    const transformer = useFirestoreTransformer((id: string, data: DocumentData) => {
        let createdAt = null;
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            createdAt = data.createdAt.toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
            createdAt = data.createdAt;
        } else if (data.createdAt && data.createdAt.seconds) {
            createdAt = new Date(data.createdAt.seconds * 1000).toISOString();
        }

        return {
            id: id,
            name: data.name,
            companyId: data.companyId,
            jobTitle: data.jobTitle,
            jobDescription: data.jobDescription,
            keySkills: data.keySkills,
            intro: data.intro,
            outro: data.outro,
            questions: data.questions,
            createdBy: data.createdBy,
            createdByName: data.createdByName,
            createdAt: createdAt,
            duration: data.duration,
            questionCount: data.questionCount,
            difficulty: data.difficulty,
            tone: data.tone,
        } as AiInterview;
    }, []);

    const constraints = useMemo(() => 
        companyId ? [where('companyId', '==', companyId)] : [], 
    [companyId]);

    const { data: interviews, loading, error } = useFirestoreCollection<AiInterview>({
        collectionPath: 'ai-interviews',
        constraints,
        transformer,
        disabled: !companyId,
    });

    return (
        <AiInterviewContext.Provider value={{ interviews, loading, error }}>
            {children}
        </AiInterviewContext.Provider>
    );
};
