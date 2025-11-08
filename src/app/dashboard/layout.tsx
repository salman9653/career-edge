
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
                          <DashboardLayoutContent>
                              {children}
                          </DashboardLayoutContent>
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
