
'use client';
import { MoreHorizontal, ArrowLeft, Briefcase, MapPin, Banknote, FileText, ListOrdered, ChevronDown, Edit, Trash2, ChevronsUpDown, ChevronUp, Check, Mail, Linkedin, Clipboard, BriefcaseBusiness, Share2, Loader2, AlertTriangle, Copy, Users, SquareArrowOutUpRight, Sparkles } from "lucide-react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ResumeAnalysis } from "@/components/resume-analysis"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "@/hooks/use-session"
import { useEffect, useState, useRef, useContext, useTransition, useMemo } from "react"
import type { Job, Round, Question, Applicant } from "@/lib/types"
import { doc, getDoc, onSnapshot, collection, Unsubscribe } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { QuestionContext } from "@/context/question-context";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { deleteJobAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { ShareButtonGroup } from "@/components/share-button-group"

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useSession();
  const { questions: allQuestions, loading: questionsLoading } = useContext(QuestionContext);
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const descriptionLineCount = useMemo(() => {
    return job?.description?.split('\n').length || 0;
  }, [job?.description]);
  
  const jobId = params.id as string;

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
          setLoading(false);
      });

    }
    
    return () => {
        jobUnsub?.();
        applicantsUnsub?.();
    };
  }, [jobId]);
  
  const handleDeleteJob = () => {
      startDeleteTransition(async () => {
        const result = await deleteJobAction(jobId);
        if (result?.error) {
            toast({ variant: "destructive", title: "Error deleting job", description: result.error });
        } else {
            toast({ title: "Job Deleted", description: "The job posting has been successfully deleted." });
        }
        setIsDeleteDialogOpen(false);
      });
  }

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.toDate ? date.toDate() : new Date(date);
    return format(jsDate, "dd MMM yyyy");
  }

  const getJobLink = () => `${window.location.origin}/apply-with-link/${jobId}`;


  if(loading || !job || questionsLoading) {
    return (
       <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardSidebar role="company" user={session} />
        <div className="flex flex-col max-h-screen">
            <header className="flex h-16 shrink-0 items-center gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
                <Skeleton className="h-6 w-1/2" />
            </header>
            <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
                <Skeleton className="h-full w-full" />
            </main>
        </div>
      </div>
    )
  }

  const locationDisplay = job.preference === 'Remote' ? 'Remote' : `${job.location} (${job.preference})`;
  const getRoundQuestions = (round: Round): Question[] => {
    if (round.type !== 'screening' || !round.questionIds) return [];
    return allQuestions.filter(q => round.questionIds.includes(q.id));
  };


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role="company" user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
            </Button>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="font-headline text-xl font-semibold">{job.title}</h1>
            </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="font-headline text-3xl">{job.title}</CardTitle>
                                <Badge variant={job.status === 'Live' ? 'default' : 'outline'}>{job.status}</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6 text-xs">
                                        <AvatarFallback>{getInitials(job.createdByName)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{job.createdByName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4"/>
                                    <span>Posted on {formatDate(job.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShareButtonGroup jobTitle={job.title} companyName={session?.displayName || ''} jobLink={getJobLink()} />
                            <Button variant="secondary" size="sm" asChild>
                                <Link href={`/dashboard/company/jobs/edit/${job.id}`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Link>
                            </Button>
                            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <div className="flex justify-center">
                                            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                                                <AlertTriangle className="h-6 w-6 text-destructive"/>
                                            </div>
                                        </div>
                                        <AlertDialogTitle className="text-center">Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-center">
                                            This action cannot be undone. This will permanently delete this job posting and all its data.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteJob} disabled={isDeletePending} className="bg-destructive hover:bg-destructive/90">
                                            {isDeletePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm text-muted-foreground border-t border-b py-4">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                            <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /><span>{job.type}</span></div>
                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span className="capitalize">{locationDisplay}</span></div>
                            {job.salary.min > 0 && job.salary.max > 0 && (<div className="flex items-center gap-2"><Banknote className="h-4 w-4" /><span>{job.salary.min} LPA to {job.salary.max} LPA</span></div>)}
                            <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /><span>{job.workExperience}</span></div>
                            <div className="flex items-center gap-2"><Users className="h-4 w-4" /><span>{job.positions} positions</span></div>
                        </div>
                         <Link href={`/dashboard/company/ats/${job.id}`} className="flex items-center gap-2 text-dash-primary hover:underline font-semibold">
                            <Users className="h-4 w-4" />
                            <span>{applicants.length} Applicants</span>
                            <SquareArrowOutUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                     <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Assigned Recruiter:</span>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 text-xs"><AvatarFallback>{getInitials(job.recruiter.name)}</AvatarFallback></Avatar>
                            <span className="font-medium">{job.recruiter.name}</span>
                        </div>
                    </div>
                </CardContent>
                <Tabs defaultValue="description">
                    <CardContent>
                         <TabsList>
                            <TabsTrigger value="description">Job Description</TabsTrigger>
                            <TabsTrigger value="rounds">Hiring Rounds</TabsTrigger>
                            <TabsTrigger value="analysis">AI Resume Analysis</TabsTrigger>
                        </TabsList>
                    </CardContent>
                    <TabsContent value="description" className="px-6 pb-6">
                        <div className={cn("whitespace-pre-wrap text-sm", !isDescriptionExpanded && "line-clamp-[10]")}>
                            {job.description}
                        </div>
                         {descriptionLineCount > 10 && (
                            <Button variant="link" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="p-0 h-auto">
                                {isDescriptionExpanded ? 'Show Less' : 'Show More'}
                            </Button>
                        )}
                    </TabsContent>
                    <TabsContent value="rounds" className="px-6 pb-6">
                         <div className="space-y-4 py-4">
                            {job.rounds.map((round: Round, index: number) => {
                                if(round.type === 'screening') {
                                    const screeningQuestions = getRoundQuestions(round);
                                    return (
                                        <Collapsible key={index} className="group">
                                            <CollapsibleTrigger asChild>
                                                <div className="flex items-start gap-3 p-3 rounded-md border bg-secondary cursor-pointer">
                                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-dash-primary text-dash-primary-foreground font-bold shrink-0 mt-1">{index + 1}</div>
                                                    <div className="flex-1 text-sm">
                                                        <p className="font-medium">{round.name} <span className="text-muted-foreground capitalize">({round.type})</span></p>
                                                        {round.questionIds && <p className="text-xs text-muted-foreground mt-1">{round.questionIds.length} screening questions</p>}
                                                    </div>
                                                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="py-2 pl-4 pr-4 border-l-2 border-dash-primary ml-5 mt-1">
                                                    <ol className="space-y-1 text-sm text-muted-foreground">
                                                        {screeningQuestions.map((q, i) => (
                                                          <li key={q.id}>
                                                            <span className="font-semibold text-dash-primary mr-2">Q{i + 1}:</span>{q.question}
                                                          </li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    )
                                }
                                return (
                                    <div key={index} className="flex items-start gap-3 p-3 rounded-md border bg-secondary">
                                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-dash-primary text-dash-primary-foreground font-bold shrink-0 mt-1">{index + 1}</div>
                                      <div className="flex-1 text-sm">
                                          <p className="font-medium">{round.name} <span className="text-muted-foreground capitalize">({round.type})</span></p>
                                          {round.assessmentName && <p className="text-xs text-muted-foreground">Assessment: {round.assessmentName}</p>}
                                          {round.aiInterviewName && <p className="text-xs text-muted-foreground">AI Interview Name: {round.aiInterviewName}</p>}
                                          {round.selectionCriteria && <p className="text-xs text-muted-foreground">Passing Criteria: {round.selectionCriteria}%</p>}
                                      </div>
                                    </div>
                                )
                            })}
                            {job.rounds.length === 0 && <p className="text-muted-foreground">No rounds configured for this job.</p>}
                          </div>
                    </TabsContent>
                    <TabsContent value="analysis" className="px-6 pb-6">
                        <div className="text-center space-y-1 mb-4">
                           <h2 className='text-2xl font-bold font-headline'>AI Resume Analysis</h2>
                           <div className='text-muted-foreground max-w-md mx-auto'>Upload a resume to automatically screen and score it against this job description.
                             <Badge variant="outline" className="ml-2">Coming Soon</Badge>
                           </div>
                        </div>
                        <ResumeAnalysis jobDescription={job.description} view="drag-and-drop" />
                    </TabsContent>
                </Tabs>
            </Card>
        </main>
      </div>
    </div>
  )
}
