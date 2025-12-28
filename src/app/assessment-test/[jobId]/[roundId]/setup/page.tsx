import { Suspense } from 'react';
import AssessmentSetupContent from './_components/setup-content';
import { Card } from '@/components/ui/card';
import { Loader2, Briefcase } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

function SetupPageLoading() {
    return (
        <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
            <div className="flex items-center justify-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                    <span className="font-headline text-lg font-bold text-foreground">Career Edge</span>
                    <Avatar className="h-12 w-12">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#667EEA] to-[#764BA2] text-white">
                            <Briefcase className="h-6 w-6" />
                        </div>
                    </Avatar>
                </div>
            </div>
            <Card className="w-full max-w-4xl overflow-hidden">
                <div className="flex flex-col items-center justify-center gap-2 text-center p-8 min-h-[700px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Loading setup...</p>
                </div>
            </Card>
        </div>
    );
}

interface AssessmentSetupPageProps {
    params: Promise<{ jobId: string; roundId: string }>;
}

export default async function AssessmentSetupPage({ params }: AssessmentSetupPageProps) {
    const { jobId, roundId } = await params;
    
    return (
        <Suspense fallback={<SetupPageLoading />}>
            <AssessmentSetupContent jobId={jobId} roundId={roundId} />
        </Suspense>
    );
}
