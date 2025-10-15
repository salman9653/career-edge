
'use client';
import { useState, useMemo } from 'react';
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
import { File, PlusCircle, Search, ArrowUpDown, ArrowUp, ArrowDown, ListTodo, X, Trash2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import type { AiInterview } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { mockAiInterviews } from '@/lib/mock-data';
import { FilterSheet } from './ai-interviews-filter-sheet';
import { GenerateAiInterviewDialog } from './generate-ai-interview-dialog';

type SortKey = 'name' | 'createdAt' | 'duration' | 'questionCount' | 'difficulty' | 'tone';

export interface AiInterviewFilterState {
    difficulty: ('Easy' | 'Medium' | 'Hard')[];
    tone: ('Formal' | 'Conversational' | 'Technical')[];
}

interface AiInterviewsTableProps {
    onCreate: () => void;
}

export function AiInterviewsTable({ onCreate }: AiInterviewsTableProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSelectModeActive, setIsSelectModeActive] = useState(false);
    const [selectedInterviews, setSelectedInterviews] = useState<string[]>([]);
    const [filters, setFilters] = useState<AiInterviewFilterState>({ difficulty: [], tone: [] });
    const { toast } = useToast();
    const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);

    // Using mock data for now
    const interviews = mockAiInterviews;
    const loading = false;

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
    
    const filteredAndSortedInterviews = useMemo(() => {
        let sortableItems = [...interviews];
        
        if (searchQuery) {
            sortableItems = sortableItems.filter(interview =>
                interview.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        if (filters.difficulty.length > 0) {
            sortableItems = sortableItems.filter(interview => filters.difficulty.includes(interview.difficulty));
        }

        if (filters.tone.length > 0) {
            sortableItems = sortableItems.filter(interview => filters.tone.includes(interview.tone));
        }

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (aValue === null || bValue === null) return 0;
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [interviews, searchQuery, sortConfig, filters]);

    const formatDate = (date: any) => {
        if (!date) return "-";
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return format(dateObj, "dd MMM yyyy");
    }

    const toggleSelectMode = () => {
        setIsSelectModeActive(!isSelectModeActive);
        setSelectedInterviews([]);
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedInterviews(filteredAndSortedInterviews.map(a => a.id));
        } else {
            setSelectedInterviews([]);
        }
    }

    const handleRowSelect = (interviewId: string, checked: boolean) => {
        if (checked) {
            setSelectedInterviews(prev => [...prev, interviewId]);
        } else {
            setSelectedInterviews(prev => prev.filter(id => id !== interviewId));
        }
    }

    const handleRowClick = (interviewId: string) => {
        if (isSelectModeActive) {
            const isSelected = selectedInterviews.includes(interviewId);
            handleRowSelect(interviewId, !isSelected);
        } else {
            // router.push(`/dashboard/company/templates/ai-interviews/${interviewId}`);
        }
    };

    return (
        <>
        <GenerateAiInterviewDialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen} />
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-center gap-2">
                {isSelectModeActive ? (
                    <>
                         <div className="flex items-center gap-4 flex-1">
                            <span className="text-sm font-medium">{selectedInterviews.length} selected</span>
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
                                    <AlertDialogHeader><AlertDialogTitle>Export Not Implemented</AlertDialogTitle></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>OK</AlertDialogCancel></AlertDialogFooter>
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
                                    <AlertDialogHeader><AlertDialogTitle>Delete Not Implemented</AlertDialogTitle></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>OK</AlertDialogCancel></AlertDialogFooter>
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
                                placeholder="Search interviews..."
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
                            <FilterSheet filters={filters} onFilterChange={setFilters} />
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
                            <Button size="sm" className="h-10 gap-1" onClick={() => setIsGenerateDialogOpen(true)}>
                                <Sparkles className="h-3.5 w-3.5" /> Generate AI Interview
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
                                            checked={selectedInterviews.length > 0 && selectedInterviews.length === filteredAndSortedInterviews.length}
                                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                            aria-label="Select all rows"
                                        />
                                    ) : 'S.No.'}
                                </TableHead>
                                <TableHead className="font-bold py-4">
                                     <button onClick={() => requestSort('name')} className="group flex items-center gap-2">
                                        Name
                                        {getSortIndicator('name')}
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4">
                                     <button onClick={() => requestSort('createdAt')} className="group flex items-center gap-2">
                                        Created On
                                        {getSortIndicator('createdAt')}
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4">
                                    <button onClick={() => requestSort('duration')} className="group flex items-center gap-2">
                                        Duration
                                        {getSortIndicator('duration')}
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4">
                                    <button onClick={() => requestSort('questionCount')} className="group flex items-center gap-2">
                                        Questions
                                        {getSortIndicator('questionCount')}
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4">
                                    <button onClick={() => requestSort('difficulty')} className="group flex items-center gap-2">
                                        Difficulty
                                        {getSortIndicator('difficulty')}
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4">
                                    <button onClick={() => requestSort('tone')} className="group flex items-center gap-2">
                                        Tone
                                        {getSortIndicator('tone')}
                                    </button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {loading ? (
                                Array.from({length: 3}).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell colSpan={8} className="p-4">
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : filteredAndSortedInterviews.length > 0 ? (
                                filteredAndSortedInterviews.map((interview, index) => (
                                    <TableRow key={interview.id} onClick={() => handleRowClick(interview.id)} className="cursor-pointer" data-state={selectedInterviews.includes(interview.id) && "selected"}>
                                        <TableCell className="w-[80px] pl-6" onClick={(e) => {if(isSelectModeActive) e.stopPropagation()}}>
                                            {isSelectModeActive ? (
                                                <Checkbox
                                                    checked={selectedInterviews.includes(interview.id)}
                                                    onCheckedChange={(checked) => handleRowSelect(interview.id, !!checked)}
                                                    aria-label={`Select row ${index + 1}`}
                                                />
                                            ) : (
                                                index + 1
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <span className="hover:underline">
                                                {interview.name}
                                            </span>
                                        </TableCell>
                                        <TableCell>{formatDate(interview.createdAt)}</TableCell>
                                        <TableCell>{interview.duration} min</TableCell>
                                        <TableCell>{interview.questionCount}</TableCell>
                                        <TableCell><Badge variant="secondary">{interview.difficulty}</Badge></TableCell>
                                        <TableCell><Badge variant="outline">{interview.tone}</Badge></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24">No AI Interviews found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
        </>
    );
}
