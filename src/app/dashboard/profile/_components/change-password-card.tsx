
'use client';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { changePasswordAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const initialState = {
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
  const [state, formAction] = useActionState(changePasswordAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

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
                    <Input id="currentPassword" name="currentPassword" type="password" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" name="newPassword" type="password" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" required />
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
