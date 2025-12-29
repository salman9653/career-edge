'use client';

import React, { createContext, useMemo, ReactNode } from 'react';
import { DocumentData } from 'firebase/firestore';
import { useSession } from '@/hooks/use-session';
import { useFirestoreCollection, useFirestoreTransformer } from '@/hooks/use-firestore';

export interface CrmCandidate {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    tags?: string[];
    lastContact?: string;
    source: string;
}

interface TalentPoolContextType {
    candidates: CrmCandidate[];
    loading: boolean;
    error: Error | null;
}

export const TalentPoolContext = createContext<TalentPoolContextType>({
    candidates: [],
    loading: true,
    error: null,
});

export const TalentPoolProvider = ({ children }: { children: ReactNode }) => {
    const { session } = useSession();

    const companyId = useMemo(() => {
        if (!session?.uid) return null;
        if (session.role === 'company') return session.uid;
        if (session.role === 'manager') return session.company_uid;
        return null;
    }, [session]);

    const collectionPath = useMemo(() => 
        companyId ? `users/${companyId}/talent_pool` : '', 
    [companyId]);

    const transformer = useFirestoreTransformer((id: string, data: DocumentData) => ({
        id: id,
        name: data.name || 'N/A',
        email: data.email || 'N/A',
        avatarUrl: data.avatarUrl,
        tags: data.tags || [],
        lastContact: data.lastContact?.toDate()?.toISOString() || null,
        source: data.source || 'Manual',
    } as CrmCandidate), []);

    const { data: candidates, loading, error } = useFirestoreCollection<CrmCandidate>({
        collectionPath,
        transformer,
        disabled: !collectionPath,
    });

    return (
        <TalentPoolContext.Provider value={{ candidates, loading, error }}>
            {children}
        </TalentPoolContext.Provider>
    );
};
