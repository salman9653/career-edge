'use client';

import { useState, useContext } from 'react';
import { AssessmentsTable } from '../../assessments/_components/assessments-table';
import { AiInterviewsTable } from './ai-interviews-table';
import { CreateAssessmentDialog } from '../../assessments/_components/create-assessment-dialog';
import { AssessmentContext } from '@/context/assessment-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';

export function TemplatesContent() {
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
