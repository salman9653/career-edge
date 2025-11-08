
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ArrowLeft, TrendingUp, TrendingDown, Lightbulb, Trophy, Target, Star, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { ResumeAnalysisResult } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';


const ScoreRing = ({ score }: { score: number }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;

    let colorClass = 'text-green-500';
    if (score < 75) colorClass = 'text-yellow-500';
    if (score < 50) colorClass = 'text-red-500';

    return (
        <div className="relative h-40 w-40">
            <svg className="absolute top-0 left-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                    className="text-muted"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
                <circle
                    className={colorClass}
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                        transition: 'stroke-dashoffset 0.5s ease-out',
                    }}
                />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold">{score}</div>
        </div>
    )
}


export default function ResumeAnalysisDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { session, loading: sessionLoading } = useSession();
    const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);

    const analysisId = params.id as string;

    useEffect(() => {
        if (!session?.uid || !analysisId) {
            setLoading(false);
            return;
        }

        const companyId = session.role === 'company' ? session.uid : session.company_uid;
        if (!companyId) {
            setLoading(false);
            return;
        }

        const fetchAnalysis = async () => {
            const docRef = doc(db, `users/${companyId}/resume-analyses`, analysisId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setAnalysis({ id: docSnap.id, ...docSnap.data() } as ResumeAnalysisResult);
            } else {
                console.log("No such document!");
            }
            setLoading(false);
        };

        fetchAnalysis();
    }, [session, analysisId]);

     if (sessionLoading || loading) {
        return (
             <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                {session && <DashboardSidebar role={session.role} user={session} />}
                <div className="flex flex-col max-h-screen">
                    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                         <Skeleton className="h-6 w-48" />
                    </header>
                    <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
                       <Skeleton className="w-full h-full rounded-lg" />
                    </main>
                </div>
            </div>
        )
    }

    if (!analysis) {
        return (
            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                {session && <DashboardSidebar role={session.role} user={session} />}
                <div className="flex flex-col max-h-screen">
                     <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="font-headline text-xl font-semibold">Resume Analysis</h1>
                    </header>
                    <main className="flex-1 flex items-center justify-center p-4">
                        <p>Analysis not found.</p>
                    </main>
                </div>
            </div>
        )
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <DashboardSidebar role={session?.role || 'company'} user={session} />
             <div className="flex flex-col max-h-screen">
                <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="font-headline text-xl font-semibold">Resume Analysis</h1>
                </header>
                <main className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <Card>
                            <CardHeader>
                                 <CardTitle className="font-headline text-2xl">
                                    Analysis for: 
                                    <Link href={`/dashboard/company/jobs/${analysis.jobId}`} className="ml-2 text-dash-primary hover:underline">
                                        {analysis.jobTitle}
                                    </Link>
                                </CardTitle>
                                <CardDescription>at {analysis.companyName}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col md:flex-row items-center gap-8">
                                <ScoreRing score={analysis.overallScore} />
                                <div className="flex-1 w-full space-y-4">
                                     <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <Label className="text-sm">Skills Match</Label>
                                            <span className="text-sm font-medium">{analysis.ratings.skills}%</span>
                                        </div>
                                        <Progress value={analysis.ratings.skills} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <Label className="text-sm">Experience Match</Label>
                                            <span className="text-sm font-medium">{analysis.ratings.experience}%</span>
                                        </div>
                                        <Progress value={analysis.ratings.experience} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <Label className="text-sm">Qualifications Match</Label>
                                            <span className="text-sm font-medium">{analysis.ratings.qualifications}%</span>
                                        </div>
                                        <Progress value={analysis.ratings.qualifications} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> AI Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{analysis.summary}</p>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-500"/> Strengths</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {analysis.pros.map((pro, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                                <span className="text-sm text-muted-foreground">{pro}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><TrendingDown className="h-5 w-5 text-red-500"/> Areas for Improvement</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {analysis.cons.map((con, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                 <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                                                 <span className="text-sm text-muted-foreground">{con}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-yellow-500"/> Actionable Suggestions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                 <ul className="space-y-3">
                                    {analysis.improvements.map((imp, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Star className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                                            <span className="text-sm text-muted-foreground">{imp}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}
