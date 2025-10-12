
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useSession } from '@/hooks/use-session';

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
    const [candidates, setCandidates] = useState<CrmCandidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let unsubscribe: Unsubscribe = () => {};

        if (session?.uid && (session.role === 'company' || session.role === 'manager')) {
            const companyId = session.role === 'company' ? session.uid : session.company_uid;
            if (!companyId) {
                setLoading(false);
                return;
            }
            
            const talentPoolCol = collection(db, 'users', companyId, 'talent_pool');
            const q = query(talentPoolCol);
            
            unsubscribe = onSnapshot(q, (snapshot) => {
                const candidateList = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name || 'N/A',
                        email: data.email || 'N/A',
                        avatarUrl: data.avatarUrl,
                        tags: data.tags || [],
                        lastContact: data.lastContact?.toDate()?.toISOString() || null,
                        source: data.source || 'Manual',
                    } as CrmCandidate;
                });
                setCandidates(candidateList);
                setLoading(false);
            }, (err) => {
                console.error("Error fetching talent pool:", err);
                setError(err);
                setLoading(false);
            });
        } else {
             setLoading(false);
        }

        return () => unsubscribe();
    }, [session]);

    return (
        <TalentPoolContext.Provider value={{ candidates, loading, error }}>
            {children}
        </TalentPoolContext.Provider>
    );
};
