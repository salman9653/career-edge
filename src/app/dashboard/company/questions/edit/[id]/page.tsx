'use client';

import { QuestionEditLayout } from '@/components/questions/question-edit-layout';

const COMPANY_EDIT_CONFIG = {
  role: 'company' as const,
  allowedRoles: ['company', 'manager'],
  libraryType: 'custom' as const,
  pageTitle: 'Edit Question',
  redirectPath: '/dashboard/company/questions?tab=custom',
};

export default function CompanyEditQuestionPage() {
  return <QuestionEditLayout config={COMPANY_EDIT_CONFIG} />;
}
