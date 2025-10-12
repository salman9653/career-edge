
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateAssessmentAction } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import type { Assessment } from '@/lib/types';

const initialState: {
  error?: string | null;
  success?: boolean;
} = {
  error: null,
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

interface EditAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: Assessment;
}

export function EditAssessmentDialog({ open, onOpenChange, assessment }: EditAssessmentDialogProps) {
  const [state, formAction] = useActionState(updateAssessmentAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Assessment Updated',
        description: 'The assessment details have been saved.',
      });
      onOpenChange(false);
    }
  }, [state.success, toast, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Edit Assessment</DialogTitle>
          <DialogDescription>
            Update the details for your assessment.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} ref={formRef}>
          <input type="hidden" name="assessmentId" value={assessment.id} />
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Assessment Name*</Label>
                <Input id="name" name="name" defaultValue={assessment.name} required />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="assessmentType">Assessment Type*</Label>
                <Select name="assessmentType" required defaultValue={assessment.assessmentType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="mcq">MCQ</SelectItem>
                        <SelectItem value="subjective">Subjective</SelectItem>
                        <SelectItem value="code">Coding</SelectItem>
                        <SelectItem value="mixed" disabled>Mixed</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea id="description" name="description" defaultValue={assessment.description} />
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
