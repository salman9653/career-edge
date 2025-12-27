

'use client';
import { useEffect, useState, useMemo, useContext, useActionState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { ArrowLeft, PlusCircle, Edit, Trash2, Loader2, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Assessment, Question } from '@/lib/types';
import { QuestionContext } from '@/context/question-context';
import { SelectQuestionsTable } from '@/components/questions/select-questions-table';
import { QuestionsTable } from '@/components/questions/questions-table';
import { useFormStatus } from 'react-dom';
import { updateAssessmentQuestionsAction, deleteAssessmentAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
} from "@/components/ui/alert-dialog";
import { EditAssessmentDialog } from '../../../assessments/_components/edit-assessment-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface UpdateAssessmentQuestionsState {
  error?: string | null;
  success?: boolean;
}

const initialState: UpdateAssessmentQuestionsState = {
  error: null,
  success: false,
};

function SaveQuestionsButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Save Questions to Assessment'}
    </Button>
  );
}

const AssessmentStats = ({ questions }: { questions: Question[] }) => {
    const totalQuestions = questions.length;

    const difficultyCounts = questions.reduce((acc, q) => {
        if (q.difficulty === 1) acc.easy++;
        else if (q.difficulty === 2) acc.medium++;
        else if (q.difficulty === 3) acc.hard++;
        return acc;
    }, { easy: 0, medium: 0, hard: 0 });
    
    const easyPercent = totalQuestions > 0 ? Math.round((difficultyCounts.easy / totalQuestions) * 100) : 0;
    const mediumPercent = totalQuestions > 0 ? Math.round((difficultyCounts.medium / totalQuestions) * 100) : 0;
    const hardPercent = totalQuestions > 0 ? Math.round((difficultyCounts.hard / totalQuestions) * 100) : 0;

    const uniqueCategories = new Set(questions.flatMap(q => q.category));
    const totalCategories = uniqueCategories.size;

    return (
        <div className="text-sm text-muted-foreground flex flex-col md:flex-row items-start md:items-center">
            <span>
                <span className="font-bold text-foreground">{totalQuestions.toString().padStart(2, '0')} questions</span> added from <span className="font-bold text-foreground">{totalCategories.toString().padStart(2, '0')} categories</span>
            </span>
            <span className="mx-2 hidden md:inline">|</span>
            <div className="flex gap-2 items-center">
                <span className="text-green-600 dark:text-green-400 font-medium">{easyPercent}% easy</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">{mediumPercent}% medium</span>
                <span className="text-red-600 dark:text-red-400 font-medium">{hardPercent}% hard</span>
            </div>
        </div>
    );
};

export default function AssessmentDetailPage() {
    const { session, loading: sessionLoading } = useSession();
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { questions: allQuestions, loading: questionsLoading } = useContext(QuestionContext);
    
    const [state, formAction] = useActionState<UpdateAssessmentQuestionsState, FormData>(updateAssessmentQuestionsAction, initialState);
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeletePending, startDeleteTransition] = useTransition();

    const [newlySelectedQuestions, setNewlySelectedQuestions] = useState<Question[]>([]);

    const assessmentId = params.id as string;

    useEffect(() => {
        if (assessmentId) {
            const unsub = onSnapshot(doc(db, "assessments", assessmentId), (doc) => {
                if (doc.exists()) {
                    const data = doc.data() as Omit<Assessment, 'id'>;
                    const loadedAssessment = { id: doc.id, ...data };
                    setAssessment(loadedAssessment);
                    if (loadedAssessment.questionIds.length === 0) {
                        setIsSheetOpen(true);
                    }
                } else {
                    setAssessment(null);
                }
                setLoading(false);
            });
            return () => unsub();
        }
    }, [assessmentId]);

    useEffect(() => {
        if(state.success) {
            toast({ title: "Assessment updated successfully!" });
            setIsSheetOpen(false);
            setNewlySelectedQuestions([]); // Clear new selections after saving
        }
    }, [state.success, toast]);

    const { libraryQuestions, customQuestions } = useMemo(() => {
        const typeFilter = (q: Question) => {
            if (!assessment || assessment.assessmentType === 'mixed') return true;
            return q.type === assessment.assessmentType;
        };

        const libraryQs = allQuestions.filter(q => q.libraryType === 'library' && q.status === 'active' && typeFilter(q));
        const customQs = session?.uid ? allQuestions.filter(q => q.libraryType === 'custom' && q.addedBy === session.uid && q.status === 'active' && typeFilter(q)) : [];
        return { libraryQuestions: libraryQs, customQuestions: customQs };
    }, [allQuestions, session?.uid, assessment]);
    
    const handleSelectQuestion = (question: Question, isSelected: boolean) => {
        setNewlySelectedQuestions(prev =>
            isSelected ? [...prev, question] : prev.filter(q => q.id !== question.id)
        );
    };
    
    const handleDelete = () => {
        startDeleteTransition(async () => {
            const result = await deleteAssessmentAction(assessmentId);
            if(result?.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Success', description: 'Assessment deleted successfully.' });
            }
        });
    }

    if (sessionLoading || loading) {
         return (
            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                {session && <DashboardSidebar role={session.role} user={session} />}
                <div className="flex flex-col max-h-screen">
                    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                        <Skeleton className="h-6 w-48" />
                    </header>
                    <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
                       <Skeleton className="w-full h-12 rounded-lg" />
                       <Skeleton className="w-full h-[300px] rounded-lg" />
                    </main>
                </div>
            </div>
        )
    }

    if (!session || (assessment && assessment.createdBy !== session.uid)) {
        return <div className="flex min-h-screen items-center justify-center"><p>Access Denied</p></div>;
    }

    if (!assessment) {
        return <div className="flex min-h-screen items-center justify-center"><p>Assessment not found.</p></div>;
    }
    
    const assessmentQuestions = allQuestions.filter(q => assessment.questionIds.includes(q.id));
    const allSelectedQuestionIds = [...assessment.questionIds, ...newlySelectedQuestions.map(q => q.id)];
    const finalSelectedQuestionIds = [...new Set(allSelectedQuestionIds)];

    return (
        <>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent className="w-full sm:max-w-4xl p-0 flex flex-col">
                <SheetHeader className="p-6 pb-4 border-b">
                    <SheetTitle className="font-headline text-2xl">Add Questions to Assessment</SheetTitle>
                    <SheetDescription>Select questions from the library or your custom questions.</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                    <Tabs defaultValue="library" className="flex flex-col h-full">
                        <TabsList className="mb-4 self-start">
                            <TabsTrigger value="library">Library Questions</TabsTrigger>
                            <TabsTrigger value="custom">My Custom Questions</TabsTrigger>
                        </TabsList>
                        <TabsContent value="library" className="flex-1 overflow-hidden">
                            <SelectQuestionsTable 
                                questions={libraryQuestions} 
                                loading={questionsLoading} 
                                existingQuestionIds={assessment.questionIds}
                                newlySelectedQuestionIds={newlySelectedQuestions.map(q => q.id)}
                                onSelectQuestion={handleSelectQuestion}
                            />
                        </TabsContent>
                        <TabsContent value="custom" className="flex-1 overflow-hidden">
                             <SelectQuestionsTable 
                                questions={customQuestions} 
                                loading={questionsLoading} 
                                existingQuestionIds={assessment.questionIds}
                                newlySelectedQuestionIds={newlySelectedQuestions.map(q => q.id)}
                                onSelectQuestion={handleSelectQuestion}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
                <SheetFooter className="p-6 pt-4 border-t bg-background">
                     <form action={formAction} className="w-full flex justify-between items-center">
                        <div>
                           {newlySelectedQuestions.length > 0 && <p className="text-sm font-medium">{newlySelectedQuestions.length} new questions selected</p>}
                        </div>
                        <div>
                            <input type="hidden" name="assessmentId" value={assessmentId} />
                            {finalSelectedQuestionIds.map(id => <input key={id} type="hidden" name="questionIds" value={id} />)}
                            {state.error && <Alert variant="destructive" className="mb-4"><AlertDescription>{state.error}</AlertDescription></Alert>}
                            <SaveQuestionsButton />
                        </div>
                    </form>
                </SheetFooter>
            </SheetContent>
        </Sheet>
        
        <EditAssessmentDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            assessment={assessment}
        />
        
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <DashboardSidebar role={session.role} user={session} />
            <div className="flex flex-col max-h-screen">
                <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-2 flex-1">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/company/templates')}>
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Back</span>
                        </Button>
                        <h1 className="font-headline text-xl font-semibold truncate">{assessment.name}</h1>
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 custom-scrollbar">
                    <div className="flex flex-col md:hidden gap-4">
                        <Card className="relative bg-muted">
                             <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)} className="absolute top-2 right-2 text-dash-primary">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <CardContent className="p-4 space-y-1">
                                <p className="text-sm"><span className="text-muted-foreground">Assessment Name:</span> <span className="font-semibold">{assessment.name}</span></p>
                                <p className="text-sm"><span className="text-muted-foreground">Assessment Type:</span> <span className="font-semibold capitalize">{assessment.assessmentType}</span></p>
                            </CardContent>
                        </Card>
                         <div className="flex items-center gap-2 w-full">
                             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="w-full">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this assessment and all of its associated data.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} disabled={isDeletePending} className="bg-destructive hover:bg-destructive/90">
                                            {isDeletePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button size="sm" onClick={() => setIsSheetOpen(true)} className="w-full">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Questions
                            </Button>
                        </div>
                    </div>
                    <div className="hidden md:flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4">
                        <div className="flex items-center bg-muted text-sm rounded-full w-full md:w-auto">
                            <div className="flex items-center gap-2 p-2 px-4">
                                <span className="text-muted-foreground">Assessment Name:</span>
                                <span className="font-semibold">{assessment.name}</span>
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex items-center gap-2 p-2 px-4">
                                <span className="text-muted-foreground">Assessment Type:</span>
                                <span className="font-semibold capitalize">{assessment.assessmentType}</span>
                            </div>
                            <Separator orientation="vertical" className="h-full hidden md:block" />
                            <div className="pr-2 hidden md:block">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)} className="h-10 w-10 rounded-full text-dash-primary">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Edit assessment details</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="w-full md:w-auto">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this assessment and all of its associated data.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} disabled={isDeletePending} className="bg-destructive hover:bg-destructive/90">
                                            {isDeletePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button size="sm" onClick={() => setIsSheetOpen(true)} className="w-full md:w-auto">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Questions
                            </Button>
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-2">
                            <h2 className="text-lg font-semibold">Questions in this Assessment</h2>
                            {assessmentQuestions.length > 0 && <AssessmentStats questions={assessmentQuestions} />}
                        </div>
                        <div>
                            {assessmentQuestions.length > 0 ? (
                                <QuestionsTable questions={assessmentQuestions} loading={questionsLoading} context="assessment" />
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                    <Info className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">No Questions Yet</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">Click "Add Questions" to start building your assessment.</p>
                                    <Button className="mt-6" onClick={() => setIsSheetOpen(true)}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Questions
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
        </>
    );
}
