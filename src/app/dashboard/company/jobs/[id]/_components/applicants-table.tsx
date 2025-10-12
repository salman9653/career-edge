
'use client';
import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { File, Search, ArrowUpDown, ArrowUp, ArrowDown, ListTodo, X, Trash2, UserCog } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Applicant } from '@/lib/types';
import { FilterSheet } from './filter-sheet';

type SortKey = 'candidateName' | 'appliedAt';

export interface FilterState {
    status: string[];
}

const getFiltersFromParams = (searchParams: URLSearchParams): FilterState => {
    return {
        status: searchParams.get('status')?.split(',') || [],
    };
};

interface ApplicantsTableProps {
    applicants: Applicant[];
    loading: boolean;
}

export function ApplicantsTable({ applicants, loading }: ApplicantsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<FilterState>(() => getFiltersFromParams(searchParams));
  const [isPending, startTransition] = useTransition();

  const [isSelectModeActive, setIsSelectModeActive] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    setFilters(getFiltersFromParams(searchParams));
  }, [searchParams]);

  const handleFilterChange = (newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilters.status.length > 0) {
      params.set('status', newFilters.status.join(','));
    } else {
      params.delete('status');
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
        params.set('q', searchQuery);
    } else {
        params.delete('q');
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, pathname]);
  
  const filteredAndSortedApplicants = useMemo(() => {
    let filtered = applicants;

    if (searchQuery) {
      filtered = filtered.filter(applicant =>
        applicant.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Add status filter when applicant has a status property
    // if (filters.status.length > 0) {
    //   filtered = filtered.filter(applicant => filters.status.includes(applicant.status));
    // }

    let sortable = [...filtered];
    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [applicants, sortConfig, searchQuery, filters]);

  const requestSort = (key: SortKey) => {
    if (sortConfig && sortConfig.key === key) {
        if (sortConfig.direction === 'descending') setSortConfig(null);
        else setSortConfig({ key, direction: 'ascending' });
    } else {
        setSortConfig({ key, direction: 'descending' });
    }
  };

  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />;
    if (sortConfig.direction === 'ascending') return <ArrowUp className="h-4 w-4" />;
    return <ArrowDown className="h-4 w-4" />;
  };

  const getInitials = (name: string) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const toggleSelectMode = () => {
    setIsSelectModeActive(!isSelectModeActive);
    setSelectedApplicants([]);
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedApplicants(checked ? filteredAndSortedApplicants.map(a => a.id) : []);
  }

  const handleRowSelect = (applicantId: string, checked: boolean) => {
    setSelectedApplicants(prev => checked ? [...prev, applicantId] : prev.filter(id => id !== applicantId));
  }

  const handleRowClick = (applicant: Applicant) => {
    if (isSelectModeActive) {
      handleRowSelect(applicant.id, !selectedApplicants.includes(applicant.id));
    } else {
      // Logic to view applicant details, maybe a sheet or a new page
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "-";
    const jsDate = date.toDate ? date.toDate() : new Date(date);
    return format(jsDate, "dd MMM yyyy");
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-2 mb-4">
        {isSelectModeActive ? (
          <>
            <div className="flex items-center gap-4 flex-1">
                <span className="text-sm font-medium">{selectedApplicants.length} selected</span>
                <Button variant="ghost" size="sm" onClick={toggleSelectMode} className="h-10 gap-1 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                </Button>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" className="h-10 gap-1">
                    <UserCog className="h-3.5 w-3.5" />
                    <span>Change Status</span>
                </Button>
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
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-1 items-center gap-4">
              <h2 className="text-lg font-semibold whitespace-nowrap">
                Applicants ({applicants.length})
              </h2>
              <div className={cn("relative w-full", isSearchFocused ? "flex-1" : "md:flex-1")}>
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      type="search"
                      placeholder="Search applicants..."
                      className="w-full rounded-lg bg-background pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                  />
              </div>
            </div>
            <div className={cn("flex items-center gap-2", isSearchFocused && "hidden md:flex")}>
                <Button variant="secondary" size="sm" onClick={toggleSelectMode} className="h-10 gap-1">
                    <ListTodo className="h-3.5 w-3.5" />
                    <span>Select</span>
                </Button>
                <FilterSheet filters={filters} onFilterChange={handleFilterChange} />
                <Button size="sm" variant="secondary" className="h-10 gap-1">
                    <File className="h-3.5 w-3.5" /> Export
                </Button>
            </div>
          </>
        )}
      </div>
      <Card className="flex-1 overflow-hidden">
        <div className="relative h-full overflow-auto custom-scrollbar">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[80px] font-bold py-4 pl-6">
                    {isSelectModeActive ? (
                        <Checkbox
                            checked={selectedApplicants.length > 0 && selectedApplicants.length === filteredAndSortedApplicants.length}
                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        />
                    ) : 'S.No.'}
                </TableHead>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead className="font-bold py-4">Name</TableHead>
                <TableHead className="font-bold py-4">Email</TableHead>
                <TableHead className="font-bold py-4">Status</TableHead>
                <TableHead className="font-bold py-4">
                    <button onClick={() => requestSort('appliedAt')} className="group flex items-center gap-2">
                        Applied On
                        <div className="p-1 group-hover:bg-accent rounded-full transition-colors">{getSortIndicator('appliedAt')}</div>
                    </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}><TableCell colSpan={6}><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                ))
              ) : filteredAndSortedApplicants.length > 0 ? (
                filteredAndSortedApplicants.map((applicant, index) => (
                  <TableRow key={applicant.id} onClick={() => handleRowClick(applicant)} className="cursor-pointer" data-state={selectedApplicants.includes(applicant.id) && "selected"}>
                    <TableCell className="w-[80px] pl-6" onClick={(e) => {if(isSelectModeActive) e.stopPropagation()}}>
                        {isSelectModeActive ? (
                            <Checkbox checked={selectedApplicants.includes(applicant.id)} onCheckedChange={(checked) => handleRowSelect(applicant.id, !!checked)} />
                        ) : ( index + 1 )}
                    </TableCell>
                    <TableCell className="w-[80px]">
                         <Avatar className="h-10 w-10">
                            <AvatarImage src={applicant.avatarUrl} alt={applicant.candidateName} />
                            <AvatarFallback>{getInitials(applicant.candidateName)}</AvatarFallback>
                        </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{applicant.candidateName}</TableCell>
                     <TableCell>{applicant.candidateEmail}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{applicant.status || 'New'}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(applicant.appliedAt)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">No applicants yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
