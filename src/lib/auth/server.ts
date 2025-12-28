import 'server-only';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import type { UserProfile } from '@/lib/types'; // Assuming UserProfile is the main user type
import { redirect } from 'next/navigation';

export async function getCurrentUser(): Promise<UserProfile | null> {
  const sessionCookie = (await cookies()).get('session')?.value;

  if (!sessionCookie) {
    console.log('[Auth] No session cookie found');
    return null;
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;
    console.log(`[Auth] Session valid for uid: ${uid}`);

    // Fetch user profile from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      console.log(`[Auth] User document not found for uid: ${uid}`);
      return null;
    }

    return { uid: userDoc.id, ...userDoc.data() } as unknown as UserProfile;
  } catch (error) {
    console.error('[Auth] Error verifying session cookie:', error);
    return null;
  }
}

export async function requireUser(): Promise<UserProfile> {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }
    return user;
}
