
'use client';


import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ListFilter, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { FilterState } from './companies-table';


interface FilterSheetProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
}


const statusOptions = ['Active', 'Inactive', 'Banned'];
const planOptions = ['Free', 'Pro', 'Pro+', 'Enterprise'];


export function FilterSheet({ filters, onFilterChange }: FilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);


  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);


  const handleCheckedChange = (
    category: keyof FilterState,
    value: string,
    checked: boolean
  ) => {
    setLocalFilters((prev) => {
      const currentValues = prev[category] || [];
      const newValues = checked
        ? [...currentValues, value]
        : currentValues.filter((v) => v !== value);
      return { ...prev, [category]: newValues };
    });
  };


  const applyFilters = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };


  const clearFilters = () => {
    const clearedFilters = { status: [], plan: [] };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setIsOpen(false);
  };


  const activeFilterCount =
    filters.status.length + filters.plan.length;


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative">
        <SheetTrigger asChild>
          <Button variant="secondary" size="sm" className="h-10 gap-1 relative">
            <ListFilter className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Filter
            </span>
          </Button>
        </SheetTrigger>
        {activeFilterCount > 0 && (
          <div className="absolute -top-2 -right-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }} 
              className="relative group"
            >
              <Badge
                variant="default"
                className="h-5 w-5 rounded-full flex items-center justify-center p-0 transition-all"
              >
                <span className="group-hover:opacity-0 group-hover:scale-0 transition-all duration-200">{activeFilterCount}</span>
                <X className="h-3 w-3 absolute opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200" />
              </Badge>
            </button>
          </div>
        )}
      </div>
      <SheetContent className="w-[300px] sm:w-[400px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-headline">Filters</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-6 py-6">
          <div>
            <h3 className="font-semibold mb-4">Status</h3>
            <div className="space-y-3">
              {statusOptions.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={localFilters.status.includes(status)}
                    onCheckedChange={(checked) =>
                      handleCheckedChange('status', status, !!checked)
                    }
                  />
                  <Label
                    htmlFor={`status-${status}`}
                    className="w-full font-normal"
                  >
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Subscription Plan</h3>
            <div className="space-y-3">
              {planOptions.map((plan) => (
                <div key={plan} className="flex items-center space-x-2">
                  <Checkbox
                    id={`plan-${plan}`}
                    checked={localFilters.plan.includes(plan)}
                    onCheckedChange={(checked) =>
                      handleCheckedChange('plan', plan, !!checked)
                    }
                  />
                  <Label
                    htmlFor={`plan-${plan}`}
                    className="w-full font-normal"
                  >
                    {plan}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={clearFilters} className="w-full">
            Clear Filters
          </Button>
          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
