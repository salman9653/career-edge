

'use client';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, ChevronUp, Loader2, MoreVertical, PlusCircle, Trash2 } from 'lucide-react';
import { useContext, useMemo, useState } from 'react';
import { SubscriptionContext } from '@/context/subscription-context';
import Link from 'next/link';
import type { PlanFeature, SubscriptionPlan, Price } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteSubscriptionPlanAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { MobileSearch } from '@/components/mobile-search';

const formatPrice = (price?: Price): string => {
    if (!price) {
        return 'N/A';
    }

    const { amount, cycle } = price;
    
    if (amount === 0 && cycle === 'monthly') {
        return `₹0/mo`;
    }
    if (amount === 0 && cycle === 'yearly') {
        return `₹0/yr`;
    }


    const amountInMajorUnit = amount / 100;
    
    const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amountInMajorUnit);
    
    return `${formattedAmount}/${cycle === 'monthly' ? 'mo' : 'yr'}`;
};

const formatFeatureText = (feature: PlanFeature): string => {
    const { label, limit } = feature;

    if (!limit || limit === '0') {
        return label;
    }
    if (limit === 'Unlimited') {
        return `Unlimited ${label.toLowerCase()}`;
    }
    
    return `${limit} ${label}`;
};

const SubscriptionPlanCard = ({ plan, billingCycle, onDelete }: { plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly', onDelete: (planId: string) => void }) => {
    const price = plan.prices.find(p => p.cycle === billingCycle);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    return (
        <>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this plan?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the &quot;{plan.name}&quot; subscription plan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(plan.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline capitalize">{plan.name}</CardTitle>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold">{formatPrice(price)}</p>
                        </div>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/admin/subscriptions/configure/${plan.id}`}>
                                    Edit Plan
                                </Link>
                            </DropdownMenuItem>
                             {plan.type === 'company-enterprise' && (
                                <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive"
                                    onSelect={() => setIsDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    Delete Plan
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-dash-primary mt-1 shrink-0" />
                            <span>{formatFeatureText(feature)}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardContent>
                <Button className="w-full" variant="secondary" asChild>
                    <Link href={`/dashboard/admin/subscriptions/configure/${plan.id}`}>
                        Edit Plan
                    </Link>
                </Button>
            </CardContent>
        </Card>
        </>
    );
};

export default function ManageSubscriptionsPage() {
  const { session, loading: sessionLoading } = useSession();
  const { plans, loading: plansLoading } = useContext(SubscriptionContext);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showEnterprise, setShowEnterprise] = useState(false);
  const { toast } = useToast();

  const { companyPlans, candidatePlans, enterprisePlans } = useMemo(() => {
    const standardCompanyPlans = ['Free', 'Pro', 'Pro+'];
    const allCandidatePlans = ['Free', 'Pro', 'Pro+'];

    const getPlan = (name: string, type: 'company' | 'candidate') => {
        const id = `${type}-${name.toLowerCase()}`;
        const found = plans.find(p => p.id === id);

        if (found) return found;
        
        return {
            id,
            name,
            type,
            prices: [
                { currency: 'INR', amount: 0, cycle: 'monthly' },
                { currency: 'INR', amount: 0, cycle: 'yearly' }
            ],
            features: []
        } as SubscriptionPlan;
    }

    const enterprise = plans.filter(p => p.type === 'company-enterprise');
    
    return {
        companyPlans: standardCompanyPlans.map(name => getPlan(name, 'company')),
        candidatePlans: allCandidatePlans.map(name => getPlan(name, 'candidate')),
        enterprisePlans: enterprise
    }
  }, [plans]);

  const handleDeletePlan = async (planId: string) => {
    const result = await deleteSubscriptionPlanAction(planId);
    if (result?.error) {
        toast({
            variant: "destructive",
            title: "Error Deleting Plan",
            description: result.error,
        });
    } else {
        toast({
            title: "Plan Deleted",
            description: "The subscription plan has been successfully deleted.",
        });
    }
  };

  if (sessionLoading) {
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
      return (
        <div className="space-y-8">
            <div className="flex justify-center">
                <Tabs value={billingCycle} onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}>
                    <TabsList>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                        <TabsTrigger value="yearly">Annually</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="font-headline text-2xl font-bold">Company Plans</h2>
                    <Button asChild>
                        <Link href={`/dashboard/admin/subscriptions/new-enterprise`}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Enterprise Plan
                        </Link>
                    </Button>
                </div>
                {plansLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                ) : companyPlans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {companyPlans.map(plan => <SubscriptionPlanCard key={plan.id} plan={plan} billingCycle={billingCycle} onDelete={handleDeletePlan} />)}
                    </div>
                ) : (
                    <p>No company plans found.</p>
                )}
                 {enterprisePlans.length > 0 && (
                    <div className="text-center mt-6">
                        <Button variant="ghost" onClick={() => setShowEnterprise(!showEnterprise)}>
                            {showEnterprise ? 'Hide enterprise plans' : 'Show enterprise plans'}
                            {showEnterprise ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>
                 )}
                 {showEnterprise && enterprisePlans.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {enterprisePlans.map(plan => <SubscriptionPlanCard key={plan.id} plan={plan} billingCycle={billingCycle} onDelete={handleDeletePlan} />)}
                    </div>
                 )}
            </div>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="font-headline text-2xl font-bold">Candidate Plans</h2>
                </div>
                 {plansLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                ) : candidatePlans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {candidatePlans.map(plan => <SubscriptionPlanCard key={plan.id} plan={plan} billingCycle={billingCycle} onDelete={handleDeletePlan} />)}
                    </div>
                ) : (
                    <p>No candidate plans found.</p>
                )}
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Offers &amp; Coupons</CardTitle>
                    <CardDescription>Manage discounts and promotional codes for your subscription plans.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard/admin/coupons">Manage Coupons</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      );
    }
    return <p>You do not have permission to view this page.</p>
  };

  return (
    <>
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Manage Subscriptions</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
          {renderContent()}
        </main>
    </>
  );
}
