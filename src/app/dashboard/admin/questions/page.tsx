

'use client';
import { useContext, useMemo } from 'react';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { QuestionsTable } from '@/components/questions/questions-table';
import { QuestionContext } from '@/context/question-context';
import { MobileSearch } from '@/components/mobile-search';

export default function QuestionLibraryPage() {
  const { session, loading } = useSession();
  const { questions, loading: questionsLoading } = useContext(QuestionContext);

  const libraryQuestions = useMemo(() => {
    return questions.filter(q => q.libraryType === 'library');
  }, [questions]);

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

  if (session.role !== 'admin') {
     return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <DashboardSidebar role={session.role} user={session} />
             <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 custom-scrollbar">
                <p>You do not have permission to view this page.</p>
             </main>
        </div>
     )
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role={session.role} user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Question Library</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-2 overflow-hidden p-4 md:p-6">
            <QuestionsTable questions={libraryQuestions} loading={questionsLoading} context="admin" showAddButton={true} />
        </main>
      </div>
    </div>
  );
}
