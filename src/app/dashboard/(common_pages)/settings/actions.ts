
'use server';

import { doc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { cookies } from 'next/headers';

interface UserPreferences {
    themeMode?: 'light' | 'dark' | 'system';
    themeColor?: string;
}

import { 
    ThemePreferencesSchema, 
    WhatsNewSchema, 
    AboutPlatformSchema, 
    ContactInfoSchema, 
    FeedbackSchema, 
    TermsSchema, 
    PolicySchema 
  } from '@/lib/schemas/settings';
  
  export async function updateThemePreferencesAction(preferences: UserPreferences) {
      const sessionCookie = (await cookies()).get('firebase-session');
      if (!sessionCookie) {
          return { error: 'User not authenticated.' };
      }
  
      const validatedFields = ThemePreferencesSchema.safeParse(preferences);
      if (!validatedFields.success) {
          return { error: validatedFields.error.issues[0].message };
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
    const rawData = { content: formData.get('content') };
    const validatedFields = WhatsNewSchema.safeParse(rawData);
  
    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
    }
  
    try {
      const docRef = doc(db, 'settings', 'help');
      await setDoc(docRef, {
        'whats-new': {
          content: validatedFields.data.content,
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
      const rawData = {
          version: formData.get('version'),
          content: formData.get('content'),
      };
      const validatedFields = AboutPlatformSchema.safeParse(rawData);
  
      if (!validatedFields.success) {
          return { error: validatedFields.error.issues[0].message };
      }
  
      try {
          const docRef = doc(db, 'settings', 'help');
          await setDoc(docRef, {
              about: {
                  version: validatedFields.data.version,
                  content: validatedFields.data.content,
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
      const rawData = {
          email: formData.get('email'),
          phone: formData.get('phone'),
          address: formData.get('address'),
          phoneAvailable: formData.get('phoneAvailable'),
      };
      const validatedFields = ContactInfoSchema.safeParse(rawData);
  
      if (!validatedFields.success) {
          return { error: validatedFields.error.issues[0].message };
      }
  
      try {
          const docRef = doc(db, 'settings', 'help');
          await setDoc(docRef, {
              contact: {
                  ...validatedFields.data,
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
      const rawData = {
          feedbackContent: formData.get('feedbackContent') || "",
          rating: Number(formData.get('rating') || 0),
          feedbackBy: formData.get('feedbackBy'),
          feedbackByName: formData.get('feedbackByName'),
      };
  
      const validatedFields = FeedbackSchema.safeParse(rawData);
  
      if (!validatedFields.success) {
          return { error: validatedFields.error.issues[0].message };
      }
  
      const { feedbackContent, rating, feedbackBy, feedbackByName } = validatedFields.data;
  
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
      const rawData = { content: formData.get('content') };
      const validatedFields = TermsSchema.safeParse(rawData);
  
      if (!validatedFields.success) {
          return { error: validatedFields.error.issues[0].message };
      }
      try {
          await setDoc(doc(db, 'settings', 'help'), {
              terms: { content: validatedFields.data.content, updatedAt: serverTimestamp() }
          }, { merge: true });
          return { success: true };
      } catch (e: any) {
          return { error: e.message };
      }
  }
  
  export async function updatePolicyAction(prevState: any, formData: FormData) {
      const rawData = { content: formData.get('content') };
      const validatedFields = PolicySchema.safeParse(rawData);
  
      if (!validatedFields.success) {
          return { error: validatedFields.error.issues[0].message };
      }
      try {
          await setDoc(doc(db, 'settings', 'help'), {
              policy: { content: validatedFields.data.content, updatedAt: serverTimestamp() }
          }, { merge: true });
          return { success: true };
      } catch (e: any) {
          return { error: e.message };
      }
  }
