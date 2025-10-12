
'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ListFilter, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { FilterState } from './assessments-table';

interface FilterSheetProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  availableCreators: string[];
}

const typeOptions = ['mcq', 'subjective', 'code'];
const questionCountOptions = [
    { label: '< 10', value: '0-9' },
    { label: '10 - 20', value: '10-20' },
    { label: '20 - 30', value: '20-30' },
    { label: '30 - 50', value: '30-50' },
    { label: '50+', value: '50+' },
];


export function FilterSheet({ filters, onFilterChange, availableCreators }: FilterSheetProps) {
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
      return { ...prev, [category]: newValues as any };
    });
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters = { assessmentType: [], questionCount: [], createdBy: [] };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setIsOpen(false);
  };

  const activeFilterCount = filters.assessmentType.length + filters.questionCount.length + filters.createdBy.length;

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
            <h3 className="font-semibold mb-4">Assessment Type</h3>
            <div className="space-y-3">
              {typeOptions.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={localFilters.assessmentType.includes(type)}
                    onCheckedChange={(checked) =>
                      handleCheckedChange('assessmentType', type, !!checked)
                    }
                  />
                  <Label
                    htmlFor={`type-${type}`}
                    className="w-full font-normal capitalize"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Number of Questions</h3>
            <div className="space-y-3">
              {questionCountOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`count-${option.value}`}
                    checked={localFilters.questionCount.includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleCheckedChange('questionCount', option.value, !!checked)
                    }
                  />
                  <Label
                    htmlFor={`count-${option.value}`}
                    className="w-full font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          {availableCreators.length > 0 && (
            <div>
                <h3 className="font-semibold mb-4">Created By</h3>
                <div className="space-y-3">
                {availableCreators.map((creator) => (
                    <div key={creator} className="flex items-center space-x-2">
                    <Checkbox
                        id={`creator-${creator}`}
                        checked={localFilters.createdBy.includes(creator)}
                        onCheckedChange={(checked) =>
                        handleCheckedChange('createdBy', creator, !!checked)
                        }
                    />
                    <Label
                        htmlFor={`creator-${creator}`}
                        className="w-full font-normal"
                    >
                        {creator}
                    </Label>
                    </div>
                ))}
                </div>
            </div>
          )}
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
