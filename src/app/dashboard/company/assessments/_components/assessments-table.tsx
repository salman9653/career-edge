
'use client';
import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { TableVirtuoso } from 'react-virtuoso';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { File, PlusCircle, Search, ArrowUpDown, ArrowUp, ArrowDown, ListFilter, ListTodo, X, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import type { Assessment } from '@/lib/types';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { FilterSheet } from './filter-sheet';

type SortKey = 'name' | 'createdAt' | 'questionIds' | 'createdByName';

export interface FilterState {
    assessmentType: string[];
    questionCount: string[];
    createdBy: string[];
}

const getFiltersFromParams = (searchParams: URLSearchParams): FilterState => {
    return {
        assessmentType: searchParams.get('assessmentType')?.split(',') || [],
        questionCount: searchParams.get('questionCount')?.split(',') || [],
        createdBy: searchParams.get('createdBy')?.split(',') || [],
    };
};

interface AssessmentsTableProps {
    assessments: Assessment[];
    loading: boolean;
    onCreate: () => void;
}

export function AssessmentsTable({ assessments, loading, onCreate }: AssessmentsTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSelectModeActive, setIsSelectModeActive] = useState(false);
    const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
    
    const [filters, setFilters] = useState<FilterState>(() => getFiltersFromParams(searchParams));
    const [isPending, startTransition] = useTransition();

    const { toast } = useToast();

    const uniqueCreators = useMemo(() => {
        const creators = new Set(assessments.map(a => a.createdByName));
        return Array.from(creators);
    }, [assessments]);

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
    
    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
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
    
    const filteredAndSortedAssessments = useMemo(() => {
        let sortableItems = [...assessments];
        
        if (searchQuery) {
            sortableItems = sortableItems.filter(assessment =>
                assessment.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        if (filters.assessmentType.length > 0) {
            sortableItems = sortableItems.filter(assessment =>
                filters.assessmentType.includes(assessment.assessmentType)
            );
        }

        if (filters.questionCount.length > 0) {
            sortableItems = sortableItems.filter(assessment => {
                const count = assessment.questionIds.length;
                return filters.questionCount.some(range => {
                    const [min, max] = range.split('-').map(Number);
                    if (range.endsWith('+')) return count >= min;
                    return count >= min && count <= max;
                });
            });
        }
        
        if (filters.createdBy.length > 0) {
            sortableItems = sortableItems.filter(assessment =>
                filters.createdBy.includes(assessment.createdByName)
            );
        }

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;
                if (sortConfig.key === 'questionIds') {
                    aValue = a.questionIds.length;
                    bValue = b.questionIds.length;
                } else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
                }
                
                if (aValue === null || bValue === null) return 0;
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [assessments, searchQuery, sortConfig, filters]);

    const formatDate = (date: any) => {
        if (!date) return "-";
        // Handle both Firestore Timestamp and ISO string
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return format(dateObj, "dd MMM yyyy");
    }

    const toggleSelectMode = () => {
        setIsSelectModeActive(!isSelectModeActive);
        setSelectedAssessments([]);
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedAssessments(filteredAndSortedAssessments.map(a => a.id));
        } else {
            setSelectedAssessments([]);
        }
    }

    const handleRowSelect = (assessmentId: string, checked: boolean) => {
        if (checked) {
            setSelectedAssessments(prev => [...prev, assessmentId]);
        } else {
            setSelectedAssessments(prev => prev.filter(id => id !== assessmentId));
        }
    }

    const handleRowClick = (assessmentId: string) => {
        if (isSelectModeActive) {
            const isSelected = selectedAssessments.includes(assessmentId);
            handleRowSelect(assessmentId, !isSelected);
        } else {
            router.push(`/dashboard/company/assessments/${assessmentId}`);
        }
    };
    
     const handleBulkDelete = async () => {
        if (selectedAssessments.length === 0) {
            toast({ variant: "destructive", title: "No assessments selected" });
            return;
        }
        try {
            const batch = writeBatch(db);
            selectedAssessments.forEach(id => {
                batch.delete(doc(db, 'assessments', id));
            });
            await batch.commit();
            toast({ title: `${selectedAssessments.length} assessments deleted.` });
            setSelectedAssessments([]);
            setIsSelectModeActive(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete assessments." });
        }
    };

    const handleExport = () => {
        const csvHeader = "S.No.,Assessment Name,Created By,Created On,No. of questions,Type\n";
        const csvRows = filteredAndSortedAssessments.map((assessment, index) => {
            const row = [
                index + 1,
                `"${assessment.name.replace(/"/g, '""')}"`,
                `"${assessment.createdByName.replace(/"/g, '""')}"`,
                formatDate(assessment.createdAt),
                assessment.questionIds.length,
                assessment.assessmentType
            ];
            return row.join(',');
        }).join('\n');

        const csvContent = csvHeader + csvRows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'assessments.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-center gap-2">
                {isSelectModeActive ? (
                    <>
                         <div className="flex items-center gap-4 flex-1">
                            <span className="text-sm font-medium">{selectedAssessments.length} selected</span>
                            <Button variant="ghost" size="sm" onClick={toggleSelectMode} className="h-10 gap-1 text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                                <span>Cancel</span>
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <Button size="sm" variant="secondary" className="h-10 gap-1">
                                        <File className="h-3.5 w-3.5" /> Export
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Export Selected Assessments</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will export the {selectedAssessments.length} selected assessments as a CSV file.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleExport}>Export</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="h-10 gap-1">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>Delete</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete {selectedAssessments.length} assessments.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={cn("relative", isSearchFocused ? "flex-1" : "md:flex-1")}>
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search assessments..."
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
                            <FilterSheet filters={filters} onFilterChange={handleFilterChange} availableCreators={uniqueCreators} />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="secondary" className="h-10 gap-1">
                                        <File className="h-3.5 w-3.5" /> Export
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Export All Assessments</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will export all visible assessments as a CSV file.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleExport}>Export</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button size="sm" className="h-10 gap-1" onClick={onCreate}>
                                <PlusCircle className="h-3.5 w-3.5" /> Create Assessment
                            </Button>
                        </div>
                    </>
                )}
            </div>

             {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index}><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
                    ))
                ) : filteredAndSortedAssessments.length > 0 ? (
                    filteredAndSortedAssessments.map((assessment, index) => (
                        <Card key={assessment.id} onClick={() => handleRowClick(assessment.id)} className="cursor-pointer">
                            <CardHeader className="p-4 flex flex-row items-center gap-4">
                               {isSelectModeActive && (
                                   <Checkbox
                                        checked={selectedAssessments.includes(assessment.id)}
                                        onCheckedChange={(checked) => handleRowSelect(assessment.id, !!checked)}
                                        onClick={(e) => e.stopPropagation()}
                                        aria-label={`Select assessment ${index + 1}`}
                                    />
                                )}
                                <p className="font-semibold">
                                    <span className="mr-2">{index + 1}.</span>{assessment.name}
                                </p>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-sm text-muted-foreground space-y-2">
                                <div>
                                    <span>No. of Questions: </span>
                                    <span className="font-medium text-foreground">{assessment.questionIds.length}</span>
                                </div>
                                <div>
                                    <span>Type: </span>
                                    <Badge variant="secondary" className="capitalize">{assessment.assessmentType}</Badge>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center text-xs text-muted-foreground bg-muted/50 p-3 rounded-b-lg">
                                <span>Created: {formatDate(assessment.createdAt)}</span>
                                <span>By: {assessment.createdByName}</span>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="text-center h-24 flex items-center justify-center">
                            <p>No assessments found.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
            
            {/* Desktop View - Table */}
            <Card className="hidden md:flex flex-1 flex-col overflow-hidden">
            <div className="h-full w-full">
                {loading ? (
                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                            <TableRow>
                                <TableHead className="w-[80px] font-bold py-4 pl-6">
                                     {isSelectModeActive ? (
                                        <Checkbox 
                                            checked={selectedAssessments.length > 0 && selectedAssessments.length === filteredAndSortedAssessments.length}
                                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                            aria-label="Select all rows"
                                        />
                                    ) : 'S.No.'}
                                </TableHead>
                                <TableHead className="font-bold py-4">
                                     <button onClick={() => requestSort('name')} className="group flex items-center gap-2">
                                        Assessment Name
                                        {getSortIndicator('name')}
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4">
                                     <button onClick={() => requestSort('createdByName')} className="group flex items-center gap-2">
                                        Created By
                                        {getSortIndicator('createdByName')}
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4">
                                     <button onClick={() => requestSort('createdAt')} className="group flex items-center gap-2">
                                        Created On
                                        {getSortIndicator('createdAt')}
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4">
                                    <button onClick={() => requestSort('questionIds')} className="group flex items-center gap-2">
                                        No. of questions
                                        {getSortIndicator('questionIds')}
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4">Type</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {Array.from({length: 3}).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell colSpan={6} className="p-4">
                                        <Skeleton className="h-5 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : filteredAndSortedAssessments.length > 0 ? (
                    <TableVirtuoso
                        data={filteredAndSortedAssessments}
                        components={{
                            Table: (props) => <Table {...props} style={{ ...props.style, borderCollapse: 'collapse', width: '100%' }} />,
                            TableHead: React.forwardRef((props, ref) => <TableHeader {...props} ref={ref} className="bg-muted/50 z-10" />),
                            TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
                            TableRow: (props) => {
                                const index = props['data-index'];
                                const assessment = filteredAndSortedAssessments[index];
                                if (!assessment) return <TableRow {...props} />;
                                
                                return (
                                    <TableRow 
                                        {...props} 
                                        onClick={() => handleRowClick(assessment.id)} 
                                        className="cursor-pointer" 
                                        data-state={selectedAssessments.includes(assessment.id) && "selected"} 
                                    />
                                );
                            },
                        }}
                        fixedHeaderContent={() => (
                            <TableRow>
                                <TableHead className="w-[80px] font-bold py-4 pl-6 h-12 bg-muted/50">
                                     {isSelectModeActive ? (
                                        <Checkbox 
                                            checked={selectedAssessments.length > 0 && selectedAssessments.length === filteredAndSortedAssessments.length}
                                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                            aria-label="Select all rows"
                                        />
                                    ) : 'S.No.'}
                                </TableHead>
                                <TableHead className="font-bold py-4 bg-muted/50">
                                     <button onClick={() => requestSort('name')} className="group flex items-center gap-2">
                                        Assessment Name
                                        {getSortIndicator('name')}
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4 bg-muted/50">
                                     <button onClick={() => requestSort('createdByName')} className="group flex items-center gap-2">
                                        Created By
                                        {getSortIndicator('createdByName')}
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4 bg-muted/50">
                                     <button onClick={() => requestSort('createdAt')} className="group flex items-center gap-2">
                                        Created On
                                        {getSortIndicator('createdAt')}
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4 bg-muted/50">
                                    <button onClick={() => requestSort('questionIds')} className="group flex items-center gap-2">
                                        No. of questions
                                        {getSortIndicator('questionIds')}
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4 bg-muted/50">Type</TableHead>
                            </TableRow>
                        )}
                        itemContent={(index, assessment) => (
                            <>
                                <TableCell className="w-[80px] pl-6" onClick={(e) => {if(isSelectModeActive) e.stopPropagation()}}>
                                    {isSelectModeActive ? (
                                        <Checkbox
                                            checked={selectedAssessments.includes(assessment.id)}
                                            onCheckedChange={(checked) => handleRowSelect(assessment.id, !!checked)}
                                            aria-label={`Select row ${index + 1}`}
                                        />
                                    ) : (
                                        index + 1
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">
                                    <span className="hover:underline">
                                        {assessment.name}
                                    </span>
                                </TableCell>
                                <TableCell>{assessment.createdByName}</TableCell>
                                <TableCell>{formatDate(assessment.createdAt)}</TableCell>
                                <TableCell>{assessment.questionIds.length}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Badge variant="secondary" className="capitalize">{assessment.assessmentType}</Badge>
                                    </div>
                                </TableCell>
                            </>
                        )}

                    />
                ) : (
                    <div className="flex items-center justify-center h-24 text-muted-foreground w-full">
                        No assessments found.
                    </div>
                )}
            </div>
            </Card>
        </div>
    );
}

