
'use client';

import { QuestionProvider } from '@/context/question-context';
import { AssessmentProvider } from '@/context/assessment-context';
import { JobProvider } from '@/context/job-context';
import { TalentPoolProvider } from '@/context/talent-pool-context';

export default function CompanyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <JobProvider>
            <AssessmentProvider>
                <TalentPoolProvider>
                    <QuestionProvider>
                        {children}
                    </QuestionProvider>
                </TalentPoolProvider>
            </AssessmentProvider>
        </JobProvider>
    );
}
