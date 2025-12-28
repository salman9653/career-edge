import { QuestionsListLayout } from '@/components/questions/questions-list-layout';

const ADMIN_CONFIG = {
  role: 'admin' as const,
  allowedRoles: ['admin'],
  pageTitle: 'Question Bank',
  showTabs: false,
  redirectPath: '/dashboard/admin/questions',
};

export default function AdminQuestionsPage() {
  return <QuestionsListLayout config={ADMIN_CONFIG} />;
}
