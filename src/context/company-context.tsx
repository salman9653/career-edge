'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface CompanySize {
    size: string;
    employees: string;
}

export interface CompanyData {
    id: string;
    name: string;
    email: string;
    displayImageUrl?: string;
    status: string;
    plan: string;
    size: CompanySize;
    createdAt: string | null;
}

interface CompanyContextType {
    companies: CompanyData[];
    loading: boolean;
    error: Error | null;
}

export const CompanyContext = createContext<CompanyContextType>({
    companies: [],
    loading: true,
    error: null,
});

export const CompanyProvider = ({ children }: { children: ReactNode }) => {
    const [companies, setCompanies] = useState<CompanyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const companiesCol = collection(db, 'users');
        const q = query(companiesCol, where('role', '==', 'company'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const companyList = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || 'N/A',
                    email: data.email || 'N/A',
                    displayImageUrl: data.displayImageUrl,
                    status: data.status || 'Active',
                    plan: data.subscription || 'Free',
                    size: data.companySize || { size: 'Startup', employees: '1-100' },
                    createdAt: data.createdAt?.toDate()?.toISOString() || null
                };
            });
            setCompanies(companyList);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching companies:", err);
            setError(err);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return (
        <CompanyContext.Provider value={{ companies, loading, error }}>
            {children}
        </CompanyContext.Provider>
    );
};
