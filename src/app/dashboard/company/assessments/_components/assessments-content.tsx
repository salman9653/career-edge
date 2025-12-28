'use client';
import { useState, useContext } from 'react';
import { AssessmentsTable } from './assessments-table';
import { CreateAssessmentDialog } from './create-assessment-dialog';
import { AssessmentContext } from '@/context/assessment-context';

export function AssessmentsContent() {
  const { assessments, loading: assessmentsLoading } = useContext(AssessmentContext);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  return (
      <>
        <CreateAssessmentDialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen} />
        <AssessmentsTable 
          assessments={assessments} 
          loading={assessmentsLoading}
          onCreate={() => setCreateDialogOpen(true)} />
      </>
  );
}
