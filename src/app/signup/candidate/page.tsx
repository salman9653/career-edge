
'use client';

import Link from "next/link"
import { useActionState, Suspense } from 'react';
import { useFormStatus } from 'react-dom';
import { signUpCandidate } from '@/lib/firebase/auth';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation";

const initialState = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Create an account'}
    </Button>
  )
}

function CandidateSignupForm() {
    const [state, formAction] = useActionState(signUpCandidate, initialState);
    const searchParams = useSearchParams();
    const redirectJobId = searchParams.get('redirectJobId');

    const loginUrl = redirectJobId ? `/login?redirectJobId=${redirectJobId}` : '/login';

    return (
        <Card className="mx-auto w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mb-4 flex justify-center">
                    <Logo />
                </div>
                <CardTitle className="font-headline text-2xl">Create a Candidate Account</CardTitle>
                <CardDescription>
                    Find your dream job with Career Edge.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction}>
                    {redirectJobId && <input type="hidden" name="redirectJobId" value={redirectJobId} />}
                    <div className="grid gap-4">
                    {state?.error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Signup Failed</AlertTitle>
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" name="first-name" placeholder="Max" required />
                        </div>
                        <div className="grid gap-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" name="last-name" placeholder="Robinson" required />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <SubmitButton />
                    <Button variant="outline" className="w-full" disabled>
                        Sign up with Google
                    </Button>
                    </div>
                </form>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link href={loginUrl} className="underline">
                    Log in
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

export default function CandidateSignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <Suspense fallback={
          <Card className="mx-auto w-full max-w-md p-6">
              <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
          </Card>
      }>
        <CandidateSignupForm />
      </Suspense>
    </div>
  )
}
