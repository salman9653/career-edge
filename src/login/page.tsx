
'use client';

import Link from "next/link"
import { useFormState, useFormStatus } from 'react-dom';
import { signInWithEmailAndPassword, type User, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Ban } from "lucide-react"
import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";

interface AuthState {
  error?: string | null;
  user?: User | null;
  role?: string | null;
  status?: string | null;
  userData?: any;
}

const initialState: AuthState = {
  error: null,
};

async function signInAction(prevState: any, formData: FormData): Promise<AuthState> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Please fill out all fields.' };
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            return { error: null, user, role: userData.role, status: userData.status, userData };
        } else {
             return { error: "User data not found." };
        }
    } catch (e: any) {
        return { error: e.message };
    }
}


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
       {pending ? <Loader2 className="animate-spin" /> : 'Login'}
    </Button>
  )
}


export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction] = useFormState(signInAction, initialState);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    if (state.user && state.role && state.userData) {
      if (state.status === 'banned') {
        setIsBanned(true);
      } else if (state.status === 'inactive' || state.status === 'invited') {
        // Log out users who are not yet active
        signOut(auth);
        formAction({ error: "Your account is not active yet. Please accept your invitation." });
      } else {
        const sessionData = {
          uid: state.user.uid,
          email: state.user.email,
          displayName: state.user.displayName,
          role: state.role,
          phone: state.userData.phone || '',
          emailVerified: state.user.emailVerified,
          displayImageUrl: state.userData.displayImageUrl || null,
          companySize: state.userData.companySize,
          website: state.userData.website,
          socials: state.userData.socials,
          helplinePhone: state.userData.helplinePhone,
          helplineEmail: state.userData.helplineEmail,
          aboutCompany: state.userData.aboutCompany,
          companyType: state.userData.companyType,
          foundedYear: state.userData.foundedYear,
          tags: state.userData.tags,
          benefits: state.userData.benefits,
          preferences: state.userData.preferences || { themeMode: 'system', themeColor: 'Aubergine' },
          company_uid: state.userData.company_uid || null,
          permissions_role: state.userData.permissions_role || null
        }
        sessionStorage.removeItem('hasDismissedVerificationToast');
        document.cookie = `firebase-session=${btoa(JSON.stringify(sessionData))}; path=/`;
        
        const redirectUrl = searchParams.get('redirect');
        if (redirectUrl) {
          router.push(decodeURIComponent(redirectUrl));
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [state, router, searchParams]);

  const handleBannedOk = async () => {
    await signOut(auth);
    setIsBanned(false);
  }

  return (
    <>
      <AlertDialog open={isBanned}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <Ban className="h-6 w-6 text-destructive"/>
                </div>
            </div>
            <AlertDialogTitle className="text-center">Account Suspended</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Your account has been suspended. Please contact support for more information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleBannedOk} className="w-full">OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <Card className="mx-auto w-full max-w-sm rounded-lg">
          <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                  <Logo />
              </div>
            <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Enter your email below to log in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction}>
            <div className="grid gap-4">
              {state?.error && (
                  <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Login Failed</AlertTitle>
                      <AlertDescription>{state.error}</AlertDescription>
                    </Alert>
                )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="rounded-md"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" name="password" type="password" required className="rounded-md" />
              </div>
              <SubmitButton />
              <Button variant="outline" className="w-full" disabled>
                Login with Google
              </Button>
            </div>
            </form>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/" className="underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
