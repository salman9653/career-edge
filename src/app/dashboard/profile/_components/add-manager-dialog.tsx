
'use client';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addManagerAction } from '@/app/actions';

const initialState = {
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Add Manager'}
    </Button>
  );
}

interface AddManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export function AddManagerDialog({ open, onOpenChange, companyId }: AddManagerDialogProps) {
  const [state, formAction] = useActionState(addManagerAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Manager Added',
        description: 'The new manager has been added and is ready to be invited.',
      });
      onOpenChange(false);
      formRef.current?.reset();
    }
  }, [state.success, toast, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Account Manager</DialogTitle>
          <DialogDescription>
            Enter the details for the new manager. They will be invited to create their own login credentials.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} ref={formRef}>
          <input type="hidden" name="company_uid" value={companyId} />
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" name="designation" placeholder="e.g., Hiring Manager" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="permissions_role">Role</Label>
               <Select name="permissions_role" required>
                <SelectTrigger id="permissions_role">
                    <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Admin">Admin (Full Access)</SelectItem>
                    <SelectItem value="Editor">Editor (Can manage jobs)</SelectItem>
                    <SelectItem value="Viewer">Viewer (Read-only)</SelectItem>
                </SelectContent>
                </Select>
            </div>
            {state?.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
