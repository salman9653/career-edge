
import { createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db } from './config';
import { redirect } from 'next/navigation';
import { getFirebaseErrorMessage } from './error-messages';

import { CandidateSignupSchema, CompanySignupSchema } from '@/lib/schemas/auth';

export async function signUpCandidate(prevState: any, formData: FormData) {
  const redirectJobId = formData.get('redirectJobId') as string | null;

  const rawData = {
      firstName: formData.get('first-name'),
      lastName: formData.get('last-name'),
      email: formData.get('email'),
      password: formData.get('password'),
  };

  const validatedFields = CandidateSignupSchema.safeParse(rawData);

  if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0].message };
  }

  const { firstName, lastName, email, password } = validatedFields.data;

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
    // Legacy client cookie (optional but kept for compat)
    document.cookie = `firebase-session=${btoa(JSON.stringify(cookieData))}; path=/`;

    // SYNC SERVER SESSION (Critical for Server Components)
    try {
        const idToken = await user.getIdToken();
        await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });
    } catch (error) {
        console.error("Failed to sync server session during signup:", error);
    }

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
    const rawData = {
        companyName: formData.get('company-name'),
        email: formData.get('email'),
        password: formData.get('password'),
    };

    const validatedFields = CompanySignupSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0].message };
    }

    const { companyName, email, password } = validatedFields.data;
  
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
      
      // SYNC SERVER SESSION (Critical for Server Components)
      try {
          const idToken = await user.getIdToken();
          await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
          });
      } catch (error) {
          console.error("Failed to sync server session during signup:", error);
      }
      
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
