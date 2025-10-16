
'use client';
import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, Edit, Trash2, AlertTriangle, Sparkles, ChevronDown, Bot } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { AiInterview } from '@/lib/types';
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
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';

export default function AiInterviewDetailPage() {
    const { session, loading: sessionLoading } = useSession();
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const [interview, setInterview] = useState<AiInterview | null>(null);
    const [editableInterview, setEditableInterview] = useState<AiInterview | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeletePending, startDeleteTransition] = useTransition();
    const [isEditing, setIsEditing] = useState(false);

    const interviewId = params.id as string;

    useEffect(() => {
        if (interviewId) {
            const unsub = onSnapshot(doc(db, "ai-interviews", interviewId), (doc) => {
                if (doc.exists()) {
                    const data = { id: doc.id, ...doc.data() } as AiInterview;
                    setInterview(data);
                    setEditableInterview(data);
                } else {
                    setInterview(null);
                    setEditableInterview(null);
                }
                setLoading(false);
            });
            return () => unsub();
        }
    }, [interviewId]);

    const handleEdit = () => {
        setEditableInterview(interview); // Reset edits on re-entering edit mode
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditableInterview(interview); // Discard changes
    };

    const handleSave = () => {
        // Placeholder for save action
        toast({ title: "Save not implemented yet." });
        // In the future, this would call a server action
        // setInterview(editableInterview);
        // setIsEditing(false);
    };

    const handleDelete = () => {
        // Placeholder for delete action
        toast({ title: 'Delete not implemented yet.'});
        setIsDeleteDialogOpen(false);
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

    if (!session || (interview && interview.createdBy !== session.uid)) {
        return <div className="flex min-h-screen items-center justify-center"><p>Access Denied</p></div>;
    }

    if (!interview || !editableInterview) {
        return <div className="flex min-h-screen items-center justify-center"><p>Interview not found.</p></div>;
    }
    
    const handleInputChange = (field: keyof AiInterview, value: string) => {
        setEditableInterview(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleQuestionChange = (qIndex: number, value: string) => {
        const newQuestions = [...editableInterview.questions];
        newQuestions[qIndex].question = value;
        setEditableInterview(prev => prev ? { ...prev, questions: newQuestions } : null);
    };

    const handleFollowupChange = (qIndex: number, fIndex: number, value: string) => {
        const newQuestions = [...editableInterview.questions];
        newQuestions[qIndex].followUps[fIndex] = value;
        setEditableInterview(prev => prev ? { ...prev, questions: newQuestions } : null);
    };


    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <DashboardSidebar role={session.role} user={session} />
            <div className="flex flex-col max-h-screen">
                <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-2 flex-1">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                            <span className="sr-only">Back</span>
                        </Button>
                        <h1 className="font-headline text-xl font-semibold truncate">{interview.name}</h1>
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="font-headline text-2xl">{interview.jobTitle}</CardTitle>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
                                        <Badge variant="secondary">{interview.difficulty}</Badge>
                                        <Badge variant="outline">{interview.tone}</Badge>
                                        <span>Duration: {interview.duration} mins</span>
                                        <span>Questions: {interview.questionCount}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     {isEditing ? (
                                        <>
                                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                                            <Button onClick={handleSave}>Save Changes</Button>
                                        </>
                                     ) : (
                                        <>
                                            <Button variant="secondary" size="sm" onClick={handleEdit}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </Button>
                                            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <div className="flex justify-center">
                                                            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                                                                <AlertTriangle className="h-6 w-6 text-destructive"/>
                                                            </div>
                                                        </div>
                                                        <AlertDialogTitle className="text-center">Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-center">
                                                            This action cannot be undone. This will permanently delete this interview template.
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
                                        </>
                                     )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Key Skills Probed</h3>
                                <div className="flex flex-wrap gap-2">
                                    {interview.keySkills.map(skill => <Badge key={skill}>{skill}</Badge>)}
                                </div>
                            </div>

                             <div className="prose prose-sm dark:prose-invert max-w-full">
                                <h3 className="font-semibold text-lg">Introductory Script</h3>
                                {isEditing ? (
                                    <Textarea 
                                        value={editableInterview.intro} 
                                        onChange={(e) => handleInputChange('intro', e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                ) : (
                                    <blockquote className="border-l-4 border-dash-primary pl-4 italic">
                                       <p>{interview.intro}</p>
                                    </blockquote>
                                )}
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Interview Questions</h3>
                                {editableInterview.questions.map((q, index) => (
                                    <Card key={index} className="bg-muted/50">
                                        <CardContent className="p-4">
                                            <div className="font-semibold mb-2 flex justify-between items-start">
                                                <div className="flex-1">
                                                    <span className="text-dash-primary mr-2">Q{index + 1}:</span>
                                                    {isEditing ? (
                                                        <Textarea 
                                                            value={q.question} 
                                                            onChange={(e) => handleQuestionChange(index, e.target.value)}
                                                            className="mt-1 bg-background"
                                                        />
                                                    ) : (
                                                        <span>{q.question}</span>
                                                    )}
                                                </div>
                                                {isEditing && (
                                                    <Button variant="ghost" size="icon" disabled title="Regenerate with AI (coming soon)">
                                                        <Sparkles className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <Collapsible>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="link" size="sm" className="p-0 h-auto">
                                                        Show {q.followUps.length} follow-ups <ChevronDown className="ml-1 h-4 w-4" />
                                                    </Button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                     <ul className="mt-2 ml-4 list-disc space-y-2 text-sm text-muted-foreground">
                                                        {q.followUps.map((fu, fuIndex) => (
                                                            <li key={fuIndex}>
                                                                {isEditing ? (
                                                                    <Textarea 
                                                                        value={fu} 
                                                                        onChange={(e) => handleFollowupChange(index, fuIndex, e.target.value)}
                                                                        className="text-xs bg-background"
                                                                        rows={2}
                                                                    />
                                                                ) : (
                                                                    fu
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            
                             <div className="prose prose-sm dark:prose-invert max-w-full">
                                <h3 className="font-semibold text-lg">Concluding Script</h3>
                                {isEditing ? (
                                    <Textarea 
                                        value={editableInterview.outro} 
                                        onChange={(e) => handleInputChange('outro', e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                ) : (
                                    <blockquote className="border-l-4 border-dash-primary pl-4 italic">
                                       <p>{interview.outro}</p>
                                    </blockquote>
                                )}
                            </div>

                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
