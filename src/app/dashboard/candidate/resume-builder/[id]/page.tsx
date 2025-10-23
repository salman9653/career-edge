
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2, Edit, Trash2, Download, Sparkles, RefreshCw } from 'lucide-react';
import { MobileSearch } from '@/components/mobile-search';
import type { GeneratedResume } from '@/ai/flows/generate-ats-resume-flow-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function GeneratedResumePage() {
    const { session } = useSession();
    const router = useRouter();
    const params = useParams();
    const resumeId = params.id as string;
    
    const [resume, setResume] = useState<GeneratedResume | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(session?.uid && resumeId) {
            const fetchResume = async () => {
                setLoading(true);
                const docRef = doc(db, `users/${session.uid}/generated-resumes`, resumeId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setResume({ id: docSnap.id, ...docSnap.data() } as GeneratedResume);
                }
                setLoading(false);
            }
            fetchResume();
        }
    }, [session, resumeId]);

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
                    <main className="flex-1 p-6 flex items-center justify-center">
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
                    <main className="flex-1 p-6 flex items-center justify-center">
                        <p>Resume not found.</p>
                    </main>
                </div>
            </div>
        )
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <DashboardSidebar role={session?.role || 'candidate'} user={session} />
            <div className="flex flex-col max-h-screen">
                <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="font-headline text-xl font-semibold">{resume.name}</h1>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                        <Button variant="secondary" size="sm"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                        <Button size="sm"><Sparkles className="mr-2 h-4 w-4" /> Regenerate</Button>
                    </div>
                </header>
                <main className="flex-1 overflow-auto custom-scrollbar p-4 md:p-6">
                    <Card>
                        <CardContent className="p-6">
                            <article className="prose dark:prose-invert max-w-full">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {resume.markdownContent}
                                </ReactMarkdown>
                            </article>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
