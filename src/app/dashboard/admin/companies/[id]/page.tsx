
'use client'
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from '@/components/ui/skeleton';
import { type CompanyData } from '@/context/company-context';
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
import { MoreHorizontal, ShieldAlert, ShieldCheck, User, ShieldX, Trash, Gem, Star, Crown, ArrowLeft, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type CompanySize } from '@/context/company-context';


export default function CompanyProfilePage() {
    const params = useParams();
    const { session, loading: sessionLoading } = useSession();
    const [company, setCompany] = useState<CompanyData | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    const companyId = params.id as string;

    useEffect(() => {
        if (companyId) {
            const fetchCompany = async () => {
                setLoading(true);
                const docRef = doc(db, 'users', companyId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const companyData = {
                        id: docSnap.id,
                        name: data.name || 'N/A',
                        email: data.email || 'N/A',
                        status: data.status || 'Active',
                        plan: data.subscription || 'Free',
                        size: data.companySize || { size: 'Startup', employees: '1-100' },
                        logo: data.logoUrl,
                        createdAt: data.createdAt?.toDate()?.toISOString() || null
                    };
                    setCompany(companyData as CompanyData);
                } else {
                    console.log("No such company!");
                    setCompany(null);
                }
                setLoading(false);
            };
            fetchCompany();
        }
    }, [companyId]);
    
    const getInitials = (name: string) => {
        if (!name) return 'C';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return format(new Date(dateString), "dd MMM yyyy");
    }

    const handleStatusChange = async (companyId: string, newStatus: string) => {
        try {
            const companyRef = doc(db, 'users', companyId);
            await updateDoc(companyRef, { status: newStatus });
            setCompany(prev => prev ? { ...prev, status: newStatus } : null);
            toast({
                title: "Status Updated",
                description: `Company status has been changed to ${newStatus}.`,
            });
        } catch (error) {
            console.error("Error updating status: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update company status.",
            });
        }
    };

    const handlePlanChange = async (companyId: string, newPlan: string) => {
        try {
            const companyRef = doc(db, 'users', companyId);
            await updateDoc(companyRef, { subscription: newPlan });
            setCompany(prev => prev ? { ...prev, plan: newPlan } : null);
            toast({
                title: "Plan Updated",
                description: `Company plan has been changed to ${newPlan}.`,
            });
        } catch (error) {
            console.error("Error updating plan: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update company plan.",
            });
        }
    };

    const handleDeleteCompany = async (companyId: string) => {
        try {
            await deleteDoc(doc(db, "users", companyId));
            toast({
                title: "Company Deleted",
                description: "The company account has been successfully deleted.",
            });
            router.push('/dashboard/admin/companies');
        } catch (error) {
            console.error("Error deleting company: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete company account.",
            });
        }
    };

    const getPlanIcon = (plan: string) => {
        const iconClass = "mr-2 h-4 w-4";
        switch (plan) {
            case 'Free':
                return <User className={iconClass} />;
            case 'Pro':
                return <Star className={iconClass} />;
            case 'Pro+':
                return <Gem className={iconClass} />;
            case 'Enterprise':
                return <Crown className={iconClass} />;
            default:
                return null;
        }
    };

    const getStatusIcon = (status: string) => {
        const iconClass = "mr-2 h-4 w-4";
        switch (status) {
            case 'Active':
                return <ShieldCheck className={iconClass} />;
            case 'Inactive':
                return <ShieldX className={iconClass} />;
            case 'Banned':
                return <ShieldAlert className={iconClass} />;
            default:
                return null;
        }
    };

    const getCompanySizeDisplay = (size: CompanySize) => {
        if (!size || !size.size) return "Startup (1-100 employees)";
        switch (size.size) {
            case 'Startup':
                return 'Startup (1-100 employees)';
            case 'Growth':
                return 'Growth (100-500 employees)';
            case 'Enterprise':
                return 'Enterprise (500+ employees)';
            default:
                return `${size.size} (${size.employees} employees)`;
        }
    }

    if (sessionLoading) {
        return (
            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                {session && <DashboardSidebar role={session.role} user={session} />}
                <div className="flex flex-col max-h-screen">
                    <header className="flex h-16 shrink-0 items-center gap-4 bg-background px-4 md:px-6 sticky top-0 z-30">
                        <Skeleton className="h-6 w-48" />
                    </header>
                    <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
                       <Skeleton className="w-full h-[300px] rounded-lg" />
                    </main>
                </div>
            </div>
        )
    }

    if (!session) {
        return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;
    }
    
    if (session.role !== 'admin') {
         return <div className="flex min-h-screen items-center justify-center"><p>Access Denied</p></div>;
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
                <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
                    {loading ? (
                        <Skeleton className="w-full h-[300px] rounded-lg" />
                    ) : company ? (
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-6">
                                        <Avatar className="w-24 h-24 text-3xl">
                                            {company.logo && <AvatarImage src={company.logo} alt={company.name} data-ai-hint="company logo" />}
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
                                                            <DropdownMenuItem onClick={() => handleStatusChange(company.id, 'Active')}><ShieldCheck />Active</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusChange(company.id, 'Inactive')}><ShieldX />Inactive</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusChange(company.id, 'Banned')} className="text-destructive focus:text-destructive"><ShieldAlert/>Banned</DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger><Gem/>Change Plan</DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuItem onClick={() => handlePlanChange(company.id, 'Free')}><User />Free</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handlePlanChange(company.id, 'Pro')}><Star />Pro</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handlePlanChange(company.id, 'Pro+')} className="text-amber-500 focus:text-amber-600"><Gem />Pro+</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handlePlanChange(company.id, 'Enterprise')}><Crown />Enterprise</DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                                <DropdownMenuSeparator />
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive" disabled>
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
                                            <AlertDialogAction onClick={() => handleDeleteCompany(company.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardHeader>
                            <CardContent className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className={`font-medium flex items-center ${company.status === 'Banned' ? 'text-destructive' : ''}`}>
                                        {getStatusIcon(company.status)}
                                        {company.status}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground">Subscription Plan</span>
                                    <span className={`font-medium flex items-center ${company.plan === 'Pro+' ? 'text-amber-500' : company.plan === 'Enterprise' ? 'text-primary' : ''}`}>
                                        {getPlanIcon(company.plan)}
                                        {company.plan}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground">Company Size</span>
                                    <span className="font-medium">{getCompanySizeDisplay(company.size)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground">Member Since</span>
                                    <span className="font-medium">{formatDate(company.createdAt)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <p>Company not found.</p>
                    )}
                </main>
            </div>
        </div>
    );
}
