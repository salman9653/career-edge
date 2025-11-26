'use client';

import { useContext, useMemo } from 'react';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { QuestionsTable } from '@/components/questions/questions-table';
import { QuestionContext } from '@/context/question-context';
import { MobileSearch } from '@/components/mobile-search';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, useSearchParams } from 'next/navigation';

export type QuestionsListConfig = {
  role: 'admin' | 'company';
  allowedRoles: string[];
  pageTitle: string;
  showTabs: boolean;
  redirectPath: string;
};

type QuestionsListLayoutProps = {
  config: QuestionsListConfig;
};

export function QuestionsListLayout({ config }: QuestionsListLayoutProps) {
  const { session, loading } = useSession();
  const { questions, loading: questionsLoading } = useContext(QuestionContext);
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get('tab') || 'library';

  const { libraryQuestions, customQuestions } = useMemo(() => {
    const libraryQs = questions.filter(q => q.libraryType === 'library');
    const customQs = session?.uid ? questions.filter(q => q.libraryType === 'custom' && q.addedBy === session.uid) : [];
    return { libraryQuestions: libraryQs, customQuestions: customQs };
  }, [questions, session?.uid]);

  const handleTabChange = (value: string) => {
    router.push(`${config.redirectPath}?tab=${value}`);
  };

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

  if (!config.allowedRoles.includes(session.role)) {
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardSidebar role={session.role} user={session} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 custom-scrollbar">
          <p>You do not have permission to view this page.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role={session.role} user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
          <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">{config.pageTitle}</h1>
          <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-2 overflow-hidden p-4 md:p-6">
          {config.showTabs ? (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col h-full">
              <TabsList className="mb-4 self-start">
                <TabsTrigger value="library">Library Questions</TabsTrigger>
                <TabsTrigger value="custom">My Custom Questions</TabsTrigger>
              </TabsList>
              <TabsContent value="library" className="flex-1 overflow-hidden">
                <QuestionsTable 
                  questions={libraryQuestions} 
                  loading={questionsLoading} 
                  context={config.role} 
                  showAddButton={false} 
                  showCreatedBy={false} 
                />
              </TabsContent>
              <TabsContent value="custom" className="flex-1 overflow-hidden">
                <QuestionsTable 
                  questions={customQuestions} 
                  loading={questionsLoading} 
                  context={config.role} 
                  showAddButton={true} 
                  showCreatedBy={true} 
                />
              </TabsContent>
            </Tabs>
          ) : (
            <QuestionsTable 
              questions={libraryQuestions} 
              loading={questionsLoading} 
              context={config.role} 
              showAddButton={true} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
