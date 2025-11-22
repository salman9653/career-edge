
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from "react-dom";
import { signUpCompany } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";

const initialState = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      className="w-full h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 transition-all duration-300" 
      disabled={pending}
    >
       {pending ? <Loader2 className="animate-spin" /> : 'Create an account'}
    </Button>
  )
}

export default function CompanySignupPage() {
  const [state, formAction] = useActionState(signUpCompany, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-12 px-4">
    <Card className="mx-auto w-full max-w-md rounded-2xl border-primary/10 bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/5">
      <CardHeader className="text-center space-y-3 pb-8">
        <CardTitle className="font-headline text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Create a Company Account
        </CardTitle>
        <CardDescription className="text-base">
          Find the best talent for your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
        <div className="grid gap-5">
           {state?.error && (
                 <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Signup Failed</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
              )}
          <div className="grid gap-2">
            <Label htmlFor="company-name" className="text-sm font-medium">Company name</Label>
            <Input 
              id="company-name" 
              name="company-name" 
              placeholder="Innovate Inc." 
              required 
              className="rounded-lg h-11 border-primary/20 focus:border-primary/40 transition-colors"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-medium">Company Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="recruiting@example.com"
              required
              className="rounded-lg h-11 border-primary/20 focus:border-primary/40 transition-colors"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
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
            Sign up with Google
          </Button>
        </div>
        </form>
      </CardContent>
    </Card>
    </div>
  )
}
