
'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { collection, query, where, onSnapshot, Unsubscribe, orderBy, writeBatch, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Notification } from '@/lib/types';
import { useSession } from '@/hooks/use-session';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: Error | null;
    markAllAsRead: () => void;
    markAsRead: (notificationId: string) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    loading: true,
    error: null,
    markAllAsRead: () => {},
    markAsRead: () => {},
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
                const rawNotifications = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Notification));
                
                // Group notifications client-side
                const groupedNotifications: Notification[] = [];
                const jobApplicationGroups: Record<string, Notification[]> = {};

                // Separate and group new application notifications
                rawNotifications.forEach(n => {
                    if (n.type === 'NEW_APPLICATION' && n.jobId && !n.isRead) {
                        if (!jobApplicationGroups[n.jobId]) {
                            jobApplicationGroups[n.jobId] = [];
                        }
                        jobApplicationGroups[n.jobId].push(n);
                    } else {
                        groupedNotifications.push(n);
                    }
                });

                // Create summary notifications for groups
                for (const jobId in jobApplicationGroups) {
                    const group = jobApplicationGroups[jobId];
                    if (group.length > 1) {
                        const latestNotification = group[0]; // They are sorted by date
                        const applicantNames = group.map(n => n.senderName).filter(Boolean);
                        
                        groupedNotifications.unshift({
                            ...latestNotification,
                            id: `group-${jobId}-${Date.now()}`, // Create a stable but unique ID for the session
                            message: `**${group.length}** new candidates have applied for **${latestNotification.jobTitle}**.`,
                            senderName: `${applicantNames.slice(0, 2).join(', ')}${applicantNames.length > 2 ? ` and ${applicantNames.length - 2} others` : ''}`,
                            applicantCount: group.length,
                            newApplicantNames: applicantNames,
                            originalIds: group.map(n => n.id), // Store original IDs to mark as read
                        });
                    } else {
                        // If only one, add it back as a normal notification
                        groupedNotifications.unshift(...group);
                    }
                }
                
                // Sort final list again to ensure grouped items are on top
                groupedNotifications.sort((a, b) => {
                    const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                    const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                    return bDate.getTime() - aDate.getTime();
                });
                
                setNotifications(groupedNotifications);
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
            if (notification.originalIds) {
                notification.originalIds.forEach(id => {
                    const docRef = doc(db, 'notifications', id);
                    batch.update(docRef, { isRead: true });
                });
            } else if (!notification.isRead) {
                const docRef = doc(db, 'notifications', notification.id);
                batch.update(docRef, { isRead: true });
            }
        });
        await batch.commit();
    };

    const markAsRead = async (notificationId: string) => {
        const notification = notifications.find(n => n.id === notificationId);
        if(notification) {
             const batch = writeBatch(db);
             if (notification.originalIds) {
                notification.originalIds.forEach(id => {
                    const docRef = doc(db, 'notifications', id);
                    batch.update(docRef, { isRead: true });
                });
            } else if (!notification.isRead) {
                const docRef = doc(db, 'notifications', notification.id);
                batch.update(docRef, { isRead: true });
            }
            await batch.commit();
        }
    }

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, loading, error, markAllAsRead, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
