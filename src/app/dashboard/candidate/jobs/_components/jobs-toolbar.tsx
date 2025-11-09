
'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ListFilter, X, MapPin } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

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
    locationQuery: string;
    onLocationQueryChange: (query: string) => void;
    onSearchSubmit: () => void;
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    uniqueJobTypes: string[];
    uniqueLocations: string[];
}

export function JobsToolbar({
    searchQuery,
    onSearchQueryChange,
    locationQuery,
    onLocationQueryChange,
    onSearchSubmit,
    filters,
    onFilterChange,
    uniqueJobTypes,
    uniqueLocations
}: JobsToolbarProps) {
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
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleFormSubmit} className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Job title, keywords, or company"
              className="w-full rounded-md bg-background pl-9 h-12"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
            />
          </div>
          <div className="relative flex-1 w-full">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Location"
              className="w-full rounded-md bg-background pl-9 h-12"
              value={locationQuery}
              onChange={(e) => onLocationQueryChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <div className="relative">
                <SheetTrigger asChild>
                  <Button variant="outline" size="lg" className="h-12 gap-1 w-full md:w-auto">
                    <ListFilter className="h-4 w-4" />
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
            <Button type="submit" size="lg" className="h-12 w-full md:w-auto">
              Find Jobs
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
