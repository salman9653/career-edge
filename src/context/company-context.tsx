
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { UserProfile, CompanySize } from '@/lib/types';

export type CompanyData = Omit<UserProfile, 'uid' | 'email' | 'name' | 'role' | 'displayImageUrl'> & {
    id: string;
    name: string;
    email: string;
    displayImageUrl?: string;
    status: string;
    plan: string;
    size: CompanySize;
    createdAt: string | null;
};


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

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const companyListPromises = snapshot.docs.map(async (companyDoc) => {
                const data = companyDoc.data();
                
                let displayImageUrl = data.displayImageUrl;
                if (data.hasDisplayImage) {
                    const imageDocSnap = await getDoc(doc(db, `users/${companyDoc.id}/uploads/displayImage`));
                    if (imageDocSnap.exists()) {
                        displayImageUrl = imageDocSnap.data().data;
                    }
                }

                return {
                    id: companyDoc.id,
                    name: data.name || 'N/A',
                    email: data.email || 'N/A',
                    displayImageUrl,
                    status: data.status || 'Active',
                    plan: data.subscription || 'Free',
                    size: data.companySize || { size: 'Startup', employees: '1-100' },
                    createdAt: data.createdAt?.toDate()?.toISOString() || null,
                    website: data.website,
                    socials: data.socials,
                    helplinePhone: data.helplinePhone,
                    helplineEmail: data.helplineEmail,
                    aboutCompany: data.aboutCompany,
                    companyType: data.companyType,
                    foundedYear: data.foundedYear,
                    tags: data.tags,
                    benefits: data.benefits,
                } as CompanyData;
            });

            const companyList = await Promise.all(companyListPromises);
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
