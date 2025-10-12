
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { SubscriptionPlan, Price } from '@/lib/types';

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
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const subsCollection = collection(db, 'subscriptions');
        const q = query(subsCollection);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const planList = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || '',
                    type: data.type || 'candidate',
                    prices: data.prices || [{ currency: 'USD', amount: 0, cycle: 'monthly' }],
                    features: data.features || [],
                } as SubscriptionPlan;
            });
            setPlans(planList);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching subscription plans:", err);
            setError(err);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    return (
        <SubscriptionContext.Provider value={{ plans, loading, error }}>
            {children}
        </SubscriptionContext.Provider>
    );
};
