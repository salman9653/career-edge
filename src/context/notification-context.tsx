
'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { collection, query, where, onSnapshot, Unsubscribe, orderBy, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Notification } from '@/lib/types';
import { useSession } from '@/hooks/use-session';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: Error | null;
    markAllAsRead: () => void;
}

export const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    loading: true,
    error: null,
    markAllAsRead: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const { session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let unsubscribe: Unsubscribe = () => {};

        if (session?.uid) {
            const q = query(
                collection(db, 'notifications'), 
                where('recipientId', '==', session.uid),
                orderBy('createdAt', 'desc')
            );
            
            unsubscribe = onSnapshot(q, (snapshot) => {
                const notificationList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Notification));
                setNotifications(notificationList);
                setLoading(false);
            }, (err) => {
                console.error("Error fetching notifications:", err);
                setError(err);
                setLoading(false);
            });
        } else {
             setLoading(false);
        }

        return () => unsubscribe();
    }, [session]);
    
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAllAsRead = async () => {
        if (unreadCount === 0) return;

        const batch = writeBatch(db);
        notifications.forEach(notification => {
            if (!notification.isRead) {
                const docRef = doc(db, 'notifications', notification.id);
                batch.update(docRef, { isRead: true });
            }
        });
        await batch.commit();
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, loading, error, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
