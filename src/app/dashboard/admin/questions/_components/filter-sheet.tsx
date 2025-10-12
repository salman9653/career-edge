
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
import { ListFilter } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { FilterState } from '@/components/questions/questions-table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FilterSheetProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  availableCategories: string[];
}

const typeOptions = ['mcq', 'subjective', 'code'];
const difficultyOptions = [
    { label: 'Easy', value: 1 },
    { label: 'Medium', value: 2 },
    { label: 'Hard', value: 3 }
];

export function FilterSheet({ filters, onFilterChange, availableCategories }: FilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  const handleCheckedChange = (
    category: keyof FilterState,
    value: string | number,
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
    const clearedFilters = { type: [], category: [], difficulty: [] };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setIsOpen(false);
  };

  const activeFilterCount =
    filters.type.length + filters.category.length + filters.difficulty.length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm" className="h-10 gap-1 relative">
          <ListFilter className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Filter
          </span>
          {activeFilterCount > 0 && (
            <Badge
              variant="default"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center p-0"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[300px] sm:w-[400px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-headline">Filters</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="space-y-6 py-6 pr-6">
            <div>
              <h3 className="font-semibold mb-4">Type</h3>
              <div className="space-y-3">
                {typeOptions.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={localFilters.type.includes(type)}
                      onCheckedChange={(checked) =>
                        handleCheckedChange('type', type, !!checked)
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
              <h3 className="font-semibold mb-4">Difficulty</h3>
              <div className="space-y-3">
                {difficultyOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`difficulty-${option.value}`}
                      checked={localFilters.difficulty.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handleCheckedChange('difficulty', option.value, !!checked)
                      }
                    />
                    <Label
                      htmlFor={`difficulty-${option.value}`}
                      className="w-full font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Category</h3>
              <div className="space-y-3">
                {availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={localFilters.category.includes(category)}
                      onCheckedChange={(checked) =>
                        handleCheckedChange('category', category, !!checked)
                      }
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="w-full font-normal"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
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
