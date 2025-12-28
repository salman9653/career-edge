import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsLoading() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </header>
      <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    </>
  );
}
