
'use client';

import { useState, useEffect, useActionState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2, Edit, Download, Save } from 'lucide-react';
import type { GeneratedResume } from '@/ai/flows/generate-ats-resume-flow-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { updateGeneratedResumeAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useFormStatus } from 'react-dom';

const initialState = {
    error: null,
    success: false,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} size="sm">
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
        </Button>
    )
}

export default function GeneratedResumePage() {
    const { session } = useSession();
    const router = useRouter();
    const params = useParams();
    const resumeId = params.id as string;
    
    const [resume, setResume] = useState<GeneratedResume | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editableContent, setEditableContent] = useState('');
    
    const [state, formAction] = useActionState(updateGeneratedResumeAction, initialState);
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
                    setEditableContent(data.markdownContent);
                }
                setLoading(false);
            }
            fetchResume();
        }
    }, [session, resumeId]);
    
    useEffect(() => {
        if (state.success) {
            toast({ title: "Resume updated successfully!"});
            setIsEditing(false);
        } else if (state.error) {
            toast({ variant: 'destructive', title: "Error", description: state.error });
        }
    }, [state, toast]);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set('content', editableContent);
        formAction(formData);
    };

    if (loading) {
        return (
             <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                <DashboardSidebar role="candidate" user={session} />
                <div className="flex flex-col max-h-screen">
                     <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="font-headline text-xl font-semibold">Generated Resume</h1>
                    </header>
                    <main className="flex-1 p-6 flex items-center justify-center bg-secondary">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </main>
                </div>
            </div>
        )
    }

    if (!resume) {
        return (
             <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                <DashboardSidebar role="candidate" user={session} />
                <div className="flex flex-col max-h-screen">
                     <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="font-headline text-xl font-semibold">Generated Resume</h1>
                    </header>
                    <main className="flex-1 p-6 flex items-center justify-center bg-secondary">
                        <p>Resume not found.</p>
                    </main>
                </div>
            </div>
        )
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <DashboardSidebar role={session?.role || 'candidate'} user={session} />
            <form onSubmit={handleSave} className="flex flex-col max-h-screen w-full">
                 <input type="hidden" name="userId" value={session?.uid} />
                 <input type="hidden" name="resumeId" value={resumeId} />
                <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="font-headline text-xl font-semibold">{resume.name}</h1>
                    </div>
                </header>
                <main className="flex-1 overflow-auto custom-scrollbar p-4 md:p-8 bg-secondary">
                    <Card className="max-w-[8.5in] min-h-[11in] mx-auto bg-card shadow-lg relative group">
                        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             {isEditing ? (
                                <>
                                    <Button variant="ghost" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <SubmitButton />
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" size="sm" type="button" onClick={() => setIsEditing(true)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </Button>
                                    <Button variant="outline" size="sm" type="button" disabled>
                                        <Download className="mr-2 h-4 w-4" /> Download PDF
                                    </Button>
                                </>
                            )}
                        </div>
                        <CardContent className="p-12">
                             {isEditing ? (
                                <RichTextEditor value={editableContent} onChange={setEditableContent} />
                             ) : (
                                <article className="prose dark:prose-invert max-w-full prose-sm md:prose-base">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {resume.markdownContent}
                                    </ReactMarkdown>
                                </article>
                             )}
                        </CardContent>
                    </Card>
                </main>
            </form>
        </div>
    );
}
