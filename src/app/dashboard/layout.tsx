'use client';

import { useState, useEffect } from 'react';
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

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

    return (
        <DashboardThemeProvider>
            <DashboardLayoutWrapper>
                <CompanyProvider>
                    <CandidateProvider>
                        <JobProvider>
                             <AssessmentProvider>
                                <QuestionProvider>
                                    <SettingsDialog open={isSettingsOpen} onOpenChange={handleSettingsOpenChange} initialTab={searchParams.get('tab') || 'Account'} />
                                    {children}
                                    <Toaster />
                                </QuestionProvider>
                            </AssessmentProvider>
                        </JobProvider>
                    </CandidateProvider>
                </CompanyProvider>
            </DashboardLayoutWrapper>
        </DashboardThemeProvider>
    );
}
