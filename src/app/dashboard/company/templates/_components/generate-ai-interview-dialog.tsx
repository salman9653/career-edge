
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
import { Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { GradientButton } from '@/components/ui/gradient-button';
import { generateAiInterviewAction } from '@/app/actions';
import { useSession } from '@/hooks/use-session';

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
    <GradientButton type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" />Generate Interview</>}
    </GradientButton>
  );
}

interface GenerateAiInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateAiInterviewDialog({ open, onOpenChange }: GenerateAiInterviewDialogProps) {
  const [state, formAction] = useActionState(generateAiInterviewAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { session } = useSession();

  useEffect(() => {
    if (state.success) {
      toast({ title: 'AI Interview Generated!', description: 'The new interview template has been created.' });
      onOpenChange(false);
      formRef.current?.reset();
    }
  }, [state.success, toast, onOpenChange]);
  
  const companyId = session?.role === 'company' ? session.uid : session?.company_uid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Generate AI Interview</DialogTitle>
          <DialogDescription>
            Provide the details for the role, and our AI will generate a structured interview for you.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} ref={formRef}>
          <input type="hidden" name="createdBy" value={session?.uid} />
          <input type="hidden" name="createdByName" value={session?.displayName} />
          <input type="hidden" name="companyId" value={companyId} />
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input id="jobTitle" name="jobTitle" placeholder="e.g., Senior Product Manager" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea id="jobDescription" name="jobDescription" placeholder="Paste the job description here..." required className="min-h-24" />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="keySkills">Key Skills to Probe (comma-separated)</Label>
                <Input id="keySkills" name="keySkills" placeholder="e.g., React, Leadership, Client Communication" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select name="difficulty" required>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Select name="tone" required>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Formal">Formal</SelectItem>
                            <SelectItem value="Conversational">Conversational</SelectItem>
                            <SelectItem value="Technical">Technical</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="duration">Duration (mins)</Label>
                    <Input id="duration" name="duration" type="number" placeholder="e.g., 20" required />
                </div>
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
