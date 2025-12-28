'use client';

import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { MobileSearch } from '@/components/mobile-search';
import { redirect } from 'next/navigation';

export default function CandidateDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'candidate') {
    redirect('/dashboard');
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role="candidate" user={session} />
      <div className="flex flex-col max-h-screen">
        {children}
      </div>
    </div>
  );
}
