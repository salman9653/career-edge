
'use client';

import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { MobileSearch } from '@/components/mobile-search';
import { GeneratedResumeProvider } from '@/context/generated-resume-context';
import { ResumesTable } from './_components/resumes-table';

export default function ResumeBuilderPage() {
    const { session } = useSession();

    return (
        <GeneratedResumeProvider>
            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                <DashboardSidebar role={session?.role || 'candidate'} user={session} />
                <div className="flex flex-col max-h-screen">
                    <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
                        <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Resume Builder</h1>
                        <MobileSearch />
                    </header>
                    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 custom-scrollbar">
                        <ResumesTable />
                    </main>
                </div>
            </div>
        </GeneratedResumeProvider>
    )
}
