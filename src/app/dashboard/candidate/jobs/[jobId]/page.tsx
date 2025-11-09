
'use client';

import { useEffect, useState, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Job, Applicant } from '@/lib/types';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { MobileSearch } from '@/components/mobile-search';
import { JobContext } from '@/context/job-context';
import { CompanyContext } from '@/context/company-context';
import { JobDetailView, JobDetailSkeleton } from '@/components/job-detail-view';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CandidateJobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.jobId as string;
    const { session, loading: sessionLoading } = useSession();
    const { jobs: allJobs, loading: jobsLoading } = useContext(JobContext);
    const { companies, loading: companiesLoading } = useContext(CompanyContext);

    const [job, setJob] = useState<Job | null>(null);
    const [applicantData, setApplicantData] = useState<Applicant | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (jobId && allJobs.length > 0) {
            const foundJob = allJobs.find(j => j.id === jobId) || null;
            setJob(foundJob);
            setLoading(jobsLoading);
        }
    }, [jobId, allJobs, jobsLoading]);

    useEffect(() => {
        if(session?.uid && jobId) {
            const checkApplicationStatus = async () => {
                const applicationRef = doc(db, 'jobs', jobId, 'applicants', session.uid);
                const applicationSnap = await getDoc(applicationRef);
                if (applicationSnap.exists()) {
                    setApplicantData(applicationSnap.data() as Applicant);
                }
            }
            checkApplicationStatus();
        }
    }, [jobId, session]);

    const company = useMemo(() => {
        if (!job || companiesLoading) return null;
        return companies.find(c => c.id === job.companyId) || null;
    }, [job, companies, companiesLoading]);
    
    const isLoading = loading || sessionLoading || jobsLoading || companiesLoading;

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <DashboardSidebar role="candidate" user={session} />
            <div className="flex flex-col max-h-screen">
                <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
                    <div className="flex items-center gap-2">
                         <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="font-headline text-xl font-semibold md:ml-0">Job Details</h1>
                    </div>
                    <MobileSearch />
                </header>
                <main className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar">
                    {isLoading ? (
                        <JobDetailSkeleton />
                    ) : job ? (
                        <JobDetailView
                            job={job}
                            company={company}
                            applicantData={applicantData}
                            allJobs={allJobs}
                        />
                    ) : (
                        <div>Job not found.</div>
                    )}
                </main>
            </div>
        </div>
    );
}

