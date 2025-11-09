
'use client';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { MobileSearch } from '@/components/mobile-search';
import { useContext, useEffect, useState, Suspense, useMemo } from 'react';
import type { Job, Applicant, Company } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { JobContext } from '@/context/job-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Briefcase, MapPin, Calendar, CheckCircle, Banknote } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { JobDetailView, JobDetailSkeleton } from '@/components/job-detail-view';
import { CompanyContext } from '@/context/company-context';

export interface Application extends Job {
    companyDetails: Company | null;
    applicantData: Applicant;
}

const JobListItem = ({ job, onClick, isActive, isSavedJob }: { job: Application | Job, onClick: () => void, isActive: boolean, isSavedJob?: boolean }) => {
    const getInitials = (name?: string) => {
        if (!name) return '';
        const names = name.split(' ');
        return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
    }
    const company = 'companyDetails' in job ? job.companyDetails : null;
    const applicantData = 'applicantData' in job ? job.applicantData : null;
    
    if (isSavedJob) {
        return (
            <Card onClick={onClick} className={cn("cursor-pointer hover:bg-accent transition-colors", isActive && "bg-accent border-dash-primary")}>
                <CardHeader>
                    <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 rounded-lg">
                            <AvatarImage src={company?.logoUrl || undefined} alt={`${company?.name} logo`} />
                            <AvatarFallback className="rounded-lg">{getInitials(company?.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold text-lg line-clamp-1">{job.title}</p>
                            <p className="text-sm text-muted-foreground">{company?.name}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {job.location}</div>
                        <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> {job.type}</div>
                        <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> {job.workExperience}</div>
                        {job.salary.min > 0 && job.salary.max > 0 && (
                            <div className="flex items-center gap-2">
                                <Banknote className="h-4 w-4" />
                                <span>{job.salary.min} - {job.salary.max} LPA</span>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Posted {job.createdAt ? formatDistanceToNow(job.createdAt.toDate(), { addSuffix: true }) : ''}
                    </div>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card onClick={onClick} className={cn("cursor-pointer hover:bg-accent transition-colors", isActive && "bg-accent border-dash-primary")}>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 rounded-lg">
                        <AvatarImage src={company?.logoUrl} />
                        <AvatarFallback className="rounded-lg">{getInitials(company?.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold line-clamp-1">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{company?.name}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                           <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</div>
                        </div>
                    </div>
                </div>
                 {applicantData && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border bg-green-50 dark:bg-green-900/20 px-3 py-1 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-green-700 dark:text-green-300 font-medium">
                            Application sent {applicantData.appliedAt ? formatDistanceToNow(applicantData.appliedAt.toDate(), { addSuffix: true }) : ''}
                        </span>
                    </div>
                 )}
            </CardContent>
        </Card>
    );
};


function ApplicationsPageContent() {
  const { session, loading: sessionLoading } = useSession();
  const { jobs, loading: jobsLoading } = useContext(JobContext);
  const { companies, loading: companiesLoading } = useContext(CompanyContext);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedJobId = searchParams.get('jobId');

  useEffect(() => {
    if (!session?.uid || jobsLoading) return;

    setLoading(true);
    const fetchApplications = async () => {
        const userApplications: Application[] = [];
        
        for (const job of jobs) {
            const applicationRef = doc(db, 'jobs', job.id, 'applicants', session.uid);
            const applicationSnap = await getDoc(applicationRef);
            if (applicationSnap.exists()) {
                const companyDetails = companies.find(c => c.id === job.companyId) || null;
                userApplications.push({
                    ...job,
                    companyDetails: companyDetails,
                    applicantData: applicationSnap.data() as Applicant,
                });
            }
        }
        setApplications(userApplications);
        setLoading(false);
    };

    fetchApplications();
    
  }, [session, jobs, jobsLoading, companies]);

  const favoriteJobs = useMemo(() => {
      return jobs.filter(job => session?.favourite_jobs?.includes(job.id)).map(job => {
          const company = companies.find(c => c.id === job.companyId);
          return {
              ...job,
              companyDetails: company || null
          }
      });
  }, [jobs, session?.favourite_jobs, companies]);


  const selectedJob = useMemo(() => {
      if (!selectedJobId) return null;
      const foundInApplied = applications.find(app => app.id === selectedJobId);
      if (foundInApplied) return foundInApplied;
      const foundInSaved = favoriteJobs.find(job => job.id === selectedJobId);
      return foundInSaved || null;
  }, [selectedJobId, applications, favoriteJobs]);

  const selectedCompany = useMemo(() => {
    if(!selectedJob) return null;
    if('companyDetails' in selectedJob && selectedJob.companyDetails) return selectedJob.companyDetails;
    return null;
  }, [selectedJob]);


  if (sessionLoading || loading) {
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardSidebar role="candidate" user={session} />
        <div className="flex flex-col max-h-screen">
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
              <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">My Activity</h1>
              <MobileSearch />
          </header>
          <main className="flex-1 flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin" />
          </main>
        </div>
      </div>
    );
  }

  const handleJobSelect = (jobId: string) => {
    router.push(`/dashboard/candidate/applications?jobId=${jobId}`);
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role="candidate" user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">My Activity</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:p-6">
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={35} minSize={25}>
               <div className="flex flex-col h-full">
                <div className="w-full mb-4">
                   <div className="w-full mb-4">
                      <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
                          <Button variant={searchParams.get('tab') !== 'saved' ? 'secondary' : 'ghost'} onClick={() => router.push('/dashboard/candidate/applications')} className="rounded-md">Applied Jobs</Button>
                          <Button variant={searchParams.get('tab') === 'saved' ? 'secondary' : 'ghost'} onClick={() => router.push('/dashboard/candidate/applications?tab=saved')} className="rounded-md">Saved Jobs</Button>
                      </div>
                  </div>
                  {searchParams.get('tab') === 'saved' ? (
                     <div className="flex-1 overflow-auto custom-scrollbar pr-4">
                       <div className="space-y-2">
                        {favoriteJobs.map(job => (
                            <JobListItem key={job.id} job={job} onClick={() => handleJobSelect(job.id)} isActive={selectedJobId === job.id} isSavedJob={true} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-auto custom-scrollbar pr-4">
                      <div className="space-y-2">
                        {applications.map(app => (
                            <JobListItem key={app.id} job={app} onClick={() => handleJobSelect(app.id)} isActive={selectedJobId === app.id} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65} minSize={40}>
                <Card className="h-full">
                    {selectedJob ? (
                        <JobDetailView 
                            job={selectedJob} 
                            company={selectedCompany} 
                            applicantData={'applicantData' in selectedJob ? selectedJob.applicantData : null}
                            allJobs={allJobs}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <Briefcase className="h-16 w-16 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">Select a Job</h3>
                            <p className="text-muted-foreground">Choose a job from the list to see its details.</p>
                        </div>
                    )}
                </Card>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>
    </div>
  );
}

export default function CandidateApplicationsPage() {
  return (
    <Suspense>
      <ApplicationsPageContent />
    </Suspense>
  )
}
