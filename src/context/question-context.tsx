
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, query, where, Unsubscribe, Query, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Question } from '@/lib/types';
import { useSession } from '@/hooks/use-session';

interface QuestionContextType {
    questions: Question[];
    loading: boolean;
    error: Error | null;
}

export const QuestionContext = createContext<QuestionContextType>({
    questions: [],
    loading: true,
    error: null,
});

interface QuestionProviderProps {
    children: ReactNode;
}

const mapDocToQuestion = (doc: DocumentData): Question => {
    const data = doc.data();
    return {
        id: doc.id,
        question: data.question || '',
        type: data.type || 'subjective',
        category: data.category || [],
        difficulty: data.difficulty || 1,
        // Handle server timestamps which might be null on initial client-side render
        createdAt: data.createdAt?.toDate()?.toISOString() || null,
        status: data.status || 'active',
        libraryType: data.libraryType || 'custom',
        addedBy: data.addedBy || '',
        addedByName: data.addedByName || '',
        answerSummary: data.answerSummary,
        options: data.options,
        correctAnswer: data.correctAnswer,
        acceptableAnswer: data.acceptableAnswer,
        isStrict: data.isStrict,
        // Add coding question fields
        functionName: data.functionName,
        boilerplate: data.boilerplate,
        examples: data.examples,
        constraints: data.constraints,
        testCases: data.testCases,
        hints: data.hints,
    };
};

export const QuestionProvider = ({ children }: QuestionProviderProps) => {
    const { session } = useSession();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let unsubscribe: Unsubscribe | (() => void) = () => {};

        setLoading(true);
        const questionsCol = collection(db, 'questions');
        const q = query(questionsCol);

        unsubscribe = onSnapshot(q, (snapshot) => {
            const questionList = snapshot.docs.map(mapDocToQuestion);
            setQuestions(questionList);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching questions:", err);
            setError(err);
            setLoading(false);
        });
        
        return () => unsubscribe();
    }, []);

    return (
        <QuestionContext.Provider value={{ questions, loading, error }}>
            {children}
        </QuestionContext.Provider>
    );
};
