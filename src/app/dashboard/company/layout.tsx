
'use client';

import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { redirect } from 'next/navigation';
import { QuestionProvider } from '@/context/question-context';
import { AssessmentProvider } from '@/context/assessment-context';
import { JobProvider } from '@/context/job-context';
import { TalentPoolProvider } from '@/context/talent-pool-context';
import { AiInterviewProvider } from '@/context/ai-interview-context';

export default function CompanyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { session, loading } = useSession();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!session) {
        redirect('/login');
    }

    if (session.role !== 'company' && session.role !== 'manager') {
        redirect('/dashboard');
    }

    return (
        <JobProvider>
            <AssessmentProvider>
                <TalentPoolProvider>
                    <QuestionProvider>
                        <AiInterviewProvider>
                            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                                <DashboardSidebar role={session.role} user={session} />
                                <div className="flex flex-col max-h-screen">
                                    {children}
                                </div>
                            </div>
                        </AiInterviewProvider>
                    </QuestionProvider>
                </TalentPoolProvider>
            </AssessmentProvider>
        </JobProvider>
    );
}
