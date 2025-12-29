'use client';

import React, { createContext, ReactNode } from 'react';
import { where, doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { UserProfile, CompanySize } from '@/lib/types';
import { useFirestoreCollection, useFirestoreTransformer } from '@/hooks/use-firestore';

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
    const transformer = useFirestoreTransformer(async (id: string, data: DocumentData): Promise<CompanyData> => {
        let displayImageUrl = data.displayImageUrl;
        if (data.hasDisplayImage) {
            const imageDocSnap = await getDoc(doc(db, `users/${id}/uploads/displayImage`));
            if (imageDocSnap.exists()) {
                displayImageUrl = imageDocSnap.data().data;
            }
        }

        return {
            id: id,
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
    }, []);

    const { data: companies, loading, error } = useFirestoreCollection<CompanyData>({
        collectionPath: 'users',
        constraints: [where('role', '==', 'company')],
        transformer,
    });

    return (
        <CompanyContext.Provider value={{ companies, loading, error }}>
            {children}
        </CompanyContext.Provider>
    );
};
