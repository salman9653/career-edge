import { CandidateDashboardContent } from '@/components/dashboard/candidate-dashboard';
import { fetchCandidateDashboardDataServer } from '@/lib/data/server/applications';
import { getCurrentUser } from '@/lib/auth/server';

export default async function CandidateDashboardPage() {
  const user = await getCurrentUser();
  
  let initialData = null;
  if (user?.uid) {
    initialData = await fetchCandidateDashboardDataServer(user.uid);
  }
  
  return <CandidateDashboardContent initialData={initialData} />;
}
