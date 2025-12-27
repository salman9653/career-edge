
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { addSubscriptionPlanAction } from '@/app/actions';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { allCompanyFeatures, allCandidateFeatures } from '@/lib/features';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { SubscriptionPlan } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface SubscriptionPlanState {
  error?: string | null;
  success?: boolean;
}

const initialState: SubscriptionPlanState = {
  error: null,
  success: false,
};

function SubmitButton({ isEditMode }: { isEditMode: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="animate-spin" /> : (isEditMode ? 'Update Plan' : 'Save Plan')}
    </Button>
  )
}

export default function ConfigureSubscriptionPlanPage() {
  const { session, loading: sessionLoading } = useSession();
  const [state, formAction] = useActionState<SubscriptionPlanState, FormData>(addSubscriptionPlanAction, initialState);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const planId = decodeURIComponent(params.plan?.[0] as string);
  const isEditMode = planId.startsWith('company-') || planId.startsWith('candidate-');
  const planTypeFromUrl = isEditMode ? planId.split('-')[0] : 'company';
  const planNameFromUrl = planId.split('-').slice(1).join('-') || 'Enterprise';

  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>({});
  const [featureLimits, setFeatureLimits] = useState<Record<string, string>>({});
  const [unlimitedFeatures, setUnlimitedFeatures] = useState<Record<string, boolean>>({});
  const planName = planNameFromUrl;

  useEffect(() => {
    if (isEditMode) {
      const fetchPlan = async () => {
        setLoading(true);
        const docRef = doc(db, 'subscriptions', planId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as SubscriptionPlan;
          setPlan(data);
          
          const featuresMap: Record<string, boolean> = {};
          const limitsMap: Record<string, string> = {};
          const unlimitedMap: Record<string, boolean> = {};

          data.features.forEach(feature => {
            featuresMap[feature.name] = true;
            if(feature.limit) {
                limitsMap[feature.name] = feature.limit;
                if(feature.limit === 'Unlimited') {
                    unlimitedMap[feature.name] = true;
                }
            }
          });
          setSelectedFeatures(featuresMap);
          setFeatureLimits(limitsMap);
          setUnlimitedFeatures(unlimitedMap);
        }
        setLoading(false);
      }
      fetchPlan();
    } else {
        setLoading(false);
    }
  }, [planId, isEditMode]);


  useEffect(() => {
    if (state.success) {
        toast({
            title: "Plan Saved",
            description: `The subscription plan has been successfully saved.`,
        });
        router.push('/dashboard/admin/subscriptions');
    }
  }, [state.success, router, toast]);

  const handleFeatureChange = (featureName: string, isChecked: boolean) => {
    setSelectedFeatures(prev => ({ ...prev, [featureName]: isChecked }));
    if (!isChecked) {
      const newLimits = { ...featureLimits };
      delete newLimits[featureName];
      setFeatureLimits(newLimits);
      const newUnlimited = { ...unlimitedFeatures };
      delete newUnlimited[featureName];
      setUnlimitedFeatures(newUnlimited);
    }
  };

  const handleLimitChange = (featureName: string, limit: string) => {
    setFeatureLimits(prev => ({ ...prev, [featureName]: limit }));
  };

  const handleUnlimitedChange = (featureName: string, isChecked: boolean) => {
    setUnlimitedFeatures(prev => ({ ...prev, [featureName]: isChecked }));
    if (isChecked) {
      handleLimitChange(featureName, 'Unlimited');
    } else {
      const existingLimit = plan?.features.find(f => f.name === featureName)?.limit;
      handleLimitChange(featureName, existingLimit === 'Unlimited' ? '' : (existingLimit || ''));
    }
  };
  
  const currentPlanType = planTypeFromUrl;
  const currentFeatures = currentPlanType === 'company' ? allCompanyFeatures : allCandidateFeatures;
  
  const monthlyPrice = plan?.prices.find(p => p.cycle === 'monthly')?.amount;
  const yearlyPrice = plan?.prices.find(p => p.cycle === 'yearly')?.amount;

  if (sessionLoading || loading) {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
         {session && <DashboardSidebar role={session.role} user={session} />}
         <div className="flex flex-col max-h-screen">
          <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
             <Skeleton className="h-8 w-48" />
          </header>
          <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
            <div className="max-w-2xl mx-auto w-full">
                <Skeleton className="h-[600px] w-full" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!session || session.role !== 'admin') {
    return <div className="flex min-h-screen items-center justify-center"><p>Access Denied</p></div>;
  }
  if (!currentPlanType || !['company', 'candidate'].includes(currentPlanType)) {
      return <div className="flex min-h-screen items-center justify-center"><p>Invalid Plan Type.</p></div>;
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
            <h1 className="font-headline text-xl font-semibold capitalize">{isEditMode ? 'Edit' : 'Create'} {planNameFromUrl} Plan</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
          <div className="max-w-2xl mx-auto w-full">
          <form action={formAction}>
            <input type="hidden" name="type" value={currentPlanType} />
            <input type="hidden" name="name" value={planName} />
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Plan Configuration</CardTitle>
                    <CardDescription>Configure the pricing and features for the <span className="capitalize font-semibold">{planName}</span> {currentPlanType} subscription plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-2">
                        <Label>Pricing</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="monthly_amount" className="text-sm font-normal">Monthly Price (INR)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        name="currency"
                                        defaultValue="INR"
                                        className="w-24 bg-muted"
                                        readOnly
                                    />
                                    <Input
                                        id="monthly_amount"
                                        name="monthly_amount"
                                        type="number"
                                        placeholder="e.g., 4999"
                                        required
                                        step="0.01"
                                        defaultValue={typeof monthlyPrice === 'number' ? monthlyPrice / 100 : ''}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="yearly_amount" className="text-sm font-normal">Yearly Price (INR)</Label>
                                 <div className="flex items-center gap-2">
                                     <Input
                                        defaultValue="INR"
                                        className="w-24 bg-muted"
                                        readOnly
                                    />
                                    <Input
                                        id="yearly_amount"
                                        name="yearly_amount"
                                        type="number"
                                        placeholder="e.g., 49990"
                                        required
                                        step="0.01"
                                        defaultValue={typeof yearlyPrice === 'number' ? yearlyPrice / 100 : ''}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                     
                    <div className="space-y-4">
                    <Label className="text-base font-medium">Features</Label>
                    <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                        {currentFeatures.map((feature) => (
                        <div key={feature.name}>
                            <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                id={feature.name}
                                name={`feature_${feature.name}`}
                                checked={selectedFeatures[feature.name] || false}
                                onCheckedChange={(checked) => handleFeatureChange(feature.name, !!checked)}
                                />
                                <Label htmlFor={feature.name} className="font-normal">{feature.label}</Label>
                            </div>
                            {feature.hasLimit && selectedFeatures[feature.name] && (
                                <div className="flex items-center gap-2">
                                    <Input
                                    type="text"
                                    name={`limit_${feature.name}`}
                                    placeholder="Set limit"
                                    className="w-32 h-8"
                                    value={featureLimits[feature.name] || ''}
                                    onChange={(e) => handleLimitChange(feature.name, e.target.value)}
                                    disabled={unlimitedFeatures[feature.name]}
                                    />
                                    <div className="flex items-center gap-1">
                                        <Checkbox
                                            id={`unlimited_${feature.name}`}
                                            name={`unlimited_${feature.name}`}
                                            checked={unlimitedFeatures[feature.name] || false}
                                            onCheckedChange={(checked) => handleUnlimitedChange(feature.name, !!checked)}
                                        />
                                        <Label htmlFor={`unlimited_${feature.name}`} className="text-xs font-normal">Unlimited</Label>
                                    </div>
                                </div>
                            )}
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                    {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
                    <SubmitButton isEditMode={isEditMode} />
                </CardContent>
            </Card>
          </form>
          </div>
        </main>
      </div>
    </div>
  );
}
