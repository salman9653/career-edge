import { MobileSearch } from '@/components/mobile-search';
import { ResumeAnalysisList } from './_components/analysis-list';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AllResumeAnalysesPage() {
    return (
        <>
            <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/candidate">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <h1 className="font-headline text-xl font-semibold">All Resume Analyses</h1>
                </div>
                <MobileSearch />
            </header>
            <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
                <ResumeAnalysisList />
            </main>
        </>
    );
}
