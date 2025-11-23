
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardThemeProvider } from '@/context/dashboard-theme-context';
import { DashboardLayoutWrapper } from './layout-wrapper';
import { CompanyProvider } from '@/context/company-context';
import { CandidateProvider } from '@/context/candidate-context';
import { SettingsDialog } from '@/components/settings-dialog';
import { Toaster } from '@/components/ui/toaster';
import { JobProvider } from '@/context/job-context';
import { AssessmentProvider } from '@/context/assessment-context';
import { QuestionProvider } from '@/context/question-context';
import { Loader2 } from 'lucide-react';
import { NotificationProvider } from '@/context/notification-context';
import { AiInterviewProvider } from '@/context/ai-interview-context';
import { CommandMenu } from '@/components/command-menu';
import { GeneratedResumeProvider } from '@/context/generated-resume-context';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

    useEffect(() => {
        setIsSettingsOpen(searchParams.get('settings') === 'true');
    }, [searchParams]);

     const handleSettingsOpenChange = (open: boolean) => {
        const params = new URLSearchParams(searchParams.toString());
        if (open) {
            params.set('settings', 'true');
            if (!params.has('tab')) {
                params.set('tab', 'Account');
            }
        } else {
            params.delete('settings');
            params.delete('tab');
        }
        router.replace(`?${params.toString()}`, { scroll: false });
    }
    
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
          if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            setIsCommandMenuOpen((open) => !open)
          }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
      }, []);

    return (
        <DashboardThemeProvider>
            <DashboardLayoutWrapper>
                <NotificationProvider>
                  <SettingsDialog open={isSettingsOpen} onOpenChange={handleSettingsOpenChange} initialTab={searchParams.get('tab') || 'Account'} />
                  <CommandMenu open={isCommandMenuOpen} onOpenChange={setIsCommandMenuOpen} />
                  {children}
                  <Toaster />
                </NotificationProvider>
            </DashboardLayoutWrapper>
        </DashboardThemeProvider>
    )
}


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <CompanyProvider>
              <CandidateProvider>
                <JobProvider>
                  <AssessmentProvider>
                    <QuestionProvider>
                      <AiInterviewProvider>
                        <GeneratedResumeProvider>
                          <div className="relative min-h-screen w-full overflow-hidden">
                            {/* Animated gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/30 dark:from-primary/10 dark:via-background dark:to-secondary/20 -z-20" />
                            
                            {/* Animated orbs */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                              <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-blob" />
                              <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
                            </div>

                            <DashboardLayoutContent>
                                {children}
                            </DashboardLayoutContent>
                          </div>
                        </GeneratedResumeProvider>
                      </AiInterviewProvider>
                    </QuestionProvider>
                  </AssessmentProvider>
                </JobProvider>
              </CandidateProvider>
            </CompanyProvider>
        </Suspense>
    );
}
