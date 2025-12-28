import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function CompanyJobsLoading() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </header>
      <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-10 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
