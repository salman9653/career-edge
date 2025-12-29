
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2, Download, Trash2, AlertTriangle } from 'lucide-react';
import type { GeneratedResume } from '@/ai/flows/generate-ats-resume-flow-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { deleteGeneratedResumeAction } from '@/app/actions';
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

export default function GeneratedResumePage() {
    const { session } = useSession();
    const router = useRouter();
    const params = useParams();
    const resumeId = params.id as string;
    
    const [resume, setResume] = useState<GeneratedResume | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, startDeleteTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        if(session?.uid && resumeId) {
            const fetchResume = async () => {
                setLoading(true);
                const docRef = doc(db, `users/${session.uid}/generated-resumes`, resumeId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() } as GeneratedResume;
                    setResume(data);
                }
                setLoading(false);
            }
            fetchResume();
        }
    }, [session, resumeId]);

    const handlePrint = () => {
        window.print();
    };

    const handleDelete = () => {
        if (!session?.uid) return;
        startDeleteTransition(async () => {
            const result = await deleteGeneratedResumeAction(resumeId, session.uid);
            if(result.success) {
                toast({ title: "Resume deleted successfully!" });
                router.push('/dashboard/candidate/resume-builder');
            } else if ('error' in result) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
        })
    }

    if (loading) {
        return (
             <>
                 <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="font-headline text-xl font-semibold">Generated Resume</h1>
                    </header>
                     <main className="flex-1 p-6 flex items-center justify-center bg-secondary">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </main>
             </>
        )
    }

    if (!resume) {
        return (
             <>
                 <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="font-headline text-xl font-semibold">Generated Resume</h1>
                    </header>
                    <main className="flex-1 p-6 flex items-center justify-center bg-secondary">
                        <p>Resume not found.</p>
                    </main>
             </>
        )
    }

    return (
        <>
             <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="font-headline text-xl font-semibold">{resume.name}</h1>
                    </div>
                </header>
                <main className="flex-1 overflow-auto custom-scrollbar p-4 md:p-8 bg-secondary">
                    <Card id="printable-resume" className={cn("force-light max-w-[8.5in] min-h-[11in] mx-auto shadow-lg print:shadow-none print:border-none relative")}>
                        <div className="absolute top-4 right-4 flex items-center gap-2 print:hidden">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
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
                                            This action cannot be undone. This will permanently delete this resume.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrint}>
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardContent className="p-12">
                            <article className="prose max-w-full prose-sm md:prose-base prose-headings:font-headline prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {resume.markdownContent}
                                </ReactMarkdown>
                            </article>
                        </CardContent>
                    </Card>
                </main>
        </>
    );
}
