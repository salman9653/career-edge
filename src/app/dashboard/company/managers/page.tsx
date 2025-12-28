import { MobileSearch } from '@/components/mobile-search';
import { CompanyManagersContent } from './_components/managers-content';

export default function CompanyManagersPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
        <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Company Account Managers</h1>
        <MobileSearch />
      </header>
      <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
        <CompanyManagersContent />
      </main>
    </>
  );
}
