
'use client';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Briefcase, FileText } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, XAxis, YAxis, CartesianGrid, BarChart as RechartsBarChart } from 'recharts';
import { MobileSearch } from '@/components/mobile-search';

const AdminAnalytics = () => {
    const userGrowthData = [
        { month: "Jan", candidates: 186, companies: 80 },
        { month: "Feb", candidates: 305, companies: 200 },
        { month: "Mar", candidates: 237, companies: 120 },
        { month: "Apr", candidates: 173, companies: 190 },
        { month: "May", candidates: 209, companies: 130 },
    ];
    const userGrowthConfig = {
        candidates: { label: "Candidates", color: "hsl(var(--primary))" },
        companies: { label: "Companies", color: "hsl(var(--muted-foreground))" },
    };

    return (
        <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,396</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jobs Posted</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">350</div>
                        <p className="text-xs text-muted-foreground">+50 since last week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Applications</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4,832</div>
                        <p className="text-xs text-muted-foreground">+32% from last month</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>Candidate and Company signups over the last 5 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={userGrowthConfig} className="min-h-[300px] w-full">
                        <RechartsBarChart accessibilityLayer data={userGrowthData}>
                             <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="candidates" fill="var(--color-candidates)" radius={4} />
                            <Bar dataKey="companies" fill="var(--color-companies)" radius={4} />
                        </RechartsBarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
};

const CompanyAnalytics = () => {
    const applicationsData = [
        { date: "2024-05-01", applications: 5 },
        { date: "2024-05-02", applications: 8 },
        { date: "2024-05-03", applications: 3 },
        { date: "2024-05-04", applications: 12 },
        { date: "2024-05-05", applications: 7 },
         { date: "2024-05-06", applications: 9 },
    ];

    const applicationsConfig = {
        applications: { label: "Applications", color: "hsl(var(--primary))" },
    };
    return (
        <div className="grid gap-6">
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">28</div>
                        <p className="text-xs text-muted-foreground">+5 in the last 7 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Most Popular Job</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">Senior Frontend Developer</div>
                        <p className="text-xs text-muted-foreground">15 applicants</p>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Application Trends</CardTitle>
                    <CardDescription>Number of applications received per day.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={applicationsConfig} className="min-h-[300px] w-full">
                        <RechartsBarChart accessibilityLayer data={applicationsData}>
                             <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar
                                dataKey="applications"
                                fill="var(--color-applications)"
                                radius={4}
                            />
                        </RechartsBarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
};


export default function AnalyticsPage() {
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
    if (session.role === 'admin') {
      return <AdminAnalytics />;
    }
    if (session.role === 'company') {
        return <CompanyAnalytics />;
    }
    return <p>You do not have permission to view this page.</p>
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role={session.role} user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Analytics</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
