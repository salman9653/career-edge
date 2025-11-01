
'use client';
import { useState, useMemo, useContext, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { File, PlusCircle, Search, ArrowUpDown, MoreVertical, Trash2, Download, ListTodo, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { GeneratedResumeContext } from '@/context/generated-resume-context';
import type { GeneratedResume } from '@/ai/flows/generate-ats-resume-flow-types';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSession } from '@/hooks/use-session';
import { deleteGeneratedResumeAction } from '@/app/actions';

type SortKey = 'name' | 'createdAt';

export function ResumesTable() {
    const { resumes, loading } = useContext(GeneratedResumeContext);
    const router = useRouter();
    const { session } = useSession();
    const { toast } = useToast();
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'createdAt', direction: 'descending' });
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSelectModeActive, setIsSelectModeActive] = useState(false);
    const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
    const [isDeleting, startDeleteTransition] = useTransition();

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'descending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'ascending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortKey) => {
        if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />;
        if (sortConfig.direction === 'ascending') return '▲';
        return '▼';
    };

    const filteredAndSortedResumes = useMemo(() => {
        let sortableItems = [...resumes];
        if (searchQuery) {
            sortableItems = sortableItems.filter(resume =>
                resume.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                resume.jobDescription.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [resumes, searchQuery, sortConfig]);

    const formatDate = (date: any) => {
        if (!date) return "N/A";
        const jsDate = date.toDate ? date.toDate() : new Date(date);
        return format(jsDate, "dd MMM yyyy");
    }

    const handleRowClick = (resumeId: string) => {
        if (isSelectModeActive) {
            handleRowSelect(resumeId, !selectedResumes.includes(resumeId));
        } else {
            router.push(`/dashboard/candidate/resumes/${resumeId}`);
        }
    };
    
    const toggleSelectMode = () => {
        setIsSelectModeActive(!isSelectModeActive);
        setSelectedResumes([]);
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedResumes(filteredAndSortedResumes.map(r => r.id));
        } else {
            setSelectedResumes([]);
        }
    }

    const handleRowSelect = (resumeId: string, checked: boolean) => {
        if (checked) {
            setSelectedResumes(prev => [...prev, resumeId]);
        } else {
            setSelectedResumes(prev => prev.filter(id => id !== resumeId));
        }
    }
    
    const handleDelete = (resumeIds: string[]) => {
        if (!session?.uid) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to delete resumes." });
            return;
        }
        startDeleteTransition(async () => {
            let errorOccurred = false;
            for (const resumeId of resumeIds) {
                const result = await deleteGeneratedResumeAction(resumeId, session.uid);
                if (result.error) {
                    errorOccurred = true;
                    toast({ variant: "destructive", title: "Deletion Failed", description: `Could not delete resume ${resumeId}. ${result.error}` });
                }
            }
            if (!errorOccurred) {
                toast({ title: "Resumes Deleted", description: `${resumeIds.length} resume(s) have been successfully deleted.` });
            }
            setSelectedResumes([]);
            setIsSelectModeActive(false);
        });
    };


    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-center gap-2">
                 {isSelectModeActive ? (
                    <>
                        <div className="flex items-center gap-4 flex-1">
                            <span className="text-sm font-medium">{selectedResumes.length} selected</span>
                            <Button variant="ghost" size="sm" onClick={toggleSelectMode} className="h-10 gap-1 text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                                <span>Cancel</span>
                            </Button>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="h-10 gap-1" disabled={selectedResumes.length === 0}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Delete</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently delete {selectedResumes.length} selected resume(s).</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(selectedResumes)} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                         {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                         Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                ) : (
                    <>
                        <div className={cn("relative", isSearchFocused ? "flex-1" : "md:flex-1")}>
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search resumes..."
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
                            <Button size="sm" className="h-10 gap-1" asChild>
                                <Link href="/dashboard/candidate/resume-builder/new">
                                    <PlusCircle className="h-3.5 w-3.5" /> Generate New
                                </Link>
                            </Button>
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
                                            checked={selectedResumes.length > 0 && selectedResumes.length === filteredAndSortedResumes.length}
                                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                            aria-label="Select all rows"
                                        />
                                    ) : 'S.No.'}
                                </TableHead>
                                <TableHead>
                                    <button onClick={() => requestSort('name')} className="group flex items-center gap-2">
                                        Resume Name {getSortIndicator('name')}
                                    </button>
                                </TableHead>
                                <TableHead>Target Job</TableHead>
                                <TableHead>
                                     <button onClick={() => requestSort('createdAt')} className="group flex items-center gap-2">
                                        Date Created {getSortIndicator('createdAt')}
                                    </button>
                                </TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <TableRow key={index}><TableCell colSpan={5}><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                                ))
                            ) : filteredAndSortedResumes.length > 0 ? (
                                filteredAndSortedResumes.map((resume, index) => (
                                    <TableRow key={resume.id} onClick={() => handleRowClick(resume.id)} className="cursor-pointer" data-state={selectedResumes.includes(resume.id) && "selected"}>
                                         <TableCell className="w-[80px] pl-6" onClick={(e) => {if(isSelectModeActive) e.stopPropagation()}}>
                                            {isSelectModeActive ? (
                                                <Checkbox
                                                    checked={selectedResumes.includes(resume.id)}
                                                    onCheckedChange={(checked) => handleRowSelect(resume.id, !!checked)}
                                                    aria-label={`Select row ${index + 1}`}
                                                />
                                            ) : (
                                                index + 1
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{resume.name}</TableCell>
                                        <TableCell className="max-w-xs truncate text-muted-foreground">{resume.jobDescription}</TableCell>
                                        <TableCell>{formatDate(resume.createdAt)}</TableCell>
                                        <TableCell className="text-right pr-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => window.print()}><Download className="mr-2 h-4 w-4" /> Download PDF</DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>This action cannot be undone. This will permanently delete this resume.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete([resume.id])} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                                                     {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        You haven't generated any resumes yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
