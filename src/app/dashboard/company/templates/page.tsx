
'use client';
import { useState, useContext } from 'react';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { AssessmentsTable } from '../assessments/_components/assessments-table';
import { AiInterviewsTable } from './_components/ai-interviews-table';
import { CreateAssessmentDialog } from '../assessments/_components/create-assessment-dialog';
import { AssessmentContext } from '@/context/assessment-context';
import { MobileSearch } from '@/components/mobile-search';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TemplatesPage() {
  const { session, loading: sessionLoading } = useSession();
  const { assessments, loading: assessmentsLoading } = useContext(AssessmentContext);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get('tab') || 'assessments';

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
  
  const handleTabChange = (value: string) => {
    router.push(`/dashboard/company/templates?tab=${value}`);
  }

  const renderContent = () => {
    if (session.role === 'company' || session.role === 'manager') {
      return (
          <>
            <CreateAssessmentDialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen} />
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col h-full">
              <TabsList className="mb-4 self-start">
                  <TabsTrigger value="assessments">Assessments</TabsTrigger>
                  <TabsTrigger value="ai-interviews">AI Interviews</TabsTrigger>
              </TabsList>
              <TabsContent value="assessments" className="flex-1 overflow-hidden">
                <AssessmentsTable 
                  assessments={assessments} 
                  loading={assessmentsLoading}
                  onCreate={() => setCreateDialogOpen(true)} />
              </TabsContent>
              <TabsContent value="ai-interviews" className="flex-1 overflow-hidden">
                <AiInterviewsTable
                  onCreate={() => {}} // Placeholder for "Generate AI Interview"
                />
              </TabsContent>
            </Tabs>
          </>
      );
    }
    return <p>You do not have permission to view this page.</p>
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role={session.role} user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Templates</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col overflow-hidden p-4 md:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
