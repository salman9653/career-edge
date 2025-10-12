
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

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
    const [candidates, setCandidates] = useState<CandidateData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const candidatesCol = collection(db, 'users');
        const q = query(candidatesCol, where('role', '==', 'candidate'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const candidateList = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || 'N/A',
                    email: data.email || 'N/A',
                    status: data.status || 'Active',
                    subscription: data.subscription || 'Free',
                    applications: data.applications || 0,
                    avatar: data.avatarUrl,
                    createdAt: data.createdAt?.toDate()?.toISOString() || null
                };
            });
            setCandidates(candidateList);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching candidates:", err);
            setError(err);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return (
        <CandidateContext.Provider value={{ candidates, loading, error }}>
            {children}
        </CandidateContext.Provider>
    );
};
