
'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ListFilter, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface FilterState {
    jobType: string[];
    location: string[];
    workExperience: string[];
}

const workExperienceOptions = [
    'Fresher',
    '0-1 Year',
    '1-3 years',
    '3-5 years',
    '5-7 years',
    '7+ years',
];

interface JobsToolbarProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    uniqueJobTypes: string[];
    uniqueLocations: string[];
}

export function JobsToolbar({
    searchQuery,
    onSearchQueryChange,
    filters,
    onFilterChange,
    uniqueJobTypes,
    uniqueLocations
}: JobsToolbarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleCheckedChange = (category: keyof FilterState, value: string, checked: boolean) => {
    setLocalFilters((prev) => {
      const currentValues = prev[category] || [];
      const newValues = checked ? [...currentValues, value] : currentValues.filter((v) => v !== value);
      return { ...prev, [category]: newValues as any };
    });
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    setIsSheetOpen(false);
  };
  
  const clearFilters = () => {
    const clearedFilters = { jobType: [], location: [], workExperience: [] };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setIsSheetOpen(false);
  };

  const activeFilterCount = filters.jobType.length + filters.location.length + filters.workExperience.length;

  return (
    <div className="flex items-center gap-2">
        <div className={cn("relative", isSearchFocused ? "flex-1" : "md:flex-1")}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search jobs..."
                className="w-full rounded-lg bg-background pl-8"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
            />
        </div>
        <div className={cn("flex items-center gap-2", isSearchFocused && "hidden md:flex")}>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <div className="relative">
                <SheetTrigger asChild>
                  <Button variant="secondary" size="sm" className="h-10 gap-1">
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
                    <h3 className="font-semibold mb-4">Job Type</h3>
                    <div className="space-y-3">
                      {uniqueJobTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={localFilters.jobType.includes(type)}
                            onCheckedChange={(checked) => handleCheckedChange('jobType', type, !!checked)}
                          />
                          <Label htmlFor={`type-${type}`} className="w-full font-normal capitalize">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Location</h3>
                    <div className="space-y-3">
                      {uniqueLocations.map((location) => (
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
                    <h3 className="font-semibold mb-4">Work Experience</h3>
                    <div className="space-y-3">
                      {workExperienceOptions.map((exp) => (
                        <div key={exp} className="flex items-center space-x-2">
                          <Checkbox
                            id={`experience-${exp}`}
                            checked={localFilters.workExperience.includes(exp)}
                            onCheckedChange={(checked) => handleCheckedChange('workExperience', exp, !!checked)}
                          />
                          <Label htmlFor={`experience-${exp}`} className="w-full font-normal capitalize">
                            {exp}
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
        </div>
    </div>
  );
}
