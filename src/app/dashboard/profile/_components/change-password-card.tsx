
'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { changePasswordAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type ActionState = {
  error?: string | null;
  success?: string | null;
};

const initialState: ActionState = {
  error: null,
  success: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Change Password'}
    </Button>
  );
}

export function ChangePasswordCard() {
  const [state, formAction] = useActionState<ActionState, FormData>(changePasswordAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success',
        description: state.success,
      });
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <form action={formAction} ref={formRef}>
        <div className="space-y-4">
             <div>
                <h4 className="font-semibold">Change Password</h4>
                <p className="text-sm text-muted-foreground">
                    Update your account password. For security, you will be logged out after a successful password change.
                </p>
            </div>
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                        <Input id="currentPassword" name="currentPassword" type={showCurrentPassword ? 'text' : 'password'} required className="pr-10" />
                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                            {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                        <Input id="newPassword" name="newPassword" type={showNewPassword ? 'text' : 'password'} required className="pr-10" />
                         <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                        <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required className="pr-10" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                {state?.error && <Alert variant="destructive" className="mt-2"><AlertDescription>{state.error}</AlertDescription></Alert>}
            </div>
            <div className="pt-4 flex justify-end">
                 <SubmitButton />
            </div>
        </div>
    </form>
  );
}
