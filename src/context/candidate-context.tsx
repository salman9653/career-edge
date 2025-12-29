'use client';

import React, { createContext, ReactNode } from 'react';
import { where, doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useFirestoreCollection, useFirestoreTransformer } from '@/hooks/use-firestore';

export interface CandidateData {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status: string;
    subscription: string;
    applications: number;
    createdAt: string | null;
}

interface CandidateContextType {
    candidates: CandidateData[];
    loading: boolean;
    error: Error | null;
}

export const CandidateContext = createContext<CandidateContextType>({
    candidates: [],
    loading: true,
    error: null,
});

export const CandidateProvider = ({ children }: { children: ReactNode }) => {
    const transformer = useFirestoreTransformer(async (id: string, data: DocumentData): Promise<CandidateData> => {
        let avatarUrl = data.avatarUrl;
        if (data.hasDisplayImage) {
            const imageDocSnap = await getDoc(doc(db, `users/${id}/uploads/displayImage`));
            if (imageDocSnap.exists()) {
                avatarUrl = imageDocSnap.data().data;
            }
        }

        return {
            id: id,
            name: data.name || 'N/A',
            email: data.email || 'N/A',
            status: data.status || 'Active',
            subscription: data.subscription || 'Free',
            applications: data.applications || 0,
            avatar: avatarUrl,
            createdAt: data.createdAt?.toDate()?.toISOString() || null
        };
    }, []);

    const { data: candidates, loading, error } = useFirestoreCollection<CandidateData>({
        collectionPath: 'users',
        constraints: [where('role', '==', 'candidate')],
        transformer,
    });

    return (
        <CandidateContext.Provider value={{ candidates, loading, error }}>
            {children}
        </CandidateContext.Provider>
    );
};
