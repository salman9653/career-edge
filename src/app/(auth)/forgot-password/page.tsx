
'use client';

import Link from "next/link";
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { sendPasswordResetEmailAction } from "@/lib/firebase/auth";

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
    <Button 
      type="submit" 
      className="w-full h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 transition-all duration-300" 
      disabled={pending}
    >
       {pending ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
    </Button>
  )
}

export default function ForgotPasswordPage() {
    const [state, formAction] = useActionState(sendPasswordResetEmailAction, initialState);

    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12 px-4">
            <Card className="mx-auto w-full max-w-md rounded-2xl border border-white/20 bg-gradient-to-br from-background/60 via-background/40 to-background/30 backdrop-blur-2xl shadow-2xl shadow-primary/10">
                <CardHeader className="text-center space-y-3 pb-8">
                    {!state.success && (
                        <>
                            <CardTitle className="font-headline text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Forgot Password
                            </CardTitle>
                            <CardDescription className="text-base">
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
                            <h3 className="font-headline text-xl font-semibold">Check Your Email</h3>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>We've sent a link to reset your password to</p>
                                <p className="font-medium text-foreground">{state.email}</p>
                                <p>Please check your inbox and follow the instructions.</p>
                            </div>
                            <Button 
                              asChild 
                              className="w-full h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 transition-all duration-300"
                            >
                                <Link href="/login">Back to Login</Link>
                            </Button>
                        </div>
                    ) : (
                        <form action={formAction} className="space-y-5">
                            {state.error && (
                                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
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
                            <SubmitButton />
                        </form>
                    )}
                     {!state.success && (
                        <div className="mt-4 text-center text-sm">
                            Remember your password?{" "}
                            <Link href="/login" className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                                Log in
                            </Link>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
    )
}
