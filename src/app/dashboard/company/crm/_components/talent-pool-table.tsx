'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockCrmCandidates } from '@/lib/mock-data';
import { format, formatDistanceToNow, isThisMonth, isBefore, subMonths } from 'date-fns';
import { File, PlusCircle, Search, ArrowUpDown, MoreVertical, ListTodo, X, ArrowUp, ArrowDown, Trash2, Users, UserPlus, EyeOff, Star, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import React, { useState, useMemo } from 'react';
import { TableVirtuoso } from 'react-virtuoso';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CrmCandidate } from '@/context/talent-pool-context';
import { FilterSheet } from './filter-sheet';
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
import type { CrmFilterState } from '../types';

type SortKey = 'name' | 'lastContact' | 'email';


export function TalentPoolTable() {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
    const [isSelectModeActive, setIsSelectModeActive] = useState(false);
    const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [filters, setFilters] = useState<CrmFilterState>({ tags: [], location: [], source: [], timeFilter: null });

    const { availableTags, availableLocations, availableSources } = useMemo(() => {
        const tags = new Set<string>();
        const locations = new Set<string>();
        const sources = new Set<string>();
        mockCrmCandidates.forEach(c => {
            c.tags?.forEach(tag => tags.add(tag));
            if (c.location) locations.add(c.location);
            if (c.source) sources.add(c.source);
        });
        return { 
            availableTags: Array.from(tags).sort(), 
            availableLocations: Array.from(locations).sort(),
            availableSources: Array.from(sources).sort(),
        };
    }, []);

    const filteredAndSortedCandidates = useMemo(() => {
        let filtered = mockCrmCandidates;
        if (searchQuery) {
            filtered = filtered.filter(c => 
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        if (filters.tags.length > 0) {
            filtered = filtered.filter(c => c.tags && filters.tags.some(tag => c.tags?.includes(tag)));
        }
        if (filters.location.length > 0) {
            filtered = filtered.filter(c => filters.location.includes(c.location));
        }
        if (filters.source.length > 0) {
            filtered = filtered.filter(c => filters.source.includes(c.source));
        }
        if (filters.timeFilter === 'newThisMonth') {
            filtered = filtered.filter(c => isThisMonth(new Date(c.lastContact)));
        }
        if (filters.timeFilter === 'uncontacted') {
            filtered = filtered.filter(c => isBefore(new Date(c.lastContact), subMonths(new Date(), 3)));
        }
        
        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (!aValue || !bValue) return 0;

                if(sortConfig.key === 'lastContact') {
                    const dateA = new Date(aValue);
                    const dateB = new Date(bValue);
                    if (dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                }

                if (aValue.localeCompare(bValue) < 0) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue.localeCompare(bValue) > 0) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [searchQuery, sortConfig, filters]);

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    }

    const getSortIndicator = (key: SortKey) => {
        if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />;
        return sortConfig.direction === 'ascending' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    }

    const getInitials = (name: string) => {
        if (!name) return '??';
        const names = name.split(' ');
        return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : name.substring(0, 2);
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedCandidates(checked ? filteredAndSortedCandidates.map(c => c.id) : []);
    };
    
    const handleRowSelect = (id: string, checked: boolean) => {
        setSelectedCandidates(prev => checked ? [...prev, id] : prev.filter(candidateId => candidateId !== id));
    };
    
    const toggleSelectMode = () => {
        setIsSelectModeActive(!isSelectModeActive);
        setSelectedCandidates([]);
    };

    const handleRowClick = (candidateId: string) => {
        if (isSelectModeActive) {
          handleRowSelect(candidateId, !selectedCandidates.includes(candidateId));
        } else {
          // router.push(`/dashboard/company/crm/${candidateId}`);
        }
      };

    const newThisMonth = useMemo(() => mockCrmCandidates.filter(c => isThisMonth(new Date(c.lastContact))).length, []);
    const uncontacted = useMemo(() => mockCrmCandidates.filter(c => isBefore(new Date(c.lastContact), subMonths(new Date(), 3))).length, []);
    const topTalent = useMemo(() => mockCrmCandidates.filter(c => c.tags?.includes('Top Talent')).length, []);

    const handleCardFilter = (filter: 'newThisMonth' | 'uncontacted' | 'topTalent' | null) => {
        if (filter === 'topTalent') {
            setFilters({ tags: ['Top Talent'], location: [], source: [], timeFilter: null });
        } else if (filter) {
            setFilters({ tags: [], location: [], source: [], timeFilter: filter });
        } else {
            setFilters({ tags: [], location: [], source: [], timeFilter: null });
        }
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            <TooltipProvider>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
               {/* ... (Cards remain unchanged) ... */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card className="hover:bg-accent transition-colors cursor-pointer" onClick={() => handleCardFilter(null)}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
                                <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-2xl font-bold">{mockCrmCandidates.length}</div>
                                <p className="text-xs text-muted-foreground">Total candidates in your talent pool.</p>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>View all candidates</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card className="hover:bg-accent transition-colors cursor-pointer" onClick={() => handleCardFilter('newThisMonth')}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
                                <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                                <UserPlus className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-2xl font-bold">+{newThisMonth}</div>
                                <p className="text-xs text-muted-foreground">Candidates added or contacted this month.</p>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>View new candidates this month</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card className="hover:bg-accent transition-colors cursor-pointer" onClick={() => handleCardFilter('uncontacted')}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
                                <CardTitle className="text-sm font-medium">Uncontacted</CardTitle>
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-2xl font-bold">{uncontacted}</div>
                                <p className="text-xs text-muted-foreground">Not contacted in the last 3 months.</p>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>View uncontacted candidates</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                     <TooltipTrigger asChild>
                        <Card className="hover:bg-accent transition-colors cursor-pointer" onClick={() => handleCardFilter('topTalent')}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
                                <CardTitle className="text-sm font-medium">Top Talent</CardTitle>
                                <Star className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-2xl font-bold">{topTalent}</div>
                                <p className="text-xs text-muted-foreground">Candidates marked as "Top Talent".</p>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>View top talent</p>
                    </TooltipContent>
                </Tooltip>
            </div>
            </TooltipProvider>
            
            <div className="flex flex-col gap-4 flex-1 min-h-0">
                <div className="flex items-center gap-2">
                     {/* ... (Toolbar remains unchanged) ... */}
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
                            <div className={cn("relative", isSearchFocused ? "flex-1" : "md:flex-1")}>
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search talent pool..."
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
                                <FilterSheet 
                                    filters={filters} 
                                    onFilterChange={setFilters}
                                    availableTags={availableTags}
                                    availableLocations={availableLocations}
                                    availableSources={availableSources}
                                />
                                <Button size="sm" variant="secondary" className="h-10 gap-1" disabled>
                                    <File className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                    Export
                                    </span>
                                </Button>
                                <Button size="sm" className="h-10 gap-1" disabled>
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                    Add Candidate
                                    </span>
                                </Button>
                            </div>
                        </>
                    )}
                </div>
                <Card className="flex-1 overflow-hidden">
                     {/* Virtualized Table Container */}
                    <div className="h-full w-full"> 
                        <TableVirtuoso
                            data={filteredAndSortedCandidates}
                            components={{
                                Table: (props) => <Table {...props} style={{ ...props.style, borderCollapse: 'collapse', width: '100%' }} />,
                                TableHead: React.forwardRef((props, ref) => <TableHeader {...props} ref={ref} className="bg-muted/50 z-10" />),
                                TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
                                TableRow: (props) => {
                                    const index = props['data-index'];
                                    const candidate = filteredAndSortedCandidates[index];
                                    if (!candidate) return <TableRow {...props} />;
                                    
                                    return (
                                        <TableRow 
                                            {...props} 
                                            onClick={() => handleRowClick(candidate.id)} 
                                            className="cursor-pointer"
                                            data-state={selectedCandidates.includes(candidate.id) && "selected"}
                                        />
                                    );
                                },
                            }}
                            fixedHeaderContent={() => (
                                <TableRow>
                                    <TableHead className="w-[60px] pl-6 h-12 bg-muted/50">
                                        {isSelectModeActive ? (
                                            <Checkbox
                                                checked={selectedCandidates.length > 0 && selectedCandidates.length === filteredAndSortedCandidates.length}
                                                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                                aria-label="Select all rows"
                                            />
                                        ) : (
                                            "S.No."
                                        )}
                                    </TableHead>
                                    <TableHead className="bg-muted/50">Candidate</TableHead>
                                    <TableHead className="bg-muted/50">Email</TableHead>
                                    <TableHead className="bg-muted/50">Phone</TableHead>
                                    <TableHead className="bg-muted/50">Location</TableHead>
                                    <TableHead className="bg-muted/50">Tags</TableHead>
                                    <TableHead className="bg-muted/50">
                                        <button onClick={() => requestSort('lastContact')} className="group flex items-center gap-2">
                                            Last Contact
                                            {getSortIndicator('lastContact')}
                                        </button>
                                    </TableHead>
                                    <TableHead className="text-right pr-6 bg-muted/50">Actions</TableHead>
                                </TableRow>
                            )}
                            itemContent={(index, candidate) => {
                                const firstTag = candidate.tags?.[0];
                                const otherTags = candidate.tags?.slice(1) || [];
                                
                                return (
                                    <>
                                        <TableCell className="w-[60px] pl-6" onClick={(e) => {if(isSelectModeActive) e.stopPropagation()}}>
                                            {isSelectModeActive ? (
                                                <Checkbox
                                                    checked={selectedCandidates.includes(candidate.id)}
                                                    onCheckedChange={(checked) => handleRowSelect(candidate.id, !!checked)}
                                                    aria-label={`Select candidate ${index + 1}`}
                                                />
                                            ) : (
                                                index + 1
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
                                                    <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{candidate.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{candidate.email}</TableCell>
                                        <TableCell>{candidate.phone}</TableCell>
                                        <TableCell>{candidate.location}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {firstTag && <Badge variant="secondary">{firstTag}</Badge>}
                                                {otherTags.length > 0 && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Badge variant="default" className="rounded-full !px-2">
                                                                    <span>+{otherTags.length}</span>
                                                                </Badge>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{otherTags.join(', ')}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{candidate.lastContact ? formatDistanceToNow(new Date(candidate.lastContact), { addSuffix: true }) : 'N/A'}</TableCell>
                                        <TableCell className="text-right pr-4">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </>
                                );
                            }}
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
}
