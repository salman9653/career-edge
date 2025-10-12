
'use client';

import { useEffect, useState, useMemo, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Job, Socials, CompanySize, Round, Question, ApplicantRoundResult } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, MapPin, Banknote, Building, Calendar, Loader2, XCircle, PauseCircle, Info, Lock, Globe, Phone, Mail, ChevronDown, ChevronUp, ArrowLeft, Sparkles, CheckCircle, CircleDot, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSession } from '@/hooks/use-session';
import { allBenefits } from '@/lib/benefits';
import Link from 'next/link';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { MobileSearch } from '@/components/mobile-search';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResumeAnalysis } from "@/components/resume-analysis";
import { JobContext } from '@/context/job-context';
import { QuestionContext } from '@/context/question-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GradientButton } from '@/components/ui/gradient-button';
import { applyForJobAction, toggleFavoriteJobAction } from '@/app/dashboard/candidate/actions';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScreeningQuestionsDialog } from './_components/screening-questions-dialog';
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


interface Company {
    name: string;
    displayImageUrl?: string;
    aboutCompany?: string;
    website?: string;
    helplinePhone?: string;
    helplineEmail?: string;
    benefits?: string[];
    socials?: Socials;
    companySize?: CompanySize;
    companyType?: string;
    foundedYear?: string;
}

interface ApplicantData {
  activeRoundIndex: number;
  status: string;
  roundResults: ApplicantRoundResult[];
}

export default function CandidateJobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.jobId as string;
    const { session, loading: sessionLoading, updateSession } = useSession();
    const { jobs: allJobs, loading: jobsLoading } = useContext(JobContext);
    const { questions: allQuestions, loading: questionsLoading } = useContext(QuestionContext);
    const { toast } = useToast();

    const [job, setJob] = useState<Job | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isAboutExpanded, setIsAboutExpanded] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [hasApplied, setHasApplied] = useState(false);
    const [checkingAppliedStatus, setCheckingAppliedStatus] = useState(true);
    const [applicantData, setApplicantData] = useState<ApplicantData | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    
    const [isScreeningOpen, setIsScreeningOpen] = useState(false);
    const [screeningQuestions, setScreeningQuestions] = useState<Question[]>([]);
    
    useEffect(() => {
        if (session?.favourite_jobs && jobId) {
            setIsFavorite(session.favourite_jobs.includes(jobId));
        }
    }, [session?.favourite_jobs, jobId]);

    const handleToggleFavorite = async () => {
        if (!session) return;
        
        const originalIsFavorite = isFavorite;
        setIsFavorite(!originalIsFavorite);

        const newFavorites = originalIsFavorite 
            ? (session.favourite_jobs || []).filter(id => id !== jobId) 
            : [...(session.favourite_jobs || []), jobId];
        
        updateSession({ favourite_jobs: newFavorites });

        const result = await toggleFavoriteJobAction(jobId, session);
        if (result.error) {
            setIsFavorite(originalIsFavorite);
             updateSession({ favourite_jobs: session.favourite_jobs }); // Revert
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    };
    
    const descriptionLineCount = useMemo(() => {
        return job?.description?.split('\n').length || 0;
    }, [job?.description]);

    const selectedBenefits = useMemo(() => {
        if (!company?.benefits) return [];
        return allBenefits.filter(b => company.benefits.includes(b.id));
    }, [company?.benefits]);

    const getWebsiteUrl = (url?: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    };

    const similarJobs = useMemo(() => {
        if (!job || jobsLoading) return [];
        return allJobs.filter(j => j.id !== job.id).slice(0, 3);
    }, [job, allJobs, jobsLoading]);

    useEffect(() => {
        if (jobId) {
            const fetchJobAndCompany = async () => {
                setLoading(true);
                setError(null);
                try {
                    const jobDocRef = doc(db, 'jobs', jobId);
                    const jobDocSnap = await getDoc(jobDocRef);

                    if (jobDocSnap.exists()) {
                        const jobData = { id: jobDocSnap.id, ...jobDocSnap.data() } as Job;
                        setJob(jobData);

                        if(jobData.companyId) {
                            const companyDocRef = doc(db, 'users', jobData.companyId);
                            const companyDocSnap = await getDoc(companyDocRef);

                            if(companyDocSnap.exists()) {
                                setCompany(companyDocSnap.data() as Company);
                            } else {
                                 setError('The company associated with this job could not be found.');
                            }
                        } else {
                            setError('Company information is missing for this job.');
                        }
                    } else {
                        setError('This job posting could not be found. It may have been removed or the link is incorrect.');
                    }
                } catch (err) {
                    console.error("Error fetching job:", err);
                    setError('An unexpected error occurred while trying to load the job posting.');
                } finally {
                    setLoading(false);
                }
            }
            fetchJobAndCompany();
        }
    }, [jobId]);

    useEffect(() => {
        if(session?.uid && jobId) {
            const checkApplicationStatus = async () => {
                setCheckingAppliedStatus(true);
                const applicationRef = doc(db, 'jobs', jobId, 'applicants', session.uid);
                const applicationSnap = await getDoc(applicationRef);
                setHasApplied(applicationSnap.exists());
                if (applicationSnap.exists()) {
                    const data = applicationSnap.data();
                    setApplicantData({ 
                        activeRoundIndex: data.activeRoundIndex,
                        status: data.status,
                        roundResults: data.roundResults || []
                    });
                }
                setCheckingAppliedStatus(false);
            }
            checkApplicationStatus();
        } else if (!sessionLoading) {
            setCheckingAppliedStatus(false);
        }
    }, [jobId, session, sessionLoading]);

    useEffect(() => {
        if (!checkingAppliedStatus) {
            if (hasApplied) {
                setActiveTab('track');
            } else {
                setActiveTab('description');
            }
        }
    }, [hasApplied, checkingAppliedStatus]);


    const handleApply = async () => {
        if (!session) {
          toast({ title: 'Authentication Required', description: 'Please log in to apply.', variant: 'destructive' });
          router.push(`/login?redirect=/dashboard/candidate/jobs/${jobId}`);
          return;
        }

        const firstRound = job?.rounds?.[0];
        if (firstRound?.type === 'screening' && firstRound.questionIds && !questionsLoading) {
            const screeningQs = allQuestions.filter(q => firstRound.questionIds.includes(q.id));
            setScreeningQuestions(screeningQs);
            setIsScreeningOpen(true);
        } else {
            await submitApplication();
        }
    };
    
    const submitApplication = async (answers?: { questionId: string; answer: string }[]) => {
      if (!session) return;
      setIsApplying(true);
      const result = await applyForJobAction({
        jobId,
        candidateId: session.uid,
        candidateName: session.displayName,
        candidateEmail: session.email,
        answers,
      });
      setIsApplying(false);
      setIsScreeningOpen(false);

      if (result.success) {
        toast({ title: 'Application Submitted!', description: "Your application has been sent." });
        setHasApplied(true);
        const newActiveRoundIndex = answers ? 1 : 0;
        setApplicantData({
            activeRoundIndex: newActiveRoundIndex,
            status: 'In Progress', // A more generic status
            roundResults: result.roundResults || [],
        });
      } else {
        toast({ title: 'Application Failed', description: result.error || 'An unknown error occurred.', variant: 'destructive' });
      }
    };

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
    
    if (loading || sessionLoading || checkingAppliedStatus) {
        return (
             <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                <DashboardSidebar role="candidate" user={session} />
                 <div className="flex flex-col max-h-screen">
                    <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
                        <div className="flex items-center gap-2">
                           <Skeleton className="h-10 w-10" />
                           <Skeleton className="h-6 w-48" />
                        </div>
                        <MobileSearch />
                    </header>
                    <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div>
                                        <Skeleton className="h-5 w-20 mb-2" />
                                        <Skeleton className="h-8 w-64 mb-2" />
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                                <Skeleton className="h-5 w-32" />
                                            </div>
                                            <Skeleton className="h-5 w-40" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Skeleton className="h-12 w-12" />
                                        <Skeleton className="h-12 w-12" />
                                        <Skeleton className="h-12 w-28" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-b py-4">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-8 w-24" />
                                        <Skeleton className="h-8 w-24" />
                                        <Skeleton className="h-8 w-24" />
                                        <Skeleton className="h-8 w-24" />
                                    </div>
                                    <div className="pt-6 space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-5/6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </main>
                </div>
             </div>
        )
    }

    if (error) {
        return (
            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                <DashboardSidebar role="candidate" user={session} />
                <div className="flex flex-col max-h-screen">
                    <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
                        <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Job Details</h1>
                        <MobileSearch />
                    </header>
                     <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar justify-center items-center">
                        <Card className="w-full max-w-lg p-8 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                        <XCircle className="h-6 w-6 text-destructive"/>
                                </div>
                            </div>
                            <CardTitle className="font-headline text-2xl mb-2">Job Not Found</CardTitle>
                            <CardDescription>{error}</CardDescription>
                            <Button onClick={() => router.push('/dashboard/candidate/jobs')} className="mt-6">Back to Jobs</Button>
                        </Card>
                    </main>
                </div>
            </div>
        )
    }

    if (!job) return null;

    return (
        <>
        <ScreeningQuestionsDialog
            open={isScreeningOpen}
            onOpenChange={setIsScreeningOpen}
            questions={screeningQuestions}
            onSubmit={submitApplication}
            isSubmitting={isApplying}
        />
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <DashboardSidebar role="candidate" user={session} />
            <div className="flex flex-col max-h-screen">
                <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
                    <div className="flex items-center gap-2">
                         <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="font-headline text-xl font-semibold md:ml-0">Job Details</h1>
                    </div>
                    <MobileSearch />
                </header>
                <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:p-6 custom-scrollbar">
                    <div className="w-full mx-auto space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div>
                                        <Badge variant="outline" className="mb-2">{job.type}</Badge>
                                        <CardTitle className="font-headline text-3xl">{job.title}</CardTitle>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2 cursor-pointer p-1 rounded-md hover:bg-accent transition-colors" onClick={() => setActiveTab('about')}>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={company?.displayImageUrl} />
                                                    <AvatarFallback>{getInitials(company?.name)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-semibold text-foreground">{company?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4"/>
                                                <span>Posted on {formatDate(job.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="w-12 h-12"
                                                        onClick={handleToggleFavorite}
                                                    >
                                                        <Bookmark className={cn("h-6 w-6", isFavorite && "fill-current text-dash-primary")} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{isFavorite ? "Remove from saved" : "Save this job"}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <GradientButton
                                            size="icon"
                                            className="w-12 h-12"
                                            onClick={() => setActiveTab('analyze')}
                                            tooltip="Analyze resume with AI"
                                        >
                                            <Sparkles />
                                        </GradientButton>
                                        {hasApplied ? (
                                            <Button size="lg" className="w-full sm:w-auto h-12 bg-green-600 hover:bg-green-700" disabled>
                                                <CheckCircle className="mr-2 h-5 w-5" />
                                                Applied
                                            </Button>
                                        ) : (
                                            <Button size="lg" className="w-full sm:w-auto h-12" onClick={handleApply} disabled={isApplying || job.status !== 'Live'}>
                                                {isApplying ? <Loader2 className="animate-spin" /> : 'Apply Now'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground border-t border-b py-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{locationDisplay}</span>
                                    </div>
                                    {job.salary.min > 0 && job.salary.max > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Banknote className="h-4 w-4" />
                                            <span>{job.salary.min} LPA to {job.salary.max} LPA</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        <span>{job.workExperience} experience</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4" />
                                        <span>{job.positions} positions</span>
                                    </div>
                                </div>

                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList>
                                        {hasApplied && <TabsTrigger value="track">Track Application</TabsTrigger>}
                                        <TabsTrigger value="description">Job Description</TabsTrigger>
                                        <TabsTrigger value="analyze">Analyze Resume</TabsTrigger>
                                        <TabsTrigger value="about">About Company</TabsTrigger>
                                        <TabsTrigger value="similar">Similar Jobs</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="track" className="pt-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Application Progress</CardTitle>
                                                <CardDescription>Follow your application journey through our hiring stages.</CardDescription>
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
                                                                {isCompleted && roundResult && (
                                                                    <Collapsible>
                                                                        <CollapsibleTrigger asChild>
                                                                            <Button variant="link" className="p-0 h-auto text-sm">
                                                                                Show Details <ChevronDown className="ml-1 h-4 w-4" />
                                                                            </Button>
                                                                        </CollapsibleTrigger>
                                                                        <CollapsibleContent>
                                                                            <Card className="mt-2 bg-secondary/50">
                                                                                <CardContent className="p-4 text-sm space-y-2">
                                                                                   {roundResult.completedAt && <p><strong>Completed On:</strong> {formatDate(roundResult.completedAt)}</p>}
                                                                                </CardContent>
                                                                            </Card>
                                                                        </CollapsibleContent>
                                                                    </Collapsible>
                                                                )}
                                                            </li>
                                                        )
                                                    })}
                                                    <li className="ms-6">
                                                        <span className={cn(
                                                                "absolute flex items-center justify-center w-6 h-6 rounded-full -start-3 ring-4 ring-background",
                                                                applicantData && applicantData.activeRoundIndex >= job.rounds.length ? "bg-green-500 text-white" : "bg-muted"
                                                            )}>
                                                            <CheckCircle className="w-4 h-4" />
                                                        </span>
                                                        <h3 className={cn("font-semibold", !applicantData || applicantData.activeRoundIndex < job.rounds.length ? 'text-muted-foreground' : '')}>Hired / Rejected</h3>
                                                    </li>
                                                </ol>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                    <TabsContent value="description" className="pt-6">
                                      {job.status === 'Live' ? (
                                          <div>
                                              <p className={cn("text-muted-foreground whitespace-pre-wrap", !isDescriptionExpanded && "line-clamp-[10]")}>
                                                  {job.description}
                                              </p>
                                              {descriptionLineCount > 10 && (
                                                  <Button variant="link" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="p-0 h-auto">
                                                      {isDescriptionExpanded ? 'Show Less' : 'Show More'}
                                                  </Button>
                                              )}
                                          </div>
                                      ) : (
                                           <Card className="bg-muted/30 border-dashed">
                                              <CardContent className="p-8 text-center space-y-2">
                                                  <div className="flex justify-center mb-2">
                                                      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                                          <Lock className="h-6 w-6 text-destructive"/>
                                                      </div>
                                                  </div>
                                                  <h3 className="font-semibold">Job Not Available</h3>
                                                  <p className="text-sm text-muted-foreground">This job is not accepting applications at this time.</p>
                                              </CardContent>
                                          </Card>
                                      )}
                                    </TabsContent>
                                    <TabsContent value="analyze" className="pt-6">
                                        <div className='text-center space-y-1 mb-4'>
                                            <h2 className='text-2xl font-bold font-headline'>AI Resume Analysis</h2>
                                            <p className='text-muted-foreground'>Upload a resume to analyze it against this job .</p>
                                        </div>
                                        <ResumeAnalysis jobDescription={job.description} />
                                    </TabsContent>
                                    <TabsContent value="about" className="pt-6">
                                      {company && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-16 w-16">
                                                    <AvatarImage src={company?.displayImageUrl} />
                                                    <AvatarFallback>{getInitials(company?.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="text-2xl font-bold font-headline">{company.name}</h3>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground border-t border-b py-4">
                                                {company.companySize && (
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4" />
                                                        <span>{company.companySize.size} ({company.companySize.employees} employees)</span>
                                                    </div>
                                                )}
                                                {company.companyType && (
                                                    <div className="flex items-center gap-2">
                                                        <Info className="h-4 w-4" />
                                                        <span>{company.companyType}</span>
                                                    </div>
                                                )}
                                                {company.foundedYear && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>Founded in {company.foundedYear}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {company.aboutCompany && (
                                                <div>
                                                    <h3 className="font-semibold mb-2">About the Company</h3>
                                                    <p className={cn("text-sm text-muted-foreground whitespace-pre-wrap", !isAboutExpanded && "line-clamp-3")}>
                                                        {company.aboutCompany}
                                                    </p>
                                                    {company.aboutCompany.length > 0 && (
                                                        <Button variant="link" onClick={() => setIsAboutExpanded(!isAboutExpanded)} className="p-0 h-auto text-sm">
                                                            {isAboutExpanded ? 'Show Less' : 'Show More'}
                                                            {isAboutExpanded ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {company.helplinePhone || company.helplineEmail ? (
                                                <div>
                                                    <h3 className="font-semibold mb-2">Contact</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {company.helplinePhone && (
                                                            <div className="flex items-start gap-3 text-sm">
                                                                <Phone className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                                                <div>
                                                                    <p className="text-muted-foreground">Contact Phone</p>
                                                                    <p className="font-medium">{company.helplinePhone}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {company.helplineEmail && (
                                                            <div className="flex items-start gap-3 text-sm">
                                                                <Mail className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                                                <div>
                                                                    <p className="text-muted-foreground">Contact Email</p>
                                                                    <p className="font-medium">{company.helplineEmail}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : null}
                                            {selectedBenefits.length > 0 && (
                                                <div>
                                                    <h3 className="font-semibold mb-2">Benefits & Perks</h3>
                                                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
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
                                    <TabsContent value="similar" className="pt-6">
                                        <div className="space-y-4">
                                            {similarJobs.length > 0 ? similarJobs.map(j => (
                                                <Card key={j.id}>
                                                    <CardHeader>
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <CardTitle className="text-lg font-semibold">{j.title}</CardTitle>
                                                                <CardDescription>{j.location} &middot; {j.type}</CardDescription>
                                                            </div>
                                                            <Button asChild variant="secondary">
                                                                <Link href={`/dashboard/candidate/jobs/${j.id}`}>View Job</Link>
                                                            </Button>
                                                        </div>
                                                    </CardHeader>
                                                </Card>
                                            )) : (
                                                <p className="text-muted-foreground text-center">No similar jobs found.</p>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
        </>
    );
}
