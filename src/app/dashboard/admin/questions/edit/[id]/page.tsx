'use client';

import { QuestionEditLayout } from '@/components/questions/question-edit-layout';

const ADMIN_EDIT_CONFIG = {
  role: 'admin' as const,
  allowedRoles: ['admin'],
  libraryType: 'library' as const,
  pageTitle: 'Edit Question',
  redirectPath: '/dashboard/admin/questions',
};

export default function AdminEditQuestionPage() {
  return <QuestionEditLayout config={ADMIN_EDIT_CONFIG} />;
}
