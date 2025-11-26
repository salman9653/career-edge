
'use server';

import { createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db } from './config';
import { redirect } from 'next/navigation';
import { getFirebaseErrorMessage } from './error-messages';

export async function signUpCandidate(prevState: any, formData: FormData) {
  const firstName = formData.get('first-name') as string;
  const lastName = formData.get('last-name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectJobId = formData.get('redirectJobId') as string | null;

  if (!firstName || !lastName || !email || !password) {
    return { error: 'Please fill out all fields.' };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
    });

    const sessionData = {
      uid: user.uid,
      name: `${firstName} ${lastName}`,
      email: user.email,
      phone: '',
      role: 'candidate',
      status: 'Active',
      createdAt: serverTimestamp(),
      subscription: 'Free',
      applications: 0,
      preferences: { themeMode: 'system', themeColor: 'Aubergine' }
    };

    await setDoc(doc(db, 'users', user.uid), sessionData);
    
    // Set cookie manually here to log the user in immediately
    const cookieData = {
        uid: user.uid,
        email: user.email,
        displayName: sessionData.name,
        role: sessionData.role,
        emailVerified: user.emailVerified,
        preferences: sessionData.preferences,
    };
    // The redirect logic will handle cookies, but we might need to set it here if redirect doesn't work as expected
    // For now, we rely on redirect to handle login, but this is a fallback.

  } catch (e: any) {
    return { error: getFirebaseErrorMessage(e) };
  }
  
  if (redirectJobId) {
      redirect(`/dashboard/candidate/jobs/${redirectJobId}`);
  } else {
      redirect('/dashboard');
  }
}


export async function signUpCompany(prevState: any, formData: FormData) {
    const companyName = formData.get('company-name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
  
    if (!companyName || !email || !password) {
      return { error: 'Please fill out all fields.' };
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: companyName,
      });
  
      const companyData = {
        uid: user.uid,
        name: companyName,
        email: user.email,
        phone: '',
        role: 'company',
        createdAt: serverTimestamp(),
        status: 'Active',
        subscription: 'Free',
        companySize: { size: 'Startup', employees: '1-100' },
        website: '',
        socials: { linkedin: '', twitter: '', naukri: '', glassdoor: '' },
        helplinePhone: '',
        helplineEmail: '',
        aboutCompany: '',
        companyType: '',
        foundedYear: '',
        tags: [],
        benefits: [],
        preferences: { themeMode: 'system', themeColor: 'Aubergine' }
      };

      await setDoc(doc(db, 'users', user.uid), companyData);
      
      // Notify admins
      const adminsQuery = query(collection(db, 'users'), where('role', 'in', ['admin', 'adminAccountManager']));
      const adminsSnapshot = await getDocs(adminsQuery);
      
      if (!adminsSnapshot.empty) {
        const batch = writeBatch(db);
        adminsSnapshot.forEach(adminDoc => {
            const notificationRef = doc(collection(db, 'notifications'));
            batch.set(notificationRef, {
                recipientId: adminDoc.id,
                senderId: user.uid,
                senderName: companyName,
                type: 'NEW_COMPANY_SIGNUP',
                message: `${companyName} has just signed up on Career Edge.`,
                link: `/dashboard/admin/companies/${user.uid}`,
                isRead: false,
                createdAt: serverTimestamp(),
            });
        });
        await batch.commit();
      }

    } catch (e: any)      {
      return { error: getFirebaseErrorMessage(e) };
    }

    redirect('/dashboard');
}

export async function sendPasswordResetEmailAction(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    if (!email) {
        return { error: 'Email is required.' };
    }
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, email };
    } catch (e: any) {
        return { error: getFirebaseErrorMessage(e), email };
    }
}
