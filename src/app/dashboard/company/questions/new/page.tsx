'use client';

import { QuestionFormLayout } from '@/components/questions/question-form-layout';

const COMPANY_NEW_CONFIG = {
  role: 'company' as const,
  allowedRoles: ['company', 'manager', 'admin'],
  libraryType: 'custom' as const,
  pageTitle: 'Add Custom Question',
  cardTitle: 'Create Custom Question',
  cardDescription: "This question will be saved to your company's private question bank.",
  redirectPath: '/dashboard/company/questions?tab=custom',
  successMessage: 'The new question has been added to your custom library.',
};

export default function CompanyNewQuestionPage() {
  return <QuestionFormLayout config={COMPANY_NEW_CONFIG} />;
}
