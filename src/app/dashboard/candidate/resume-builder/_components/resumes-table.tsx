
'use client';
import { useState, useMemo, useContext } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { File, PlusCircle, Search, ArrowUpDown, MoreVertical, Trash2, Download, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { GeneratedResumeContext } from '@/context/generated-resume-context';
import type { GeneratedResume } from '@/ai/flows/generate-ats-resume-flow-types';

type SortKey = 'name' | 'createdAt';

export function ResumesTable() {
    const { resumes, loading } = useContext(GeneratedResumeContext);
    const router = useRouter();
    const { toast } = useToast();
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'createdAt', direction: 'descending' });
    const [searchQuery, setSearchQuery] = useState('');

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
        router.push(`/dashboard/candidate/resumes/${resumeId}`);
    };

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search resumes..."
                        className="w-full rounded-lg bg-background pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                 <Button size="sm" className="h-10 gap-1" asChild>
                    <Link href="/dashboard/candidate/resume-builder/new">
                        <PlusCircle className="h-3.5 w-3.5" /> Generate New
                    </Link>
                </Button>
            </div>
            <Card className="flex-1 overflow-hidden">
                <div className="relative h-full overflow-auto custom-scrollbar">
                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0">
                            <TableRow>
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
                                    <TableRow key={index}><TableCell colSpan={4}><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                                ))
                            ) : filteredAndSortedResumes.length > 0 ? (
                                filteredAndSortedResumes.map(resume => (
                                    <TableRow key={resume.id} onClick={() => handleRowClick(resume.id)} className="cursor-pointer">
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
                                                    <DropdownMenuItem onSelect={() => handleRowClick(resume.id)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                    <DropdownMenuItem disabled><Download className="mr-2 h-4 w-4" /> Download PDF</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" disabled><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
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
