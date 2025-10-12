
'use client';
import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import type { CompanySize, Socials } from '@/lib/types';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export interface UserPreferences {
  themeMode: 'light' | 'dark' | 'system';
  themeColor: string;
}

export interface UserSession {
  uid: string;
  email: string;
  displayName: string;
  role: 'candidate' | 'company' | 'admin' | 'manager';
  phone?: string;
  emailVerified?: boolean;
  displayImageUrl?: string | null;
  companySize?: CompanySize;
  website?: string;
  socials?: Socials;
  helplinePhone?: string;
  helplineEmail?: string;
  aboutCompany?: string;
  companyType?: string;
  foundedYear?: string;
  tags?: string[];
  benefits?: string[];
  preferences: UserPreferences;
  company_uid?: string;
  permissions_role?: 'Admin' | 'Editor' | 'Viewer';
  favourite_jobs?: string[];
}

export function useSession() {
    const [session, setSession] = useState<UserSession | null>(null);
    const [loading, setLoading] = useState(true);

    const updateSession = useCallback((newSessionData: Partial<UserSession>) => {
        const sessionCookie = Cookies.get('firebase-session');
        if (sessionCookie) {
            try {
                const prevSession = JSON.parse(atob(sessionCookie));
                const updatedSession = { ...prevSession, ...newSessionData };

                if (newSessionData.preferences) {
                    updatedSession.preferences = {
                        ...prevSession.preferences,
                        ...newSessionData.preferences,
                    };
                }
                
                Cookies.set('firebase-session', btoa(JSON.stringify(updatedSession)), { path: '/' });
                setSession(updatedSession);

            } catch (e) {
                 console.error("Failed to update session cookie", e);
            }
        }
    }, []);

    useEffect(() => {
        const sessionCookie = Cookies.get('firebase-session');
        if (sessionCookie) {
            try {
                const decodedSession = JSON.parse(atob(sessionCookie));
                setSession(decodedSession);
            } catch (e) {
                console.error("Failed to parse session cookie", e);
                setSession(null);
            }
        }
        setLoading(false);

        const unsubscribe = onIdTokenChanged(auth, async (user: User | null) => {
            const currentSessionCookie = Cookies.get('firebase-session');
            if (user && currentSessionCookie) {
                try {
                    const currentSession = JSON.parse(atob(currentSessionCookie));
                    await user.reload(); // Force refresh user data
                    if (user.emailVerified !== currentSession.emailVerified) {
                        const updatedSession = { ...currentSession, emailVerified: user.emailVerified };
                        Cookies.set('firebase-session', btoa(JSON.stringify(updatedSession)), { path: '/' });
                        setSession(updatedSession);
                    }
                } catch(e) {
                    console.error("Error handling token change:", e);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return { session, loading, updateSession };
}
