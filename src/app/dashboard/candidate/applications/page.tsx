import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ApplicationsPageContent } from './_components/applications-content';

export default function CandidateApplicationsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ApplicationsPageContent />
    </Suspense>
  )
}
