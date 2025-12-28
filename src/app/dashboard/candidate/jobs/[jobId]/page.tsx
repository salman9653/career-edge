import { CandidateJobDetailContent } from '../_components/job-detail-content';

interface PageProps {
    params: Promise<{ jobId: string }>;
}

export default async function CandidateJobDetailsPage({ params }: PageProps) {
    const { jobId } = await params;
    return <CandidateJobDetailContent jobId={jobId} />;
}
