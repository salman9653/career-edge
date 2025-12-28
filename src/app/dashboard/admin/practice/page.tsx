

'use client';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { MobileSearch } from '@/components/mobile-search';

export default function ManagePracticePage() {
  const { session, loading } = useSession();

  if (loading) {
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
    if (session.role === 'admin') {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Practice Module</CardTitle>
                <CardDescription>Review and manage candidate practice sessions and performance.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Content for managing candidate practice sessions will go here.</p>
            </CardContent>
        </Card>
      );
    }
    return <p>You do not have permission to view this page.</p>
  };

  return (
    <>
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Manage Practice Module</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
          {renderContent()}
        </main>
    </>
  );
}
