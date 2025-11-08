
'use client';

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
    return (
        <SubscriptionProvider>
            <CompanyProvider>
                <CandidateProvider>
                    <QuestionProvider>
                        <CouponProvider>
                            <ManagerProvider>
                                <JobProvider>
                                    {children}
                                </JobProvider>
                            </ManagerProvider>
                        </CouponProvider>
                    </QuestionProvider>
                </CandidateProvider>
            </CompanyProvider>
        </SubscriptionProvider>
    );
}
