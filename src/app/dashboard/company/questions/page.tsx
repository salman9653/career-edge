import { QuestionsListLayout } from '@/components/questions/questions-list-layout';

const COMPANY_CONFIG = {
  role: 'company' as const,
  allowedRoles: ['company', 'manager'],
  pageTitle: 'Question Bank',
  showTabs: true,
  redirectPath: '/dashboard/company/questions',
};

export default function CompanyQuestionsPage() {
  return <QuestionsListLayout config={COMPANY_CONFIG} />;
}
