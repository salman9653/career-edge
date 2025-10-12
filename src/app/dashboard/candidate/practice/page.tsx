

'use client';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockQuestions } from '@/lib/mock-data';
import { MobileSearch } from '@/components/mobile-search';

export default function CandidatePracticePage() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (session.role === 'candidate') {
      return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>AI Mock Interview</CardTitle>
                    <CardDescription>Practice your interview skills with an AI-powered mock interviewer.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full">Start Mock Interview</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Question Library</CardTitle>
                    <CardDescription>Review common interview questions from our library to prepare.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ul className="space-y-2 text-sm text-muted-foreground">
                        {mockQuestions.slice(0, 3).map(q => (
                            <li key={q.id}>- {q.question}</li>
                        ))}
                        <li>... and more</li>
                    </ul>
                    <Button variant="outline" className="w-full mt-4">Browse All Questions</Button>
                </CardContent>
            </Card>
        </div>
      );
    }
    return <p>You do not have permission to view this page.</p>
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role={session.role} user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Interview Practice</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
