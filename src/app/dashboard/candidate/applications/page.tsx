
'use client';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { MobileSearch } from '@/components/mobile-search';
import { useContext, useEffect, useState, Suspense, useMemo } from 'react';
import type { Job, Applicant, Round, Company, ResumeAnalysisResult } from '@/lib/types';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { JobContext } from '@/context/job-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Briefcase, MapPin, Calendar, CheckCircle, CircleDot, ChevronDown, Sparkles, Bookmark, ArrowLeft, XCircle, PauseCircle, Lock, Info, Banknote, Building, Globe, Phone, Mail, ChevronUp } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { allBenefits } from '@/lib/benefits';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface Application extends Job {
    companyDetails: Company;
    applicantData: Applicant;
}

const JobListItem = ({ job, onClick, isActive }: { job: Application | Job, onClick: () => void, isActive: boolean }) => {
    const getInitials = (name?: string) => {
        if (!name) return '';
        const names = name.split(' ');
        return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
    }
    const company = 'companyDetails' in job ? job.companyDetails : null;
    const applicantData = 'applicantData' in job ? job.applicantData : null;

    const getStatusVariant = (status?: Applicant['status']) => {
        if (!status) return 'outline';
        switch (status) {
            case 'Screening Passed': return 'default';
            case 'Screening Failed': return 'destructive';
            case 'Hired': return 'default';
            case 'Rejected': return 'destructive';
            default: return 'outline';
        }
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
                           {applicantData && <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(applicantData.appliedAt.toDate(), 'dd MMM yy')}</div>}
                        </div>
                    </div>
                </div>
                 {applicantData && <Badge variant={getStatusVariant(applicantData.status)} className="mt-3">{applicantData.status || "Submitted"}</Badge>}
            </CardContent>
        </Card>
    );
};

const JobDetailView = ({ job, company, applicantData }: { job: Job, company: Company | null, applicantData: Applicant | null }) => {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isAboutExpanded, setIsAboutExpanded] = useState(false);
    
    const descriptionLineCount = useMemo(() => {
        return job?.description?.split('\n').length || 0;
    }, [job?.description]);

    const selectedBenefits = useMemo(() => {
        if (!company?.benefits) return [];
        return allBenefits.filter(b => company.benefits.includes(b.id));
    }, [company?.benefits]);
    
    const getInitials = (name?: string) => {
        if (!name) return '';
        const names = name.split(' ');
        return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
    }
    
    const locationDisplay = job?.preference === 'Remote' ? 'Remote' : `${job?.location} (${job?.preference})`;
    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        const jsDate = date.toDate ? date.toDate() : new Date(date);
        return format(jsDate, "dd MMM yyyy");
    }

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Briefcase className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Select a Job</h3>
                <p className="text-muted-foreground">Choose a job from the list to see its details.</p>
            </div>
        );
    }
    
    return (
        <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
                <CardHeader className="p-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <Badge variant="outline" className="mb-2">{job.type}</Badge>
                            <CardTitle className="font-headline text-3xl">{job.title}</CardTitle>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={company?.logoUrl} />
                                        <AvatarFallback>{getInitials(company?.name)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold text-foreground">{company?.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4"/>
                                    <span>Posted {formatDistanceToNow(job.createdAt.toDate(), { addSuffix: true })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 p-0">
                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground border-t border-b py-4">
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{locationDisplay}</span></div>
                        {job.salary.min > 0 && job.salary.max > 0 && (<div className="flex items-center gap-2"><Banknote className="h-4 w-4" /><span>{job.salary.min} LPA to {job.salary.max} LPA</span></div>)}
                        <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /><span>{job.workExperience} experience</span></div>
                        <div className="flex items-center gap-2"><Building className="h-4 w-4" /><span>{job.positions} positions</span></div>
                    </div>
                </CardContent>

                <Tabs defaultValue="track" className="w-full">
                    <TabsList className="w-full grid grid-cols-3">
                        {applicantData && <TabsTrigger value="track">Track Application</TabsTrigger>}
                        <TabsTrigger value="description">Job Description</TabsTrigger>
                        <TabsTrigger value="about">About Company</TabsTrigger>
                    </TabsList>
                    {applicantData && (
                        <TabsContent value="track" className="pt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Application Progress</CardTitle>
                                    <CardDescription>Follow your application journey through the hiring stages.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ol className="relative border-s border-border">                  
                                        {job.rounds.map((round: Round, index) => {
                                            const isCompleted = applicantData && index < applicantData.activeRoundIndex;
                                            const isCurrent = applicantData && index === applicantData.activeRoundIndex;
                                            const isUpcoming = !applicantData || index > applicantData.activeRoundIndex;
                                            const roundResult = applicantData?.roundResults.find(r => r.roundId === round.id);

                                            return (
                                                <li key={round.id} className="mb-10 ms-6">            
                                                    <span className={cn(
                                                        "absolute flex items-center justify-center w-6 h-6 rounded-full -start-3 ring-4 ring-background",
                                                        isCompleted && "bg-green-500 text-white",
                                                        isCurrent && "bg-dash-primary text-dash-primary-foreground",
                                                        isUpcoming && "bg-muted"
                                                    )}>
                                                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : isCurrent ? <CircleDot className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground" />}
                                                    </span>
                                                    <h3 className={cn("font-semibold", isUpcoming && 'text-muted-foreground')}>{round.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{round.type}</p>
                                                </li>
                                            )
                                        })}
                                    </ol>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                    <TabsContent value="description" className="pt-6">
                        <div 
                            className={cn("prose dark:prose-invert max-w-full text-sm", !isDescriptionExpanded && "line-clamp-[10]")}
                            dangerouslySetInnerHTML={{ __html: job.description }}
                        />
                         {descriptionLineCount > 10 && (
                            <Button variant="link" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="p-0 h-auto">
                                {isDescriptionExpanded ? 'Show Less' : 'Show More'}
                            </Button>
                        )}
                    </TabsContent>
                    <TabsContent value="about" className="pt-6">
                      {company && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold font-headline">About {company.name}</h3>
                            {company.aboutCompany && (
                                <div>
                                    <p className={cn("text-sm text-muted-foreground whitespace-pre-wrap", !isAboutExpanded && "line-clamp-3")}>
                                        {company.aboutCompany}
                                    </p>
                                    <Button variant="link" onClick={() => setIsAboutExpanded(!isAboutExpanded)} className="p-0 h-auto text-sm">
                                        {isAboutExpanded ? 'Show Less' : 'Show More'}
                                    </Button>
                                </div>
                            )}
                            {selectedBenefits.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">Benefits & Perks</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedBenefits.map(benefit => (
                                            <div key={benefit.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <benefit.icon className="h-5 w-5 text-primary" />
                                                <span>{benefit.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                      )}
                    </TabsContent>
                </Tabs>
            </div>
        </ScrollArea>
    );
};


function ApplicationsPageContent() {
  const { session, loading: sessionLoading } = useSession();
  const { jobs, loading: jobsLoading } = useContext(JobContext);
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
                let companyDetails: Company | null = null;
                if(job.companyId) {
                    const companyDocRef = doc(db, 'users', job.companyId);
                    const companyDocSnap = await getDoc(companyDocRef);
                    if(companyDocSnap.exists()) {
                       const companyData = companyDocSnap.data();
                       companyDetails = {
                           id: companyDocSnap.id,
                           name: companyData.name,
                           logoUrl: companyData.displayImageUrl
                       } as Company;
                    }
                }
                userApplications.push({
                    ...job,
                    companyDetails: companyDetails!,
                    applicantData: applicationSnap.data() as Applicant,
                });
            }
        }
        setApplications(userApplications);
        setLoading(false);
    };

    fetchApplications();
    
  }, [session, jobs, jobsLoading]);

  const favoriteJobs = useMemo(() => {
      return jobs.filter(job => session?.favourite_jobs?.includes(job.id));
  }, [jobs, session?.favourite_jobs]);


  const selectedJob = useMemo(() => {
      if (!selectedJobId) return null;
      const foundInApplied = applications.find(app => app.id === selectedJobId);
      if (foundInApplied) return foundInApplied;
      const foundInSaved = favoriteJobs.find(job => job.id === selectedJobId);
      return foundInSaved || null;
  }, [selectedJobId, applications, favoriteJobs]);

  const selectedCompany = useMemo(() => {
    if(!selectedJob) return null;
    if('companyDetails' in selectedJob) return selectedJob.companyDetails;

    // Fallback for saved jobs which might not have companyDetails populated initially
    if(selectedJob.companyId) {
        // This is a temporary solution, ideally the context would handle this join
        const fetchCompany = async () => {
            const companyDoc = await getDoc(doc(db, 'users', selectedJob.companyId));
            if(companyDoc.exists()) {
                const data = companyDoc.data();
                return { id: data.id, name: data.name, logoUrl: data.displayImageUrl } as Company
            }
            return null;
        }
        // This is not ideal as it's async inside a sync hook, but for now it might work with a flicker
        // A better approach would be to have a companies context.
        return null;
    }
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
              <Tabs defaultValue="applied" className="flex flex-col h-full">
                <div className="w-full mb-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="applied">Applied Jobs</TabsTrigger>
                    <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="applied" className="flex-1 overflow-auto custom-scrollbar pr-4">
                  <div className="space-y-2">
                    {applications.map(app => (
                        <JobListItem key={app.id} job={app} onClick={() => handleJobSelect(app.id)} isActive={selectedJobId === app.id} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="saved" className="flex-1 overflow-auto custom-scrollbar pr-4">
                   <div className="space-y-2">
                    {favoriteJobs.map(job => (
                        <JobListItem key={job.id} job={job} onClick={() => handleJobSelect(job.id)} isActive={selectedJobId === job.id} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65} minSize={40}>
                <Card className="h-full">
                    {selectedJob ? (
                        <JobDetailView job={selectedJob} company={selectedCompany} applicantData={'applicantData' in selectedJob ? selectedJob.applicantData : null} />
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
