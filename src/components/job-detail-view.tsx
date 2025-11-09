
'use client';

import { useEffect, useState, useMemo, useContext } from 'react';
import { useRouter } from 'next/navigation';
import type { Job, Socials, CompanySize, Round, Question, ApplicantRoundResult, Applicant, Company } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, MapPin, Banknote, Building, Calendar, Loader2, Sparkles, CheckCircle, CircleDot, Bookmark, XCircle, PauseCircle, Lock, Info, Globe, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSession } from '@/hooks/use-session';
import { allBenefits } from '@/lib/benefits';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResumeAnalysis } from "@/components/resume-analysis";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GradientButton } from '@/components/ui/gradient-button';
import { applyForJobAction, toggleFavoriteJobAction } from '@/app/dashboard/candidate/actions';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScreeningQuestionsDialog } from '@/app/dashboard/candidate/jobs/[jobId]/_components/screening-questions-dialog';
import { QuestionContext } from '@/context/question-context';
import { ScrollArea } from './ui/scroll-area';

interface JobDetailViewProps {
    job: Job;
    company: Company | null;
    applicantData: Applicant | null;
    allJobs: Job[];
}

export const JobDetailView = ({ job, company, applicantData, allJobs }: JobDetailViewProps) => {
    const router = useRouter();
    const { session, updateSession } = useSession();
    const { toast } = useToast();
    const { questions: allQuestions, loading: questionsLoading } = useContext(QuestionContext);
    
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isAboutExpanded, setIsAboutExpanded] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [isScreeningOpen, setIsScreeningOpen] = useState(false);
    const [screeningQuestions, setScreeningQuestions] = useState<Question[]>([]);
    
    const [hasApplied, setHasApplied] = useState(!!applicantData);

    const [isFavorite, setIsFavorite] = useState(session?.favourite_jobs?.includes(job.id) || false);

    useEffect(() => {
        setIsFavorite(session?.favourite_jobs?.includes(job.id) || false);
    }, [session?.favourite_jobs, job.id]);

    useEffect(() => {
        setHasApplied(!!applicantData);
    }, [applicantData]);

    const handleToggleFavorite = async () => {
        if (!session) return;
        
        const originalIsFavorite = isFavorite;
        setIsFavorite(!originalIsFavorite);

        const newFavorites = originalIsFavorite 
            ? (session.favourite_jobs || []).filter(id => id !== job.id) 
            : [...(session.favourite_jobs || []), job.id];
        
        updateSession({ favourite_jobs: newFavorites });

        const result = await toggleFavoriteJobAction(job.id, session);
        if (result.error) {
            setIsFavorite(originalIsFavorite);
            updateSession({ favourite_jobs: session.favourite_jobs });
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    };
    
    const handleApply = async () => {
        if (!session) {
          toast({ title: 'Authentication Required', description: 'Please log in to apply.', variant: 'destructive' });
          router.push(`/login?redirectJobId=${job.id}`);
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
        jobId: job.id,
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
      } else {
        toast({ title: 'Application Failed', description: result.error || 'An unknown error occurred.', variant: 'destructive' });
      }
    };


    const descriptionLineCount = useMemo(() => job?.description?.split('\n').length || 0, [job?.description]);
    const selectedBenefits = useMemo(() => {
        if (!company?.benefits) return [];
        return allBenefits.filter(b => company.benefits!.includes(b.id));
    }, [company?.benefits]);
    
    const similarJobs = useMemo(() => {
        if (!job) return [];
        return allJobs.filter(j => j.id !== job.id).slice(0, 3);
    }, [job, allJobs]);

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

    const [activeTab, setActiveTab] = useState(hasApplied ? 'track' : 'description');

    useEffect(() => {
        if(hasApplied) setActiveTab('track');
        else setActiveTab('description');
    }, [hasApplied]);

    // Insights logic
    const insights = useMemo(() => {
        if (!session || !job) return null;

        const results = {
            skills: false,
            experience: false,
            location: false,
            salary: false,
        };

        // Skill check
        const candidateSkills = session.keySkills || [];
        const jobSkills = job.keySkills || [];
        results.skills = candidateSkills.some(skill => jobSkills.includes(skill));

        // Experience check
        const candidateExp = session.experience ? parseInt(session.experience, 10) : 0;
        const jobExpRange = job.workExperience.match(/(\d+)-(\d+)/);
        if (jobExpRange) {
            const minExp = parseInt(jobExpRange[1], 10);
            const maxExp = parseInt(jobExpRange[2], 10);
            results.experience = candidateExp >= minExp && candidateExp <= maxExp;
        } else if (job.workExperience.includes('+')) {
             const minExp = parseInt(job.workExperience, 10);
             results.experience = candidateExp >= minExp;
        } else if (job.workExperience === 'Fresher') {
             results.experience = candidateExp <= 1;
        }


        // Location check (simplified: assumes candidate prefers Remote if not specified)
        const candidatePreference = 'Remote'; // Placeholder
        results.location = job.preference === candidatePreference;

        // Salary check (very simplified)
        const candidateSalaryExpectation = 30; // Placeholder in LPA
        results.salary = candidateSalaryExpectation >= job.salary.min && candidateSalaryExpectation <= job.salary.max;

        return results;
    }, [session, job]);
    
    const jobTitleLink = applicantData ? `/dashboard/candidate/jobs/${job.id}` : '#';

    if (!job) return <JobDetailSkeleton />;

    return (
        <>
            <ScreeningQuestionsDialog
                open={isScreeningOpen}
                onOpenChange={setIsScreeningOpen}
                questions={screeningQuestions}
                onSubmit={submitApplication}
                isSubmitting={isApplying}
            />
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <Badge variant="outline" className="mb-2">{job.type}</Badge>
                             <CardTitle className="font-headline text-3xl">
                                <Link href={jobTitleLink} className={cn(applicantData && "hover:underline")}>
                                    {job.title}
                                </Link>
                            </CardTitle>
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
                                    <span>Posted {formatDistanceToNow(job.createdAt.toDate(), { addSuffix: true })}</span>
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
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{locationDisplay}</span></div>
                        {job.salary.min > 0 && job.salary.max > 0 && (<div className="flex items-center gap-2"><Banknote className="h-4 w-4" /><span>{job.salary.min} LPA to {job.salary.max} LPA</span></div>)}
                        <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /><span>{job.workExperience} experience</span></div>
                        <div className="flex items-center gap-2"><Building className="h-4 w-4" /><span>{job.positions} positions</span></div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="overflow-x-auto custom-scrollbar">
                             <TabsList className="bg-muted flex w-max">
                                {hasApplied && <TabsTrigger value="track">Track Application</TabsTrigger>}
                                <TabsTrigger value="description">Job Description</TabsTrigger>
                                <TabsTrigger value="insights">Insights</TabsTrigger>
                                <TabsTrigger value="analyze">Analyze Resume</TabsTrigger>
                                <TabsTrigger value="about">About Company</TabsTrigger>
                                <TabsTrigger value="similar">Similar Jobs</TabsTrigger>
                            </TabsList>
                        </div>
                        {hasApplied && (
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
                        )}
                        <TabsContent value="description" className="pt-6">
                          {job.status === 'Live' ? (
                            <div 
                                className={cn("prose dark:prose-invert max-w-full text-sm", !isDescriptionExpanded && "line-clamp-[10]")}
                                dangerouslySetInnerHTML={{ __html: job.description }}
                            />
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
                         <TabsContent value="insights" className="pt-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Activity on this job</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/30">
                                        <p className="text-2xl font-bold">{job.applicants?.length || 0}</p>
                                        <p className="text-sm text-muted-foreground">Total applications</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/30">
                                        <p className="text-2xl font-bold">{Math.floor((job.applicants?.length || 0) / 3)}</p>
                                        <p className="text-sm text-muted-foreground">Applications viewed</p>
                                    </div>
                                </div>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold mb-2">What may work for you?</h3>
                                <div className="space-y-3">
                                    {insights?.skills ? (
                                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                            <CheckCircle className="h-5 w-5" />
                                            <span>Your skills in **{job.keySkills?.[0]}** match the job requirements.</span>
                                        </div>
                                    ) : (
                                         <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                            <XCircle className="h-5 w-5" />
                                            <span>Your skills may not align with the primary job requirements like **{job.keySkills?.[0]}**.</span>
                                        </div>
                                    )}
                                     {insights?.experience ? (
                                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                            <CheckCircle className="h-5 w-5" />
                                            <span>Your **{session?.experience} years** of experience is within the required **{job.workExperience}** range.</span>
                                        </div>
                                     ) : (
                                         <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                            <XCircle className="h-5 w-5" />
                                            <span>Your **{session?.experience} years** of experience does not match the required **{job.workExperience}** range.</span>
                                        </div>
                                     )}
                                      {insights?.location ? (
                                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                            <CheckCircle className="h-5 w-5" />
                                            <span>This is a **{job.preference}** role which matches your preference.</span>
                                        </div>
                                     ) : (
                                         <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                            <XCircle className="h-5 w-5" />
                                            <span>This is an **{job.preference}** role in **{job.location}**, which may not match your preference for **Remote** work.</span>
                                        </div>
                                     )}
                                     {insights?.salary ? (
                                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                            <CheckCircle className="h-5 w-5" />
                                            <span>The salary range **({job.salary.min}-{job.salary.max} LPA)** aligns with your expectations.</span>
                                        </div>
                                     ) : (
                                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                            <XCircle className="h-5 w-5" />
                                            <span>The salary range may not align with your expectations.</span>
                                        </div>
                                     )}
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="analyze" className="pt-6">
                            <div className='text-center space-y-1 mb-4'>
                                <h2 className='text-2xl font-bold font-headline'>AI Resume Analysis</h2>
                                <p className='text-muted-foreground'>Upload a resume to analyze it against this job.</p>
                            </div>
                            <ResumeAnalysis 
                                jobId={job.id} 
                                jobTitle={job.title}
                                jobDescription={job.description}
                                companyName={company?.name || ''}
                            />
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
                                    {company.companySize && ( <div className="flex items-center gap-2"><Building className="h-4 w-4" /><span>{company.companySize.size} ({company.companySize.employees} employees)</span></div> )}
                                    {company.companyType && ( <div className="flex items-center gap-2"><Info className="h-4 w-4" /><span>{company.companyType}</span></div> )}
                                    {company.foundedYear && ( <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>Founded in {company.foundedYear}</span></div> )}
                                </div>
                                {company.aboutCompany && (
                                    <div>
                                        <h3 className="font-semibold mb-2">About the Company</h3>
                                        <p className={cn("text-sm text-muted-foreground whitespace-pre-wrap", !isAboutExpanded && "line-clamp-3")}>
                                            {company.aboutCompany}
                                        </p>
                                        <Button variant="link" onClick={() => setIsAboutExpanded(!isAboutExpanded)} className="p-0 h-auto text-sm">
                                            {isAboutExpanded ? 'Show Less' : 'Show More'}
                                            {isAboutExpanded ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                                        </Button>
                                    </div>
                                )}
                                {company.helplinePhone || company.helplineEmail ? (
                                    <div>
                                        <h3 className="font-semibold mb-2">Contact</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {company.helplinePhone && (<div className="flex items-start gap-3 text-sm"><Phone className="h-5 w-5 text-muted-foreground mt-1 shrink-0" /><div><p className="text-muted-foreground">Contact Phone</p><p className="font-medium">{company.helplinePhone}</p></div></div>)}
                                            {company.helplineEmail && (<div className="flex items-start gap-3 text-sm"><Mail className="h-5 w-5 text-muted-foreground mt-1 shrink-0" /><div><p className="text-muted-foreground">Contact Email</p><p className="font-medium">{company.helplineEmail}</p></div></div>)}
                                        </div>
                                    </div>
                                ) : null}
                                {selectedBenefits.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Benefits & Perks</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                                            {selectedBenefits.map(benefit => (<div key={benefit.id} className="flex items-center gap-2 text-sm text-muted-foreground"><benefit.icon className="h-5 w-5 text-primary" /><span>{benefit.label}</span></div>))}
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
        </>
    );
};

export const JobDetailSkeleton = () => {
    return (
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
                    </div>
                    <div className="pt-6 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
