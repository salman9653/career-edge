'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import type { Coupon } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Edit, Trash2, Pen, X, Loader2, AlertTriangle, User, Star, Gem, Crown, ShieldX, ShieldCheck, FileText, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { deleteCouponAction, updateCouponStatusAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';


interface CouponDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
}

export function CouponDetailSheet({ open, onOpenChange, coupon: initialCoupon }: CouponDetailSheetProps) {
  const [coupon, setCoupon] = useState(initialCoupon);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCoupon(initialCoupon);
  }, [initialCoupon]);

  if (!coupon) return null;

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    setIsUpdating(true);
    const result = await updateCouponStatusAction(coupon.id, newStatus);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error updating status',
        description: result.error,
      });
    } else {
      setCoupon(prev => prev ? { ...prev, status: newStatus } : null);
      toast({
        title: 'Status Updated',
        description: `Coupon status changed to ${newStatus}.`,
      });
    }
    setIsUpdating(false);
  };
  
  const handleDelete = async () => {
    const result = await deleteCouponAction(coupon.id);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error deleting promotion',
        description: result.error,
      });
    } else {
      toast({
        title: 'Promotion Deleted',
        description: 'The promotion has been successfully deleted.',
      });
      onOpenChange(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'active': return 'default';
        case 'inactive': return 'secondary';
        case 'expired': return 'destructive';
        default: return 'outline';
    }
  }

  const getPlanIcon = (planId: string) => {
    const type = planId.split('-')[0];
    if (type === 'candidate') return <User className="mr-2 h-4 w-4" />;
    if (type === 'company') {
      if (planId.includes('pro+')) return <Gem className="mr-2 h-4 w-4 text-amber-500" />;
      if (planId.includes('pro')) return <Star className="mr-2 h-4 w-4" />;
      if (planId.includes('enterprise')) return <Crown className="mr-2 h-4 w-4" />;
      return <User className="mr-2 h-4 w-4" />;
    }
    return null;
  }
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
        return format(new Date(dateString), "dd MMM yyyy, h:mm a");
    } catch (e) {
        return "Invalid Date";
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent showClose={false} className="sm:max-w-xl w-full flex flex-col p-0">
        <TooltipProvider>
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
                <SheetTitle className="font-headline text-2xl capitalize">Promotion Details</SheetTitle>
                <SheetDescription>
                  {coupon.type === 'coupon' ? `Code: ` : `Offer: `}
                  <span className="font-mono font-medium">{coupon.type === 'coupon' ? coupon.code : coupon.description}</span>
                </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
                 <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/admin/coupons/edit/${coupon.id}`}>
                              <Edit className="h-5 w-5" />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Edit {coupon.type}</p>
                    </TooltipContent>
                 </Tooltip>
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete {coupon.type}</p>
                    </TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="flex justify-center">
                          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                              <AlertTriangle className="h-6 w-6 text-destructive"/>
                          </div>
                      </div>
                      <AlertDialogTitle className="text-center">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-center">
                        This action cannot be undone. This will permanently delete this {coupon.type}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
            </div>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-auto custom-scrollbar p-6">
          <div className="space-y-6">
              <div className="space-y-2">
                  <h4 className="font-semibold">Description</h4>
                  <p className="text-muted-foreground">{coupon.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">{coupon.type}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} Off</span>
                  </div>
                  <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Status</span>
                       <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="justify-start p-0 h-auto group -ml-1 hover:bg-transparent">
                                     <Badge variant={getStatusVariant(coupon.status)} className="capitalize flex items-center gap-1">
                                        {coupon.status}
                                        {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pen className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />}
                                     </Badge>
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Update status</p>
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleStatusChange('active')}><ShieldCheck className="mr-2 h-4 w-4" />Active</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange('inactive')}><ShieldX className="mr-2 h-4 w-4" />Inactive</DropdownMenuItem>
                      </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                  <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Created At</span>
                      <span className="font-medium">{formatDate(coupon.createdAt)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Valid From</span>
                      <span className="font-medium">{formatDate(coupon.validFrom)}</span>
                  </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Valid Until</span>
                      <span className="font-medium">{formatDate(coupon.validUntil)}</span>
                  </div>
              </div>

              <div className="space-y-2">
                  <h4 className="font-semibold">Applicable Plans</h4>
                  <ul className="space-y-2">
                      {coupon.applicablePlans.map((planId) => (
                          <li key={planId} className="flex items-center text-muted-foreground text-sm">
                             {getPlanIcon(planId)}
                              <span className="capitalize">{planId.replace(/-/g, ' ')}</span>
                          </li>
                      ))}
                  </ul>
              </div>

               <div className="space-y-4">
                <Card className="border-dashed">
                    <CardHeader className="flex-row items-center gap-4 space-y-0">
                        <FileText className="h-6 w-6 text-muted-foreground"/>
                        <div>
                            <h4 className="font-semibold">Offer Terms and Conditions</h4>
                            <p className="text-sm text-muted-foreground">This feature is under development.</p>
                        </div>
                    </CardHeader>
                </Card>
                 <Card className="border-dashed">
                    <CardHeader className="flex-row items-center gap-4 space-y-0">
                        <HelpCircle className="h-6 w-6 text-muted-foreground"/>
                        <div>
                            <h4 className="font-semibold">Frequently Asked Questions</h4>
                            <p className="text-sm text-muted-foreground">This feature is under development.</p>
                        </div>
                    </CardHeader>
                </Card>
              </div>
          </div>
        </div>
        </TooltipProvider>
      </SheetContent>
    </Sheet>
  );
}
