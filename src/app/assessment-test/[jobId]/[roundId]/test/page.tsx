import { Suspense } from 'react';
import AssessmentTestContent from './_components/test-content';
import { Loader2 } from 'lucide-react';

function TestPageLoading() {
    return (
        <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
}

interface AssessmentTestPageProps {
    params: Promise<{ jobId: string; roundId: string }>;
}

export default async function AssessmentTestPage({ params }: AssessmentTestPageProps) {
    const { jobId, roundId } = await params;
    
    return (
        <Suspense fallback={<TestPageLoading />}>
            <AssessmentTestContent jobId={jobId} roundId={roundId} />
        </Suspense>
    );
}
