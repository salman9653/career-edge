
'use client';
import { useContext, useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
import { MoreVertical, File, Search, ArrowUpDown, ArrowUp, ArrowDown, Trash, ShieldAlert, User, ShieldCheck, ShieldX, Gem, Star, Crown, UserCog, X, ListTodo } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { CompanyContext, type CompanyData } from '@/context/company-context';
import { JobContext } from '@/context/job-context';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterSheet } from './filter-sheet';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


type SortKey = 'name' | 'size' | 'createdAt' | 'companyType' | 'jobsPosted';
export interface FilterState {
    status: string[];
    plan: string[];
}

const getFiltersFromParams = (searchParams: URLSearchParams): FilterState => {
    return {
        status: searchParams.get('status')?.split(',') || [],
        plan: searchParams.get('plan')?.split(',') || [],
    };
};


export function CompaniesTable() {
  const { companies, loading } = useContext(CompanyContext);
  const { jobs, loading: jobsLoading } = useContext(JobContext);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<FilterState>(() => getFiltersFromParams(searchParams));
  const [isPending, startTransition] = useTransition();
  
  const [isSelectModeActive, setIsSelectModeActive] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
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
    if (selectedCompanies.length === 0) {
        toast({
            variant: "destructive",
            title: "No companies selected",
            description: "Please select at least one company to change status.",
        });
        return;
    }

    try {
        const batch = writeBatch(db);
        selectedCompanies.forEach(companyId => {
            const companyRef = doc(db, 'users', companyId);
            batch.update(companyRef, { status: newStatus });
        });
        await batch.commit();
        toast({
            title: "Bulk Status Update",
            description: `${selectedCompanies.length} companies have been updated to ${newStatus}.`,
        });
        // Exit select mode after action
        setSelectedCompanies([]);
        setIsSelectModeActive(false);
    } catch (error) {
        console.error("Error updating bulk status: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update company statuses.",
        });
    }
  };


  const filteredAndSortedCompanies = useMemo(() => {
    let companyJobsCount = jobs.reduce((acc, job) => {
        acc[job.companyId] = (acc[job.companyId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    let filteredCompanies = companies.map(c => ({...c, jobsPosted: companyJobsCount[c.id] || 0}));


    if (searchQuery) {
        filteredCompanies = filteredCompanies.filter(company =>
            company.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }


    if (filters.status.length > 0) {
        filteredCompanies = filteredCompanies.filter(company =>
            filters.status.includes(company.status)
        );
    }
    if (filters.plan.length > 0) {
        filteredCompanies = filteredCompanies.filter(company =>
             filters.plan.includes(company.plan)
        );
    }


    let sortableCompanies = [...filteredCompanies];
    if (sortConfig !== null) {
      sortableCompanies.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === 'size') {
            aValue = a.size?.size || '';
            bValue = b.size?.size || '';
        } else if (sortConfig.key === 'jobsPosted') {
            aValue = a.jobsPosted;
            bValue = b.jobsPosted;
        } else {
            aValue = a[sortConfig.key as keyof typeof a] || '';
            bValue = b[sortConfig.key as keyof typeof b] || '';
        }


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
    return sortableCompanies;
  }, [companies, jobs, sortConfig, searchQuery, filters]);


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
    const csvHeader = "S.No.,Company Name,Email,Status,Subscription,Company Size,Member Since\n";
    const csvRows = filteredAndSortedCompanies.map((company, index) => {
        const row = [
            index + 1,
            `"${company.name.replace(/"/g, '""')}"`,
            `"${company.email.replace(/"/g, '""')}"`,
            company.status,
            company.plan,
            `"${company.size.size.replace(/"/g, '""')}"`,
            formatDate(company.createdAt)
        ];
        return row.join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'companies.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const getPlanIcon = (plan: string) => {
    const iconClass = "mr-2 h-4 w-4";
    switch (plan) {
        case 'Free':
            return <User className={iconClass} />;
        case 'Pro':
            return <Star className={iconClass} />;
        case 'Pro+':
            return <Gem className={`${iconClass} text-amber-500`} />;
        case 'Enterprise':
            return <Crown className={iconClass} />;
        default:
            return null;
    }
  };

  const toggleSelectMode = () => {
    setIsSelectModeActive(!isSelectModeActive);
    setSelectedCompanies([]);
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
        setSelectedCompanies(filteredAndSortedCompanies.map(c => c.id));
    } else {
        setSelectedCompanies([]);
    }
  }

  const handleRowSelect = (companyId: string, checked: boolean) => {
    if (checked) {
        setSelectedCompanies(prev => [...prev, companyId]);
    } else {
        setSelectedCompanies(prev => prev.filter(id => id !== companyId));
    }
  }

  const handleRowClick = (companyId: string) => {
    if (!isSelectModeActive) {
      router.push(`/dashboard/admin/companies/${companyId}`);
    } else {
      const isSelected = selectedCompanies.includes(companyId);
      handleRowSelect(companyId, !isSelected);
    }
  };


  return (
    <>
        <div className="flex items-center gap-2 mb-4">
            {isSelectModeActive ? (
                <>
                    <div className="flex items-center gap-4 flex-1">
                        <span className="text-sm font-medium">{selectedCompanies.length} selected</span>
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
                        placeholder="Search companies..."
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
                          <AlertDialogTitle>Export Company List</AlertDialogTitle>
                          <AlertDialogDescription>
                              This will export the currently visible list of companies as a CSV file. Are you sure you want to proceed?
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
                                        checked={selectedCompanies.length > 0 && selectedCompanies.length === filteredAndSortedCompanies.length}
                                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        aria-label="Select all rows"
                                    />
                                ) : 'S.No.'}
                            </TableHead>
                            <TableHead className="font-bold py-4">
                                <button onClick={() => requestSort('name')} className="group flex items-center gap-2">
                                    Company Name
                                    <div className="p-1 group-hover:bg-accent rounded-full transition-colors">
                                        {getSortIndicator('name')}
                                    </div>
                                </button>
                            </TableHead>
                            <TableHead className="font-bold py-4">Status</TableHead>
                            <TableHead className="font-bold py-4">Subscription</TableHead>
                            <TableHead className="font-bold py-4">
                                <button onClick={() => requestSort('size')} className="group flex items-center gap-2">
                                    Company Size
                                    <div className="p-1 group-hover:bg-accent rounded-full transition-colors">
                                        {getSortIndicator('size')}
                                    </div>
                                </button>
                            </TableHead>
                             <TableHead className="font-bold py-4">
                                <button onClick={() => requestSort('companyType')} className="group flex items-center gap-2">
                                    Company Type
                                    <div className="p-1 group-hover:bg-accent rounded-full transition-colors">
                                        {getSortIndicator('companyType')}
                                    </div>
                                </button>
                            </TableHead>
                            <TableHead className="font-bold py-4">
                                <button onClick={() => requestSort('jobsPosted')} className="group flex items-center gap-2">
                                    Jobs Posted
                                    <div className="p-1 group-hover:bg-accent rounded-full transition-colors">
                                        {getSortIndicator('jobsPosted')}
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
                        {loading || jobsLoading ? (
                            Array.from({length: 10}).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell className="pl-6"><Skeleton className="h-5 w-5" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredAndSortedCompanies.length > 0 ? (
                            filteredAndSortedCompanies.map((company, index) => (
                                <TableRow key={company.id} onClick={() => handleRowClick(company.id)} className="cursor-pointer" data-state={selectedCompanies.includes(company.id) && "selected"}>
                                    <TableCell className="w-[80px] pl-6" onClick={(e) => {if(isSelectModeActive) e.stopPropagation()}}>
                                        {isSelectModeActive ? (
                                            <Checkbox
                                                checked={selectedCompanies.includes(company.id)}
                                                onCheckedChange={(checked) => handleRowSelect(company.id, !!checked)}
                                                aria-label={`Select row ${index + 1}`}
                                            />
                                        ) : (
                                            index + 1
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                {company.displayImageUrl && <AvatarImage src={company.displayImageUrl} alt={`${company.name} logo`} data-ai-hint="company logo" />}
                                                <AvatarFallback>{getInitials(company.name)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{company.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(company.status)}>{company.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className={`flex items-center`}>
                                        {getPlanIcon(company.plan)}
                                        {company.plan}
                                      </div>
                                    </TableCell>
                                    <TableCell>{company.size?.size || 'N/A'}</TableCell>
                                    <TableCell>{company.companyType || 'N/A'}</TableCell>
                                    <TableCell>{company.jobsPosted || 0}</TableCell>
                                    <TableCell>{formatDate(company.createdAt)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24">
                                    {searchQuery ? `No companies found for "${searchQuery}"` : 'No companies found.'}
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
