
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Logo } from '@/components/logo';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Calendar, Clock, AlertTriangle, Play } from 'lucide-react';
import { format } from 'date-fns';
import type { Job, Applicant, Schedule, Round } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface AssessmentDetails {
    jobTitle: string;
    companyName: string;
    companyLogo?: string;
    roundName: string;
    assessmentName: string;
    dueDate: Date;
    hasExpired: boolean;
}

export default function AssessmentStartPage() {
    const params = useParams();
    const router = useRouter();
    const { session, loading: sessionLoading } = useSession();
    const { toast } = useToast();

    const jobId = params.jobId as string;
    const roundId = params.roundId as string;
    
    const [assessmentDetails, setAssessmentDetails] = useState<AssessmentDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        if (sessionLoading) return;
        
        if (!session || session.role !== 'candidate') {
            router.replace('/login');
            return;
        }

        if (jobId && roundId && session.uid) {
            const fetchAssessmentData = async () => {
                try {
                    const jobDocRef = doc(db, 'jobs', jobId);
                    const applicantDocRef = doc(db, 'jobs', jobId, 'applicants', session.uid);
                    
                    const [jobDoc, applicantDoc] = await Promise.all([
                        getDoc(jobDocRef),
                        getDoc(applicantDocRef)
                    ]);
                    
                    if (!jobDoc.exists() || !applicantDoc.exists()) {
                        setError("Assessment details could not be found. Please check the link or contact support.");
                        setLoading(false);
                        return;
                    }
                    
                    const jobData = jobDoc.data() as Job;
                    const applicantData = applicantDoc.data() as Applicant;

                    const numericRoundId = parseInt(roundId, 10);
                    const schedule = applicantData.schedules?.find(s => s.roundId === numericRoundId);
                    const round = jobData.rounds.find(r => r.id === numericRoundId);
                    
                    if (!schedule || !round) {
                        setError("This assessment round is not scheduled for you.");
                        setLoading(false);
                        return;
                    }

                    let companyName = 'A Company';
                    let companyLogo: string | undefined;

                    if (jobData.companyId) {
                        const companyDoc = await getDoc(doc(db, 'users', jobData.companyId));
                        if(companyDoc.exists()) {
                            const companyData = companyDoc.data();
                            companyName = companyData.name;
                            companyLogo = companyData.displayImageUrl;
                        }
                    }
                    
                    const dueDate = schedule.dueDate.toDate ? schedule.dueDate.toDate() : new Date(schedule.dueDate);
                    const hasExpired = new Date() > dueDate;
                    
                    const details: AssessmentDetails = {
                        jobTitle: jobData.title,
                        companyName,
                        companyLogo,
                        roundName: round.name,
                        assessmentName: round.assessmentName || 'Assessment',
                        dueDate,
                        hasExpired,
                    };
                    
                    setAssessmentDetails(details);
                    sessionStorage.setItem(`assessment-${jobId}-${roundId}`, JSON.stringify({
                        assessmentId: round.assessmentId,
                        assessmentName: round.assessmentName,
                        jobId,
                        roundId,
                    }));

                } catch(e: any) {
                    console.error("Error fetching assessment details:", e);
                    setError("An unexpected error occurred.");
                } finally {
                    setLoading(false);
                }
            };
            fetchAssessmentData();
        }

    }, [session, sessionLoading, router, jobId, roundId]);
    
    const handleStartAssessment = () => {
        router.push(`/assessment-test/${jobId}/${roundId}/setup`);
    };

    const getInitials = (name: string) => {
        if (!name) return '';
        const names = name.split(' ');
        return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
    }

    const renderContent = () => {
        if (loading || sessionLoading) {
            return (
                <div className="flex flex-col items-center justify-center gap-2 text-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Loading assessment details...</p>
                </div>
            );
        }

        if (error) {
             return (
                <div className="text-center p-8">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-destructive"/>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold">An Error Occurred</h2>
                    <p className="text-muted-foreground mt-2">{error}</p>
                    <Button onClick={() => router.push('/dashboard')} className="mt-6">Go to Dashboard</Button>
                </div>
            );
        }

        if (assessmentDetails) {
            return (
                <>
                    <CardHeader className="text-center items-center">
                        <Avatar className="h-16 w-16 mb-2">
                           <AvatarImage src={assessmentDetails.companyLogo} />
                           <AvatarFallback>{getInitials(assessmentDetails.companyName)}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="font-headline text-3xl">{assessmentDetails.assessmentName} - Assessment</CardTitle>
                        <CardDescription>
                            for {assessmentDetails.jobTitle} • at {assessmentDetails.companyName}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-center gap-8 text-center text-sm">
                            <div className="flex flex-col items-center gap-1">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">{format(assessmentDetails.dueDate, "dd MMM yyyy")}</span>
                                <span className="text-xs text-muted-foreground">Due Date</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">{format(assessmentDetails.dueDate, "h:mm a")}</span>
                                <span className="text-xs text-muted-foreground">Due Time</span>
                            </div>
                        </div>

                         {assessmentDetails.hasExpired ? (
                            <div className="text-center p-4 bg-destructive/10 rounded-lg">
                                <p className="font-semibold text-destructive">The due date for this assessment has passed.</p>
                                <p className="text-sm text-destructive/80">Please contact the recruiter for more information.</p>
                            </div>
                        ) : null}
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full" 
                            disabled={assessmentDetails.hasExpired}
                            onClick={handleStartAssessment}
                        >
                            <Play className="mr-2 h-4 w-4" />
                            Start Assessment
                        </Button>
                    </CardFooter>
                </>
            )
        }

        return null;
    }

    return (
        <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
            <div className="mb-8">
                <Logo />
            </div>
            <Card className="w-full max-w-lg">
                {renderContent()}
            </Card>
        </div>
    );
}
