
'use client';
import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import type { CompanySize, Socials, UserProfile } from '@/lib/types';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

export interface UserPreferences {
  themeMode: 'light' | 'dark' | 'system';
  themeColor: string;
}

export interface UserSession extends UserProfile {
  // uid, email, displayName, role etc are already in UserProfile
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
        if (sessionCookie) {
            try {
                const decodedSession = JSON.parse(atob(sessionCookie));
                setSession(decodedSession);
            } catch (e) {
                console.error("Failed to parse session cookie", e);
                Cookies.remove('firebase-session', { path: '/' });
                setSession(null);
            }
        }
        setLoading(false);

        // This listener handles auth state changes (login/logout)
        // and updates to things like emailVerified from the auth object itself.
        const unsubscribeFromAuth = onIdTokenChanged(auth, async (user: User | null) => {
            if (user) {
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
                Cookies.remove('firebase-session', { path: '/' });
                setSession(null);
            }
        });

        // This listener handles real-time updates from the user's Firestore document.
        let unsubscribeFromFirestore: () => void = () => {};
        if(session?.uid) {
            const userDocRef = doc(db, 'users', session.uid);
            unsubscribeFromFirestore = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const firestoreData = docSnap.data();
                     const sessionData: Partial<UserSession> = {
                        name: firestoreData.name,
                        phone: firestoreData.phone,
                        displayImageUrl: firestoreData.displayImageUrl,
                        companySize: firestoreData.companySize,
                        website: firestoreData.website,
                        socials: firestoreData.socials,
                        helplinePhone: firestoreData.helplinePhone,
                        helplineEmail: firestoreData.helplineEmail,
                        aboutCompany: firestoreData.aboutCompany,
                        companyType: firestoreData.companyType,
                        foundedYear: firestoreData.foundedYear,
                        tags: firestoreData.tags,
                        benefits: firestoreData.benefits,
                        preferences: firestoreData.preferences,
                        permissions_role: firestoreData.permissions_role,
                        favourite_jobs: firestoreData.favourite_jobs,
                        // Update any other fields from firestore here
                    };
                    updateSessionCookie(sessionData);
                }
            });
        }


        return () => {
            unsubscribeFromAuth();
            unsubscribeFromFirestore();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.uid]);

    return { session, loading, updateSession: updateSessionCookie };
}
