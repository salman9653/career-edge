
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Assessment } from '@/lib/types';
import { useSession } from '@/hooks/use-session';

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
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let unsubscribe: Unsubscribe = () => {};

        if (session?.uid && (session.role === 'company' || session.role === 'manager')) {
            const createdById = session.role === 'company' ? session.uid : session.company_uid;
            if (!createdById) {
                setLoading(false);
                return;
            }
            
            const q = query(collection(db, 'assessments'), where('createdBy', '==', createdById));
            
            unsubscribe = onSnapshot(q, (snapshot) => {
                const assessmentList = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name,
                        assessmentType: data.assessmentType,
                        description: data.description,
                        questionIds: data.questionIds || [],
                        createdBy: data.createdBy,
                        createdByName: data.createdByName || '',
                        createdAt: data.createdAt,
                    } as Assessment;
                });
                setAssessments(assessmentList);
                setLoading(false);
            }, (err) => {
                console.error("Error fetching assessments:", err);
                setError(err);
                setLoading(false);
            });
        } else {
             setLoading(false);
        }

        return () => unsubscribe();
    }, [session]);

    return (
        <AssessmentContext.Provider value={{ assessments, loading, error }}>
            {children}
        </AssessmentContext.Provider>
    );
};
