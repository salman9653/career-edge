
'use client';

import { CompanyProvider } from '@/context/company-context';
import { CandidateProvider } from '@/context/candidate-context';
import { QuestionProvider } from '@/context/question-context';
import { SubscriptionProvider } from '@/context/subscription-context';
import { CouponProvider } from '@/context/coupon-context';

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
                            {children}
                        </CouponProvider>
                    </QuestionProvider>
                </CandidateProvider>
            </CompanyProvider>
        </SubscriptionProvider>
    );
}
