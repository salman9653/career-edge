
'use client'
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUserProfileAction } from '@/app/actions';
import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Save Changes'}
    </Button>
  );
}

export function UpdateNameCard({ name, phone, onSave, onCancel }: { name: string, phone: string, onSave: (updatedProfile: {name: string, phone: string}) => void, onCancel: () => void }) {
  // @ts-ignore - Types compatibility issue wrapper
  const [state, formAction] = useActionState<ActionState, FormData>(updateUserProfileAction, initialState);
  const { session } = useSession();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
      });
      const formData = new FormData(formRef.current!);
      const newName = formData.get('name') as string;
      const newPhone = formData.get('phone') as string;
      onSave({name: newName, phone: newPhone});
    }
  }, [state.success, toast, onSave]);

  return (
    <form action={formAction} ref={formRef}>
      <input type="hidden" name="userId" value={session?.uid} />
        <div>
          <h2 className="text-2xl font-semibold leading-none tracking-tight">Edit Profile</h2>
          <p className="text-sm text-muted-foreground">Update your display name and contact information.</p>
        </div>
        <div className="space-y-4 mt-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={name} required />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" defaultValue={phone} type="tel" />
          </div>
          {state?.error && <Alert variant="destructive" className="mt-2"><AlertDescription>{state.error}</AlertDescription></Alert>}
        </div>
        <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
            <SubmitButton />
        </div>
    </form>
  );
}
