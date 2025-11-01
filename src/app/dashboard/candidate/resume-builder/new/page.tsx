
'use client';

import { useState, useActionState, useRef } from 'react';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Sparkles, FileText, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateAtsResumeAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { GradientButton } from '@/components/ui/gradient-button';
import { cn } from '@/lib/utils';
import type { DragEvent } from 'react';
import { Switch } from '@/components/ui/switch';
import { useFormStatus } from 'react-dom';

const initialState = {
    error: null,
    success: false,
    resumeId: null,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <GradientButton type="submit" disabled={pending} size="lg">
            {pending ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {pending ? 'Generating...' : 'Generate My Resume'}
        </GradientButton>
    )
}

export default function NewResumePage() {
    const { session } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [state, formAction] = useActionState(generateAtsResumeAction, initialState);

    const [existingResume, setExistingResume] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [useProfileData, setUseProfileData] = useState(true);

    if (state.success && state.resumeId) {
        toast({ title: 'Resume Generated!', description: 'Your new resume is ready.' });
        router.push(`/dashboard/candidate/resumes/${state.resumeId}`);
    }

    const handleFileSelect = (file: File | null) => {
        if (file && (file.type.includes('pdf') || file.type.includes('document'))) {
            setExistingResume(file);
        } else {
            setExistingResume(null);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(event.target.files?.[0] || null);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (event.dataTransfer.files?.[0]) {
            handleFileSelect(event.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleButtonClick = () => fileInputRef.current?.click();
    
    const userDetailsFromProfile = session ? {
        name: session.displayName,
        email: session.email,
        phone: session.phone,
        profileSummary: session.profileSummary,
        keySkills: session.keySkills,
        employment: session.employment,
        education: session.education,
        projects: session.projects,
        socials: session.socials,
        portfolio: session.portfolio
    } : {};

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <DashboardSidebar role={session?.role || 'candidate'} user={session} />
            <div className="flex flex-col max-h-screen">
                <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="font-headline text-xl font-semibold">Generate New Resume</h1>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 custom-scrollbar">
                    <form action={formAction} className="max-w-4xl mx-auto w-full">
                        <input type="hidden" name="userId" value={session?.uid} />
                        <input 
                            type="hidden" 
                            name="userDetails" 
                            value={useProfileData ? JSON.stringify(userDetailsFromProfile) : ''} 
                        />
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Resume Generator</CardTitle>
                                <CardDescription>Fill in your details and provide a job description to get a tailored, ATS-friendly resume.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="resumeName">Resume Name</Label>
                                    <Input id="resumeName" name="resumeName" placeholder="e.g., Resume for Google SWE" required/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="existingResume">Upload Existing Resume (Optional)</Label>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx" className="hidden" name="existingResume"/>
                                    <div
                                        className={cn("relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors", isDragging && "border-dash-primary bg-dash-primary/10")}
                                        onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={handleButtonClick}
                                    >
                                        {existingResume ? (
                                            <div className="text-center">
                                                <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                                <p className="font-semibold">{existingResume.name}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch id="use-profile-data" checked={useProfileData} onCheckedChange={setUseProfileData} />
                                    <Label htmlFor="use-profile-data">Use details from my profile</Label>
                                </div>
                                
                                {!useProfileData && (
                                    <div className="space-y-2">
                                        <Label htmlFor="userDetailsManual">Your Details (JSON format)</Label>
                                        <Textarea id="userDetailsManual" name="userDetails" placeholder='{ "name": "John Doe", "email": "john@email.com", "phone": "123-456-7890", "skills": ["React", "TypeScript"], "experience": [{ "title": "Software Engineer", "company": "Tech Corp", "duration": "2020-Present", "responsibilities": ["Developed features...", "Mentored junior devs..."] }] }' required className="min-h-40 font-mono text-xs" />
                                        <p className="text-xs text-muted-foreground">Provide your details in JSON format. You can include sections like name, contact, summary, skills, experience, education, projects, etc.</p>
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    <Label htmlFor="jobDescription">Target Job Description</Label>
                                    <Textarea id="jobDescription" name="jobDescription" placeholder="Paste the job description you are targeting..." required className="min-h-40" />
                                </div>
                                <div className="flex justify-end">
                                    <SubmitButton />
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </main>
            </div>
        </div>
    );
}
