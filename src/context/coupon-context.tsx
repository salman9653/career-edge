'use client';

import React, { createContext, ReactNode } from 'react';
import type { Coupon } from '@/lib/types';
import { useFirestoreCollection, useFirestoreTransformer } from '@/hooks/use-firestore';
import { DocumentData } from 'firebase/firestore';

interface CouponContextType {
    coupons: Coupon[];
    loading: boolean;
    error: Error | null;
}

export const CouponContext = createContext<CouponContextType>({
    coupons: [],
    loading: true,
    error: null,
});

export const CouponProvider = ({ children }: { children: ReactNode }) => {
    const transformer = useFirestoreTransformer((id: string, data: DocumentData) => ({
        id: id,
        code: data.code || '',
        description: data.description || '',
        type: data.type || 'coupon',
        discountType: data.discountType || 'percentage',
        discountValue: data.discountValue || 0,
        status: data.status || 'inactive',
        validFrom: data.validFrom?.toDate()?.toISOString() || null,
        validUntil: data.validUntil?.toDate()?.toISOString() || null,
        applicablePlans: data.applicablePlans || [],
        createdAt: data.createdAt?.toDate()?.toISOString() || '',
    } as Coupon), []);

    const { data: coupons, loading, error } = useFirestoreCollection<Coupon>({
        collectionPath: 'coupons',
        transformer,
    });

    return (
        <CouponContext.Provider value={{ coupons, loading, error }}>
            {children}
        </CouponContext.Provider>
    );
};
