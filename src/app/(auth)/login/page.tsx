'use client';

import Link from "next/link"
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
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
import { AlertCircle, Loader2, Ban, Eye, EyeOff } from "lucide-react"
import { useEffect, useState, Suspense } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";
import { RoleSelectionDialog } from "@/components/role-selection-dialog";
import { DashboardThemeProvider } from "@/context/dashboard-theme-context";

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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState(signInAction, initialState);
  const [isBanned, setIsBanned] = useState(false);
  const [bannedMessage, setBannedMessage] = useState('');
  const [isRoleSelectionOpen, setIsRoleSelectionOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const redirectJobId = searchParams.get('redirectJobId');

  useEffect(() => {
    if (state.user && state.role && state.userData) {
      if (state.status === 'banned') {
        if (state.role === 'company') {
          setBannedMessage('Your company account has been suspended. Please contact support for more information.');
        } else if (state.role === 'candidate') {
          setBannedMessage('Your account has been suspended due to a violation of our terms of service. Please contact support for assistance.');
        } else if (state.role === 'manager') {
            setBannedMessage('Your manager account has been suspended. Please contact your company administrator.');
        } else {
            setBannedMessage('Your account has been suspended. Please contact support.');
        }
        setIsBanned(true);
      } else if (state.status === 'inactive' || state.status === 'invited') {
        // Log out users who are not yet active
        signOut(auth);
        formAction({ error: "Your account is not active yet. Please accept your invitation." });
      }
      else {
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
        
        const redirectJobId = searchParams.get('redirectJobId');
        if (redirectJobId) {
          switch(state.role) {
            case 'candidate':
              router.push(`/dashboard/candidate/jobs/${redirectJobId}`);
              break;
            case 'company':
            case 'manager':
              router.push(`/dashboard/company/jobs/${redirectJobId}`);
              break;
            case 'admin':
              router.push(`/dashboard/admin/companies/jobs/${redirectJobId}`);
              break;
            default:
              router.push('/dashboard');
          }
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [state, router, searchParams]);

  const handleBannedOk = async () => {
    await signOut(auth);
    setIsBanned(false);
    setBannedMessage('');
  }
  
  const handleSignUpClick = () => {
    if (redirectJobId) {
      router.push(`/signup/candidate?redirectJobId=${redirectJobId}`);
    } else {
      setIsRoleSelectionOpen(true);
    }
  };

  const loginUrl = redirectJobId ? `/login?redirectJobId=${redirectJobId}` : '/login';

  return (
    <>
      <DashboardThemeProvider>
        <RoleSelectionDialog open={isRoleSelectionOpen} onOpenChange={setIsRoleSelectionOpen} />
      </DashboardThemeProvider>
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
              {bannedMessage}
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
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                 <div className="relative">
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    className="rounded-md pr-10"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                  </button>
                </div>
              </div>
              <SubmitButton />
              <Button variant="outline" className="w-full" disabled>
                Login with Google
              </Button>
            </div>
            </form>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={handleSignUpClick}>
                Sign up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
