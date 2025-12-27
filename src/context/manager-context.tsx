
'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useSession } from '@/hooks/use-session';

export interface ManagerProfile {
    id: string;
    name: string;
    email: string;
    designation: string;
    permissions_role: string;
    status: 'active' | 'inactive' | 'invited' | 'banned';
    avatar?: string;
    uid?: string;
}

interface ManagerContextType {
    managers: ManagerProfile[];
    loading: boolean;
    error: Error | null;
}

export const ManagerContext = createContext<ManagerContextType>({
    managers: [],
    loading: true,
    error: null,
});

export const useManagers = () => useContext(ManagerContext);

export const ManagerProvider = ({ children }: { children: ReactNode }) => {
    const { session, loading: sessionLoading } = useSession();
    const [managers, setManagers] = useState<ManagerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let unsubscribe: Unsubscribe = () => {};

        const fetchManagers = (q: any) => {
            unsubscribe = onSnapshot(q, (snapshot: any) => {
                const managersList = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as ManagerProfile));
                setManagers(managersList);
                setLoading(false);
            }, (err: any) => {
                console.error("Error fetching managers:", err);
                setError(err);
                setLoading(false);
            });
        };

        if (session?.uid) {
            let managersQuery;
            if (session.role === 'admin') {
                managersQuery = query(collection(db, 'users'), where('role', '==', 'adminAccountManager'));
                fetchManagers(managersQuery);
            } else if (session.role === 'company' || session.role === 'manager') {
                const companyId = session.role === 'company' ? session.uid : session.company_uid;
                if (!companyId) {
                    setLoading(false);
                    return;
                }
                managersQuery = query(collection(db, 'users'), where('company_uid', '==', companyId));
                fetchManagers(managersQuery);
            } else {
                setLoading(false);
            }
        } else if (!sessionLoading) {
            setLoading(false);
        }

        return () => unsubscribe();
    }, [session, sessionLoading]);

    return (
        <ManagerContext.Provider value={{ managers, loading, error }}>
            {children}
        </ManagerContext.Provider>
    );
};
