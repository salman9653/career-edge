
'use client';
import { useState, useContext } from 'react';
import { AssessmentsTable } from '../assessments/_components/assessments-table';
import { AiInterviewsTable } from './_components/ai-interviews-table';
import { CreateAssessmentDialog } from '../assessments/_components/create-assessment-dialog';
import { AssessmentContext } from '@/context/assessment-context';
import { MobileSearch } from '@/components/mobile-search';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TemplatesPage() {
  const { assessments, loading: assessmentsLoading } = useContext(AssessmentContext);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get('tab') || 'assessments';
  
  const handleTabChange = (value: string) => {
    router.push(`/dashboard/company/templates?tab=${value}`);
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
        <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Templates</h1>
        <MobileSearch />
      </header>
      <main className="flex flex-1 flex-col overflow-hidden p-4 md:p-6">
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
      </main>
    </>
  );
}
