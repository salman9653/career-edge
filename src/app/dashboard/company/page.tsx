import { CompanyDashboardContent } from '@/components/dashboard/company-dashboard';
import { fetchCompanyDashboardStats } from './actions';
import { getCurrentUser } from '@/lib/auth/server';

export default async function CompanyDashboardPage() {
  const user = await getCurrentUser();
  let initialData = null;

  if (user) {
    const companyId = user.role === 'company' ? user.uid : user.company_uid;
    if (companyId) {
       initialData = await fetchCompanyDashboardStats(companyId);
    }
  }

  return <CompanyDashboardContent initialData={initialData} />;
}
