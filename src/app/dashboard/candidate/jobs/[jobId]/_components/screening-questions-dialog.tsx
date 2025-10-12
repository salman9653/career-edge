
'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import type { Question } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScreeningQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: Question[];
  onSubmit: (answers: { questionId: string; answer: string }[]) => void;
  isSubmitting: boolean;
}

export function ScreeningQuestionsDialog({ open, onOpenChange, questions, onSubmit, isSubmitting }: ScreeningQuestionsDialogProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));
    onSubmit(formattedAnswers);
  };
  
  const allQuestionsAnswered = questions.length === Object.keys(answers).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Please answer to proceed</DialogTitle>
          <DialogDescription>Your answers to these screening questions will be submitted with your application.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
            <div className="space-y-6 pr-6">
            {questions.map((q, index) => (
                <div key={q.id} className="space-y-3">
                    <Label className="font-semibold">{index + 1}. {q.question}</Label>
                    <RadioGroup
                        onValueChange={(value) => handleAnswerChange(q.id, value)}
                        value={answers[q.id]}
                    >
                        {q.options?.map((option, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${q.id}-${i}`} />
                            <Label htmlFor={`${q.id}-${i}`} className="font-normal">{option}</Label>
                        </div>
                        ))}
                    </RadioGroup>
                </div>
            ))}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !allQuestionsAnswered}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

