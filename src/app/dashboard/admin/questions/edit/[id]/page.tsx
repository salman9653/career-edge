
'use client';

import { useActionState, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { updateQuestionAction } from '@/app/actions';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Question } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';

const initialState = {
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Update Question'}
    </Button>
  )
}

export default function EditQuestionPage() {
  const { session, loading: sessionLoading } = useSession();
  const [state, formAction] = useActionState(updateQuestionAction, initialState);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionStatement, setQuestionStatement] = useState('');
  const [questionType, setQuestionType] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  
  const questionId = params.id as string;

  useEffect(() => {
    if (questionId) {
      const fetchQuestion = async () => {
        setLoading(true);
        const docRef = doc(db, 'questions', questionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Omit<Question, 'id'>;
          const fetchedQuestion = { id: docSnap.id, ...data };
          setQuestion(fetchedQuestion);
          setQuestionStatement(fetchedQuestion.question);
          setQuestionType(fetchedQuestion.type);
          if (fetchedQuestion.type === 'mcq' && fetchedQuestion.options) {
            setOptions(fetchedQuestion.options);
            setCorrectAnswer(fetchedQuestion.correctAnswer || '');
          }
        }
        setLoading(false);
      }
      fetchQuestion();
    }
  }, [questionId]);
  
  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: 'The question has been updated successfully.',
      });
      if (question?.libraryType === 'library') {
        router.push('/dashboard/admin/questions');
      } else {
        router.push('/dashboard/company/questions');
      }
    }
  }, [state.success, router, toast, question?.libraryType]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };
  
  const difficultyMap: { [key: number]: string } = { 1: 'easy', 2: 'medium', 3: 'hard' };

  if (sessionLoading || loading) {
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {session && <DashboardSidebar role={session.role} user={session} />}
         <div className="flex flex-col max-h-screen">
          <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
            <h1 className="font-headline text-xl font-semibold">Edit Question</h1>
          </header>
          <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
            <Card>
              <CardHeader><Skeleton className="h-8 w-64" /></CardHeader>
              <CardContent className="space-y-6 pt-6">
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }
  
  if (!session || !question || (question.libraryType === 'custom' && question.addedBy !== session.uid && session.role !== 'admin')) {
    return <div className="flex min-h-screen items-center justify-center"><p>Access Denied or Question not found.</p></div>;
  }


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role={session.role} user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
            </Button>
            <h1 className="font-headline text-xl font-semibold">Edit Question</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
          <form action={formAction}>
            <input type="hidden" name="questionId" value={question.id} />
            <input type="hidden" name="libraryType" value={question.libraryType} />
            <input type="hidden" name="question" value={questionStatement} />
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="font-headline text-2xl">Edit Question</CardTitle>
                            <CardDescription>Update the details for this question.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="question" className="text-base">Question Statement</Label>
                        <RichTextEditor value={questionStatement} onChange={setQuestionStatement} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                        <Label htmlFor="type">Question Type</Label>
                        <Select name="type" required onValueChange={setQuestionType} defaultValue={question.type}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mcq">MCQ (Multiple Choice)</SelectItem>
                                <SelectItem value="subjective">Subjective</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category (comma-separated)</Label>
                            <Input
                                id="category"
                                name="category"
                                defaultValue={Array.isArray(question.category) ? question.category.join(', ') : ''}
                                placeholder="e.g., React, JavaScript, Behavioral"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select name="difficulty" required defaultValue={difficultyMap[question.difficulty]}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {questionType === 'subjective' && (
                    <div className="space-y-2">
                        <Label htmlFor="answerSummary">Answer Summary</Label>
                        <Textarea
                            id="answerSummary"
                            name="answerSummary"
                            defaultValue={question.answerSummary}
                            placeholder="Provide a brief summary of the expected answer."
                            className="min-h-[100px]"
                            required
                        />
                    </div>
                    )}

                    {questionType === 'mcq' && (
                    <div className="space-y-4">
                        <Label>MCQ Options</Label>
                        <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                            <RadioGroup name="correctAnswer" value={correctAnswer} onValueChange={setCorrectAnswer} className="space-y-2">
                            {options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                <RadioGroupItem value={option} id={`option-${index}`} />
                                <Input
                                    name="options"
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    required
                                    className="flex-1 bg-background"
                                />
                                {options.length > 2 && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                )}
                                </div>
                            ))}
                            </RadioGroup>
                            {options.length < 5 && (
                            <Button type="button" variant="outline" size="sm" onClick={addOption}>
                                <Plus className="mr-2 h-4 w-4" /> Add Option
                            </Button>
                            )}
                        </div>
                    </div>
                    )}
                    {state?.error && <p className="text-sm text-destructive mt-4">{state.error}</p>}
            
                    <div className="flex justify-end gap-2 pt-4">
                        <SubmitButton />
                    </div>
                </CardContent>
            </Card>
          </form>
        </main>
      </div>
    </div>
  );
}
