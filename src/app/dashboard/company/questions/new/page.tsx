'use client';

import { useActionState, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { addQuestionAction, generateQuestionsAction } from '@/app/actions';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Loader2, Plus, Trash2, Sparkles, CheckCircle } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { GradientButton } from '@/components/ui/gradient-button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';

const addInitialState = {
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

const aiInitialState: {
  error?: string | null;
  success: boolean;
  numQuestions?: number;
  questionType?: string;
  difficulty?: string;
} = {
  error: null,
  success: false,
};

export default function AddCompanyQuestionPage() {
  const { session, loading } = useSession();
  const [addState, addFormAction] = useActionState(addQuestionAction, addInitialState);
  const [aiState, aiFormAction] = useActionState(generateQuestionsAction, aiInitialState);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [questionStatement, setQuestionStatement] = useState('');
  const [questionType, setQuestionType] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [isGeneratedQuestionsDialogOpen, setIsGeneratedQuestionsDialogOpen] = useState(false);
  
  const [examples, setExamples] = useState([{ input: '', output: '', explanation: '' }]);
  const [testCases, setTestCases] = useState([{ input: '', output: '' }]);
  const [constraints, setConstraints] = useState(['']);
  const [hints, setHints] = useState(['']);

  const from = searchParams.get('from');

  useEffect(() => {
    if (aiState.success) {
      setIsGeneratedQuestionsDialogOpen(true);
    } else if (aiState.error) {
      toast({ variant: 'destructive', title: 'Generation Failed', description: aiState.error });
    }
  }, [aiState, toast]);
  
  useEffect(() => {
    if(addState.success) {
      toast({ title: "Question added", description: "The new question has been added to your custom library." });
      router.push('/dashboard/company/questions?tab=custom');
    }
  }, [addState.success, router, toast]);

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
      setOptions(options.filter((_, i) => i !== index));
    }
  };

   const handleExampleChange = (index: number, field: 'input' | 'output' | 'explanation', value: string) => {
    const newExamples = [...examples];
    newExamples[index][field] = value;
    setExamples(newExamples);
  };

  const addExample = () => setExamples([...examples, { input: '', output: '', explanation: '' }]);
  const removeExample = (index: number) => setExamples(examples.filter((_, i) => i !== index));

  const handleTestCaseChange = (index: number, field: 'input' | 'output', value: string) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  const addTestCase = () => setTestCases([...testCases, { input: '', output: '' }]);
  const removeTestCase = (index: number) => setTestCases(testCases.filter((_, i) => i !== index));

  const handleConstraintChange = (index: number, value: string) => {
    const newConstraints = [...constraints];
    newConstraints[index] = value;
    setConstraints(newConstraints);
  };

  const addConstraint = () => setConstraints([...constraints, '']);
  const removeConstraint = (index: number) => {
    if (constraints.length > 1) {
        setConstraints(constraints.filter((_, i) => i !== index));
    }
  };

  const handleHintChange = (index: number, value: string) => {
    const newHints = [...hints];
    newHints[index] = value;
    setHints(newHints);
  };

  const addHint = () => setHints([...hints, '']);
  const removeHint = (index: number) => {
    if (hints.length > 1) {
        setHints(hints.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;
  }
  if (!session || (session.role !== 'company' && session.role !== 'admin' && session.role !== 'manager')) {
    return <div className="flex min-h-screen items-center justify-center"><p>Access Denied</p></div>;
  }

  const libraryType = session.role === 'admin' ? 'library' : 'custom';
  
  const handleGoToQuestions = () => {
      const tab = libraryType === 'custom' ? 'custom' : 'library';
      const sort = 'createdAt:desc';
      router.push(`/dashboard/company/questions?tab=${tab}&sort=${sort}`);
  }

  return (
    <>
    <AlertDialog open={isGeneratedQuestionsDialogOpen} onOpenChange={setIsGeneratedQuestionsDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <div className="flex justify-center mb-2">
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-500"/>
                    </div>
                </div>
                <AlertDialogTitle className="text-center">Questions Generated!</AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                    Successfully generated {aiState.numQuestions} {aiState.questionType} questions with {aiState.difficulty} difficulty.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center gap-2">
                <Button onClick={() => setIsGeneratedQuestionsDialogOpen(false)} variant="outline">Generate More</Button>
                <Button onClick={handleGoToQuestions}>Go to Questions List</Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

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
        <main className="flex flex-1 flex-col gap-2 overflow-auto p-4 md:p-6 custom-scrollbar">
          <div className="flex gap-2 w-full h-full">
            <div className="w-[60%] h-full">
              <form action={addFormAction} className="w-full h-full">
                <input type="hidden" name="question" value={questionStatement} />
                <input type="hidden" name="libraryType" value={libraryType} />
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
                             <RichTextEditor value={questionStatement} onChange={setQuestionStatement} />
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
                                    <SelectItem value="code">Coding</SelectItem>
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
                        
                        {questionType === 'code' && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="functionName">Function Name</Label>
                                    <Input id="functionName" name="functionName" placeholder="e.g., twoSum" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Constraints</Label>
                                    <div className="space-y-2">
                                    {constraints.map((constraint, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                        <Input
                                            name="constraints"
                                            placeholder={`Constraint ${index + 1}`}
                                            value={constraint}
                                            onChange={(e) => handleConstraintChange(index, e.target.value)}
                                        />
                                        {constraints.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeConstraint(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                        </div>
                                    ))}
                                    </div>
                                    <Button type="button" variant="link" size="sm" onClick={addConstraint} className="p-0 h-auto">
                                    + Add Constraint
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label>Hints</Label>
                                    <div className="space-y-2">
                                    {hints.map((hint, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                        <Input
                                            name="hints"
                                            placeholder={`Hint ${index + 1}`}
                                            value={hint}
                                            onChange={(e) => handleHintChange(index, e.target.value)}
                                        />
                                        {hints.length > 1 ? (
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeHint(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        ) : <div className="w-10 h-10"></div>}
                                        </div>
                                    ))}
                                    </div>
                                    <Button type="button" variant="link" size="sm" onClick={addHint} className="p-0 h-auto">
                                    + Add Hint
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="boilerplate">Boilerplate Code</Label>
                                    <Textarea id="boilerplate" name="boilerplate" placeholder="function twoSum(nums, target) {&#10;  // Your code here&#10;}" className="min-h-[120px] font-mono" />
                                </div>
                                 <div className="space-y-4">
                                    <Label>Examples</Label>
                                    {examples.map((ex, index) => (
                                        <div key={index} className="p-3 border rounded-md space-y-2 relative">
                                            {examples.length > 1 && <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeExample(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                                            <Label htmlFor={`example-input-${index}`} className="text-xs">Input</Label>
                                            <Textarea id={`example-input-${index}`} name={`example_input_${index}`} value={ex.input} onChange={(e) => handleExampleChange(index, 'input', e.target.value)} placeholder="e.g., nums = [2,7,11,15], target = 9" rows={2} />
                                            <Label htmlFor={`example-output-${index}`} className="text-xs">Output</Label>
                                            <Textarea id={`example-output-${index}`} name={`example_output_${index}`} value={ex.output} onChange={(e) => handleExampleChange(index, 'output', e.target.value)} placeholder="e.g., [0,1]" rows={1} />
                                            <Label htmlFor={`example-explanation-${index}`} className="text-xs">Explanation (Optional)</Label>
                                            <Textarea id={`example-explanation-${index}`} name={`example_explanation_${index}`} value={ex.explanation} onChange={(e) => handleExampleChange(index, 'explanation', e.target.value)} placeholder="e.g., Because nums[0] + nums[1] == 9, we return [0, 1]." rows={2} />
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={addExample}><Plus className="mr-2 h-4 w-4" /> Add Example</Button>
                                </div>
                                 <div className="space-y-4">
                                    <Label>Test Cases</Label>
                                    {testCases.map((tc, index) => (
                                        <div key={index} className="p-3 border rounded-md space-y-2 relative">
                                            {testCases.length > 1 && <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeTestCase(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                                            <Label htmlFor={`testcase-input-${index}`} className="text-xs">Input</Label>
                                            <Textarea id={`testcase-input-${index}`} name={`testcase_input_${index}`} value={tc.input} onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)} placeholder="e.g., [3,2,4], 6" rows={2} />
                                            <Label htmlFor={`testcase-output-${index}`} className="text-xs">Expected Output</Label>
                                            <Textarea id={`testcase-output-${index}`} name={`testcase_output_${index}`} value={tc.output} onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)} placeholder="e.g., [1,2]" rows={1} />
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={addTestCase}><Plus className="mr-2 h-4 w-4" /> Add Test Case</Button>
                                </div>
                            </div>
                        )}

                        {addState?.error && <p className="text-sm text-destructive mt-4">{addState.error}</p>}
                
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="secondary">Preview</Button>
                            <SubmitButton />
                        </div>
                    </CardContent>
                </Card>
              </form>
            </div>
            <div className="w-[40%] h-full rounded-lg p-0.5 bg-gradient-to-br from-purple-500 to-pink-500">
                <Card className="h-full flex flex-col w-full">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Generate Questions with AI</CardTitle>
                        <CardDescription>Describe what you're looking for, and let AI do the work.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1 overflow-auto custom-scrollbar">
                        <form action={aiFormAction}>
                            <input type="hidden" name="addedBy" value={session.uid} />
                            <input type="hidden" name="addedByName" value={session.displayName} />
                            <input type="hidden" name="libraryType" value={libraryType} />
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ai-job-title">Job Title</Label>
                                    <Input id="ai-job-title" name="ai-job-title" placeholder="e.g., Senior Frontend Developer" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ai-skills">Key Skills (comma-separated)</Label>
                                    <Input id="ai-skills" name="ai-skills" placeholder="e.g., React, TypeScript, GraphQL" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ai-question-type">Question Type</Label>
                                    <Select name="ai-question-type" required>
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
                                        <Input id="ai-num-questions" name="ai-num-questions" type="number" min="1" max="10" placeholder="5" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ai-difficulty">Difficulty</Label>
                                        <Select name="ai-difficulty" required>
                                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Easy">Easy</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="Hard">Hard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                <AiGenerateButton />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
