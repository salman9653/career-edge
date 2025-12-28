
'use client';
import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import type { CompanySize, Socials, UserProfile, Resume, Employment, Education, Project } from '@/lib/types';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';

export interface UserPreferences {
  themeMode: 'light' | 'dark' | 'system';
  themeColor: string;
}

export interface UserSession extends UserProfile {
  preferences?: UserPreferences;
  displayName?: string; // For compatibility with some auth logic
}

export function useSession() {
    const [session, setSession] = useState<UserSession | null>(null);
    const [loading, setLoading] = useState(true);

    const updateSessionCookie = useCallback((newSessionData: Partial<UserSession>) => {
        const sessionCookie = Cookies.get('firebase-session');
        let prevSession = {};
        if (sessionCookie) {
            try {
                prevSession = JSON.parse(atob(sessionCookie));
            } catch(e) {
                console.error("Failed to parse existing session cookie", e);
            }
        }
        
        const updatedSession = { ...prevSession, ...newSessionData };

        if (newSessionData.preferences) {
            updatedSession.preferences = {
                ...(prevSession as UserSession).preferences,
                ...newSessionData.preferences,
            };
        }
        
        Cookies.set('firebase-session', btoa(JSON.stringify(updatedSession)), { path: '/' });
        setSession(updatedSession as UserSession);
    }, []);

    useEffect(() => {
        const sessionCookie = Cookies.get('firebase-session');
        let initialSession: UserSession | null = null;
        if (sessionCookie) {
            try {
                initialSession = JSON.parse(atob(sessionCookie));
                setSession(initialSession);
            } catch (e) {
                console.error("Failed to parse session cookie", e);
                Cookies.remove('firebase-session', { path: '/' });
            }
        }
        setLoading(false);

        const unsubscribeFromAuth = onIdTokenChanged(auth, async (user: User | null) => {
            if (user) {
                 // Sync with Server (Set HttpOnly Cookie)
                 try {
                     const idToken = await user.getIdToken();
                     await fetch('/api/auth/login', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ idToken }),
                     });
                 } catch (error) {
                     console.error("Failed to sync server session:", error);
                 }

                 const currentSessionCookie = Cookies.get('firebase-session');
                 if (currentSessionCookie) {
                    try {
                        const currentSession = JSON.parse(atob(currentSessionCookie));
                        if (user.emailVerified !== currentSession.emailVerified) {
                           updateSessionCookie({ emailVerified: user.emailVerified });
                        }
                    } catch(e) {
                         console.error("Error handling token change:", e);
                    }
                 }
            } else {
                // User logged out
                // Clear Server Session
                try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                } catch (error) {
                    console.error("Failed to clear server session:", error);
                }

                Cookies.remove('firebase-session', { path: '/' });
                setSession(null);
            }
        });
        
        let unsubscribeFromFirestore: () => void = () => {};
        const sessionUid = initialSession?.uid;

        if (sessionUid) {
            const userDocRef = doc(db, 'users', sessionUid);
            unsubscribeFromFirestore = onSnapshot(userDocRef, async (docSnap) => {
                if (docSnap.exists()) {
                    const firestoreData = docSnap.data();
                    
                    let displayImageUrl = firestoreData.displayImageUrl || null;
                    if(firestoreData.hasDisplayImage && !displayImageUrl) {
                        const imageDoc = await getDoc(doc(db, `users/${sessionUid}/uploads/displayImage`));
                        if (imageDoc.exists()) {
                            displayImageUrl = imageDoc.data().data;
                        }
                    }

                    const sessionUpdate: Partial<UserSession> = {
                        ...firestoreData, // Spread all fields from Firestore
                        name: firestoreData.name,
                        phone: firestoreData.phone,
                        displayImageUrl: displayImageUrl,
                        preferences: firestoreData.preferences,
                        favourite_jobs: firestoreData.favourite_jobs,
                    };
                    updateSessionCookie(sessionUpdate);
                }
            });
        }


        return () => {
            unsubscribeFromAuth();
            unsubscribeFromFirestore();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { session, loading, updateSession: updateSessionCookie };
}
