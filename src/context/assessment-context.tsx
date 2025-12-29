'use client';

import React, { createContext, ReactNode, useMemo } from 'react';
import { where, DocumentData } from 'firebase/firestore';
import type { Assessment } from '@/lib/types';
import { useSession } from '@/hooks/use-session';
import { useFirestoreCollection, useFirestoreTransformer } from '@/hooks/use-firestore';

interface AssessmentContextType {
    assessments: Assessment[];
    loading: boolean;
    error: Error | null;
}

export const AssessmentContext = createContext<AssessmentContextType>({
    assessments: [],
    loading: true,
    error: null,
});

export const AssessmentProvider = ({ children }: { children: ReactNode }) => {
    const { session } = useSession();

    const createdById = useMemo(() => {
        if (!session?.uid) return null;
        if (session.role === 'company') return session.uid;
        if (session.role === 'manager') return session.company_uid;
        return null;
    }, [session]);

    const transformer = useFirestoreTransformer((id: string, data: DocumentData) => ({
        id: id,
        name: data.name,
        assessmentType: data.assessmentType,
        description: data.description,
        questionIds: data.questionIds || [],
        createdBy: data.createdBy,
        createdByName: data.createdByName || '',
        createdAt: data.createdAt,
    } as Assessment), []);

    const constraints = useMemo(() => 
        createdById ? [where('createdBy', '==', createdById)] : [], 
    [createdById]);

    const { data: assessments, loading, error } = useFirestoreCollection<Assessment>({
        collectionPath: 'assessments',
        constraints,
        transformer,
        disabled: !createdById,
    });

    return (
        <AssessmentContext.Provider value={{ assessments, loading, error }}>
            {children}
        </AssessmentContext.Provider>
    );
};
