'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/use-session';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { ResumeAnalysisResult } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ResumeAnalysisList() {
    const { session, loading: sessionLoading } = useSession();
    const [analyses, setAnalyses] = useState<ResumeAnalysisResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.uid) {
            if (!sessionLoading) setLoading(false);
            return;
        }

        const analysesRef = collection(db, `users/${session.uid}/resume-analyses`);
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
    }, [session?.uid, sessionLoading]);

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        const jsDate = date.toDate ? date.toDate() : new Date(date);
        return formatDistanceToNow(jsDate, { addSuffix: true });
    }

    if (sessionLoading || loading) {
       return (
           <div className="space-y-4">
               <Skeleton className="w-full h-24 rounded-lg" />
               <Skeleton className="w-full h-24 rounded-lg" />
               <Skeleton className="w-full h-24 rounded-lg" />
           </div>
       );
    }
    
    if (!session) return <p>Please login to view analyses.</p>;

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            {analyses.length > 0 ? (
                analyses.map(analysis => (
                    <Link href={`/dashboard/candidate/resume-analysis/${analysis.id}`} key={analysis.id}>
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
                        <p className="mt-1 text-sm text-muted-foreground">Go to a job posting to analyze your resume.</p>
                        <Button asChild className="mt-6">
                            <Link href="/dashboard/candidate/jobs">Find Jobs</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
