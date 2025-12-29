'use client';

import React, { createContext, ReactNode } from 'react';
import type { SubscriptionPlan } from '@/lib/types';
import { useFirestoreCollection, useFirestoreTransformer } from '@/hooks/use-firestore';
import { DocumentData } from 'firebase/firestore';

interface SubscriptionContextType {
    plans: SubscriptionPlan[];
    loading: boolean;
    error: Error | null;
}

export const SubscriptionContext = createContext<SubscriptionContextType>({
    plans: [],
    loading: true,
    error: null,
});

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
    const transformer = useFirestoreTransformer((id: string, data: DocumentData) => ({
        id: id,
        name: data.name || '',
        type: data.type || 'candidate',
        prices: data.prices || [{ currency: 'USD', amount: 0, cycle: 'monthly' }],
        features: data.features || [],
    } as SubscriptionPlan), []);

    const { data: plans, loading, error } = useFirestoreCollection<SubscriptionPlan>({
        collectionPath: 'subscriptions',
        transformer,
    });

    return (
        <SubscriptionContext.Provider value={{ plans, loading, error }}>
            {children}
        </SubscriptionContext.Provider>
    );
};
