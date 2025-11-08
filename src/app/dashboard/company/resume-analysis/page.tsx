
'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/use-session';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, LineChart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ResumeAnalysisResult } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MobileSearch } from '@/components/mobile-search';

export default function AllResumeAnalysesPage() {
    const { session, loading: sessionLoading } = useSession();
    const [analyses, setAnalyses] = useState<ResumeAnalysisResult[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!session?.uid) {
            setLoading(false);
            return;
        }

        const companyId = session.role === 'company' ? session.uid : session.company_uid;
        if (!companyId) {
            setLoading(false);
            return;
        }

        const analysesRef = collection(db, `users/${companyId}/resume-analyses`);
        const q = query(analysesRef, orderBy('analyzedAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const analysesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ResumeAnalysisResult));
            setAnalyses(analysesList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching analyses:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [session]);

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        const jsDate = date.toDate ? date.toDate() : new Date(date);
        return formatDistanceToNow(jsDate, { addSuffix: true });
    }

    if (sessionLoading || loading) {
        return (
            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                {session && <DashboardSidebar role={session.role} user={session} />}
                <div className="flex flex-col max-h-screen">
                    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
                        <Skeleton className="h-6 w-48" />
                         <MobileSearch />
                    </header>
                    <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
                       <div className="space-y-4">
                           <Skeleton className="w-full h-24 rounded-lg" />
                           <Skeleton className="w-full h-24 rounded-lg" />
                           <Skeleton className="w-full h-24 rounded-lg" />
                       </div>
                    </main>
                </div>
            </div>
        );
    }
    
    if (!session) {
      router.push('/login');
      return null;
    }
    
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <DashboardSidebar role={session.role} user={session} />
            <div className="flex flex-col max-h-screen">
                <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
                    <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Resume Analyses</h1>
                    <MobileSearch />
                </header>
                <main className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-4">
                        {analyses.length > 0 ? (
                            analyses.map(analysis => (
                                <Link href={`/dashboard/company/resume-analysis/${analysis.id}`} key={analysis.id}>
                                    <Card className="hover:bg-accent transition-colors">
                                        <CardContent className="p-4 grid grid-cols-[1fr_auto] items-center gap-4">
                                            <div>
                                                <p className="font-semibold">{analysis.jobTitle}</p>
                                                <p className="text-sm text-muted-foreground">{analysis.companyName}</p>
                                                <p className="text-xs text-muted-foreground mt-1">Analyzed {formatDate(analysis.analyzedAt)}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-2xl font-bold">{analysis.overallScore}</span>
                                                    <span className="text-xs text-muted-foreground">Score</span>
                                                </div>
                                                <Progress value={analysis.overallScore} className="w-24 h-2" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <LineChart className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">No Analyses Yet</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">Go to a job posting to analyze a resume.</p>
                                    <Button asChild className="mt-6">
                                        <Link href="/dashboard/company/jobs">View Jobs</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
