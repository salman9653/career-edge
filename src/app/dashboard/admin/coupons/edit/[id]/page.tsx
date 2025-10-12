
'use client';
import { useActionState, useEffect, useState, useContext, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { updateCouponAction } from '@/app/actions';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Calendar as CalendarIcon, Percent, IndianRupee } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionContext } from '@/context/subscription-context';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Coupon } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const initialState = {
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="animate-spin" /> : 'Update'}
    </Button>
  );
}

export default function EditCouponPage() {
  const { session, loading: sessionLoading } = useSession();
  const { plans, loading: plansLoading } = useContext(SubscriptionContext);
  const [state, formAction] = useActionState(updateCouponAction, initialState);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const couponId = params.id as string;
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState<'coupon' | 'offer'>('coupon');
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({ from: undefined, to: undefined });
  
  const { companyPlans, candidatePlans } = useMemo(() => {
    const company = plans.filter(p => p.type.startsWith('company') && p.name.toLowerCase() !== 'free');
    const candidate = plans.filter(p => p.type === 'candidate' && p.name.toLowerCase() !== 'free');
    return { companyPlans: company, candidatePlans: candidate };
  }, [plans]);

  useEffect(() => {
    if (couponId) {
      const fetchCoupon = async () => {
        setLoading(true);
        const docRef = doc(db, 'coupons', couponId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data()
          const fetchedCoupon: Coupon = {
            id: docSnap.id,
            code: data.code || '',
            description: data.description || '',
            type: data.type || 'coupon',
            discountType: data.discountType || 'percentage',
            discountValue: data.discountValue || 0,
            status: data.status || 'inactive',
            validFrom: data.validFrom?.toDate()?.toISOString() || null,
            validUntil: data.validUntil?.toDate()?.toISOString() || null,
            applicablePlans: data.applicablePlans || [],
            createdAt: data.createdAt?.toDate()?.toISOString() || '',
          };
          setCoupon(fetchedCoupon);
          setType(fetchedCoupon.type);
          setSelectedPlans(fetchedCoupon.applicablePlans);
          if (fetchedCoupon.validFrom) {
            setDateRange({ from: new Date(fetchedCoupon.validFrom), to: fetchedCoupon.validUntil ? new Date(fetchedCoupon.validUntil) : undefined });
          }
        }
        setLoading(false);
      }
      fetchCoupon();
    }
  }, [couponId]);

  useEffect(() => {
    if (state.success) {
      toast({ title: "Updated Successfully", description: "The coupon or offer has been updated." });
      router.push('/dashboard/admin/coupons');
    }
  }, [state.success, router, toast]);

  const handlePlanSelection = (planId: string, isChecked: boolean) => {
    setSelectedPlans(prev => 
      isChecked ? [...prev, planId] : prev.filter(id => id !== planId)
    );
  };
  
  if (sessionLoading || plansLoading || loading) {
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {session && <DashboardSidebar role={session.role} user={session} />}
        <div className="flex flex-col max-h-screen">
            <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
                <Skeleton className="h-6 w-48" />
            </header>
            <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
                <div className="max-w-2xl mx-auto w-full">
                    <Skeleton className="h-[600px] w-full rounded-lg" />
                </div>
            </main>
        </div>
    </div>
    )
  }
  if (!session || session.role !== 'admin' || !coupon) {
    return <div className="flex min-h-screen items-center justify-center"><p>Access Denied or Coupon not found.</p></div>;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role={session.role} user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="font-headline text-xl font-semibold capitalize">Edit {coupon.type}</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
          <div className="max-w-2xl mx-auto w-full">
            <form action={formAction}>
              <input type="hidden" name="couponId" value={coupon.id} />
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl capitalize">Edit {coupon.type} Details</CardTitle>
                  <CardDescription>Update the details for this promotional item.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select name="type" required value={type} onValueChange={(value) => setType(value as 'coupon' | 'offer')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coupon">Coupon</SelectItem>
                          <SelectItem value="offer">Offer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                  {type === 'coupon' && (
                    <div className="space-y-2">
                      <Label htmlFor="code">Coupon Code</Label>
                      <Input id="code" name="code" defaultValue={coupon.code} required={type === 'coupon'} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Description / Offer Name</Label>
                    <Input id="description" name="description" defaultValue={coupon.description} required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="discountType">Discount Type</Label>
                      <Select name="discountType" required defaultValue={coupon.discountType}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage"><Percent className="inline-block mr-2 h-4 w-4" />Percentage</SelectItem>
                          <SelectItem value="fixed"><IndianRupee className="inline-block mr-2 h-4 w-4" />Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountValue">Discount Value</Label>
                      <Input id="discountValue" name="discountValue" type="number" step="0.01" defaultValue={coupon.discountValue} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                      <Label htmlFor="date-range">Validity Period (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date-range"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateRange.from && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "LLL dd, y")} -{" "}
                                  {format(dateRange.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(dateRange.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={1}
                          />
                        </PopoverContent>
                      </Popover>
                      <input type="hidden" name="validFrom" value={dateRange.from?.toISOString() || ''} />
                      <input type="hidden" name="validUntil" value={dateRange.to?.toISOString() || ''} />
                  </div>

                  <div className="space-y-4">
                    <Label className="font-medium">Applicable Subscription Plans</Label>
                    <div className="p-4 border rounded-lg bg-muted/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm">Company Plans</h4>
                                {companyPlans.map(plan => (
                                    <div key={plan.id} className="flex items-center space-x-3">
                                        <Checkbox
                                        id={plan.id}
                                        name="applicablePlans"
                                        value={plan.id}
                                        checked={selectedPlans.includes(plan.id)}
                                        onCheckedChange={(checked) => handlePlanSelection(plan.id, !!checked)}
                                        />
                                        <Label htmlFor={plan.id} className="font-normal capitalize w-full">{plan.name}</Label>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3">
                                 <h4 className="font-semibold text-sm">Candidate Plans</h4>
                                {candidatePlans.map(plan => (
                                    <div key={plan.id} className="flex items-center space-x-3">
                                        <Checkbox
                                        id={plan.id}
                                        name="applicablePlans"
                                        value={plan.id}
                                        checked={selectedPlans.includes(plan.id)}
                                        onCheckedChange={(checked) => handlePlanSelection(plan.id, !!checked)}
                                        />
                                        <Label htmlFor={plan.id} className="font-normal capitalize w-full">{plan.name}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  </div>

                  {state?.error && <p className="text-sm text-destructive mt-4">{state.error}</p>}
                  <SubmitButton />
                </CardContent>
              </Card>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
