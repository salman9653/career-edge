'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
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
import { useSession } from '@/hooks/use-session';
import type { GeneratedResume } from '@/ai/flows/generate-ats-resume-flow-types';
import { renameGeneratedResumeAction } from '@/app/actions';

const initialState: {
  error?: string | null;
  success: boolean;
} = {
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Rename'}
    </Button>
  );
}

interface RenameResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resume: GeneratedResume;
}

export function RenameResumeDialog({ open, onOpenChange, resume }: RenameResumeDialogProps) {
  const [state, formAction] = useActionState(renameGeneratedResumeAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { session } = useSession();

  useEffect(() => {
    if (state.success) {
      toast({ title: 'Resume Renamed' });
      onOpenChange(false);
      formRef.current?.reset();
    }
    if (state.error) {
      toast({ variant: 'destructive', title: 'Error', description: state.error });
    }
  }, [state, toast, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Resume</DialogTitle>
          <DialogDescription>
            Enter a new name for your generated resume.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} ref={formRef} className="space-y-4">
          <input type="hidden" name="userId" value={session?.uid} />
          <input type="hidden" name="resumeId" value={resume.id} />
          <div className="grid gap-2">
              <Label htmlFor="newName">New Name</Label>
              <Input id="newName" name="newName" defaultValue={resume.name} required />
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
