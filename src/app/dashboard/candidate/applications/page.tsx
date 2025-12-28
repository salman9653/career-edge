import { ApplicationsPageContent } from './_components/applications-content';
import { Suspense } from 'react';
import { getCandidateApplicationsServer, getSavedJobsServer } from '@/lib/data/applications-server';
import { requireUser } from '@/lib/auth/server';
import ApplicationsLoading from './loading';

import { getJobs } from '@/lib/data/jobs-server'; // Use server version

async function AsyncApplicationsContentWrapper({ userId }: { userId: string }) {
    // Fetch parellel
    const [applications, savedJobs, allJobs] = await Promise.all([
        getCandidateApplicationsServer(userId),
        getSavedJobsServer(userId),
        getJobs()
    ]);

    return (
        <ApplicationsPageContent 
             initialApplications={applications}
             initialSavedJobs={savedJobs}
             initialTab="applied" 
             allJobs={allJobs}
        />
    );
}

export default async function CandidateApplicationsPage() {
    const user = await requireUser();

  return (
    // Only fetching data inside the boundary
    <Suspense fallback={<ApplicationsLoading />}>
        <AsyncApplicationsContentWrapper userId={user.uid} />
    </Suspense>
  );
}
