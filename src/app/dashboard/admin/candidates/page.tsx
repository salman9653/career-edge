

'use client';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { CandidatesTable } from './_components/candidates-table';
import { MobileSearch } from '@/components/mobile-search';


export default function ManageCandidatesPage() {
  const { session, loading } = useSession();
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }


  if (!session) {
    // This should be handled by middleware, but as a fallback
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }


  if (session.role !== 'admin') {
     return (
        <>
             <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 custom-scrollbar">
                <p>You do not have permission to view this page.</p>
             </main>
        </>
     )
  }


  return (
    <>
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Manage Candidates</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-2 overflow-hidden p-4 md:p-6">
            <CandidatesTable />
        </main>
    </>
  );
}
