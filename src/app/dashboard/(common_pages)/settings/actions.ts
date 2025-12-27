
'use server';

import { doc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { cookies } from 'next/headers';

interface UserPreferences {
    themeMode?: 'light' | 'dark' | 'system';
    themeColor?: string;
}

export async function updateThemePreferencesAction(preferences: UserPreferences) {
    const sessionCookie = (await cookies()).get('firebase-session');
    if (!sessionCookie) {
        return { error: 'User not authenticated.' };
    }

    try {
        const session = JSON.parse(atob(sessionCookie.value));
        const userId = session.uid;

        if (!userId) {
            return { error: 'User ID not found in session.' };
        }

        const userDocRef = doc(db, 'users', userId);
        const dataToUpdate: Record<string, any> = {};

        if (preferences.themeMode) {
            dataToUpdate['preferences.themeMode'] = preferences.themeMode;
        }
        if (preferences.themeColor) {
            dataToUpdate['preferences.themeColor'] = preferences.themeColor;
        }

        if (Object.keys(dataToUpdate).length === 0) {
            return { success: true, message: 'No preferences to update.' };
        }

        await updateDoc(userDocRef, dataToUpdate);

        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function updateWhatsNewAction(prevState: any, formData: FormData) {
  const content = formData.get('content') as string;

  if (!content) {
    return { error: 'Content cannot be empty.' };
  }

  try {
    const docRef = doc(db, 'settings', 'help');
    await setDoc(docRef, {
      'whats-new': {
        content: content,
        updatedAt: serverTimestamp(),
      }
    }, { merge: true });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating What's New:", error);
    return { error: 'Failed to update content in Firestore.' };
  }
}

export async function updateAboutPlatformAction(prevState: any, formData: FormData) {
    const version = formData.get('version') as string;
    const content = formData.get('content') as string;

    if (!version || !content) {
        return { error: 'Version and content cannot be empty.' };
    }

    try {
        const docRef = doc(db, 'settings', 'help');
        await setDoc(docRef, {
            about: {
                version: version,
                content: content,
                updatedAt: serverTimestamp(),
            }
        }, { merge: true });
        
        return { success: true };
    } catch (error: any) {
        console.error("Error updating About Platform:", error);
        return { error: 'Failed to update content in Firestore.' };
    }
}

export async function updateContactInfoAction(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const phoneAvailable = formData.get('phoneAvailable') as string;

    if (!email || !phone || !address) {
        return { error: 'All fields are required.' };
    }

    try {
        const docRef = doc(db, 'settings', 'help');
        await setDoc(docRef, {
            contact: {
                email,
                phone,
                address,
                phoneAvailable,
                updatedAt: serverTimestamp(),
            }
        }, { merge: true });
        
        return { success: true };
    } catch (error: any) {
        console.error("Error updating contact info:", error);
        return { error: 'Failed to update content in Firestore.' };
    }
}

export async function submitFeedbackAction(prevState: any, formData: FormData) {
    const feedbackContent = formData.get('feedbackContent') as string;
    const rating = Number(formData.get('rating'));
    const feedbackBy = formData.get('feedbackBy') as string;
    const feedbackByName = formData.get('feedbackByName') as string;

    if (!feedbackContent && rating === 0) {
        return { error: 'Please provide a rating or feedback content.' };
    }
    if (!feedbackBy || !feedbackByName) {
        return { error: 'User information is missing.' };
    }

    try {
        const docRef = doc(db, 'app-feedbacks', feedbackBy);
        const docSnap = await getDoc(docRef);

        const data = {
            user_name: feedbackByName,
            user_id: feedbackBy,
            rating: rating,
            feedback_content: feedbackContent,
            updatedAt: serverTimestamp(),
        };

        if (!docSnap.exists()) {
            // @ts-ignore
            data.createdAt = serverTimestamp();
        }

        await setDoc(docRef, data, { merge: true });

        return { success: true };
    } catch (error: any) {
        console.error("Error submitting feedback:", error);
        return { error: 'Failed to submit feedback.' };
    }
}

export async function updateTermsAction(prevState: any, formData: FormData) {
    const content = formData.get('content') as string;
    if (!content) {
        return { error: 'Content cannot be empty.' };
    }
    try {
        await setDoc(doc(db, 'settings', 'help'), {
            terms: { content, updatedAt: serverTimestamp() }
        }, { merge: true });
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updatePolicyAction(prevState: any, formData: FormData) {
    const content = formData.get('content') as string;
    if (!content) {
        return { error: 'Content cannot be empty.' };
    }
    try {
        await setDoc(doc(db, 'settings', 'help'), {
            policy: { content, updatedAt: serverTimestamp() }
        }, { merge: true });
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}
