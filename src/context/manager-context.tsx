'use client';

import React, { createContext, useMemo, useContext, ReactNode } from 'react';
import { where } from 'firebase/firestore';
import { useSession } from '@/hooks/use-session';
import { useFirestoreCollection } from '@/hooks/use-firestore';

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

    const constraints = useMemo(() => {
        if (!session?.uid) return [];
        
        if (session.role === 'admin') {
            return [where('role', '==', 'adminAccountManager')];
        } else if (session.role === 'company' || session.role === 'manager') {
            const companyId = session.role === 'company' ? session.uid : session.company_uid;
            if (!companyId) return [];
            return [where('company_uid', '==', companyId)];
        }
        return [];
    }, [session]);

    const isDisabled = useMemo(() => {
        if (sessionLoading) return true;
        if (!session?.uid) return true;
        if (session.role === 'admin') return false;
        if (session.role === 'company' || session.role === 'manager') {
            return ! (session.role === 'company' ? session.uid : session.company_uid);
        }
        return true;
    }, [session, sessionLoading]);

    const { data: managers, loading, error } = useFirestoreCollection<ManagerProfile>({
        collectionPath: 'users',
        constraints,
        disabled: isDisabled,
    });

    return (
        <ManagerContext.Provider value={{ managers, loading, error }}>
            {children}
        </ManagerContext.Provider>
    );
};
