import { Suspense } from 'react';
import ApplyWithLinkContent from './_components/apply-content';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/logo';

function ApplyPageLoading() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-secondary p-4">
            <div className="mt-12 mb-8 flex justify-center"><Logo /></div>
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-5 w-1/2 mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        </div>
    );
}

interface ApplyWithLinkPageProps {
    params: Promise<{ jobId: string }>;
}

export default async function ApplyWithLinkPage({ params }: ApplyWithLinkPageProps) {
    const { jobId } = await params;
    
    return (
        <Suspense fallback={<ApplyPageLoading />}>
            <ApplyWithLinkContent jobId={jobId} />
        </Suspense>
    );
}
