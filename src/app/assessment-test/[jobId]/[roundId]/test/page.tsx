
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Logo } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Clock, BookCopy, ChevronLeft, ChevronRight, CheckCircle, Info, Link as LinkIcon, Briefcase } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Assessment, Question, Job } from '@/lib/types';
import { submitAssessmentAction } from '@/app/dashboard/candidate/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface TestDetails {
    assessmentName: string;
    jobTitle: string;
    companyName: string;
    companyLogo?: string;
    duration: number; // in minutes
}

const CountdownTimer = ({ minutes, onTimeUp }: { minutes: number, onTimeUp: () => void }) => {
    const totalSeconds = useMemo(() => minutes * 60, [minutes]);
    const [seconds, setSeconds] = useState(totalSeconds);

    useEffect(() => {
        if (seconds <= 0) {
            onTimeUp();
            return;
        }
        const timer = setInterval(() => {
            setSeconds(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds, onTimeUp]);

    const displayMinutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const displaySeconds = (seconds % 60).toString().padStart(2, '0');
    
    const percentage = (seconds / totalSeconds) * 100;
    
    const timerColorClass = useMemo(() => {
        if (percentage <= 20) return 'text-red-500';
        if (percentage <= 40) return 'text-yellow-500';
        return 'text-green-500';
    }, [percentage]);

    return (
        <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Time Remaining</span>
            <span className={cn("font-mono text-2xl font-semibold", timerColorClass)}>{displayMinutes}:{displaySeconds}</span>
        </div>
    );
};

export default function AssessmentTestPage() {
    const params = useParams();
    const router = useRouter();
    const { session, loading: sessionLoading } = useSession();
    const { toast } = useToast();

    const jobId = params.jobId as string;
    const roundId = parseInt(params.roundId as string, 10);

    const [testDetails, setTestDetails] = useState<TestDetails | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        if (session && jobId && roundId) {
            const fetchTest = async () => {
                try {
                    const sessionData = sessionStorage.getItem(`assessment-${jobId}-${roundId}`);
                    if (!sessionData) {
                        setError("Assessment session not found. Please start from the beginning.");
                        setLoading(false);
                        return;
                    }
                    const { assessmentId, assessmentName, jobId: sessionJobId } = JSON.parse(sessionData);

                    if (sessionJobId !== jobId) {
                        setError("Mismatched job ID in session.");
                        setLoading(false);
                        return;
                    }
                    
                    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
                    if (!jobDoc.exists()) {
                        setError("Job not found.");
                        setLoading(false);
                        return;
                    }
                    const jobData = jobDoc.data() as Job;

                    let companyName = 'A Company';
                    let companyLogo: string | undefined;
                    if (jobData.companyId) {
                        const companyDoc = await getDoc(doc(db, 'users', jobData.companyId));
                        if (companyDoc.exists()) {
                            const data = companyDoc.data();
                            companyName = data.name;
                            companyLogo = data.displayImageUrl;
                        }
                    }
                    
                    const assessmentDoc = await getDoc(doc(db, 'assessments', assessmentId));
                     if (!assessmentDoc.exists()) {
                        setError("Assessment not found.");
                        setLoading(false);
                        return;
                    }
                    const assessmentData = assessmentDoc.data() as Assessment;

                    const questionDocs = await Promise.all(
                        assessmentData.questionIds.map(id => getDoc(doc(db, 'questions', id)))
                    );
                    
                    const fetchedQuestions = questionDocs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
                    
                    setTestDetails({
                        assessmentName: assessmentData.name,
                        jobTitle: jobData.title,
                        companyName: companyName,
                        companyLogo,
                        duration: 5, // For development, set to 5 minutes
                    });
                    setQuestions(fetchedQuestions);
                } catch (e: any) {
                    console.error("Error fetching test data:", e);
                    setError("An unexpected error occurred while loading the test.");
                } finally {
                    setLoading(false);
                }
            };
            fetchTest();
        }
    }, [session, jobId, roundId]);
    
    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };
    
    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleTimeUp = () => {
        toast({
            title: "Time's Up!",
            description: "Your assessment will be submitted automatically.",
            variant: "destructive"
        });
        handleSubmit();
    };
    
    const handleSubmit = async () => {
        setIsSubmitting(true);
        if(!session) return;

        const result = await submitAssessmentAction({
            jobId,
            roundId,
            candidateId: session.uid,
            answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
        });
        
        if (result.success) {
            toast({ title: "Assessment Submitted!", description: "Your answers have been recorded." });
            sessionStorage.removeItem(`assessment-${jobId}-${roundId}`);
            router.push('/dashboard/candidate/applications');
        } else {
            toast({ title: "Submission Failed", description: result.error, variant: 'destructive' });
        }
        setIsSubmitting(false);
    };

    const currentQuestion = questions[currentQuestionIndex];
    const getInitials = (name: string | null | undefined) => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    
    if(loading || sessionLoading) {
        return <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if(error) {
         return <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4"><Alert variant="destructive" className="max-w-md"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>
    }

    return (
        <div className="min-h-screen bg-secondary flex flex-col select-none" onContextMenu={(e) => e.preventDefault()}>
            <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b bg-background px-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="font-headline text-lg font-bold text-foreground">Career Edge</span>
                        <Avatar className="h-10 w-10">
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#667EEA] to-[#764BA2] text-white">
                                <Briefcase className="h-5 w-5" />
                            </div>
                        </Avatar>
                    </div>
                    {testDetails && (
                        <>
                            <div className="relative flex items-center">
                                <div className="h-px w-8 bg-border"></div>
                                <div className="h-6 w-6 rounded-full border bg-background flex items-center justify-center absolute left-1/2 -translate-x-1/2">
                                    <LinkIcon className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={testDetails.companyLogo} />
                                    <AvatarFallback>{getInitials(testDetails.companyName)}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-lg">{testDetails.companyName}</span>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="font-semibold text-sm">Hello, {session?.displayName}</p>
                        <p className="text-xs text-muted-foreground">{session?.email}</p>
                    </div>
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={session?.displayImageUrl ?? undefined} />
                        <AvatarFallback>{getInitials(session?.displayName)}</AvatarFallback>
                    </Avatar>
                </div>
            </header>
            
            <main className="flex-1 flex flex-col p-2 gap-2">
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                         <div className="flex-1">
                            <h2 className="font-semibold font-headline text-lg">{testDetails?.assessmentName} - Assessment</h2>
                            <p className="text-xs text-muted-foreground">for {testDetails?.jobTitle} • at {testDetails?.companyName}</p>
                        </div>
                        <div className="flex-1 flex justify-center">
                          {testDetails && <CountdownTimer minutes={testDetails.duration} onTimeUp={handleSubmit} />}
                        </div>
                        <div className="flex-1 flex justify-end">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={isSubmitting}>Finish Test</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to finish?</AlertDialogTitle>
                                    <AlertDialogDescription>You cannot change your answers after submitting. Your test will be graded based on your submitted answers.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleSubmit}>Finish</AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>

                <ResizablePanelGroup direction="horizontal" className="flex-1 gap-2">
                    <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
                       <Card className="h-full flex flex-col">
                           <CardContent className="p-4 flex-1 flex flex-col">
                                <h2 className="font-semibold mb-4 flex items-center gap-2">
                                    <BookCopy className="h-5 w-5" />
                                    Questions ({currentQuestionIndex + 1}/{questions.length})
                                </h2>
                                <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {questions.map((q, index) => (
                                    <Button 
                                        key={q.id}
                                        variant={currentQuestionIndex === index ? 'secondary' : 'ghost'}
                                        className="w-full justify-start gap-3 text-left h-auto py-2"
                                        onClick={() => setCurrentQuestionIndex(index)}
                                    >
                                        <span className={cn("flex items-center justify-center text-xs shrink-0", answers[q.id] && "text-green-500")}>
                                            {answers[q.id] ? <CheckCircle className="w-4 h-4" /> : `${index + 1}.`}
                                        </span>
                                       <span className="truncate flex-1">{q.question}</span>
                                    </Button>
                                ))}
                                </div>
                           </CardContent>
                       </Card>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    <ResizablePanel defaultSize={70}>
                       <Card className="h-full flex flex-col">
                           <CardContent className="p-6 flex-1 flex flex-col">
                               {currentQuestion && (
                                <>
                                <div className="flex-1 space-y-6">
                                    <div className="prose dark:prose-invert max-w-full">
                                        <h3>Question {currentQuestionIndex + 1}</h3>
                                        <p>{currentQuestion.question}</p>
                                    </div>

                                    {currentQuestion.type === 'mcq' && (
                                        <RadioGroup
                                            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                                            value={answers[currentQuestion.id]}
                                            className="space-y-3"
                                        >
                                            {currentQuestion.options?.map((option, i) => (
                                            <Label key={i} className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-muted has-[:checked]:bg-muted has-[:checked]:border-dash-primary">
                                                <RadioGroupItem value={option} id={`${currentQuestion.id}-${i}`} />
                                                <span>{option}</span>
                                            </Label>
                                            ))}
                                        </RadioGroup>
                                    )}

                                    {currentQuestion.type === 'subjective' && (
                                        <Textarea
                                            placeholder="Type your answer here..."
                                            className="min-h-[250px] text-base"
                                            value={answers[currentQuestion.id] || ''}
                                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                        />
                                    )}
                                </div>
                                <div className="flex justify-between items-center pt-6 border-t mt-6">
                                    <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
                                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                                    </Button>
                                    <Button variant="default" onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1}>
                                       Next <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                                </>
                               )}
                               {!currentQuestion && !loading && (
                                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    <Info className="h-10 w-10 text-muted-foreground mb-4"/>
                                    <h3 className="font-semibold text-lg">No Questions Found</h3>
                                    <p className="text-muted-foreground">This assessment does not have any questions configured.</p>
                                  </div>
                               )}
                           </CardContent>
                       </Card>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>
        </div>
    );
}
