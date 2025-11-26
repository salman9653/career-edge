'use client';

import { QuestionFormLayout } from '@/components/questions/question-form-layout';

const ADMIN_NEW_CONFIG = {
  role: 'admin' as const,
  allowedRoles: ['admin'],
  libraryType: 'library' as const,
  pageTitle: 'Add Library Question',
  cardTitle: 'Create Library Question',
  cardDescription: 'This question will be available to all companies on the platform.',
  redirectPath: '/dashboard/admin/questions',
  successMessage: 'The new question has been added to the library.',
};

export default function AdminNewQuestionPage() {
  return <QuestionFormLayout config={ADMIN_NEW_CONFIG} />;
}