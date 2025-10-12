'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Coupon } from '@/lib/types';

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
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const couponsCol = collection(db, 'coupons');
        const q = query(couponsCol);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const couponList = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
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
                } as Coupon;
            });
            setCoupons(couponList);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching coupons:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <CouponContext.Provider value={{ coupons, loading, error }}>
            {children}
        </CouponContext.Provider>
    );
};
