

'use client';
import { useState, useContext } from 'react';
import { AssessmentsTable } from './_components/assessments-table';
import { CreateAssessmentDialog } from './_components/create-assessment-dialog';
import { AssessmentContext } from '@/context/assessment-context';
import { MobileSearch } from '@/components/mobile-search';

export default function AssessmentsPage() {
  const { assessments, loading: assessmentsLoading } = useContext(AssessmentContext);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
        <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Assessments</h1>
        <MobileSearch />
      </header>
      <main className="flex flex-1 flex-col overflow-hidden p-4 md:p-6">
        <CreateAssessmentDialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen} />
        <AssessmentsTable 
          assessments={assessments} 
          loading={assessmentsLoading}
          onCreate={() => setCreateDialogOpen(true)} />
      </main>
    </>
  );
}
