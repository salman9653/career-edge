
'use client';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { MobileSearch } from '@/components/mobile-search';
import { ApplicationsTable } from './_components/applications-table';
import { useContext, useEffect, useState } from 'react';
import type { Job, Applicant } from '@/lib/types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface Application extends Job {
    company: {
        name: string;
        logoUrl?: string;
    };
    applicantData: Applicant;
}

export default function CandidateApplicationsPage() {
  const { session, loading: sessionLoading } = useSession();
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
            const applicantSnapshot = await onSnapshot(applicantQuery, async (snapshot) => {
                 for(const applicantDoc of snapshot.docs) {
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

                        const existingAppIndex = userApplications.findIndex(app => app.id === jobDoc.id);
                        const appData: Application = {
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
                        };

                        if (existingAppIndex > -1) {
                            userApplications[existingAppIndex] = appData;
                        } else {
                            userApplications.push(appData);
                        }
                    }
                 }
                setApplications([...userApplications]);
                setLoading(false);
            })
        }
    });

    return () => unsubscribe();
    
  }, [session]);
  
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
        <ApplicationsTable applications={applications} loading={loading} />
      );
    }
    return <p>You do not have permission to view this page.</p>
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role={session.role} user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">My Applications</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
