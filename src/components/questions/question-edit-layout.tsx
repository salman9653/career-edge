'use client';

import * as React from 'react';
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
import { languageOptions } from '@/lib/languageOptions.js';
import { CodeEditor } from '@/components/ui/code-editor';
import { Switch } from '@/components/ui/switch';

export type QuestionEditConfig = {
  role: 'admin' | 'company';
  allowedRoles: string[];
  libraryType: 'library' | 'custom';
  pageTitle: string;
  redirectPath: string;
};

type QuestionEditLayoutProps = {
  config: QuestionEditConfig;
};

const initialState = {
  error: null,
  success: false,
};

type LanguageSnippet = {
  language: string;
  functionName: string;
  boilerplate: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Update Question'}
    </Button>
  );
}

export function QuestionEditLayout({ config }: QuestionEditLayoutProps) {
  const { session, loading: sessionLoading } = useSession();
  const [state, formAction] = useActionState(updateQuestionAction, initialState);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionStatement, setQuestionStatement] = useState('');
  const [questionType, setQuestionType] = useState<string>('');
  
  // MCQ state
  const [options, setOptions] = useState<string[]>(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  
  // Code state
  const [languageSnippets, setLanguageSnippets] = useState<LanguageSnippet[]>([{ language: 'javascript', functionName: '', boilerplate: '' }]);
  const [examples, setExamples] = useState([{ input: '', output: '' }]);
  const [testCases, setTestCases] = useState([{ input: '', output: '', sample: false }]);
  const [constraints, setConstraints] = useState(['']);
  const [hints, setHints] = useState(['']);
  
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
          if (fetchedQuestion.type === 'code') {
            const fetchedSnippets = fetchedQuestion.functionName && fetchedQuestion.boilerplate 
              ? Object.keys(fetchedQuestion.functionName).map(lang => ({
                  language: lang,
                  functionName: fetchedQuestion.functionName![lang],
                  boilerplate: fetchedQuestion.boilerplate![lang],
                }))
              : [];
            if(fetchedSnippets.length > 0) setLanguageSnippets(fetchedSnippets);
            if(fetchedQuestion.examples && fetchedQuestion.examples.length > 0) setExamples(fetchedQuestion.examples);
            if(fetchedQuestion.testCases && fetchedQuestion.testCases.length > 0) setTestCases(fetchedQuestion.testCases);
            if(fetchedQuestion.constraints && fetchedQuestion.constraints.length > 0) setConstraints(fetchedQuestion.constraints);
            if(fetchedQuestion.hints && fetchedQuestion.hints.length > 0) setHints(fetchedQuestion.hints);
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
      router.push(config.redirectPath);
    }
  }, [state.success, router, toast, config.redirectPath]);

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

  const handleExampleChange = (index: number, field: 'input' | 'output', value: string) => {
    const newExamples = [...examples];
    newExamples[index][field] = value;
    setExamples(newExamples);
  };
  const addExample = () => setExamples([...examples, { input: '', output: '' }]);
  const removeExample = (index: number) => examples.length > 1 && setExamples(examples.filter((_, i) => i !== index));

  const handleTestCaseChange = (index: number, field: 'input' | 'output' | 'sample', value: string | boolean) => {
    const newTestCases = [...testCases];
    if (field === 'sample') newTestCases[index][field] = value as boolean;
    else newTestCases[index][field] = value as string;
    setTestCases(newTestCases);
  };
  const addTestCase = () => setTestCases([...testCases, { input: '', output: '', sample: false }]);
  const removeTestCase = (index: number) => testCases.length > 1 && setTestCases(testCases.filter((_, i) => i !== index));

  const handleConstraintChange = (index: number, value: string) => {
    const newConstraints = [...constraints];
    newConstraints[index] = value;
    setConstraints(newConstraints);
  };
  const addConstraint = () => setConstraints([...constraints, '']);
  const removeConstraint = (index: number) => constraints.length > 1 && setConstraints(constraints.filter((_, i) => i !== index));

  const handleHintChange = (index: number, value: string) => {
    const newHints = [...hints];
    newHints[index] = value;
    setHints(newHints);
  };
  const addHint = () => setHints([...hints, '']);
  const removeHint = (index: number) => hints.length > 1 && setHints(hints.filter((_, i) => i !== index));

  const handleAddLanguage = () => setLanguageSnippets([...languageSnippets, { language: 'javascript', functionName: '', boilerplate: '' }]);
  const handleSnippetChange = (index: number, field: 'language' | 'functionName' | 'boilerplate', value: string | undefined) => {
    const newSnippets = [...languageSnippets];
    newSnippets[index][field as keyof LanguageSnippet] = value || '';
    setLanguageSnippets(newSnippets);
  };
  const removeLanguage = (index: number) => setLanguageSnippets(languageSnippets.filter((_, i) => i !== index));
  
  const difficultyMap: { [key: number]: string } = { 1: 'easy', 2: 'medium', 3: 'hard' };

  if (sessionLoading || loading) {
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {session && <DashboardSidebar role={session.role} user={session} />}
         <div className="flex flex-col max-h-screen">
          <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
            <h1 className="font-headline text-xl font-semibold">{config.pageTitle}</h1>
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
  
  // Permission check: admin can edit library, company can edit only their custom questions
  if (!session || !question) {
    return <div className="flex min-h-screen items-center justify-center"><p>Access Denied or Question not found.</p></div>;
  }

  // Check if user has permission to edit this question
  let hasPermission = false;
  
  // Check role is allowed
  if (!config.allowedRoles.includes(session.role)) {
    hasPermission = false;
  }
  // Admin can only edit library questions
  else if (config.role === 'admin') {
    hasPermission = question.libraryType === 'library';
  }
  // Company can only edit custom questions that they created
  else if (config.role === 'company') {
    hasPermission = question.libraryType === 'custom' && question.addedBy === session.uid;
  }

  if (!hasPermission) {
    return <div className="flex min-h-screen items-center justify-center"><p>Access Denied.</p></div>;
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
            <h1 className="font-headline text-xl font-semibold">{config.pageTitle}</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
          <form action={formAction}>
            <input type="hidden" name="questionId" value={question.id} />
            <input type="hidden" name="libraryType" value={question.libraryType} />
            <input type="hidden" name="question" value={questionStatement} />
            {languageSnippets.map((snippet, index) => (
                <React.Fragment key={index}>
                    <input type="hidden" name={`language_${index}`} value={snippet.language} />
                    <input type="hidden" name={`functionName_${index}`} value={snippet.functionName} />
                    <input type="hidden" name={`boilerplate_${index}`} value={snippet.boilerplate} />
                </React.Fragment>
            ))}
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
                                <SelectItem value="code">Coding</SelectItem>
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
                    
                    {questionType === 'code' && (
                        <div className="space-y-6 pt-4 border-t">
                            <div>
                                <Label className="text-base font-medium">Language Specific Details</Label>
                                <p className="text-sm text-muted-foreground">Add boilerplate code for each language you want to support.</p>
                            </div>
                            <div className="space-y-4">
                                {languageSnippets.map((snippet, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Select value={snippet.language} onValueChange={(value) => handleSnippetChange(index, 'language', value)}>
                                                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select language" /></SelectTrigger>
                                                <SelectContent>
                                                    {languageOptions.map(option => (
                                                        <SelectItem key={option.id} value={option.value}>{option.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeLanguage(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Function Name</Label>
                                            <Input placeholder="e.g., twoSum" value={snippet.functionName} onChange={(e) => handleSnippetChange(index, 'functionName', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Boilerplate Code</Label>
                                            <CodeEditor language={snippet.language} value={snippet.boilerplate} onChange={(value) => handleSnippetChange(index, 'boilerplate', value)} />
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" variant="link" size="sm" onClick={handleAddLanguage} className="p-0 h-auto">+ Add Language</Button>
                            </div>
                            
                            <div className="space-y-4">
                                <Label className="text-base font-medium">Examples</Label>
                                {examples.map((ex, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between"><Label className="text-xs text-muted-foreground">Example {index + 1}</Label>{examples.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeExample(index)} className="shrink-0 h-6 w-6"><Trash2 className="h-4 w-4 text-destructive" /></Button>}</div>
                                        <div className="flex items-center rounded-md p-1 bg-muted"><Textarea name={`example_input_${index}`} value={ex.input} onChange={(e) => handleExampleChange(index, 'input', e.target.value)} placeholder="Input" rows={2} className="bg-background rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0 !mt-0" /><Textarea name={`example_output_${index}`} value={ex.output} onChange={(e) => handleExampleChange(index, 'output', e.target.value)} placeholder="Output" rows={2} className="bg-background rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0 !mt-0" /></div>
                                    </div>
                                ))}
                                <Button type="button" variant="link" size="sm" onClick={addExample} className="p-0 h-auto">+ Add Example</Button>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-base font-medium">Test Cases</Label>
                                {testCases.map((tc, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between"><Label className="text-xs text-muted-foreground">Test Case {index + 1}</Label><div className="flex items-center gap-2"><div className="flex items-center gap-1.5"><Switch id={`testcase_sample_${index}`} name={`testcase_sample_${index}`} checked={tc.sample} onCheckedChange={(checked) => handleTestCaseChange(index, 'sample', !!checked)} /><Label htmlFor={`testcase_sample_${index}`} className="text-xs font-normal">Sample</Label></div>{testCases.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeTestCase(index)} className="shrink-0 h-6 w-6"><Trash2 className="h-4 w-4 text-destructive" /></Button>}</div></div>
                                        <div className="flex items-center rounded-md p-1 bg-muted"><Textarea name={`testcase_input_${index}`} value={tc.input} onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)} placeholder="Input" rows={2} className="bg-background rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0 !mt-0" /><Textarea name={`testcase_output_${index}`} value={tc.output} onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)} placeholder="Output" rows={2} className="bg-background rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0 !mt-0" /></div>
                                    </div>
                                ))}
                                <Button type="button" variant="link" size="sm" onClick={addTestCase} className="p-0 h-auto">+ Add Test Case</Button>
                            </div>
                            
                             <div className="space-y-2">
                                <Label>Constraints</Label>
                                <div className="space-y-2">{constraints.map((constraint, index) => (<div key={index} className="flex items-center gap-2"><Input name="constraints" placeholder={`Constraint ${index + 1}`} value={constraint} onChange={(e) => handleConstraintChange(index, e.target.value)} />{constraints.length > 1 ? <Button type="button" variant="ghost" size="icon" onClick={() => removeConstraint(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button> : <div className="w-10 h-10"></div>}</div>))}</div>
                                <Button type="button" variant="link" size="sm" onClick={addConstraint} className="p-0 h-auto">+ Add Constraint</Button>
                            </div>
                            <div className="space-y-2">
                                <Label>Hints</Label>
                                <div className="space-y-2">{hints.map((hint, index) => (<div key={index} className="flex items-center gap-2"><Input name="hints" placeholder={`Hint ${index + 1}`} value={hint} onChange={(e) => handleHintChange(index, e.target.value)} />{hints.length > 1 ? <Button type="button" variant="ghost" size="icon" onClick={() => removeHint(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button> : <div className="w-10 h-10"></div>}</div>))}</div>
                                <Button type="button" variant="link" size="sm" onClick={addHint} className="p-0 h-auto">+ Add Hint</Button>
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
