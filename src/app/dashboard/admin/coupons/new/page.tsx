
'use client';
import { useActionState, useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { addCouponAction } from '@/app/actions';
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
import { useMemo } from 'react';

const initialState = {
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="animate-spin" /> : 'Create'}
    </Button>
  );
}

export default function NewCouponPage() {
  const { session, loading: sessionLoading } = useSession();
  const { plans, loading: plansLoading } = useContext(SubscriptionContext);
  const [state, formAction] = useActionState(addCouponAction, initialState);
  const router = useRouter();
  const { toast } = useToast();

  const [type, setType] = useState<'coupon' | 'offer'>('coupon');
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({ from: undefined, to: undefined });

  const { companyPlans, candidatePlans } = useMemo(() => {
    const company = plans.filter(p => p.type.startsWith('company') && p.name.toLowerCase() !== 'free');
    const candidate = plans.filter(p => p.type === 'candidate' && p.name.toLowerCase() !== 'free');
    return { companyPlans: company, candidatePlans: candidate };
  }, [plans]);

  useEffect(() => {
    if (state.success) {
      toast({ title: "Promotion Created", description: "The new promotion has been successfully created." });
      router.push('/dashboard/admin/coupons');
    }
  }, [state.success, router, toast]);

  const handlePlanSelection = (planId: string, isChecked: boolean) => {
    setSelectedPlans(prev => 
      isChecked ? [...prev, planId] : prev.filter(id => id !== planId)
    );
  };
  
  if (sessionLoading || plansLoading) {
    return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;
  }
  if (!session || session.role !== 'admin') {
    return <div className="flex min-h-screen items-center justify-center"><p>Access Denied</p></div>;
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
            <h1 className="font-headline text-xl font-semibold">Create Promotion</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
          <div className="max-w-2xl mx-auto w-full">
            <form action={formAction}>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Promotion Details</CardTitle>
                  <CardDescription>Fill out the form to create a new coupon or offer.</CardDescription>
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
                      <Input id="code" name="code" placeholder="e.g., SUMMER25" required={type === 'coupon'} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Description / Offer Name</Label>
                    <Input id="description" name="description" placeholder={type === 'coupon' ? "Short description for internal use" : "e.g. Black Friday Special"} required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="discountType">Discount Type</Label>
                      <Select name="discountType" required>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage"><Percent className="inline-block mr-2 h-4 w-4" />Percentage</SelectItem>
                          <SelectItem value="fixed"><IndianRupee className="inline-block mr-2 h-4 w-4" />Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountValue">Discount Value</Label>
                      <Input id="discountValue" name="discountValue" type="number" step="0.01" placeholder="e.g., 25 or 500" required />
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
