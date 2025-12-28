
'use client';

import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { redirect } from 'next/navigation';
import { CompanyProvider } from '@/context/company-context';
import { CandidateProvider } from '@/context/candidate-context';
import { QuestionProvider } from '@/context/question-context';
import { SubscriptionProvider } from '@/context/subscription-context';
import { CouponProvider } from '@/context/coupon-context';
import { ManagerProvider } from '@/context/manager-context';
import { JobProvider } from '@/context/job-context';

export default function AdminLayout({
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

    if (session.role !== 'admin') {
        redirect('/dashboard');
    }

    return (
        <SubscriptionProvider>
            <CompanyProvider>
                <CandidateProvider>
                    <QuestionProvider>
                        <CouponProvider>
                            <ManagerProvider>
                                <JobProvider>
                                    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                                        <DashboardSidebar role={session.role} user={session} />
                                        <div className="flex flex-col max-h-screen">
                                            {children}
                                        </div>
                                    </div>
                                </JobProvider>
                            </ManagerProvider>
                        </CouponProvider>
                    </QuestionProvider>
                </CandidateProvider>
            </CompanyProvider>
        </SubscriptionProvider>
    );
}
