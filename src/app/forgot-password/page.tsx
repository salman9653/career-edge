
'use client';

import Link from "next/link";
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { sendPasswordResetEmailAction } from "@/lib/firebase/auth";
import { useState } from "react";

const initialState: {
  error: string | null;
  success: boolean;
  email?: string;
} = {
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
       {pending ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
    </Button>
  )
}

export default function ForgotPasswordPage() {
    const [state, formAction] = useActionState(sendPasswordResetEmailAction, initialState);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
            <Card className="mx-auto w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                        <Logo />
                    </div>
                     {!state.success && (
                        <>
                            <CardTitle className="font-headline text-2xl">Forgot Password</CardTitle>
                            <CardDescription>
                                Enter your email and we'll send you a link to reset your password.
                            </CardDescription>
                        </>
                     )}
                </CardHeader>
                <CardContent>
                    {state.success ? (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                </div>
                            </div>
                            <h3 className="font-semibold">Check Your Email</h3>
                            <div className="text-sm text-muted-foreground">
                                <p>We've sent a link to reset your password to</p>
                                <p className="font-medium text-foreground">{state.email}</p>
                                <p>Please check your inbox and follow the instructions.</p>
                            </div>
                            <Button asChild>
                                <Link href="/login">Back to Login</Link>
                            </Button>
                        </div>
                    ) : (
                        <form action={formAction} className="space-y-4">
                            {state.error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
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
                                />
                            </div>
                            <SubmitButton />
                        </form>
                    )}
                     {!state.success && (
                        <div className="mt-4 text-center text-sm">
                            Remember your password?{" "}
                            <Link href="/login" className="underline">
                                Log in
                            </Link>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
    )
}
