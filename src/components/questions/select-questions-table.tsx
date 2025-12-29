
'use client';
import React, { useState, useMemo } from 'react';
import { TableVirtuoso } from 'react-virtuoso';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown, ArrowUp, ArrowDown, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterSheet } from './filter-sheet';
import type { Question } from '@/lib/types';
import { cn } from '@/lib/utils';
import { QuestionDetailSheet } from './question-detail-sheet';

type SortKey = 'question' | 'difficulty' | 'createdAt' | 'category';
export interface FilterState {
    type: string[];
    category: string[];
    difficulty: number[];
    createdBy: string[];
}

interface SelectQuestionsTableProps {
    questions: Question[];
    loading: boolean;
    existingQuestionIds: string[];
    newlySelectedQuestionIds: string[];
    onSelectQuestion: (question: Question, isSelected: boolean) => void;
}

export function SelectQuestionsTable({ questions, loading, existingQuestionIds, newlySelectedQuestionIds, onSelectQuestion }: SelectQuestionsTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ type: [], category: [], difficulty: [], createdBy: [] });
  const [viewedQuestion, setViewedQuestion] = useState<Question | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const uniqueCategories = useMemo(() => {
    const allCategories = questions.flatMap(q => q.category || []);
    return [...new Set(allCategories)];
  }, [questions]);

  const uniqueCreators = useMemo(() => {
    const creators = new Set(questions.map(q => q.addedByName).filter(Boolean));
    return Array.from(creators);
  }, [questions]);
  
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

        if (Array.isArray(aValue) && Array.isArray(bValue)) {
            const aString = aValue.join(', ');
            const bString = bValue.join(', ');
            const comparison = aString.localeCompare(bString);
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

  const handleRowClick = (e: React.MouseEvent, question: Question) => {
    const target = e.target as HTMLElement;
    if (target.closest('[role="checkbox"]') || existingQuestionIds.includes(question.id)) {
      return;
    }
    setViewedQuestion(question);
    setIsSheetOpen(true);
  };
  
  const handleSelectAll = (checked: boolean) => {
    filteredAndSortedQuestions.forEach(q => {
        if (existingQuestionIds.includes(q.id)) return;
        const isCurrentlySelected = newlySelectedQuestionIds.includes(q.id);
        if(checked && !isCurrentlySelected) {
            onSelectQuestion(q, true);
        } else if (!checked && isCurrentlySelected) {
            onSelectQuestion(q, false);
        }
    });
  }

  const areAllVisibleSelected = filteredAndSortedQuestions.filter(q => !existingQuestionIds.includes(q.id)).length > 0 && 
                                filteredAndSortedQuestions.filter(q => !existingQuestionIds.includes(q.id)).every(q => newlySelectedQuestionIds.includes(q.id));

  return (
    <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
            <Input
                type="search"
                placeholder="Search questions..."
                className="w-full rounded-lg bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FilterSheet filters={filters} onFilterChange={setFilters} availableCategories={uniqueCategories} availableCreators={uniqueCreators} />
        </div>
        <div className="h-full w-full">
                {loading ? (
                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                            <TableRow>
                                <TableHead className="w-[60px] font-bold py-4 pl-6">
                                    <Checkbox 
                                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        checked={areAllVisibleSelected}
                                        aria-label="Select all rows on this page"
                                    />
                                </TableHead>
                                <TableHead className="font-bold py-4">
                                    <button onClick={() => requestSort('question')} className="group flex items-center gap-2">
                                        Question
                                        <div className="p-1 group-hover:bg-accent rounded-full transition-colors">{getSortIndicator('question')}</div>
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4">Type</TableHead>
                                <TableHead className="font-bold py-4">
                                    <button onClick={() => requestSort('category')} className="group flex items-center gap-2">
                                        Category
                                        <div className="p-1 group-hover:bg-accent rounded-full transition-colors">{getSortIndicator('category')}</div>
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4">
                                    <button onClick={() => requestSort('difficulty')} className="group flex items-center gap-2">
                                        Difficulty
                                        <div className="p-1 group-hover:bg-accent rounded-full transition-colors">{getSortIndicator('difficulty')}</div>
                                    </button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({length: 5}).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell className="pl-6"><Skeleton className="h-5 w-5" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : filteredAndSortedQuestions.length > 0 ? (
                    <TableVirtuoso
                        data={filteredAndSortedQuestions}
                        components={{
                            Table: (props) => <Table {...props} style={{ ...props.style, borderCollapse: 'collapse', width: '100%' }} />,
                            TableHead: React.forwardRef((props, ref) => <TableHeader {...props} ref={ref} className="bg-muted/50 z-10" />),
                            TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
                            TableRow: (props) => {
                                const index = props['data-index'];
                                const q = filteredAndSortedQuestions[index];
                                if (!q) return <TableRow {...props} />;
                                const isExisting = existingQuestionIds.includes(q.id);

                                return (
                                    <TableRow 
                                        {...props} 
                                        onClick={(e) => handleRowClick(e, q)} 
                                        className={cn(!isExisting && "cursor-pointer")} 
                                    />
                                );
                            },
                        }}
                        fixedHeaderContent={() => (
                            <TableRow>
                                <TableHead className="w-[60px] font-bold py-4 pl-6 h-12 bg-muted/50">
                                    <Checkbox 
                                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        checked={areAllVisibleSelected}
                                        aria-label="Select all rows on this page"
                                    />
                                </TableHead>
                                <TableHead className="font-bold py-4 bg-muted/50">
                                    <button onClick={() => requestSort('question')} className="group flex items-center gap-2">
                                        Question
                                        <div className="p-1 group-hover:bg-accent rounded-full transition-colors">{getSortIndicator('question')}</div>
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4 bg-muted/50">Type</TableHead>
                                <TableHead className="font-bold py-4 bg-muted/50">
                                    <button onClick={() => requestSort('category')} className="group flex items-center gap-2">
                                        Category
                                        <div className="p-1 group-hover:bg-accent rounded-full transition-colors">{getSortIndicator('category')}</div>
                                    </button>
                                </TableHead>
                                <TableHead className="font-bold py-4 bg-muted/50">
                                    <button onClick={() => requestSort('difficulty')} className="group flex items-center gap-2">
                                        Difficulty
                                        <div className="p-1 group-hover:bg-accent rounded-full transition-colors">{getSortIndicator('difficulty')}</div>
                                    </button>
                                </TableHead>
                            </TableRow>
                        )}
                        itemContent={(index, q) => {
                            const difficulty = getDifficultyDisplay(q.difficulty);
                            const isExisting = existingQuestionIds.includes(q.id);
                            const isNewlySelected = newlySelectedQuestionIds.includes(q.id);
                            
                            return (
                                <>
                                    <TableCell className="w-[60px] pl-6" onClick={(e) => {if(!isExisting) e.stopPropagation()}}>
                                        {isExisting ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <Checkbox 
                                                checked={isNewlySelected}
                                                onCheckedChange={(checked) => onSelectQuestion(q, !!checked)}
                                                onClick={(e) => e.stopPropagation()}
                                                aria-label={`Select question ${q.id}`}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium truncate max-w-xs" onClick={(e) => handleRowClick(e, q)} style={{cursor: !isExisting ? 'pointer' : 'default'}}>{q.question}</TableCell>
                                    <TableCell onClick={(e) => handleRowClick(e, q)} style={{cursor: !isExisting ? 'pointer' : 'default'}}><span className="capitalize">{q.type}</span></TableCell>
                                    <TableCell className="truncate max-w-xs" onClick={(e) => handleRowClick(e, q)} style={{cursor: !isExisting ? 'pointer' : 'default'}}>{Array.isArray(q.category) ? q.category.join(', ') : ''}</TableCell>
                                    <TableCell onClick={(e) => handleRowClick(e, q)} style={{cursor: !isExisting ? 'pointer' : 'default'}}>
                                        <span className={cn('font-medium', difficulty.className)}>{difficulty.text}</span>
                                    </TableCell>
                                </>
                            );
                        }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-24 text-muted-foreground w-full">
                        No questions found.
                    </div>
                )}
            </div>
        {viewedQuestion && (
            <QuestionDetailSheet 
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                question={viewedQuestion}
                context="assessment"
            />
        )}
    </div>
  );
}
