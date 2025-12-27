
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
import type { CrmFilterState } from '../page';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FilterSheetProps {
  filters: CrmFilterState;
  onFilterChange: (newFilters: CrmFilterState) => void;
  availableTags: string[];
  availableLocations: string[];
  availableSources: string[];
}

export function FilterSheet({ filters, onFilterChange, availableTags, availableLocations, availableSources }: FilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<CrmFilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  const handleCheckedChange = (
    category: 'tags' | 'location' | 'source',
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
    const clearedFilters = { tags: [], location: [], source: [] };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setIsOpen(false);
  };

  const activeFilterCount =
    filters.tags.length + filters.location.length + filters.source.length;

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
        <ScrollArea className="flex-1">
          <div className="space-y-6 py-6 pr-4">
            <div>
              <h3 className="font-semibold mb-4">Location</h3>
              <div className="space-y-3">
                {availableLocations.map((location) => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location}`}
                      checked={localFilters.location.includes(location)}
                      onCheckedChange={(checked) => handleCheckedChange('location', location, !!checked)}
                    />
                    <Label htmlFor={`location-${location}`} className="w-full font-normal capitalize">
                      {location}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Source</h3>
              <div className="space-y-3">
                {availableSources.map((source) => (
                  <div key={source} className="flex items-center space-x-2">
                    <Checkbox
                      id={`source-${source}`}
                      checked={localFilters.source.includes(source)}
                      onCheckedChange={(checked) => handleCheckedChange('source', source, !!checked)}
                    />
                    <Label htmlFor={`source-${source}`} className="w-full font-normal capitalize">
                      {source}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Tags</h3>
              <div className="space-y-3">
                {availableTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={localFilters.tags.includes(tag)}
                      onCheckedChange={(checked) => handleCheckedChange('tags', tag, !!checked)}
                    />
                    <Label htmlFor={`tag-${tag}`} className="w-full font-normal capitalize">
                      {tag}
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
