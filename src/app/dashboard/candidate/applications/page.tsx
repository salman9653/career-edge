
'use client';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { MobileSearch } from '@/components/mobile-search';
import { ApplicationsTable, type Application } from './_components/applications-table';
import { FavoriteJobsTable } from './_components/favorite-jobs-table';
import { useContext, useEffect, useState } from 'react';
import type { Job, Applicant } from '@/lib/types';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { JobContext } from '@/context/job-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CandidateApplicationsPage() {
  const { session, loading: sessionLoading } = useSession();
  const { jobs, loading: jobsLoading } = useContext(JobContext);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.uid) {
        setLoading(false);
        return;
    }

    setLoading(true);
    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef);
    
    const unsubscribe = onSnapshot(q, async (jobSnapshot) => {
        const userApplications: Application[] = [];

        for (const jobDoc of jobSnapshot.docs) {
            const applicantsColRef = collection(db, 'jobs', jobDoc.id, 'applicants');
            const applicantQuery = query(applicantsColRef, where('__name__', '==', session.uid));
            
            // Can't use onSnapshot here because it would create nested listeners inside a loop
            const applicantSnapshot = await getDocs(applicantQuery);

             for(const applicantDoc of applicantSnapshot.docs) {
                if (applicantDoc.exists()) {
                    const jobData = jobDoc.data() as Job;
                    let companyData = { name: 'Unknown Company', displayImageUrl: undefined };

                    if(jobData.companyId) {
                        const companyDocRef = doc(db, 'users', jobData.companyId);
                        const companyDocSnap = await getDoc(companyDocRef);
                        if(companyDocSnap.exists()) {
                            const data = companyDocSnap.data();
                            companyData.name = data.name;
                            companyData.displayImageUrl = data.displayImageUrl;
                        }
                    }

                    userApplications.push({
                        ...jobData,
                        id: jobDoc.id,
                        company: {
                            name: companyData.name,
                            logoUrl: companyData.displayImageUrl,
                        },
                        applicantData: {
                            ...applicantDoc.data() as Omit<Applicant, 'id'>,
                            id: applicantDoc.id,
                        },
                    });
                }
             }
        }
        setApplications([...userApplications]);
        setLoading(false);
    });

    return () => unsubscribe();
    
  }, [session]);

  const favoriteJobs = jobs.filter(job => session?.favourite_jobs?.includes(job.id));
  
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (session.role === 'candidate') {
      return (
        <Tabs defaultValue="applied" className="flex-1 flex flex-col">
          <TabsList className="mb-4 self-start">
            <TabsTrigger value="applied">Applied Jobs</TabsTrigger>
            <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
          </TabsList>
          <TabsContent value="applied" className="flex-1 overflow-auto">
            <ApplicationsTable applications={applications} loading={loading} />
          </TabsContent>
          <TabsContent value="saved" className="flex-1 overflow-auto">
            <FavoriteJobsTable jobs={favoriteJobs} loading={jobsLoading} />
          </TabsContent>
        </Tabs>
      );
    }
    return <p>You do not have permission to view this page.</p>
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role={session.role} user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">My Activity</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:gap-6 md:p-6 custom-scrollbar">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
