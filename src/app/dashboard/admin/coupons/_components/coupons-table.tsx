
'use client';
import { useContext, useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { File, PlusCircle, Search, ArrowUpDown, ArrowUp, ArrowDown, ListTodo, X, Trash, UserCog, ShieldCheck, ShieldX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CouponContext } from '@/context/coupon-context';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { FilterSheet } from './filter-sheet';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
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
} from "@/components/ui/alert-dialog";
import type { Coupon } from '@/lib/types';
import { CouponDetailSheet } from './coupon-detail-sheet';
import { cn } from '@/lib/utils';

type SortKey = 'code' | 'type' | 'discountValue' | 'status' | 'validFrom' | 'validUntil';
export interface FilterState {
    status: string[];
    discountType: string[];
    type: string[];
}

export function CouponsTable() {
  const { coupons, loading } = useContext(CouponContext);
  const { toast } = useToast();
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ status: [], discountType: [], type: [] });
  const [isSelectModeActive, setIsSelectModeActive] = useState(false);
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
        return format(new Date(dateString), "dd MMM yyyy");
    } catch (e) {
        return "Invalid Date";
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'active': return 'default';
        case 'inactive': return 'secondary';
        case 'expired': return 'destructive';
        default: return 'outline';
    }
  }

  const handleBulkStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (selectedCoupons.length === 0) {
        toast({ variant: "destructive", title: "No coupons selected", description: "Please select coupons to update." });
        return;
    }
    try {
        const batch = writeBatch(db);
        selectedCoupons.forEach(couponId => {
            const couponRef = doc(db, 'coupons', couponId);
            batch.update(couponRef, { status: newStatus });
        });
        await batch.commit();
        toast({ title: "Bulk Status Update", description: `${selectedCoupons.length} coupons updated.` });
        setSelectedCoupons([]);
        setIsSelectModeActive(false);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to update statuses." });
    }
  };
  
  const filteredAndSortedCoupons = useMemo(() => {
    let filtered = [...coupons];
    if (searchQuery) {
        filtered = filtered.filter(c => 
            c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    if (filters.status.length > 0) {
        filtered = filtered.filter(c => filters.status.includes(c.status));
    }
    if (filters.discountType.length > 0) {
        filtered = filtered.filter(c => filters.discountType.includes(c.discountType));
    }
    if (filters.type.length > 0) {
        filtered = filtered.filter(c => filters.type.includes(c.type));
    }

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === null || bValue === null) return 0;
        const comparison = String(aValue).localeCompare(String(bValue));
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return filtered;
  }, [coupons, searchQuery, filters, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'descending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />;
    if (sortConfig.direction === 'ascending') return <ArrowUp className="h-4 w-4" />;
    return <ArrowDown className="h-4 w-4" />;
  };

  const handleExport = () => { /* Export logic here */ };
  
  const toggleSelectMode = () => {
    setIsSelectModeActive(!isSelectModeActive);
    setSelectedCoupons([]);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedCoupons(checked ? filteredAndSortedCoupons.map(c => c.id) : []);
  };
  
  const handleRowSelect = (couponId: string, checked: boolean) => {
    setSelectedCoupons(prev => checked ? [...prev, couponId] : prev.filter(id => id !== couponId));
  };
  
  const handleRowClick = (coupon: Coupon) => {
    if (isSelectModeActive) {
      handleRowSelect(coupon.id, !selectedCoupons.includes(coupon.id));
    } else {
      setSelectedCoupon(coupon);
      setIsSheetOpen(true);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        {isSelectModeActive ? (
            <>
                <div className="flex items-center gap-4 flex-1">
                    <span className="text-sm font-medium">{selectedCoupons.length} selected</span>
                    <Button variant="ghost" size="sm" onClick={toggleSelectMode} className="h-10 gap-1 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-10 gap-1">
                                <UserCog className="h-3.5 w-3.5" />
                                <span>Change Status</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleBulkStatusChange('active')}><ShieldCheck />Active</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkStatusChange('inactive')}><ShieldX />Inactive</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button size="sm" variant="secondary" className="h-10 gap-1">
                                <File className="h-3.5 w-3.5" /> Export
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Export Not Implemented</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>OK</AlertDialogCancel></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="destructive" size="sm" className="h-10 gap-1" disabled>
                        <Trash className="h-3.5 w-3.5" />
                        <span>Delete</span>
                    </Button>
                </div>
            </>
        ) : (
            <>
                <div className={cn("relative", isSearchFocused ? "flex-1" : "md:flex-1")}>
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Search promotions..."
                    className="w-full rounded-lg bg-background pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    />
                </div>
                <div className={cn("flex items-center gap-2", isSearchFocused && "hidden md:flex")}>
                    <Button variant="secondary" size="sm" onClick={toggleSelectMode} className="h-10 gap-1">
                        <ListTodo className="h-3.5 w-3.5" />
                        <span>Select</span>
                    </Button>
                    <FilterSheet filters={filters} onFilterChange={setFilters} />
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button size="sm" variant="secondary" className="h-10 gap-1">
                            <File className="h-3.5 w-3.5" /> Export
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Export Not Implemented</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>OK</AlertDialogCancel></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button size="sm" className="h-10 gap-1" asChild>
                    <Link href="/dashboard/admin/coupons/new">
                        <PlusCircle className="h-3.5 w-3.5" /> Create New
                    </Link>
                    </Button>
                </div>
            </>
        )}
      </div>
      <Card className="flex-1 overflow-hidden">
        <div className="relative h-full overflow-auto custom-scrollbar">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                <TableHead className="w-[80px] font-bold py-4 pl-6">
                  {isSelectModeActive ? (
                      <Checkbox
                          checked={selectedCoupons.length > 0 && selectedCoupons.length === filteredAndSortedCoupons.length}
                          onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      />
                  ) : 'S.No.'}
                </TableHead>
                <TableHead className="font-bold py-4">
                  <button onClick={() => requestSort('code')} className="group flex items-center gap-2">
                    Offer/Code
                    {getSortIndicator('code')}
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => requestSort('type')} className="group flex items-center gap-2">
                    Type
                    {getSortIndicator('type')}
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => requestSort('discountValue')} className="group flex items-center gap-2">
                    Discount
                    {getSortIndicator('discountValue')}
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => requestSort('status')} className="group flex items-center gap-2">
                    Status
                    {getSortIndicator('status')}
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => requestSort('validFrom')} className="group flex items-center gap-2">
                    Valid From
                    {getSortIndicator('validFrom')}
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => requestSort('validUntil')} className="group flex items-center gap-2">
                    Valid Until
                    {getSortIndicator('validUntil')}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({length: 5}).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7}><Skeleton className="h-5 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : filteredAndSortedCoupons.length > 0 ? (
                filteredAndSortedCoupons.map((coupon, index) => (
                  <TableRow key={coupon.id} onClick={() => handleRowClick(coupon)} className="cursor-pointer" data-state={selectedCoupons.includes(coupon.id) && "selected"}>
                    <TableCell className="pl-6" onClick={(e) => {if(isSelectModeActive) e.stopPropagation()}}>
                        {isSelectModeActive ? <Checkbox checked={selectedCoupons.includes(coupon.id)} onCheckedChange={(checked) => handleRowSelect(coupon.id, !!checked)} /> : index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{coupon.type === 'offer' ? coupon.description : coupon.code}</TableCell>
                    <TableCell className="capitalize">{coupon.type}</TableCell>
                    <TableCell>{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(coupon.status)} className="capitalize">{coupon.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(coupon.validFrom)}</TableCell>
                    <TableCell>{formatDate(coupon.validUntil)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">No promotions found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      {selectedCoupon && (
        <CouponDetailSheet 
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            coupon={selectedCoupon}
        />
      )}
    </>
  );
}
