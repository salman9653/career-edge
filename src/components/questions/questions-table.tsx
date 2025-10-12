
'use client';
import { useState, useMemo, useTransition, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
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
import { File, Search, ArrowUpDown, ArrowUp, ArrowDown, ListTodo, X, PlusCircle, Trash2, UserCog, ShieldCheck, ShieldX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterSheet } from './filter-sheet';
import { format } from 'date-fns';
import type { Question } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { QuestionDetailSheet } from './question-detail-sheet';
import { Tooltip, TooltipContent, TooltipProvider } from '../ui/tooltip';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
import { removeQuestionFromAssessmentAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

type SortKey = 'question' | 'difficulty' | 'createdAt' | 'addedByName';
export interface FilterState {
    type: string[];
    category: string[];
    difficulty: number[];
    createdBy: string[];
}

interface QuestionsTableProps {
    questions: Question[];
    loading: boolean;
    context: 'admin' | 'company' | 'assessment';
    showAddButton?: boolean;
    showCreatedBy?: boolean;
}

const getFiltersFromParams = (searchParams: URLSearchParams): FilterState => {
    return {
        type: searchParams.get('type')?.split(',') || [],
        category: searchParams.get('category')?.split(',') || [],
        difficulty: searchParams.get('difficulty')?.split(',').map(Number).filter(n => !isNaN(n)) || [],
        createdBy: searchParams.get('createdBy')?.split(',') || [],
    };
};

export function QuestionsTable({ questions, loading, context, showAddButton = false, showCreatedBy = false }: QuestionsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const [filters, setFilters] = useState<FilterState>(() => getFiltersFromParams(searchParams));

  const [isSelectModeActive, setIsSelectModeActive] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
        params.set('q', searchQuery);
    } else {
        params.delete('q');
    }
    // Using startTransition to avoid race conditions with React's rendering
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, pathname]);

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

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    (Object.keys(filters) as (keyof FilterState)[]).forEach(key => {
       params.delete(key);
    });
    startTransition(() => {
       router.replace(`${pathname}?${params.toString()}`);
    });
  }

  const handleBulkStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (selectedQuestions.length === 0) {
        toast({
            variant: "destructive",
            title: "No questions selected",
            description: "Please select questions to update.",
        });
        return;
    }
    try {
        const batch = writeBatch(db);
        selectedQuestions.forEach(questionId => {
            const questionRef = doc(db, 'questions', questionId);
            batch.update(questionRef, { status: newStatus });
        });
        await batch.commit();
        toast({
            title: "Bulk Status Update",
            description: `${selectedQuestions.length} questions updated to ${newStatus}.`,
        });
        setSelectedQuestions([]);
        setIsSelectModeActive(false);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update statuses.",
        });
    }
  };

   const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) {
        toast({ variant: "destructive", title: "No questions selected", description: "Please select questions to delete." });
        return;
    }
    try {
        const batch = writeBatch(db);
        selectedQuestions.forEach(questionId => {
            const questionRef = doc(db, 'questions', questionId);
            batch.delete(questionRef);
        });
        await batch.commit();
        toast({ title: "Bulk Delete Successful", description: `${selectedQuestions.length} questions have been deleted.` });
        setSelectedQuestions([]);
        setIsSelectModeActive(false);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete questions." });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
        return format(new Date(dateString), "dd MMM yyyy");
    } catch (e) {
        return "Invalid Date";
    }
  }

  const uniqueCategories = useMemo(() => {
    const allCategories = questions.flatMap(q => q.category || []);
    return [...new Set(allCategories)];
  }, [questions]);
  
  const uniqueCreators = useMemo(() => {
    if (!showCreatedBy) return [];
    const creators = new Set(questions.map(q => q.addedByName).filter(Boolean));
    return Array.from(creators);
}, [questions, showCreatedBy]);

  const filteredAndSortedQuestions = useMemo(() => {
    let filteredQuestions = questions;
    
    if (searchQuery) {
        filteredQuestions = filteredQuestions.filter(q =>
            q.question.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    if (filters.type.length > 0) {
        filteredQuestions = filteredQuestions.filter(q => filters.type.includes(q.type));
    }
    if (filters.category.length > 0) {
        filteredQuestions = filteredQuestions.filter(q => 
            Array.isArray(q.category) && filters.category.some(cat => q.category.includes(cat))
        );
    }
    if (filters.difficulty.length > 0) {
        filteredQuestions = filteredQuestions.filter(q => filters.difficulty.includes(q.difficulty));
    }
    if (filters.createdBy.length > 0) {
        filteredQuestions = filteredQuestions.filter(q => filters.createdBy.includes(q.addedByName));
    }

    let sortableQuestions = [...filteredQuestions];
    if (sortConfig !== null) {
      sortableQuestions.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue.localeCompare(bValue);
            return sortConfig.direction === 'ascending' ? comparison : -comparison;
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableQuestions;
  }, [questions, sortConfig, searchQuery, filters]);

  const requestSort = (key: SortKey) => {
    if (sortConfig && sortConfig.key === key) {
        if (sortConfig.direction === 'descending') setSortConfig({ key, direction: 'ascending' });
        else setSortConfig(null);
    } else {
        setSortConfig({ key, direction: 'descending' });
    }
  };

  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />;
    if (sortConfig.direction === 'ascending') return <ArrowUp className="h-4 w-4" />;
    return <ArrowDown className="h-4 w-4" />;
  };

  const getDifficultyDisplay = (level: number) => {
      switch(level) {
          case 1: return { text: 'Easy', className: 'text-green-600 dark:text-green-400' };
          case 2: return { text: 'Medium', className: 'text-yellow-600 dark:text-yellow-400' };
          case 3: return { text: 'Hard', className: 'text-red-600 dark:text-red-400' };
          default: return { text: 'N/A', className: ''};
      }
  }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'inactive': return 'secondary';
            default: return 'outline';
        }
    }

  const handleExport = () => {
    // CSV export logic here
  };

  const toggleSelectMode = () => {
    setIsSelectModeActive(!isSelectModeActive);
    setSelectedQuestions([]);
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedQuestions(checked ? filteredAndSortedQuestions.map(q => q.id) : []);
  }

  const handleRowSelect = (questionId: string, checked: boolean) => {
    setSelectedQuestions(prev => checked ? [...prev, questionId] : prev.filter(id => id !== questionId));
  }

  const handleRowClick = (question: Question) => {
    if (isSelectModeActive) {
      const isSelected = selectedQuestions.includes(question.id);
      handleRowSelect(question.id, !isSelected);
    } else {
      setSelectedQuestion(question);
      setIsSheetOpen(true);
    }
  };

  const addQuestionLink = context === 'admin' ? '/dashboard/admin/questions/new' : '/dashboard/company/questions/new?from=custom';
  
  const canSelect = context === 'admin' || (context === 'company' && showAddButton);

  const isAssessmentContext = context === 'assessment';
  const assessmentId = isAssessmentContext && typeof window !== 'undefined' ? window.location.pathname.split('/assessments/')[1] : null;

  const handleRemoveQuestion = (questionId: string) => {
    if (!assessmentId) return;
    startTransition(async () => {
        const result = await removeQuestionFromAssessmentAction(assessmentId, questionId);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Question removed from assessment.'});
        }
    });
  }

  const displayCreatedBy = context === 'admin' || (context === 'company' && showCreatedBy);
  const detailSheetContext = isAssessmentContext ? 'assessment' : 'question-bank';

  return (
    <TooltipProvider>
        {!isAssessmentContext && (
            <div className="flex items-center gap-2 mb-4">
                {isSelectModeActive ? (
                   <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <span className="text-sm font-medium">{selectedQuestions.length} selected</span>
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
                                    <DropdownMenuItem onClick={() => handleBulkStatusChange('active')}><ShieldCheck />Active</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleBulkStatusChange('inactive')}><ShieldX />Inactive</DropdownMenuItem>
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
                                            This action cannot be undone. This will permanently delete {selectedQuestions.length} questions.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={cn("relative", isSearchFocused ? "flex-1" : "md:flex-1")}>
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search questions..."
                                className="w-full rounded-lg bg-background pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                            />
                        </div>
                        <div className={cn("flex items-center gap-2", isSearchFocused && "hidden md:flex")}>
                            {canSelect && (
                                <Button variant="secondary" size="sm" onClick={toggleSelectMode} className="h-10 gap-1">
                                    <ListTodo className="h-3.5 w-3.5" /> Select
                                </Button>
                            )}
                            <FilterSheet filters={filters} onFilterChange={handleFilterChange} availableCategories={uniqueCategories} availableCreators={uniqueCreators} />
                           
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="secondary" className="h-10 gap-1">
                                        <File className="h-3.5 w-3.5" /> Export
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Export Question List</AlertDialogTitle>
                                    <AlertDialogDescription>This will export the currently visible list of questions as a CSV file.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleExport}>Export</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            {showAddButton && (
                                <Button size="sm" className="h-10 gap-1" asChild>
                                    <Link href={addQuestionLink}>
                                        <PlusCircle className="h-3.5 w-3.5" /> Add Question
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </div>
        )}
        
        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4">
             {loading ? (
                Array.from({length: 3}).map((_, index) => (
                     <Card key={index}><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
                ))
            ) : filteredAndSortedQuestions.length > 0 ? (
                 filteredAndSortedQuestions.map((q, index) => {
                     const difficulty = getDifficultyDisplay(q.difficulty);
                     return (
                         <Card key={q.id} onClick={() => handleRowClick(q)} className="cursor-pointer">
                            <CardHeader className="p-4">
                                <p className="font-semibold line-clamp-2">
                                    <span className="mr-2">{index + 1}.</span>{q.question}
                                </p>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-3">
                                <div className="text-sm text-muted-foreground space-y-2">
                                     <div className="flex items-center gap-4">
                                        <span>Difficulty: <span className={cn('font-medium', difficulty.className)}>{difficulty.text}</span></span>
                                        <span>Type: <span className="font-medium capitalize">{q.type}</span></span>
                                     </div>
                                      {q.category && q.category.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {q.category.map((cat, i) => (
                                                <Badge key={i} variant="secondary">{cat}</Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center text-xs text-muted-foreground bg-muted/50 p-3 rounded-b-lg">
                                <span>Created: {formatDate(q.createdAt)}</span>
                                {q.addedByName && <span>By: {q.addedByName}</span>}
                            </CardFooter>
                         </Card>
                     )
                 })
            ) : (
                <Card>
                    <CardContent className="text-center h-24 flex items-center justify-center">
                        <p>No questions found.</p>
                    </CardContent>
                </Card>
            )}
        </div>

        {/* Desktop View - Table */}
        <Card className="hidden md:block flex-1 overflow-hidden">
            <div className="relative h-full overflow-auto custom-scrollbar">
                <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                        <TableRow>
                            <TableHead className="w-[60px] font-bold py-4 pl-6">
                                {isSelectModeActive ? <Checkbox onCheckedChange={(checked) => handleSelectAll(!!checked)} /> : 'S.No.'}
                            </TableHead>
                            <TableHead className="font-bold py-4">
                                <button onClick={() => requestSort('question')} className="group flex items-center gap-2">
                                    Question
                                    <div className="p-1 group-hover:bg-accent rounded-full transition-colors">{getSortIndicator('question')}</div>
                                </button>
                            </TableHead>
                            <TableHead className="font-bold py-4">Type</TableHead>
                            <TableHead className="font-bold py-4">Category</TableHead>
                            <TableHead className="font-bold py-4">
                                <button onClick={() => requestSort('difficulty')} className="group flex items-center gap-2">
                                    Difficulty
                                    <div className="p-1 group-hover:bg-accent rounded-full transition-colors">{getSortIndicator('difficulty')}</div>
                                </button>
                            </TableHead>
                            {!isAssessmentContext && <TableHead className="font-bold py-4">Status</TableHead>}
                             {displayCreatedBy && (
                                <TableHead className="font-bold py-4">
                                    <button onClick={() => requestSort('addedByName')} className="group flex items-center gap-2">
                                        Created By
                                        <div className="p-1 group-hover:bg-accent rounded-full transition-colors">{getSortIndicator('addedByName')}</div>
                                    </button>
                                </TableHead>
                            )}
                            {!isAssessmentContext && (
                                <TableHead className="font-bold py-4">
                                    <button onClick={() => requestSort('createdAt')} className="group flex items-center gap-2">
                                        Created At
                                        <div className="p-1 group-hover:bg-accent rounded-full transition-colors">{getSortIndicator('createdAt')}</div>
                                    </button>
                                </TableHead>
                            )}
                            {isAssessmentContext && <TableHead className="font-bold py-4 text-right pr-6">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({length: 7}).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell colSpan={displayCreatedBy ? 8 : 7} className="p-2">
                                      <Skeleton className="h-5 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filteredAndSortedQuestions.length > 0 ? (
                            filteredAndSortedQuestions.map((q, index) => {
                                const difficulty = getDifficultyDisplay(q.difficulty);
                                const firstCategory = q.category && q.category[0];
                                const otherCategories = q.category && q.category.length > 1 ? q.category.slice(1) : [];

                                return (
                                <TableRow key={q.id} onClick={() => handleRowClick(q)} className="cursor-pointer" data-state={selectedQuestions.includes(q.id) && "selected"}>
                                    <TableCell className="w-[60px] pl-6" onClick={(e) => {if(isSelectModeActive) e.stopPropagation()}}>
                                        {isSelectModeActive ? (
                                            <Checkbox checked={selectedQuestions.includes(q.id)} onCheckedChange={(checked) => handleRowSelect(q.id, !!checked)} />
                                        ) : ( index + 1 )}
                                    </TableCell>
                                    <TableCell className="font-medium max-w-sm">
                                        <p className="truncate">{q.question}</p>
                                    </TableCell>
                                    <TableCell>
                                        <span className="capitalize">{q.type}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {firstCategory && <Badge variant="secondary">{firstCategory}</Badge>}
                                            {otherCategories.length > 0 && (
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Badge variant="default" className="rounded-full !px-2">
                                                          <span>+{otherCategories.length}</span>
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{otherCategories.join(', ')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn('font-medium', difficulty.className)}>{difficulty.text}</span>
                                    </TableCell>
                                    {!isAssessmentContext && (
                                      <TableCell>
                                          <Badge variant={getStatusVariant(q.status)} className="capitalize">{q.status}</Badge>
                                      </TableCell>
                                    )}
                                    {displayCreatedBy && <TableCell>{q.addedByName}</TableCell>}
                                    {!isAssessmentContext && <TableCell>{formatDate(q.createdAt)}</TableCell>}
                                    {isAssessmentContext && (
                                        <TableCell className="text-right pr-6">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRemoveQuestion(q.id);}} disabled={isPending}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Remove question</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableCell>
                                    )}
                                </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={displayCreatedBy ? 8 : 7} className="text-center h-24">No questions found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </Card>
        {selectedQuestion && (
            <QuestionDetailSheet 
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                question={selectedQuestion}
                context={detailSheetContext}
            />
        )}
    </TooltipProvider>
  );
}
