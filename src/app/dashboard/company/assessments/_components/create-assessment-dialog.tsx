
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAssessmentAction } from '@/app/actions';
import { useSession } from '@/hooks/use-session';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';

interface CreateAssessmentState {
  error?: string | null;
  success?: boolean;
  assessmentId?: string;
}

const initialState: CreateAssessmentState = {
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Create Assessment'}
    </Button>
  );
}

interface CreateAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentType?: 'mcq' | 'subjective' | 'code';
}

export function CreateAssessmentDialog({ open, onOpenChange, assessmentType }: CreateAssessmentDialogProps) {
  const [state, formAction] = useActionState<CreateAssessmentState, FormData>(createAssessmentAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { session } = useSession();
  const router = useRouter();
  
  const [type, setType] = useState(assessmentType);

  useEffect(() => {
    if(assessmentType) {
        setType(assessmentType);
    }
  }, [assessmentType, open]);

  useEffect(() => {
    if (state.success && state.assessmentId) {
      toast({
        title: 'Assessment Created',
        description: 'You can now add questions to your new assessment.',
      });
      router.push(`/dashboard/company/assessments/${state.assessmentId}`);
      onOpenChange(false);
      formRef.current?.reset();
      setType(undefined); // Reset type after submission
    }
  }, [state.success, state.assessmentId, toast, onOpenChange, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Create New Assessment</DialogTitle>
          <DialogDescription>
            Fill in the initial details for your assessment. You can add questions in the next step.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} ref={formRef}>
          <input type="hidden" name="createdBy" value={session?.uid || ''} />
          <input type="hidden" name="createdByName" value={session?.name || session?.displayName || ''} />
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Assessment Name*</Label>
                <Input id="name" name="name" placeholder="e.g., React Frontend Challenge" required />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="assessmentType">Assessment Type*</Label>
                <Select name="assessmentType" required value={type} onValueChange={(value) => setType(value as any)}>
                    <SelectTrigger><SelectValue placeholder="Select Assessment Type" /></SelectTrigger>
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
                <Textarea id="description" name="description" placeholder="A brief description of the assessment" />
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
