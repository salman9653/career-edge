import { Suspense } from 'react';
import FeedbackContent from './_components/feedback-content';
import { Loader2 } from 'lucide-react';

function FeedbackPageLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
}

interface FeedbackPageProps {
    params: Promise<{ jobId: string; roundId: string }>;
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
    const { jobId, roundId } = await params;
    
    return (
        <Suspense fallback={<FeedbackPageLoading />}>
            <FeedbackContent jobId={jobId} roundId={roundId} />
        </Suspense>
    );
}
