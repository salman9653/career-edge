'use client';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Users, Briefcase, FileText, ChevronRight, Hand, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { MobileSearch } from '@/components/mobile-search';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMemo, useState, useContext } from 'react';
import { Input } from '@/components/ui/input';
import { JobContext } from '@/context/job-context';
import type { Job } from '@/lib/types';

const AtsDashboard = () => {
    const { jobs, loading: jobsLoading } = useContext(JobContext);
    const [searchQuery, setSearchQuery] = useState('');

    const activeJobs = useMemo(() => jobs.filter(j => j.status === 'Live'), [jobs]);
    const totalApplicants = useMemo(() => jobs.reduce((acc, job) => acc + (job.applicants?.length || 0), 0), [jobs]);
    
    // Assuming 'new' applicants are those in the first round.
    // The logic for what makes an applicant 'new' might need refinement based on data structure.
    const newApplicants = useMemo(() => {
        return jobs.reduce((acc, job) => {
            const firstRoundId = job.rounds?.[0]?.id;
            if (!firstRoundId) return acc;
            const count = job.applicants?.filter(a => a.activeRoundIndex === 0).length || 0;
            return acc + count;
        }, 0);
    }, [jobs]);

    const manualActionStages = ['live interview', 'offer'];
    const manualActionsRequired = useMemo(() => {
        return jobs.reduce((acc, job) => {
            const manualApplicants = job.applicants?.filter(applicant => {
                const currentRound = job.rounds?.[applicant.activeRoundIndex];
                return currentRound && manualActionStages.includes(currentRound.type);
            }).length || 0;
            return acc + manualApplicants;
        }, 0);
    }, [jobs]);
    

    const filteredJobs = useMemo(() => {
        if (!searchQuery) {
            return activeJobs;
        }
        return activeJobs.filter(job =>
            job.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, activeJobs]);


    return (
        <div className="flex flex-col gap-6 h-full">
            <TooltipProvider>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/dashboard/company/jobs">
                            <Card className="hover:bg-accent transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{jobsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : activeJobs.length}</div>
                                    <p className="text-xs text-muted-foreground">{jobs.length} total jobs</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Show all jobs</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Card className="hover:bg-accent transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{jobsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalApplicants}</div>
                                <p className="text-xs text-muted-foreground">Across all jobs</p>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Total number of applications received</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Card className="hover:bg-accent transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">New Applicants</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{jobsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : newApplicants}</div>
                                <p className="text-xs text-muted-foreground">Awaiting review</p>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Applicants in the first stage of the pipeline</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Card className="hover:bg-accent transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Manual Actions Required</CardTitle>
                                <Hand className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{jobsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : manualActionsRequired}</div>
                                <p className="text-xs text-muted-foreground">Candidates awaiting manual action</p>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Applicants in stages like 'Live Interview' or 'Offer'</p>
                    </TooltipContent>
                </Tooltip>
            </div>
            </TooltipProvider>
            
            <Card className="flex-1 flex flex-col min-h-0">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Job Pipelines</CardTitle>
                            <CardDescription>An overview of your active hiring pipelines.</CardDescription>
                        </div>
                         <div className="relative w-full max-w-xs">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search pipelines..."
                                className="w-full rounded-full bg-background pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto custom-scrollbar">
                    {jobsLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                    <div className="space-y-4">
                        {filteredJobs.map(job => {
                            const pipelineSummary = job.rounds.map(round => {
                                const count = job.applicants?.filter(a => a.activeRoundIndex === job.rounds.indexOf(round)).length || 0;
                                return { name: round.name, count };
                            });

                            return (
                                <Link key={job.id} href={`/dashboard/company/ats/${job.id}`} className="block">
                                    <div className="p-4 rounded-lg border hover:bg-accent transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold">{job.title}</h3>
                                                <p className="text-sm text-muted-foreground">{job.applicants?.length || 0} Total Applicants</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 flex-wrap">
                                            {pipelineSummary.map((stage, index) => (
                                                <div key={stage.name} className="flex items-center gap-2">
                                                    <span>{stage.name} <span className="font-bold text-foreground">{stage.count}</span></span>
                                                    {index < pipelineSummary.length - 1 && <ChevronRight className="h-4 w-4" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                         {filteredJobs.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground">No active job pipelines found.</p>
                            </div>
                        )}
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
};


export default function AtsPage() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session || (session.role !== 'company' && session.role !== 'manager')) {
    return <div className="flex min-h-screen items-center justify-center"><p>Access Denied.</p></div>;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role={session.role} user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Application Tracking System</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
          <AtsDashboard />
        </main>
      </div>
    </div>
  );
}
