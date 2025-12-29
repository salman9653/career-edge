'use client';

import React, { createContext, useMemo, useContext, ReactNode } from 'react';
import { where, orderBy, writeBatch, doc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Notification } from '@/lib/types';
import { useSession } from '@/hooks/use-session';
import { useFirestoreCollection } from '@/hooks/use-firestore';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: Error | null;
    markAllAsRead: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    loading: true,
    error: null,
    markAllAsRead: async () => {},
    markAsRead: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const { session } = useSession();

    const constraints = useMemo(() => 
        session?.uid ? [
            where('recipientId', '==', session.uid),
            orderBy('createdAt', 'desc')
        ] : [], 
    [session?.uid]);

    const { data: rawNotifications, loading, error } = useFirestoreCollection<Notification>({
        collectionPath: 'notifications',
        constraints,
        disabled: !session?.uid,
    });

    const notifications = useMemo(() => {
        if (!rawNotifications.length) return [];
        
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
            const latestNotification = group[0];
            const applicantNames = group.map(n => n.senderName).filter(Boolean);
            
            if (group.length > 1) {
                groupedNotifications.unshift({
                    ...latestNotification,
                    id: `group-${jobId}-${latestNotification.id}`, // More stable ID
                    message: `**${group.length}** new candidates have applied for **${latestNotification.jobTitle}**.`,
                    senderName: `${applicantNames.slice(0, 2).join(', ')}${applicantNames.length > 2 ? ` and ${applicantNames.length - 2} others` : ''}`,
                    applicantCount: group.length,
                    newApplicantNames: applicantNames,
                    originalIds: group.map(n => n.id),
                });
            } else {
                groupedNotifications.unshift(...group);
            }
        }
        
        // Final sort
        return [...groupedNotifications].sort((a, b) => {
            const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return bDate.getTime() - aDate.getTime();
        });
    }, [rawNotifications]);

    const unreadCount = useMemo(() => 
        notifications.filter(n => !n.isRead).length, 
    [notifications]);

    const markAllAsRead = async () => {
        if (!session?.uid || unreadCount === 0) return;
        const batch = writeBatch(db);
        notifications.forEach(notification => {
            if (notification.originalIds) {
                notification.originalIds.forEach(id => {
                    batch.update(doc(db, 'notifications', id), { isRead: true });
                });
            } else if (!notification.isRead) {
                batch.update(doc(db, 'notifications', notification.id), { isRead: true });
            }
        });
        await batch.commit();
    };

    const markAsRead = async (notificationId: string) => {
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            const batch = writeBatch(db);
            if (notification.originalIds) {
                notification.originalIds.forEach(id => {
                    batch.update(doc(db, 'notifications', id), { isRead: true });
                });
            } else if (!notification.isRead) {
                batch.update(doc(db, 'notifications', notification.id), { isRead: true });
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
