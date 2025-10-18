
'use client';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Trash2, Loader2, GripVertical, Edit } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useContext, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AssessmentContext } from '@/context/assessment-context';
import type { Assessment, Question, Round, Job } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SelectScreeningQuestions } from '../../_components/select-screening-questions';
import { Reorder } from 'framer-motion';
import { updateJobAction } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AiInterviewContext } from '@/context/ai-interview-context';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface Manager {
    id: string;
    name: string;
}

export default function EditJobPage() {
  const { session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { assessments } = useContext(AssessmentContext);
  const { interviews: aiInterviews } = useContext(AiInterviewContext);
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [jobDetails, setJobDetails] = useState({
    title: '',
    description: '',
    type: '',
    preference: '',
    location: '',
    recruiter: '',
    workExperience: '',
    minSalary: '',
    maxSalary: '',
    positions: '1',
  });
  
  // State for new round creation
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundType, setNewRoundType] = useState('');
  const [newRoundAssessmentId, setNewRoundAssessmentId] = useState('');
  const [newRoundAiInterviewId, setNewRoundAiInterviewId] = useState('');
  const [newRoundSelectionCriteria, setNewRoundSelectionCriteria] = useState('');
  const [newRoundAutoProceed, setNewRoundAutoProceed] = useState(false);
  const [isScreeningSheetOpen, setIsScreeningSheetOpen] = useState(false);
  const [screeningQuestions, setScreeningQuestions] = useState<Question[]>([]);

  const [rounds, setRounds] = useState<Round[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [editingRoundId, setEditingRoundId] = useState<number | null>(null);

  const hasScreeningRound = useMemo(() => rounds.some(r => r.type === 'screening'), [rounds]);

  useEffect(() => {
    if (jobId) {
      const fetchJob = async () => {
        setLoading(true);
        const docRef = doc(db, 'jobs', jobId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Job;
          setJob(data);
          setJobDetails({
            title: data.title,
            description: data.description,
            type: data.type,
            preference: data.preference,
            location: data.location,
            recruiter: data.recruiter.id,
            workExperience: data.workExperience,
            minSalary: String(data.salary.min),
            maxSalary: String(data.salary.max),
            positions: String(data.positions),
          });
          setRounds(data.rounds);
        }
        setLoading(false);
      };
      fetchJob();
    }
  }, [jobId]);

  const filteredAssessments = useMemo(() => {
    if (newRoundType === 'assessment') {
      return assessments.filter(a => a.assessmentType === 'mcq' || a.assessmentType === 'subjective');
    }
    if (newRoundType === 'coding assessment') {
      return assessments.filter(a => a.assessmentType === 'code');
    }
    return [];
  }, [assessments, newRoundType]);
  

  useEffect(() => {
    if (session?.uid) {
        const companyId = session.role === 'company' ? session.uid : session.company_uid;
        if (!companyId) return;

        const managersQuery = query(collection(db, 'users'), where('company_uid', '==', companyId), where('status', '==', 'active'));
        const unsubscribe = onSnapshot(managersQuery, (snapshot) => {
            const managersList = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
            if (session.role === 'company') {
                managersList.unshift({ id: session.uid, name: session.displayName });
            }
            setManagers(managersList);
        });
        return () => unsubscribe();
    }
  }, [session]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    // No need to get data from form, it's already in state
    setStep(2);
  }

  const resetRoundForm = () => {
    setNewRoundName('');
    setNewRoundType('');
    setNewRoundAssessmentId('');
    setNewRoundAiInterviewId('');
    setNewRoundSelectionCriteria('');
    setNewRoundAutoProceed(false);
    setScreeningQuestions([]);
    setEditingRoundId(null);
  };
  
  const handleSaveRound = () => {
    if (newRoundName.trim() === '' || newRoundType.trim() === '') return;

    let roundData: Omit<Round, 'id' | 'assessmentName' | 'questions'> & { assessmentName?: string; questions?: Question[]; questionIds?: string[]; aiInterviewId?: string, aiInterviewName?: string } = {
        name: newRoundName,
        type: newRoundType,
        autoProceed: newRoundType !== 'screening' ? newRoundAutoProceed : false,
    };

    if (newRoundType === 'screening') {
        roundData.questionIds = screeningQuestions.map(q => q.id);
        roundData.questions = screeningQuestions;
    } else if (['assessment', 'coding assessment'].includes(newRoundType)) {
        const selectedAssessment = assessments.find(a => a.id === newRoundAssessmentId);
        roundData.assessmentId = newRoundAssessmentId;
        roundData.assessmentName = selectedAssessment?.name;
        if (newRoundType === 'assessment') {
            roundData.selectionCriteria = Number(newRoundSelectionCriteria);
        }
    } else if (newRoundType === 'ai interview') {
        const selectedAiInterview = aiInterviews.find(i => i.id === newRoundAiInterviewId);
        roundData.aiInterviewId = newRoundAiInterviewId;
        roundData.aiInterviewName = selectedAiInterview?.name;
    }
    
    if (editingRoundId !== null) {
        setRounds(rounds.map(r => r.id === editingRoundId ? { ...r, ...roundData, id: editingRoundId } : r));
    } else {
        setRounds([...rounds, { ...roundData, id: Date.now() }]);
    }
    
    resetRoundForm();
  };

  const handleRemoveRound = (roundId: number) => {
    setRounds(rounds.filter(r => r.id !== roundId));
  };
  
  const handleEditRound = (round: Round) => {
    setEditingRoundId(round.id);
    setNewRoundName(round.name);
    setNewRoundType(round.type);
    setNewRoundAssessmentId(round.assessmentId || '');
    setNewRoundAiInterviewId(round.aiInterviewId || '');
    setNewRoundSelectionCriteria(String(round.selectionCriteria || ''));
    setNewRoundAutoProceed(round.autoProceed || false);
    setScreeningQuestions(round.questions || []);
  };
  
  const handleFinalSubmit = async () => {
      if (!session) return;
      setIsSubmitting(true);
      
      const companyId = session.role === 'company' ? session.uid : session.company_uid;
      
      const { minSalary, maxSalary, recruiter, ...restOfJobDetails } = jobDetails;

      const selectedRecruiter = managers.find(m => m.id === recruiter);

      const jobData = {
          ...restOfJobDetails,
          positions: Number(jobDetails.positions),
          salary: {
            min: Number(minSalary),
            max: Number(maxSalary),
          },
          recruiter: {
            id: selectedRecruiter?.id || '',
            name: selectedRecruiter?.name || '',
          },
          companyId,
      };

      const finalRounds = rounds.map(round => {
        const { questions, ...rest } = round; // remove questions prop from all rounds
        if (round.type === 'screening') {
            return { ...rest, questionIds: questions?.map(q => q.id) || [] };
        }
        return rest;
      });

      await updateJobAction(jobId, jobData, finalRounds);
      
      setIsSubmitting(false);
  }
  
  const progressValue = step === 1 ? 50 : 100;
  
  if (loading) {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <DashboardSidebar role="company" user={session} />
          <div className="flex flex-col max-h-screen">
            <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
              <Skeleton className="h-8 w-64" />
            </header>
            <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
              <Skeleton className="h-full w-full" />
            </main>
          </div>
        </div>
      );
  }

  return (
    <>
    <SelectScreeningQuestions
        open={isScreeningSheetOpen}
        onOpenChange={setIsScreeningSheetOpen}
        selectedQuestions={screeningQuestions}
        onSelectQuestions={setScreeningQuestions}
    />
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role="company" user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="font-headline text-xl font-semibold">Edit Job Posting</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
          <div className="w-full flex-1 flex flex-col">
             <div className="mx-auto md:w-1/2 mb-6 space-y-2">
                <Progress value={progressValue} className="h-2" />
                <p className="text-sm text-muted-foreground">Step {step} of 2</p>
            </div>
            <Card className="flex-1 flex flex-col">
              {step === 1 && (
                <form onSubmit={handleNext}>
                  <CardHeader>
                    <CardTitle>1. Job Details</CardTitle>
                    <CardDescription>Update the primary details for the job posting.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input id="title" name="title" placeholder="e.g., Senior Frontend Developer" defaultValue={jobDetails.title} required />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="type">Job Type</Label>
                          <Select name="type" defaultValue={jobDetails.type} required onValueChange={(value) => setJobDetails(p => ({...p, type: value}))}>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Full-time">Full-time</SelectItem>
                              <SelectItem value="Part-time">Part-time</SelectItem>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Freelance">Freelance</SelectItem>
                              <SelectItem value="Internship">Internship</SelectItem>
                          </SelectContent>
                          </Select>
                      </div>
                       <div className="space-y-2">
                          <Label htmlFor="recruiter">Recruiter Assigned</Label>
                          <Select name="recruiter" defaultValue={jobDetails.recruiter}>
                              <SelectTrigger><SelectValue placeholder="Select a recruiter..." /></SelectTrigger>
                              <SelectContent>
                                  {managers.map(manager => (
                                      <SelectItem key={manager.id} value={manager.id}>{manager.name}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Job Description</Label>
                      <RichTextEditor value={jobDetails.description} onChange={(value) => setJobDetails(p => ({...p, description: value}))} showImageOption={false} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="preference">Job Preference</Label>
                            <Select name="preference" defaultValue={jobDetails.preference} required onValueChange={(value) => setJobDetails(p => ({...p, preference: value, location: value === 'Remote' ? 'Remote' : ''}))}>
                            <SelectTrigger><SelectValue placeholder="Select preference" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Remote">Remote</SelectItem>
                                <SelectItem value="On-site">On-site</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input 
                              id="location" 
                              name="location" 
                              placeholder="e.g., New York, NY" 
                              value={jobDetails.location}
                              onChange={(e) => setJobDetails(p => ({...p, location: e.target.value}))}
                              required 
                              disabled={jobDetails.preference === 'Remote'}
                          />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="positions">No. of Positions</Label>
                                <Input id="positions" name="positions" type="number" min="1" defaultValue={jobDetails.positions} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="workExperience">Work Experience</Label>
                                <Select name="workExperience" defaultValue={jobDetails.workExperience} onValueChange={(value) => setJobDetails(p => ({...p, workExperience: value}))}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Fresher">Fresher</SelectItem>
                                        <SelectItem value="0-1 Year">0-1 Year</SelectItem>
                                        <SelectItem value="1-3 years">1-3 years</SelectItem>
                                        <SelectItem value="3-5 years">3-5 years</SelectItem>
                                        <SelectItem value="5-7 years">5-7 years</SelectItem>
                                        <SelectItem value="7+ years">7+ years</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                           <Label>Salary Range (LPA)</Label>
                            <div className="flex items-center border border-input rounded-md">
                                <Input 
                                    type="number" 
                                    name="minSalary" 
                                    placeholder="Min" 
                                    step="0.1" 
                                    defaultValue={jobDetails.minSalary}
                                    className="border-0 rounded-r-none focus-visible:ring-0"
                                />
                                <div className="h-6 border-l border-input"></div>
                                <Input 
                                    type="number" 
                                    name="maxSalary" 
                                    placeholder="Max" 
                                    step="0.1" 
                                    defaultValue={jobDetails.maxSalary}
                                    className="border-0 rounded-l-none focus-visible:ring-0"
                                />
                            </div>
                        </div>
                    </div>
                  </CardContent>
                   <CardFooter className="flex justify-end pt-4">
                      <Button type="submit">Next: Define Rounds</Button>
                    </CardFooter>
                </form>
              )}

              {step === 2 && (
                <>
                   <CardContent className="flex-1 grid md:grid-cols-2 md:gap-8 min-h-0 pt-6">
                        {/* Left Panel */}
                        <div className="flex flex-col min-h-0">
                            <h4 className="font-semibold mb-4">Configured Rounds</h4>
                            <div className="flex-1 relative">
                                <ScrollArea className="absolute inset-0 pr-4">
                                     <Reorder.Group axis="y" values={rounds} onReorder={setRounds} className="space-y-2">
                                        {rounds.map((round) => (
                                        <Reorder.Item key={round.id} value={round}>
                                        <div className="flex items-center gap-2 p-3 rounded-md border bg-secondary">
                                            <button className="p-1 text-muted-foreground cursor-grab active:cursor-grabbing">
                                                <GripVertical className="h-5 w-5" />
                                            </button>
                                            <div className="flex-1 text-sm">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">{round.name} <span className="text-muted-foreground capitalize">({round.type})</span></p>
                                                    {round.assessmentName && <p className="text-xs text-muted-foreground">Assessment: {round.assessmentName}</p>}
                                                    {round.aiInterviewName && <p className="text-xs text-muted-foreground">AI Interview: {round.aiInterviewName}</p>}
                                                    {round.selectionCriteria && <p className="text-xs text-muted-foreground">Passing Criteria: {round.selectionCriteria}%</p>}
                                                    {round.type === 'screening' && round.questions && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {round.questions.length.toString().padStart(2, '0')} screening questions selected
                                                        </p>
                                                    )}
                                                </div>
                                                {round.type !== 'screening' && (
                                                  <Badge variant={round.autoProceed ? 'default' : 'outline'}>
                                                      {round.autoProceed ? 'Auto' : 'Manual'}
                                                  </Badge>
                                                )}
                                            </div>
                                            </div>
                                            {editingRoundId === round.id ? (
                                                <span className="text-sm font-medium text-muted-foreground animate-pulse">editing...</span>
                                            ) : (
                                                <>
                                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditRound(round)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveRound(round.id)} className="h-8 w-8">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                                </>
                                            )}
                                        </div>
                                        </Reorder.Item>
                                        ))}
                                        {rounds.length === 0 && <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg">No rounds added yet.</p>}
                                    </Reorder.Group>
                                </ScrollArea>
                            </div>
                        </div>
                        
                        {/* Right Panel */}
                        <div className="flex flex-col">
                             <h4 className="font-semibold mb-4">{editingRoundId ? 'Edit Round' : 'Add New Round'}</h4>
                            <div className="space-y-4 p-4 border rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-round-name">Round Name</Label>
                                    <Input
                                        id="new-round-name"
                                        placeholder="e.g., HR Connect"
                                        value={newRoundName}
                                        onChange={(e) => setNewRoundName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-round-type">Round Type</Label>
                                    <Select value={newRoundType} onValueChange={setNewRoundType}>
                                    <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="screening" disabled={hasScreeningRound && (editingRoundId === null || rounds.find(r => r.id === editingRoundId)?.type !== 'screening')}>Screening</SelectItem>
                                        <SelectItem value="telephonic" disabled>Telephonic</SelectItem>
                                        <SelectItem value="assessment">Assessment</SelectItem>
                                        <SelectItem value="coding assessment" disabled>Coding Assessment</SelectItem>
                                        <SelectItem value="ai interview">AI Interview</SelectItem>
                                        <SelectItem value="live interview" disabled>Live Interview</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                                </div>
                                
                                {newRoundType === 'assessment' && (
                                <div className="space-y-2">
                                    <Label htmlFor="new-round-assessment">Assessment Name</Label>
                                    <Select value={newRoundAssessmentId} onValueChange={setNewRoundAssessmentId}>
                                    <SelectTrigger><SelectValue placeholder="Select assessment..." /></SelectTrigger>
                                    <SelectContent>
                                        {filteredAssessments.map(assessment => (
                                        <SelectItem key={assessment.id} value={assessment.id}>
                                            <div className="flex justify-between w-full">
                                                <span>{assessment.name}</span>
                                                <span className="text-muted-foreground ml-4">({assessment.questionIds.length} Questions)</span>
                                            </div>
                                        </SelectItem>
                                        ))}
                                        {filteredAssessments.length === 0 && <p className="p-2 text-sm text-muted-foreground">No matching assessments found.</p>}
                                    </SelectContent>
                                    </Select>
                                </div>
                                )}

                                {newRoundType === 'ai interview' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="new-round-ai-interview">AI Interview Name</Label>
                                        <Select value={newRoundAiInterviewId} onValueChange={setNewRoundAiInterviewId}>
                                            <SelectTrigger><SelectValue placeholder="Select AI interview..." /></SelectTrigger>
                                            <SelectContent>
                                                {aiInterviews.map(interview => (
                                                    <SelectItem key={interview.id} value={interview.id}>
                                                        {interview.name}
                                                    </SelectItem>
                                                ))}
                                                {aiInterviews.length === 0 && <p className="p-2 text-sm text-muted-foreground">No AI interviews found.</p>}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {newRoundType === 'screening' && (
                                    <div className="space-y-2">
                                        {screeningQuestions.length > 0 && (
                                            <p className="text-base text-muted-foreground">
                                                {screeningQuestions.length.toString().padStart(2, '0')} screening questions selected
                                            </p>
                                        )}
                                        <Button variant="outline" className="w-full" onClick={() => setIsScreeningSheetOpen(true)}>
                                            {screeningQuestions.length > 0 ? "Select More" : "Select Screening Questions"}
                                        </Button>
                                    </div>
                                )}

                                {newRoundType === 'assessment' && (
                                <div className="space-y-2">
                                    <Label htmlFor="new-round-criteria">Selection Criteria (%)</Label>
                                    <Input
                                    id="new-round-criteria"
                                    type="number"
                                    placeholder="% marks required to pass"
                                    value={newRoundSelectionCriteria}
                                    onChange={(e) => setNewRoundSelectionCriteria(e.target.value)}
                                    />
                                </div>
                                )}
                                {newRoundType !== 'screening' && (
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="auto-proceed"
                                        checked={newRoundAutoProceed}
                                        onCheckedChange={setNewRoundAutoProceed}
                                    />
                                    <Label htmlFor="auto-proceed">Proceed to next round automatically on pass</Label>
                                </div>
                                )}
                                <div className="flex justify-end gap-2">
                                     {editingRoundId !== null && (
                                        <Button type="button" variant="ghost" onClick={resetRoundForm}>Cancel</Button>
                                    )}
                                    <Button type="button" variant="secondary" onClick={handleSaveRound}>
                                        {editingRoundId !== null ? 'Update Round' : 'Save'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-4">
                        <Button variant="outline" onClick={() => setStep(1)} className="px-6">Back</Button>
                         <Button onClick={handleFinalSubmit} disabled={isSubmitting} className="px-6">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Updating Job...' : 'Update Job'}
                        </Button>
                    </CardFooter>
                </>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
