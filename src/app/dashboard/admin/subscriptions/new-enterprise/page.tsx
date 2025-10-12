
'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { allCompanyFeatures } from '@/lib/features';

const initialState = {
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="animate-spin" /> : 'Save Enterprise Plan'}
    </Button>
  )
}

export default function NewEnterprisePlanPage() {
  const { session, loading: sessionLoading } = useSession();
  const [state, formAction] = useActionState(addSubscriptionPlanAction, initialState);
  const router = useRouter();
  const { toast } = useToast();

  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>({});
  const [featureLimits, setFeatureLimits] = useState<Record<string, string>>({});
  const [unlimitedFeatures, setUnlimitedFeatures] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (state.success) {
        toast({
            title: "Plan Saved",
            description: `The subscription plan has been successfully saved.`,
        });
        router.push('/dashboard/admin/subscriptions/company');
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
      handleLimitChange(featureName, '');
    }
  };

  if (sessionLoading) {
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
            <h1 className="font-headline text-xl font-semibold">Configure Enterprise Plan</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
          <div className="max-w-2xl mx-auto w-full">
          <form action={formAction}>
            <input type="hidden" name="type" value="company-enterprise" />
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Enterprise Plan</CardTitle>
                    <CardDescription>Create a custom enterprise-level subscription plan for companies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-base">Plan Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g., Enterprise Gold"
                            required
                        />
                    </div>
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
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                     
                    <div className="space-y-4">
                    <Label className="text-base font-medium">Features</Label>
                    <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                        {allCompanyFeatures.map((feature) => (
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
