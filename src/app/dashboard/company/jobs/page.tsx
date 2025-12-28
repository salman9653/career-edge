import { MobileSearch } from '@/components/mobile-search';
import { JobsTable } from './_components/jobs-table';
import { Suspense } from 'react';
import { getJobsByCompanyArray } from '@/lib/data/jobs-server';
import { requireUser } from '@/lib/auth/server';
import JobsLoading from './loading';

async function AsyncJobsTable({ companyId }: { companyId: string }) {
    const jobs = await getJobsByCompanyArray(companyId);
    return <JobsTable jobs={jobs} />;
}

export default async function CompanyJobsPage() {
    // requireUser is fast (cookie decryption)
    const user = await requireUser();
    const companyId = user.role === 'company' ? user.uid : user.company_uid!;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
        <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Job Postings</h1>
        <MobileSearch />
      </header>
      <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:p-6">
        <Suspense fallback={<JobsLoading />}>
            <AsyncJobsTable companyId={companyId} />
        </Suspense>
      </main>
    </>
  )
}
