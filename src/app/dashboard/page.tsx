
'use client';
import { useEffect, useContext, useCallback, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Users, Briefcase, FileText, LineChart, CalendarClock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CandidateContext } from '@/context/candidate-context';
import { CompanyContext } from '@/context/company-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { MobileSearch } from '@/components/mobile-search';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { sendEmailVerification } from 'firebase/auth';
import type { Job, Applicant, Schedule, ResumeAnalysisResult } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { JobContext } from '@/context/job-context';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';


const AdminDashboard = () => {
    const { candidates } = useContext(CandidateContext);
    const { companies } = useContext(CompanyContext);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{candidates.length}</div>
                    <p className="text-xs text-muted-foreground">+120 since last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{companies.length}</div>
                    <p className="text-xs text-muted-foreground">+15 since last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Job Postings</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">350</div>
                    <p className="text-xs text-muted-foreground">+50 since last week</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Platform Analytics</CardTitle>
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Button size="sm" className="text-sm" asChild>
                        <Link href="/dashboard/analytics">View Analytics</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
};

const CompanyDashboard = ({ user }: { user: any }) => {
    const { jobs } = useContext(JobContext);

    return (
    <div className="grid gap-6">
        <h1 className="font-headline text-3xl font-bold">Welcome, {user.displayName}!</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Job Postings</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{jobs.length}</div>
                    <p className="text-xs text-muted-foreground">View all in <Link href="/dashboard/company/jobs" className="underline">Jobs</Link></p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{jobs.reduce((acc, job) => acc + (job.applicants?.length || 0), 0)}</div>
                    <p className="text-xs text-muted-foreground">+5 new applicants this week</p>
                </CardContent>
            </Card>
        </div>
    </div>
)};

interface UpcomingSchedule {
  jobId: string;
  jobTitle: string;
  roundId: number;
  roundName: string;
  roundType: string;
  dueDate: string;
  status: 'Pending' | 'Attempted';
}

const CandidateDashboard = ({ user }: { user: any }) => {
    const [schedules, setSchedules] = useState<UpcomingSchedule[]>([]);
    const [applicationCount, setApplicationCount] = useState(0);
    const [loadingData, setLoadingData] = useState(true);
    const [recentAnalyses, setRecentAnalyses] = useState<ResumeAnalysisResult[]>([]);
    const [loadingAnalyses, setLoadingAnalyses] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!user?.uid) return;
        
        const analysesRef = collection(db, `users/${user.uid}/resume-analyses`);
        const q = query(analysesRef, orderBy('analyzedAt', 'desc'), limit(5));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const analysesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ResumeAnalysisResult));
            setRecentAnalyses(analysesList);
            setLoadingAnalyses(false);
        }, (error) => {
            console.error("Error fetching analyses:", error);
            setLoadingAnalyses(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.uid) return;
            setLoadingData(true);

            const jobsQuery = query(collection(db, 'jobs'));
            const jobsSnapshot = await getDocs(jobsQuery);
            const allSchedules: UpcomingSchedule[] = [];
            let count = 0;

            for (const jobDoc of jobsSnapshot.docs) {
                const applicantDocRef = doc(db, 'jobs', jobDoc.id, 'applicants', user.uid);
                const applicantDoc = await getDoc(applicantDocRef);

                if (applicantDoc.exists()) {
                    count++;
                    const applicantData = applicantDoc.data() as Applicant;
                    const jobData = jobDoc.data() as Job;

                    if (applicantData.schedules) {
                        applicantData.schedules.forEach(schedule => {
                            const round = jobData.rounds.find(r => r.id === schedule.roundId);
                            if (round) {
                                allSchedules.push({
                                    jobId: jobDoc.id,
                                    jobTitle: jobData.title,
                                    roundId: round.id,
                                    roundName: round.name,
                                    roundType: round.type,
                                    dueDate: schedule.dueDate,
                                    status: schedule.status,
                                });
                            }
                        });
                    }
                }
            }
            setSchedules(allSchedules);
            setApplicationCount(count);
            setLoadingData(false);
        };

        fetchData();
    }, [user]);
    
    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        const jsDate = date.toDate ? date.toDate() : new Date(date);
        try {
            return format(jsDate, "dd MMM yyyy 'at' h:mm a");
        } catch {
            return 'Invalid Date';
        }
    }

    const handleAttempt = (schedule: UpcomingSchedule) => {
      if (schedule.roundType === 'assessment') {
        window.open(`/assessment-test/${schedule.jobId}/${schedule.roundId}`, '_blank');
      } else {
        // Handle other round types in the future
      }
    };
    
    const upcomingSchedules = schedules.filter(s => s.status === 'Pending');
    const attemptedSchedules = schedules.filter(s => s.status === 'Attempted');

    return (
    <div className="grid gap-6">
         <h1 className="font-headline text-3xl font-bold">Welcome, {user.displayName}!</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Applications Submitted</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loadingData ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{applicationCount}</div>}
                     <p className="text-xs text-muted-foreground">Track in <Link href="/dashboard/candidate/applications" className="underline">My Applications</Link></p>
                </CardContent>
            </Card>
        </div>
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LineChart className="h-5 w-5" />
                        Recent Resume Analyses
                    </div>
                    <Button variant="secondary" size="sm" asChild>
                        <Link href="/dashboard/candidate/resume-analysis">View All</Link>
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loadingAnalyses ? (
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : recentAnalyses.length > 0 ? (
                    <div className="space-y-3">
                        {recentAnalyses.map(analysis => (
                           <Link href={`/dashboard/candidate/resume-analysis/${analysis.id}`} key={analysis.id}>
                               <div className="p-4 border rounded-lg hover:bg-accent transition-colors">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="font-semibold">{analysis.jobTitle}</p>
                                            <p className="text-sm text-muted-foreground">{analysis.companyName}</p>
                                        </div>
                                        <div className="flex items-center gap-2 self-start sm:self-center">
                                            <span className="font-bold text-lg">{analysis.overallScore}</span>
                                            <Progress value={analysis.overallScore} className="w-20 h-2" />
                                        </div>
                                    </div>
                                </div>
                           </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No analyses found. Analyze your resume against a job to get started.</p>
                )}
            </CardContent>
        </Card>
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
                                        <p className="font-semibold">{schedule.roundName}</p>
                                        <p className="text-sm text-muted-foreground">{schedule.jobTitle}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Due: {formatDate(schedule.dueDate)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 self-start sm:self-center">
                                        <Button size="sm" onClick={() => handleAttempt(schedule)}>Attempt</Button>
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
                                        <p className="font-semibold">{schedule.roundName}</p>
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
)};

function VerificationButton({ onVerify }: { onVerify: () => Promise<void> }) {
  const [pending, setPending] = useState(false);
  
  const handleClick = async () => {
    setPending(true);
    await onVerify();
    setPending(false);
  }

  return (
    <Button onClick={handleClick} disabled={pending}>
       {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Verify
    </Button>
  );
}


export default function DashboardPage() {
  const { session, loading } = useSession();
  const { toast, dismiss } = useToast();
  const router = useRouter();

  const [toastShown, setToastShown] = useState(false);

  const handleVerify = async () => {
    const user = auth.currentUser;
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to verify your email.", variant: "destructive" });
        return;
    }
    try {
        await sendEmailVerification(user);
        toast({
            title: "Verification Email Sent",
            description: "Please check your inbox to verify your email address.",
        });
    } catch (error: any) {
        toast({
            title: "Error",
            description: error.message || "An unknown error occurred.",
            variant: "destructive"
        });
    }
  }

  const showVerificationToast = useCallback(() => {
    if (session && !session.emailVerified && !toastShown) {
      const hasDismissed = sessionStorage.getItem('hasDismissedVerificationToast');
      if (hasDismissed !== 'true') {
        const { id } = toast({
          title: "Please Verify your Email Address !",
          duration: Infinity,
          className: "border-dash-primary",
          action: <VerificationButton onVerify={handleVerify} />,
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


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!session) {
     return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (session.role) {
      case 'admin':
      case 'adminAccountManager':
        return <AdminDashboard />;
      case 'company':
      case 'manager':
        return <CompanyDashboard user={session} />;
      case 'candidate':
        return <CandidateDashboard user={session} />;
      default:
        return null;
    }
  };

  return (
    <>
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role={session.role} user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Dashboard</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
            {renderContent()}
        </main>
      </div>
    </div>
    </>
  );
}
