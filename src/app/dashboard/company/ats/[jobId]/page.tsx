'use client';
import { useState, useMemo, useEffect, useTransition } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, LayoutGrid, List, SquareArrowOutUpRight, Loader2, MoreVertical, UserPlus, CalendarClock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ApplicantsTable } from './_components/applicants-table';
import Link from 'next/link';
import { doc, getDoc, onSnapshot, Unsubscribe, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Job, Applicant } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { scheduleNextRoundAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface SuccessInfo {
    roundName: string;
    roundType: string;
    dueDate: string | null;
}

export default function JobPipelinePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { session } = useSession();
    const jobId = params.jobId as string;
    const { toast } = useToast();

    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('list');
    const [job, setJob] = useState<Job | null>(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isScheduling, startSchedulingTransition] = useTransition();

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);

    useEffect(() => {
        let jobUnsub: Unsubscribe | undefined;
        let applicantsUnsub: Unsubscribe | undefined;

        if (jobId) {
            setLoading(true);
            const jobDocRef = doc(db, 'jobs', jobId);
            jobUnsub = onSnapshot(jobDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    setJob({ id: docSnap.id, ...docSnap.data() } as Job);
                } else {
                    setJob(null);
                }
            });

            const applicantsColRef = collection(db, 'jobs', jobId, 'applicants');
            applicantsUnsub = onSnapshot(applicantsColRef, (snapshot) => {
                const applicantList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Applicant));
                setApplicants(applicantList);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching applicants: ", error);
                setLoading(false);
            });
        }
        
        return () => {
            jobUnsub?.();
            applicantsUnsub?.();
        };
    }, [jobId]);
    
    useEffect(() => {
        const currentView = searchParams.get('view');
        if (currentView === 'kanban' || currentView === 'list') {
            setViewMode(currentView);
        } else {
            const current = new URLSearchParams(Array.from(searchParams.entries()));
            current.set('view', 'list');
            const search = current.toString();
            const query = search ? `?${search}` : "";
            router.replace(`${window.location.pathname}${query}`);
        }
    }, [searchParams, router]);


    const handleViewChange = (newView: 'kanban' | 'list') => {
        setViewMode(newView);
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('view', newView);
        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`${window.location.pathname}${query}`);
    }

    if (loading) {
        return (
            <>
                <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                    <Skeleton className="h-8 w-64" />
                </header>
                <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:p-6">
                    <div className="flex flex-col h-full gap-4">
                        <div className="flex gap-4">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                        <div className="flex-1 space-y-4">
                             {Array.from({length: 5}).map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                             ))}
                        </div>
                    </div>
                </main>
            </>
        )
    }
    
    if (!job) {
        return <div className="flex min-h-screen items-center justify-center"><p>Job not found.</p></div>;
    }

    const applicantsByStage = job.rounds.map((round, index) => ({
        ...round,
        applicants: applicants.filter(a => a.activeRoundIndex === index) || []
    }));

    const getInitials = (name: string) => {
        if (!name) return '';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    const getStatusDisplay = (status: Applicant['status']) => {
        switch (status) {
            case 'Screening Passed': return { text: 'Passed', variant: 'success' as const };
            case 'Screening Failed': return { text: 'Failed', variant: 'destructive' as const };
            case 'Hired': return { text: 'Hired', variant: 'success' as const };
            case 'Rejected': return { text: 'Rejected', variant: 'destructive' as const };
            default: return { text: 'In Progress', variant: 'outline' as const };
        }
    }
    
    const handleScheduleNextRound = (applicantId: string) => {
        startSchedulingTransition(async () => {
            const result = await scheduleNextRoundAction(jobId, applicantId);
            if ('success' in result && result.success) {
                setSuccessInfo({
                    roundName: result.roundName,
                    roundType: result.roundType,
                    dueDate: result.dueDate ? format(new Date(result.dueDate), 'dd MMM yyyy') : null,
                });
                setShowSuccessModal(true);
            } else if ('error' in result) {
                toast({ variant: 'destructive', title: "Error", description: result.error || 'An unknown error occurred.' });
            }
        });
    };

    return (
        <>
        <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex justify-center">
                        <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                            <CheckCircle className="h-6 w-6 text-green-500"/>
                        </div>
                    </div>
                    <AlertDialogTitle className="text-center">Successfully Scheduled!</AlertDialogTitle>
                    {successInfo && (
                        <AlertDialogDescription className="text-center pt-2 space-y-1">
                            <p><strong>Round:</strong> {successInfo.roundName} ({successInfo.roundType})</p>
                            {successInfo.dueDate && <p><strong>Due Date:</strong> {successInfo.dueDate}</p>}
                        </AlertDialogDescription>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setShowSuccessModal(false)}>OK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/company/ats')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                             <div className="flex items-center gap-2">
                                <h1 className="font-headline text-xl font-semibold">{job.title}</h1>
                                <Link href={`/dashboard/company/jobs/${jobId}`} passHref>
                                    <SquareArrowOutUpRight className="h-4 w-4 text-muted-foreground hover:text-dash-primary" />
                                </Link>
                            </div>
                            <p className="text-sm text-muted-foreground">{applicants.length} total applicants</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => handleViewChange('list')}>
                            <List className="h-4 w-4" />
                        </Button>
                        <Button variant={viewMode === 'kanban' ? 'default' : 'outline'} size="icon" onClick={() => handleViewChange('kanban')}>
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </header>
                 <main className="flex flex-1 flex-col overflow-hidden p-4 md:p-6">
                    {viewMode === 'kanban' ? (
                        <div className="flex-1 overflow-x-auto custom-scrollbar">
                            <div className="flex gap-4 h-full">
                                {applicantsByStage.map(stage => (
                                    <div key={stage.id} className="w-72 flex-shrink-0 flex flex-col">
                                        <h3 className="font-semibold p-2">{stage.name} ({stage.applicants.length})</h3>
                                        <ScrollArea className="flex-1 bg-muted/50 rounded-lg">
                                            <div className="p-2 space-y-2">
                                            {stage.applicants.map(applicant => {
                                                const statusDisplay = getStatusDisplay(applicant.status);
                                                const canScheduleNext = applicant.activeRoundIndex === 0 && (applicant.status === 'Screening Passed' || applicant.status === 'Screening Failed');
                                                return (
                                                    <Card key={applicant.id} className="cursor-pointer hover:bg-card">
                                                        <CardContent className="p-3">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-10 w-10">
                                                                        <AvatarFallback>{getInitials(applicant.candidateName)}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <p className="font-semibold text-sm">{applicant.candidateName}</p>
                                                                        <p className="text-xs text-muted-foreground">{applicant.candidateEmail}</p>
                                                                    </div>
                                                                </div>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                            {isScheduling ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        {canScheduleNext && (
                                                                            <DropdownMenuItem onSelect={() => handleScheduleNextRound(applicant.id)} disabled={isScheduling}>
                                                                                <CalendarClock className="mr-2 h-4 w-4" />
                                                                                Schedule Next Round
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        <DropdownMenuItem>
                                                                            <UserPlus className="mr-2 h-4 w-4" />
                                                                            Add to candidate pool
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                            <div className="mt-2">
                                                                <Badge variant={statusDisplay.variant} className={cn(statusDisplay.variant === 'success' && 'bg-green-500 hover:bg-green-600')}>{statusDisplay.text}</Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            })}
                                            {stage.applicants.length === 0 && (
                                                <div className="h-24 flex items-center justify-center text-xs text-muted-foreground">
                                                    No applicants in this stage.
                                                </div>
                                            )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                           <ApplicantsTable applicants={applicants} rounds={job.rounds} loading={loading} jobId={jobId} />
                        </div>
                    )}
                </main>
        </>
    );
}
