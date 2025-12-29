'use client';
import React, { useState, useMemo, useTransition, useEffect } from 'react';
import { TableVirtuoso } from 'react-virtuoso';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, File, Search, ArrowUpDown, ArrowUp, ArrowDown, ListTodo, X, Trash2, UserCog, UserPlus, CalendarClock, Loader2, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Applicant, Round } from '@/lib/types';
import { FilterSheet } from './filter-sheet';
import { scheduleNextRoundAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

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
    rounds: Round[];
    loading: boolean;
    jobId: string;
}

interface SuccessInfo {
    roundName: string;
    roundType: string;
    dueDate: string | null;
}

export function ApplicantsTable({ applicants, rounds, loading, jobId }: ApplicantsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<FilterState>(() => getFiltersFromParams(searchParams));
  const [isPending, startTransition] = useTransition();

  const [isSelectModeActive, setIsSelectModeActive] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);

  const stageOptions = useMemo(() => rounds.map(r => r.name), [rounds]);

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
    
    if (filters.status.length > 0) {
        filtered = filtered.filter(applicant => {
            const currentRound = rounds[applicant.activeRoundIndex];
            return currentRound && filters.status.includes(currentRound.name);
        })
    }

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
  }, [applicants, sortConfig, searchQuery, filters, rounds]);

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

  const getStatusDisplay = (status: Applicant['status']) => {
    switch (status) {
        case 'Screening Passed': return { text: 'Passed', variant: 'success' as const };
        case 'Screening Failed': return { text: 'Failed', variant: 'destructive' as const };
        case 'Hired': return { text: 'Hired', variant: 'success' as const };
        case 'Rejected': return { text: 'Rejected', variant: 'destructive' as const };
        default: return { text: 'In Progress', variant: 'outline' as const };
    }
  }

  const handleScheduleNextRound = (applicantId: string) => {
    startTransition(async () => {
        const result = await scheduleNextRoundAction(jobId, applicantId);
        if ('success' in result && result.success && result.roundName) {
            setSuccessInfo({
                roundName: result.roundName,
                roundType: result.roundType,
                dueDate: result.dueDate ? format(new Date(result.dueDate), 'dd MMM yyyy') : null,
            });
            setShowSuccessModal(true);
        } else if ('error' in result) {
            toast({ variant: 'destructive', title: "Error", description: result.error || 'An unknown error occurred.' });
        }
    });
  };

  return (
    <>
     <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                        <CheckCircle className="h-6 w-6 text-green-500"/>
                    </div>
                </div>
                <AlertDialogTitle className="text-center">Successfully Scheduled!</AlertDialogTitle>
                {successInfo && (
                    <AlertDialogDescription className="text-center pt-2 space-y-1">
                        <p><strong>Round:</strong> {successInfo.roundName} ({successInfo.roundType})</p>
                        {successInfo.dueDate && <p><strong>Due Date:</strong> {successInfo.dueDate}</p>}
                    </AlertDialogDescription>
                )}
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowSuccessModal(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
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
            <div className={cn("flex items-center gap-2", isSearchFocused && "hidden md:flex")}>
                <Button variant="secondary" size="sm" onClick={toggleSelectMode} className="h-10 gap-1">
                    <ListTodo className="h-3.5 w-3.5" />
                    <span>Select</span>
                </Button>
                <FilterSheet filters={filters} onFilterChange={handleFilterChange} stageOptions={stageOptions} />
                <Button size="sm" variant="secondary" className="h-10 gap-1">
                    <File className="h-3.5 w-3.5" /> Export
                </Button>
            </div>
          </>
        )}
      </div>
      <Card className="flex-1 overflow-hidden">
        <div className="h-full w-full">
          {loading ? (
             <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                     <TableHead className="w-[80px] font-bold py-4 pl-6">S.No.</TableHead>
                     <TableHead className="font-bold py-4">Name</TableHead>
                     <TableHead className="font-bold py-4">Email</TableHead>
                     <TableHead className="font-bold py-4">Current Stage</TableHead>
                     <TableHead className="font-bold py-4">Status</TableHead>
                     <TableHead className="font-bold py-4">Applied On</TableHead>
                     <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={index}><TableCell colSpan={7}><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                   ))}
                </TableBody>
             </Table>
          ) : filteredAndSortedApplicants.length > 0 ? (
             <TableVirtuoso
                data={filteredAndSortedApplicants}
                   components={{
                      Table: (props) => <Table {...props} style={{ ...props.style, borderCollapse: 'collapse', width: '100%' }} />,
                      TableHead: React.forwardRef((props, ref) => <TableHeader {...props} ref={ref} className="bg-muted/50 z-10" />),
                      TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
                      TableRow: (props) => {
                          const index = props['data-index'];
                          const applicant = filteredAndSortedApplicants[index];
                          if (!applicant) return <TableRow {...props} />;
                          
                          return (
                              <TableRow 
                                  {...props} 
                                  onClick={() => handleRowClick(applicant)} 
                                  className="cursor-pointer"
                                  data-state={selectedApplicants.includes(applicant.id) && "selected"}
                              />
                          );
                      },
                   }}
                fixedHeaderContent={() => (
                   <TableRow>
                     <TableHead className="w-[80px] font-bold py-4 pl-6 h-12 bg-muted/50">
                         {isSelectModeActive ? (
                             <Checkbox
                                 checked={selectedApplicants.length > 0 && selectedApplicants.length === filteredAndSortedApplicants.length}
                                 onCheckedChange={(checked) => handleSelectAll(!!checked)}
                             />
                         ) : 'S.No.'}
                     </TableHead>
                     <TableHead className="font-bold py-4 bg-muted/50">Name</TableHead>
                     <TableHead className="font-bold py-4 bg-muted/50">Email</TableHead>
                     <TableHead className="font-bold py-4 bg-muted/50">Current Stage</TableHead>
                     <TableHead className="font-bold py-4 bg-muted/50">Status</TableHead>
                     <TableHead className="font-bold py-4 bg-muted/50">
                         <button onClick={() => requestSort('appliedAt')} className="group flex items-center gap-2">
                             Applied On
                             <div className="p-1 group-hover:bg-accent rounded-full transition-colors">{getSortIndicator('appliedAt')}</div>
                         </button>
                     </TableHead>
                      <TableHead className="bg-muted/50"><span className="sr-only">Actions</span></TableHead>
                   </TableRow>
                )}
                itemContent={(index, applicant) => {
                    const currentRound = rounds[applicant.activeRoundIndex];
                    const statusDisplay = getStatusDisplay(applicant.status);
                    const canScheduleNext = applicant.activeRoundIndex === 0 && (applicant.status === 'Screening Passed' || applicant.status === 'Screening Failed');

                    return (
                        <>
                            <TableCell className="w-[80px] pl-6" onClick={(e) => {if(isSelectModeActive) e.stopPropagation()}}>
                                {isSelectModeActive ? (
                                    <Checkbox checked={selectedApplicants.includes(applicant.id)} onCheckedChange={(checked) => handleRowSelect(applicant.id, !!checked)} />
                                ) : ( index + 1 )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>{getInitials(applicant.candidateName)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{applicant.candidateName}</span>
                                </div>
                            </TableCell>
                            <TableCell>{applicant.candidateEmail}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{currentRound?.name || 'N/A'}</Badge>
                            </TableCell>
                             <TableCell>
                              <Badge variant={statusDisplay.variant} className={cn(statusDisplay.variant === 'success' && 'bg-green-500 hover:bg-green-600')}>{statusDisplay.text}</Badge>
                            </TableCell>
                            <TableCell>{formatDate(applicant.appliedAt)}</TableCell>
                            <TableCell>
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                         {canScheduleNext && (
                                            <DropdownMenuItem onSelect={() => handleScheduleNextRound(applicant.id)}>
                                                <CalendarClock className="mr-2 h-4 w-4" />
                                                Schedule Next Round
                                            </DropdownMenuItem>
                                         )}
                                        <DropdownMenuItem>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Add to candidate pool
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </>
                    );
                }}
             />
          ) : (
            <div className="flex items-center justify-center h-24 text-muted-foreground">No applicants yet.</div>
          )}
        </div>
      </Card>
    </div>
    </>
  );
}
