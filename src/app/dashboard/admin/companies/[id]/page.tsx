'use client'
import { useEffect, useState, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from '@/components/ui/skeleton';
import { type CompanyData, CompanyContext } from '@/context/company-context';
import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
    DropdownMenuSubContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, ShieldAlert, ShieldCheck, User, ShieldX, Trash, Gem, Star, Crown, ArrowLeft, UserCog, Building, Globe, Linkedin, Phone, Mail, Briefcase, Building2, Info, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type CompanySize, type Socials } from '@/lib/types';
import { updateCompanyStatusAction, updateCompanyPlanAction, deleteCompanyAction } from '../../actions';
import { JobContext } from '@/context/job-context';
import { JobsTable } from './_components/jobs-table';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';


const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);


export default function CompanyProfilePage() {
    const params = useParams();
    const { session, loading: sessionLoading } = useSession();
    const { companies, loading: companiesLoading } = useContext(CompanyContext);
    const { jobs, loading: jobsLoading } = useContext(JobContext);
    const [company, setCompany] = useState<CompanyData | null>(null);
    const [companyJobs, setCompanyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const companyId = params.id as string;

    useEffect(() => {
        if (!companiesLoading) {
            const foundCompany = companies.find(c => c.id === companyId) || null;
            setCompany(foundCompany);
            setLoading(false);
        }
    }, [companyId, companies, companiesLoading]);
    
    useEffect(() => {
        if (!jobsLoading && companyId) {
            // @ts-ignore
            const filteredJobs = jobs.filter(job => job.companyId === companyId);
            // @ts-ignore
            setCompanyJobs(filteredJobs);
        }
    }, [jobs, jobsLoading, companyId]);
    
    const getInitials = (name?: string) => {
        if (!name) return 'C';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "-";
        return format(new Date(dateString), "dd MMM yyyy");
    }

    const handleStatusChange = async (newStatus: 'Active' | 'Inactive' | 'Banned') => {
        if (!company) return;
        const result = await updateCompanyStatusAction(company.id, newStatus);
        if (result.success) {
            setCompany(prev => prev ? { ...prev, status: newStatus } : null);
            toast({ title: "Status Updated", description: `Company status changed to ${newStatus}.` });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    };

    const handlePlanChange = async (newPlan: string) => {
        if (!company) return;
        const result = await updateCompanyPlanAction(company.id, newPlan);
         if (result.success) {
            setCompany(prev => prev ? { ...prev, plan: newPlan } : null);
            toast({ title: "Plan Updated", description: `Company plan changed to ${newPlan}.` });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    };

    const handleDeleteCompany = async () => {
        if (!company) return;
        const result = await deleteCompanyAction(company.id);
        if (result.success) {
            toast({ title: "Company Deleted", description: "The company account has been deleted." });
            router.push('/dashboard/admin/companies');
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    };

    const getPlanIcon = (plan?: string) => {
        const iconClass = "mr-2 h-4 w-4";
        switch (plan) {
            case 'Free': return <User className={iconClass} />;
            case 'Pro': return <Star className={iconClass} />;
            case 'Pro+': return <Gem className={iconClass} />;
            case 'Enterprise': return <Crown className={iconClass} />;
            default: return null;
        }
    };

    const getStatusIcon = (status?: string) => {
        const iconClass = "mr-2 h-4 w-4";
        switch (status) {
            case 'Active': return <ShieldCheck className={iconClass} />;
            case 'Inactive': return <ShieldX className={iconClass} />;
            case 'Banned': return <ShieldAlert className={iconClass} />;
            default: return null;
        }
    };

    const getCompanySizeDisplay = (size?: CompanySize) => {
        if (!size || !size.size) return "Not specified";
        return `${size.size} (${size.employees} employees)`;
    }

    const getWebsiteUrl = (url?: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    if (sessionLoading || loading) {
        return (
            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                {session && <DashboardSidebar role={session.role} user={session} />}
                <div className="flex flex-col max-h-screen">
                    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                        <Skeleton className="h-6 w-48" />
                    </header>
                    <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
                       <Skeleton className="w-full h-[300px] rounded-lg" />
                       <Skeleton className="w-full h-[400px] rounded-lg" />
                    </main>
                </div>
            </div>
        )
    }

    if (!session || session.role !== 'admin') {
         return <div className="flex min-h-screen items-center justify-center"><p>Access Denied</p></div>;
    }

    if (!company) {
        return <div className="flex min-h-screen items-center justify-center"><p>Company not found.</p></div>;
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <DashboardSidebar role={session.role} user={session} />
            <div className="flex flex-col max-h-screen">
                <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/admin/companies')}>
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back</span>
                    </Button>
                    <h1 className="font-headline text-xl font-semibold">Company Profile</h1>
                </header>
                <main className="flex flex-1 flex-col gap-6 overflow-auto p-4 md:p-6 custom-scrollbar">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-6">
                                    <Avatar className="w-24 h-24 text-3xl">
                                        {company.displayImageUrl && <AvatarImage src={company.displayImageUrl} alt={company.name} data-ai-hint="company logo" />}
                                        <AvatarFallback>{getInitials(company.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-4xl font-bold font-headline">{company.name}</CardTitle>
                                        <CardDescription className="text-lg">{company.email}</CardDescription>
                                    </div>
                                </div>
                                <AlertDialog>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger><UserCog/>Change Status</DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem onClick={() => handleStatusChange('Active')}><ShieldCheck />Active</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange('Inactive')}><ShieldX />Inactive</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange('Banned')} className="text-destructive focus:text-destructive"><ShieldAlert/>Banned</DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger><Gem/>Change Plan</DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem onClick={() => handlePlanChange('Free')}><User />Free</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handlePlanChange('Pro')}><Star />Pro</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handlePlanChange('Pro+')}><Gem />Pro+</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handlePlanChange('Enterprise')}><Crown />Enterprise</DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                            <DropdownMenuSeparator />
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                    <Trash />Delete Company
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this company's account and remove their data from our servers.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteCompany} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardHeader>
                        <CardContent className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm border-t pt-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Status</span>
                                <span className={`font-medium flex items-center ${company.status === 'Banned' ? 'text-destructive' : ''}`}>
                                    {getStatusIcon(company.status)}
                                    {company.status}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Subscription Plan</span>
                                <span className={`font-medium flex items-center ${company.plan === 'Pro+' ? 'text-amber-500' : company.plan === 'Enterprise' ? 'text-primary' : ''}`}>
                                    {getPlanIcon(company.plan)}
                                    {company.plan}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Company Size</span>
                                <span className="font-medium">{getCompanySizeDisplay(company.size)}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Member Since</span>
                                <span className="font-medium">{formatDate(company.createdAt)}</span>
                            </div>
                             <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Company Type</span>
                                <span className="font-medium">{company.companyType || 'N/A'}</span>
                            </div>
                             <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Founded</span>
                                <span className="font-medium">{company.foundedYear || 'N/A'}</span>
                            </div>
                        </CardContent>
                         <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen} asChild>
                            <div className="px-6 pb-6">
                                <CollapsibleContent className="space-y-6 pt-6 border-t">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold">About Company</h4>
                                        <p className="text-sm text-muted-foreground">{company.aboutCompany || 'No description provided.'}</p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">Contact &amp; Socials</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            {company.helplinePhone && <div className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>{company.helplinePhone}</span></div>}
                                            {company.helplineEmail && <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>{company.helplineEmail}</span></div>}
                                            {company.website && <div className="flex items-center gap-2"><Globe className="h-4 w-4" /><a href={getWebsiteUrl(company.website)} target="_blank" rel="noopener noreferrer" className="text-dash-primary hover:underline">{company.website}</a></div>}
                                            {company.socials?.linkedin && <div className="flex items-center gap-2"><Linkedin className="h-4 w-4" /><a href={getWebsiteUrl(company.socials.linkedin)} target="_blank" rel="noopener noreferrer" className="text-dash-primary hover:underline">LinkedIn</a></div>}
                                            {company.socials?.twitter && <div className="flex items-center gap-2"><Twitter className="h-4 w-4" /><a href={getWebsiteUrl(company.socials.twitter)} target="_blank" rel="noopener noreferrer" className="text-dash-primary hover:underline">Twitter / X</a></div>}
                                        </div>
                                    </div>
                                </CollapsibleContent>
                                <div className="flex justify-center items-center text-sm text-muted-foreground">
                                    <CollapsibleTrigger asChild>
                                        <Button variant="link" className="text-sm text-muted-foreground">
                                            <span>{isDetailsOpen ? 'Show Less' : 'Show More Details'}</span>
                                            <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", isDetailsOpen && 'rotate-180')} />
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                            </div>
                        </Collapsible>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Job Postings</CardTitle>
                            <CardDescription>A list of all jobs posted by {company.name}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <JobsTable jobs={companyJobs} loading={jobsLoading} />
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
