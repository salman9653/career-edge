'use client';

import Link from "next/link"
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signInWithEmailAndPassword, type User, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseErrorMessage } from "@/lib/firebase/error-messages";
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
        return { error: getFirebaseErrorMessage(e) };
    }
}


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      className="w-full h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 transition-all duration-300" 
      disabled={pending}
    >
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
        
        const performRedirect = async () => {
             // Sync with Server (Set HttpOnly Cookie) - CRITICAL for Server Components
             try {
                // Check if the user object has getIdToken (it should if it's the UserImpl from Firebase)
                // If state.user is serialized, we might need to rely on auth.currentUser
                const currentUser = auth.currentUser;
                if (currentUser) {
                    const idToken = await currentUser.getIdToken();
                    await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken }),
                    });
                }
             } catch (error) {
                 console.error("Failed to sync server session during login:", error);
                 // We continue anyway, hoping the background sync works or simple client nav works
             }

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
        };

        performRedirect();
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

      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12 px-4">
        <Card className="mx-auto w-full max-w-md rounded-2xl border border-white/20 bg-gradient-to-br from-background/60 via-background/40 to-background/30 backdrop-blur-2xl shadow-2xl shadow-primary/10">
          <CardHeader className="text-center space-y-3 pb-8">
            <CardTitle className="font-headline text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction}>
            <div className="grid gap-5">
              {state?.error && (
                  <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Login Failed</AlertTitle>
                      <AlertDescription>{state.error}</AlertDescription>
                    </Alert>
                )}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="rounded-lg h-11 border-primary/20 focus:border-primary/40 transition-colors"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                 <div className="relative">
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    className="rounded-lg h-11 pr-10 border-primary/20 focus:border-primary/40 transition-colors"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                  </button>
                </div>
              </div>
              <SubmitButton />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-primary/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <Button variant="outline" className="w-full h-11 rounded-lg border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all" disabled>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Login with Google
              </Button>
            </div>
            </form>
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
