
'use client';

import Link from "next/link"
import { useActionState } from 'react';
import { useFormStatus } from "react-dom";
import { signUpCompany } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

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

export default function CompanySignupPage() {
  const [state, formAction] = useActionState(signUpCompany, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
            <Logo />
        </div>
        <CardTitle className="font-headline text-2xl">Create a Company Account</CardTitle>
        <CardDescription>
          Find the best talent for your team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
        <div className="grid gap-4">
           {state?.error && (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Signup Failed</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
              )}
          <div className="grid gap-2">
            <Label htmlFor="company-name">Company name</Label>
            <Input id="company-name" name="company-name" placeholder="Innovate Inc." required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="recruiting@example.com"
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
          <Link href="/login" className="underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}
