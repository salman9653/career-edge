'use client';

import React, { createContext, ReactNode } from 'react';
import { DocumentData } from 'firebase/firestore';
import type { Question } from '@/lib/types';
import { useFirestoreCollection, useFirestoreTransformer } from '@/hooks/use-firestore';

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

export const QuestionProvider = ({ children }: QuestionProviderProps) => {
    const transformer = useFirestoreTransformer((id: string, data: DocumentData): Question => ({
        id,
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
    }), []);

    const { data: questions, loading, error } = useFirestoreCollection<Question>({
        collectionPath: 'questions',
        transformer,
    });

    return (
        <QuestionContext.Provider value={{ questions, loading, error }}>
            {children}
        </QuestionContext.Provider>
    );
};
