'use client';
import { useEffect, useContext } from 'react';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { Users, Briefcase, FileText, LineChart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CandidateContext } from '@/context/candidate-context';
import { CompanyContext } from '@/context/company-context';
import { useRouter } from 'next/navigation';
import { MobileSearch } from '@/components/mobile-search';

const AdminDashboard = () => {
    const { candidates } = useContext(CandidateContext);
    const { companies } = useContext(CompanyContext);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <GlassCard>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{candidates.length}</div>
                    <p className="text-xs text-muted-foreground">+120 since last month</p>
                </CardContent>
            </GlassCard>
            <GlassCard>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{companies.length}</div>
                    <p className="text-xs text-muted-foreground">+15 since last month</p>
                </CardContent>
            </GlassCard>
            <GlassCard>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Job Postings</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">350</div>
                    <p className="text-xs text-muted-foreground">+50 since last week</p>
                </CardContent>
            </GlassCard>
            <GlassCard>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Platform Analytics</CardTitle>
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Button size="sm" className="text-sm" asChild>
                        <Link href="/dashboard/analytics">View Analytics</Link>
                    </Button>
                </CardContent>
            </GlassCard>
        </div>
    )
};

export default function DashboardPage() {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
        if (session.role === 'candidate') {
             router.replace('/dashboard/candidate');
        } else if (session.role === 'company' || session.role === 'manager') {
             router.replace('/dashboard/company');
        }
    }
  }, [session, router]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
      default:
        return (
             <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
        );
    }
  };

  return (
    <>
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role={session.role} user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background/30 backdrop-blur-md px-4 md:px-6 sticky top-0 z-30 md:static border-b border-white/10">
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
