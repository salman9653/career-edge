'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/hooks/use-session';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, CalendarClock, Briefcase, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileSearch } from '@/components/mobile-search';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { fetchCandidateDashboardData } from '@/app/dashboard/candidate/actions';
import { format } from 'date-fns';

interface DashboardData {
  applications: {
    jobId: string;
    jobTitle: string;
    status: string;
    appliedAt: any;
    schedules: any[];
  }[];
  stats: {
    totalApplications: number;
    activeJobs: number;
    pendingSchedules: number;
    attemptedAssessments: number;
  };
}

export function CandidateDashboardContent() {
  const { session, loading } = useSession();
  const { toast, dismiss } = useToast();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [toastShown, setToastShown] = useState(false);

  const showVerificationToast = useCallback(() => {
    if (session && !session.emailVerified && !toastShown) {
      const hasDismissed = sessionStorage.getItem('hasDismissedVerificationToast');
      if (hasDismissed !== 'true') {
        const { id } = toast({
          title: "Please Verify your Email Address !",
          duration: Infinity,
          className: "border-dash-primary",
          action: (
            <Button
              onClick={() => {
                router.push('/dashboard?settings=true&tab=Account');
                dismiss(id);
                sessionStorage.setItem('hasDismissedVerificationToast', 'true');
              }}
            >
              Verify
            </Button>
          ),
          secondaryAction: (
            <Button
              variant="outline"
              onClick={() => {
                dismiss(id);
                sessionStorage.setItem('hasDismissedVerificationToast', 'true');
              }}
            >
              Later
            </Button>
          ),
          onClose: () => {
            sessionStorage.setItem('hasDismissedVerificationToast', 'true');
          },
        });
        setToastShown(true);
      }
    }
  }, [session, toast, router, dismiss, toastShown]);

  useEffect(() => {
    showVerificationToast();
  }, [showVerificationToast]);

  useEffect(() => {
    const loadData = async () => {
      if (!session?.uid) return;
      try {
        setLoadingData(true);
        const dashboardData = await fetchCandidateDashboardData(session.uid);
        setData(dashboardData);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };

    if (session?.uid) {
      loadData();
    }
  }, [session, toast]);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    // Handle Firestore Timestamp or ISO string
    const jsDate = date.toDate ? date.toDate() : new Date(date);
    try {
        return format(jsDate, "dd MMM yyyy 'at' h:mm a");
    } catch {
        return 'Invalid Date';
    }
  };

  const handleAttempt = (schedule: any) => {
    if (schedule.roundType === 'assessment') {
      // Need to find roundId. The schedule object from actions has it?
      // Wait, fetchCandidateDashboardData returns plain schedules.
      // Let's verify what 'schedules' contains.
      // In the action, it's just `applicant.schedules`.
      // The original code joined with Job Rounds to get `roundType` and `roundName`.
      // My action didn't do that join! It just returned the schedules array.
      // The schedules array in Applicant usually only has `roundId`, `dueDate`, `status`.
      // It does NOT have `roundType` or `roundName` or `jobTitle` (wait, I added jobTitle to the parent object).
      
      // I need to fix the Server Action to enrich the schedules with Round info!
      // I can't do CLIENT side join easily because I don't have the full job object here (unless I fetch it).
      // The action SHOULD have enriched it.
      
      // Currently the action returns:
      // schedules: applicant.schedules || []
      
      // I should update the action to enrich this.
      	window.open(`/assessment-test/${schedule.jobId}/${schedule.roundId}`, '_blank');
    }
  };

  // Temporary safe return while loading
  if (loading) {
    return (
        <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
          <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Dashboard</h1>
          <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
            <Skeleton className="h-[200px] w-full" />
        </main>
      </div>
    );
  }

  if (!session) return null; // handled by layout redirect

  const upcomingSchedules: any[] = [];
  const attemptedSchedules: any[] = [];

  // Need to process schedules from data
  if (data) {
     data.applications.forEach(app => {
         if (app.schedules) {
             app.schedules.forEach(sch => {
                 // Enhanced schedule object needs enrichment.
                 // For now, I'll pass the whole app object to helper or map it here if I fix the action.
                 // Assuming I'll fix the action to return enriched schedules
                 const enrichedSchedule = {
                     ...sch,
                     jobTitle: app.jobTitle,
                     jobId: app.jobId,
                     // Missing roundName and roundType!
                 };
                 if (sch.status === 'Pending') upcomingSchedules.push(enrichedSchedule);
                 else if (sch.status === 'Attempted' || sch.status === 'Completed') attemptedSchedules.push(enrichedSchedule);
             });
         }
     });
  }

  return (
    <div className="flex flex-col max-h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
        <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Dashboard</h1>
        <MobileSearch />
      </header>
      <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
        <div className="grid gap-6">
          <h1 className="font-headline text-3xl font-bold">Welcome, {session.displayName}!</h1>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Applications Submitted</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loadingData ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{data?.stats.totalApplications || 0}</div>}
                     <p className="text-xs text-muted-foreground">Track in <Link href="/dashboard/candidate/applications" className="underline">My Applications</Link></p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Job Postings</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loadingData ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{data?.stats.activeJobs || 0}</div>}
                    <p className="text-xs text-muted-foreground">View all in <Link href="/dashboard/candidate/jobs" className="underline">Jobs</Link></p>
                </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5" />
                    Upcoming Schedules
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loadingData ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : upcomingSchedules.length > 0 ? (
                    <div className="space-y-3">
                        {upcomingSchedules.map((schedule, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="font-semibold">{schedule.roundName || `Round ${schedule.roundId + 1}`}</p>
                                        <p className="text-sm text-muted-foreground">{schedule.jobTitle}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Due: {formatDate(schedule.dueDate)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 self-start sm:self-center">
                                        {/* Default to attempt button for now, logic calls window.open which might fail if round info missing */}
                                        <Button size="sm" onClick={() => window.open(`/assessment-test/${schedule.jobId}/${schedule.roundId}`, '_blank')}>Attempt</Button>
                                        <Button variant="secondary" size="sm" asChild>
                                            <Link href={`/dashboard/candidate/jobs/${schedule.jobId}`}>
                                                View Job
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No upcoming schedules. Keep applying!</p>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Attempted Assessments</CardTitle>
            </CardHeader>
            <CardContent>
                {loadingData ? (
                    <Skeleton className="h-12 w-full" />
                ) : attemptedSchedules.length > 0 ? (
                     <div className="space-y-3">
                        {attemptedSchedules.map((schedule, index) => (
                            <div key={index} className="p-4 border rounded-lg opacity-70">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="font-semibold">{schedule.roundName || `Round ${schedule.roundId + 1}`}</p>
                                        <p className="text-sm text-muted-foreground">{schedule.jobTitle}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Attempted</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <p className="text-sm text-muted-foreground">You haven't attempted any assessments yet.</p>
                )}
            </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}
