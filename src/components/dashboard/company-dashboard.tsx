'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { Briefcase, Users } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileSearch } from '@/components/mobile-search';
import { fetchCompanyDashboardStats, type CompanyDashboardStats } from '@/app/dashboard/company/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase/config';
import { sendEmailVerification } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

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

export function CompanyDashboardContent() {
  const { session, loading: sessionLoading } = useSession();
  const { toast, dismiss } = useToast();
  const router = useRouter();
  const [stats, setStats] = useState<CompanyDashboardStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
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

  useEffect(() => {
    const loadStats = async () => {
      if (!session?.uid) return;
      try {
        setLoadingData(true);
        // If user is company, use uid. If manager, use company_uid?
        // JobContext logic: const companyId = session.role === 'company' ? session.uid : session.company_uid;
        const companyId = session.role === 'company' ? session.uid : session.company_uid;
        
        if (companyId) {
            const data = await fetchCompanyDashboardStats(companyId);
            setStats(data);
        }
      } catch (error) {
        console.error("Failed to load company stats", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics.",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };

    if (!sessionLoading && session) {
      loadStats();
    }
  }, [session, sessionLoading, toast]);

  if (sessionLoading) {
    return (
        <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background/30 backdrop-blur-md px-4 md:px-6 sticky top-0 z-30 md:static border-b border-white/10">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Dashboard</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
             <div className="grid gap-6">
                <Skeleton className="h-10 w-1/3" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
            </div>
        </main>
      </div>
    );
  }

  if (!session) return null; // handled by layout redirect

  return (
    <div className="flex flex-col max-h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background/30 backdrop-blur-md px-4 md:px-6 sticky top-0 z-30 md:static border-b border-white/10">
        <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Dashboard</h1>
        <MobileSearch />
      </header>
      <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
        <div className="grid gap-6">
            <h1 className="font-headline text-3xl font-bold">Welcome, {session.displayName || session.name || 'Company'}!</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <GlassCard>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Job Postings</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loadingData ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats?.activeJobs || 0}</div>}
                        <p className="text-xs text-muted-foreground">
                            {stats?.totalJobs ? `${stats.totalJobs} total postings` : 'View all in Jobs'}
                             <span className="block mt-1"><Link href="/dashboard/company/jobs" className="underline">Manage Jobs</Link></span>
                        </p>
                    </CardContent>
                </GlassCard>
                <GlassCard>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loadingData ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats?.totalApplicants || 0}</div>}
                        <p className="text-xs text-muted-foreground">Across all active jobs</p>
                    </CardContent>
                </GlassCard>
            </div>
             {/* Future: Add more sections like Recent Applications, Analytics Summary etc. */}
        </div>
      </main>
    </div>
  );
}
