
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { AiInterview } from '@/lib/types';
import { useSession } from '@/hooks/use-session';

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
    const [interviews, setInterviews] = useState<AiInterview[]>([]);
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
            
            const q = query(collection(db, 'ai-interviews'), where('companyId', '==', companyId));
            
            unsubscribe = onSnapshot(q, (snapshot) => {
                const interviewList = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name,
                        jobTitle: data.jobTitle,
                        jobDescription: data.jobDescription,
                        keySkills: data.keySkills,
                        intro: data.intro,
                        outro: data.outro,
                        questions: data.questions,
                        createdBy: data.createdBy,
                        createdByName: data.createdByName,
                        createdAt: data.createdAt,
                        duration: data.duration,
                        questionCount: data.questionCount,
                        difficulty: data.difficulty,
                        tone: data.tone,
                    } as AiInterview;
                });
                setInterviews(interviewList);
                setLoading(false);
            }, (err) => {
                console.error("Error fetching AI interviews:", err);
                setError(err);
                setLoading(false);
            });
        } else {
             setLoading(false);
        }

        return () => unsubscribe();
    }, [session]);

    return (
        <AiInterviewContext.Provider value={{ interviews, loading, error }}>
            {children}
        </AiInterviewContext.Provider>
    );
};
