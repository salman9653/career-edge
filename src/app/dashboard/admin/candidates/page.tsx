import { MobileSearch } from '@/components/mobile-search';
import { CandidatesTable } from './_components/candidates-table';

export default function ManageCandidatesPage() {
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
