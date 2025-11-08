
'use client';
import { useContext, useState, useMemo, useEffect, useTransition } from 'react';
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
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { File, Search, ArrowUpDown, ArrowUp, ArrowDown, Trash, ShieldAlert, User, ShieldCheck, ShieldX, Gem, Star, UserCog, X, ListTodo } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { CandidateContext, type CandidateData } from '@/context/candidate-context';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterSheet } from './filter-sheet';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type SortKey = 'name' | 'createdAt' | 'applications';
export interface FilterState {
    status: string[];
    subscription: string[];
}

const getFiltersFromParams = (searchParams: URLSearchParams): FilterState => {
    return {
        status: searchParams.get('status')?.split(',') || [],
        subscription: searchParams.get('subscription')?.split(',') || [],
    };
};

export function CandidatesTable() {
  const { candidates, loading } = useContext(CandidateContext);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<FilterState>(() => getFiltersFromParams(searchParams));
  const [isPending, startTransition] = useTransition();

  const [isSelectModeActive, setIsSelectModeActive] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFilters(getFiltersFromParams(searchParams));
  }, [searchParams]);

  const handleFilterChange = (newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams.toString());
    
    (Object.keys(newFilters) as (keyof FilterState)[]).forEach(key => {
        if (newFilters[key].length > 0) {
            params.set(key, newFilters[key].join(','));
        } else {
            params.delete(key);
        }
    });

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


  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd MMM yyyy");
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedCandidates.length === 0) {
        toast({
            variant: "destructive",
            title: "No candidates selected",
            description: "Please select at least one candidate to change status.",
        });
        return;
    }

    try {
        const batch = writeBatch(db);
        selectedCandidates.forEach(candidateId => {
            const candidateRef = doc(db, 'users', candidateId);
            batch.update(candidateRef, { status: newStatus });
        });
        await batch.commit();
        toast({
            title: "Bulk Status Update",
            description: `${selectedCandidates.length} candidates have been updated to ${newStatus}.`,
        });
        setSelectedCandidates([]);
        setIsSelectModeActive(false);
    } catch (error) {
        console.error("Error updating bulk status: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update candidate statuses.",
        });
    }
  };

  const filteredAndSortedCandidates = useMemo(() => {
    let filteredCandidates = candidates;

    if (searchQuery) {
        filteredCandidates = filteredCandidates.filter(candidate =>
            candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (filters.status.length > 0) {
        filteredCandidates = filteredCandidates.filter(candidate =>
            filters.status.includes(candidate.status)
        );
    }
    if (filters.subscription.length > 0) {
        filteredCandidates = filteredCandidates.filter(candidate =>
             filters.subscription.includes(candidate.subscription)
        );
    }

    let sortableCandidates = [...filteredCandidates];
    if (sortConfig !== null) {
      sortableCandidates.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue.localeCompare(bValue);
            return sortConfig.direction === 'ascending' ? comparison : -comparison;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableCandidates;
  }, [candidates, sortConfig, searchQuery, filters]);

  const requestSort = (key: SortKey) => {
    if (sortConfig && sortConfig.key === key) {
        if (sortConfig.direction === 'descending') {
            setSortConfig({ key, direction: 'ascending' });
        } else {
            setSortConfig(null);
        }
    } else {
        setSortConfig({ key, direction: 'descending' });
    }
  };

  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />;
    }
    if (sortConfig.direction === 'ascending') {
        return <ArrowUp className="h-4 w-4" />;
    }
    return <ArrowDown className="h-4 w-4" />;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Active':
            return 'default';
        case 'Inactive':
            return 'secondary';
        case 'Banned':
            return 'destructive';
        default:
            return 'outline';
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'C';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const handleExport = () => {
    const csvHeader = "S.No.,Candidate Name,Email,Status,Subscription,Member Since\n";
    const csvRows = filteredAndSortedCandidates.map((candidate, index) => {
        const row = [
            index + 1,
            `"${candidate.name.replace(/"/g, '""')}"`,
            `"${candidate.email.replace(/"/g, '""')}"`,
            candidate.status,
            candidate.subscription,
            formatDate(candidate.createdAt)
        ];
        return row.join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'candidates.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const getSubscriptionIcon = (plan: string) => {
    const iconClass = "mr-2 h-4 w-4";
    switch (plan) {
        case 'Free':
            return <User className={iconClass} />;
        case 'Pro':
            return <Star className={iconClass} />;
        case 'Pro+':
            return <Gem className={`${iconClass} text-amber-500`} />;
        default:
            return null;
    }
  };

  const toggleSelectMode = () => {
    setIsSelectModeActive(!isSelectModeActive);
    setSelectedCandidates([]);
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
        setSelectedCandidates(filteredAndSortedCandidates.map(c => c.id));
    } else {
        setSelectedCandidates([]);
    }
  }

  const handleRowSelect = (candidateId: string, checked: boolean) => {
    if (checked) {
        setSelectedCandidates(prev => [...prev, candidateId]);
    } else {
        setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
    }
  }

  const handleRowClick = (candidateId: string) => {
    if (!isSelectModeActive) {
      router.push(`/dashboard/admin/candidates/${candidateId}`);
    } else {
      const isSelected = selectedCandidates.includes(candidateId);
      handleRowSelect(candidateId, !isSelected);
    }
  };

  return (
    <>
        <div className="flex items-center gap-2 mb-4">
            {isSelectModeActive ? (
                <>
                    <div className="flex items-center gap-4 flex-1">
                        <span className="text-sm font-medium">{selectedCandidates.length} selected</span>
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
                                <DropdownMenuItem onClick={() => handleBulkStatusChange('Active')}><ShieldCheck />Active</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkStatusChange('Inactive')}><ShieldX />Inactive</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkStatusChange('Banned')} className="text-destructive focus:text-destructive"><ShieldAlert />Banned</DropdownMenuItem>
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
                        placeholder="Search candidates..."
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
                      <FilterSheet filters={filters} onFilterChange={handleFilterChange} />
                      <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button size="sm" variant="secondary" className="h-10 gap-1">
                              <File className="h-3.5 w-3.5" />
                              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                              Export
                              </span>
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>Export Candidate List</AlertDialogTitle>
                          <AlertDialogDescription>
                              This will export the currently visible list of candidates as a CSV file. Are you sure you want to proceed?
                          </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleExport}>Export</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                      </AlertDialog>
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
                                        checked={selectedCandidates.length > 0 && selectedCandidates.length === filteredAndSortedCandidates.length}
                                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        aria-label="Select all rows"
                                    />
                                ) : 'S.No.'}
                            </TableHead>
                            <TableHead className="font-bold py-4">
                                <button onClick={() => requestSort('name')} className="group flex items-center gap-2">
                                    Candidate Name
                                    <div className="p-1 group-hover:bg-accent rounded-full transition-colors">
                                        {getSortIndicator('name')}
                                    </div>
                                </button>
                            </TableHead>
                            <TableHead className="font-bold py-4">Status</TableHead>
                            <TableHead className="font-bold py-4">Subscription</TableHead>
                            <TableHead className="font-bold py-4">
                                <button onClick={() => requestSort('applications')} className="group flex items-center gap-2">
                                    Applications
                                    <div className="p-1 group-hover:bg-accent rounded-full transition-colors">
                                        {getSortIndicator('applications')}
                                    </div>
                                </button>
                            </TableHead>
                            <TableHead className="font-bold py-4">
                                <button onClick={() => requestSort('createdAt')} className="group flex items-center gap-2">
                                    Member Since
                                    <div className="p-1 group-hover:bg-accent rounded-full transition-colors">
                                        {getSortIndicator('createdAt')}
                                    </div>
                                </button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({length: 5}).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell className="pl-6"><Skeleton className="h-5 w-5" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredAndSortedCandidates.length > 0 ? (
                            filteredAndSortedCandidates.map((candidate, index) => (
                                <TableRow key={candidate.id} onClick={() => handleRowClick(candidate.id)} className="cursor-pointer" data-state={selectedCandidates.includes(candidate.id) && "selected"}>
                                    <TableCell className="w-[80px] pl-6" onClick={(e) => {if(isSelectModeActive) e.stopPropagation()}}>
                                        {isSelectModeActive ? (
                                            <Checkbox
                                                checked={selectedCandidates.includes(candidate.id)}
                                                onCheckedChange={(checked) => handleRowSelect(candidate.id, !!checked)}
                                                aria-label={`Select row ${index + 1}`}
                                            />
                                        ) : (
                                            index + 1
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                {candidate.avatar && <AvatarImage src={candidate.avatar} alt={`${candidate.name} avatar`} data-ai-hint="person avatar" />}
                                                <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{candidate.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(candidate.status)}>{candidate.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className={`flex items-center`}>
                                        {getSubscriptionIcon(candidate.subscription)}
                                        {candidate.subscription}
                                      </div>
                                    </TableCell>
                                    <TableCell>{candidate.applications}</TableCell>
                                    <TableCell>{formatDate(candidate.createdAt)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    {searchQuery ? `No candidates found for "${searchQuery}"` : 'No candidates found.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </Card>
    </>
  );
}
