
'use client';

import { useActionState, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { addQuestionAction } from '@/app/actions';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Loader2, Plus, Trash2, Sparkles } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { GradientButton } from '@/components/ui/gradient-button';

const initialState = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Save Question'}
    </Button>
  )
}

function AiGenerateButton() {
    const { pending } = useFormStatus();
    return (
        <GradientButton type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Questions</>}
        </GradientButton>
    )
}

export default function AddCompanyQuestionPage() {
  const { session, loading } = useSession();
  const [state, formAction] = useActionState(addQuestionAction, initialState);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [questionType, setQuestionType] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['', '']);
  
  const from = searchParams.get('from');

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

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;
  }
  if (!session || session.role !== 'company') {
    return <div className="flex min-h-screen items-center justify-center"><p>Access Denied</p></div>;
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
            <h1 className="font-headline text-xl font-semibold">Add Custom Question</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
          <div className="flex gap-2 w-full h-full">
            <div className="w-[60%] h-full">
              <form action={formAction} className="w-full h-full">
                <input type="hidden" name="libraryType" value="custom" />
                <input type="hidden" name="addedBy" value={session.uid} />
                <input type="hidden" name="addedByName" value={session.displayName} />
                {from && <input type="hidden" name="from" value={from} />}
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Create Custom Question</CardTitle>
                        <CardDescription>This question will be saved to your company's private question bank.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1 overflow-auto custom-scrollbar">
                        <div className="space-y-2">
                            <Label htmlFor="question" className="text-base">Question Statement</Label>
                            <Textarea
                                id="question"
                                name="question"
                                placeholder="e.g., How would you contribute to our company culture?"
                                className="min-h-[120px]"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                            <Label htmlFor="type">Question Type</Label>
                            <Select name="type" required onValueChange={setQuestionType}>
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
                                    placeholder="e.g., Company Culture, Technical"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="difficulty">Difficulty</Label>
                                <Select name="difficulty" required>
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
                                <RadioGroup name="correctAnswer" defaultValue="0" className="space-y-2">
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
                            <Button type="button" variant="secondary">Preview</Button>
                            <SubmitButton />
                        </div>
                    </CardContent>
                </Card>
              </form>
            </div>
            <div className="w-[40%] h-full rounded-lg p-1 bg-gradient-to-br from-purple-500 to-pink-500">
                <Card className="h-full flex flex-col w-full">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Generate Questions with AI</CardTitle>
                        <CardDescription>Describe what you're looking for, and let AI do the work.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1 overflow-auto custom-scrollbar">
                        <div className="space-y-2">
                            <Label htmlFor="ai-job-title">Job Title</Label>
                            <Input id="ai-job-title" placeholder="e.g., Senior Frontend Developer" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ai-skills">Key Skills (comma-separated)</Label>
                            <Input id="ai-skills" placeholder="e.g., React, TypeScript, GraphQL" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ai-question-type">Question Type</Label>
                             <Select name="ai-question-type">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mcq">MCQ (Multiple Choice)</SelectItem>
                                    <SelectItem value="subjective">Subjective</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ai-num-questions">Number of Questions</Label>
                                <Input id="ai-num-questions" type="number" min="1" max="10" placeholder="5" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ai-difficulty">Difficulty</Label>
                                <Select name="ai-difficulty">
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Easy</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                            <div className="flex justify-end pt-4">
                            <AiGenerateButton />
                            </div>
                    </CardContent>
                </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
