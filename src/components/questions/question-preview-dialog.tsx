
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Question } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

interface QuestionPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question | null;
}

export function QuestionPreviewDialog({ open, onOpenChange, question }: QuestionPreviewDialogProps) {
  if (!question) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Question Preview</DialogTitle>
          <DialogDescription>This is how the question will appear to candidates.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1">
            <div className="space-y-6 pr-6">
                <div className="prose dark:prose-invert max-w-full">
                    <h3>Question</h3>
                    <div dangerouslySetInnerHTML={{ __html: question.question }} />
                </div>

                {question.type === 'mcq' && (
                    <RadioGroup disabled className="space-y-3">
                        {question.options?.map((option, i) => (
                        <Label key={i} className="flex items-center space-x-3 p-4 border rounded-md cursor-not-allowed has-[:checked]:bg-muted has-[:checked]:border-primary">
                            <RadioGroupItem value={option} id={`preview-${question.id}-${i}`} />
                            <span>{option}</span>
                        </Label>
                        ))}
                    </RadioGroup>
                )}

                {question.type === 'subjective' && (
                    <Textarea
                        placeholder="Candidate's answer would go here..."
                        className="min-h-[150px] text-base"
                        disabled
                    />
                )}

                {question.type === 'code' && (
                     <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground">A code editor will be displayed here for the candidate.</p>
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
