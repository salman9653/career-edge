'use client';

import { GeneratedResumeProvider } from '@/context/generated-resume-context';
import { ResumesTable } from './resumes-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, FileText, BotIcon, FilesIcon } from 'lucide-react';

const PlaceholderContent = ({ title, description, icon: Icon }: { title: string; description: string; icon: React.ElementType }) => (
    <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted p-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background">
            <Icon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-6 text-xl font-semibold">{title}</h3>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
);

export function ResumesPageContent() {
    return (
        <GeneratedResumeProvider>
            <Tabs defaultValue="generator" className="flex flex-col h-full">
                <TabsList className="mb-4 self-start">
                    <TabsTrigger value="generator">Resume Generator</TabsTrigger>
                    <TabsTrigger value="critique" disabled>Resume Critique</TabsTrigger>
                    <TabsTrigger value="cover-letter" disabled>Cover Letter Generator</TabsTrigger>
                    <TabsTrigger value="resume-samples" disabled>Resume Samples</TabsTrigger>
                    <TabsTrigger value="cover-letter-samples" disabled>Cover Letter Samples</TabsTrigger>
                </TabsList>
                <TabsContent value="generator" className="flex-1 overflow-hidden">
                    <ResumesTable />
                </TabsContent>
                    <TabsContent value="critique" className="flex-1 overflow-hidden">
                    <PlaceholderContent
                        title="Coming Soon: AI Resume Critique"
                        description="Get instant, detailed feedback on your resume to improve its effectiveness and ATS compatibility."
                        icon={BotIcon}
                    />
                    </TabsContent>
                    <TabsContent value="cover-letter" className="flex-1 overflow-hidden">
                    <PlaceholderContent
                        title="Coming Soon: AI Cover Letter Generator"
                        description="Generate personalized and compelling cover letters tailored to specific job descriptions in seconds."
                        icon={Bot}
                    />
                    </TabsContent>
                    <TabsContent value="resume-samples" className="flex-1 overflow-hidden">
                    <PlaceholderContent
                        title="Coming Soon: Resume Samples"
                        description="Browse a library of professional resume samples for various industries and roles to get inspired."
                        icon={FileText}
                    />
                    </TabsContent>
                    <TabsContent value="cover-letter-samples" className="flex-1 overflow-hidden">
                    <PlaceholderContent
                        title="Coming Soon: Cover Letter Samples"
                        description="Explore a collection of effective cover letters to learn what makes a great first impression."
                        icon={FilesIcon}
                    />
                    </TabsContent>
            </Tabs>
        </GeneratedResumeProvider>
    )
}
