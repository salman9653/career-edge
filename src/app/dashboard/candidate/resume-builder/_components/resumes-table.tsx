
'use client';
import { useState, useMemo, useContext, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { File, PlusCircle, Search, ArrowUpDown, MoreVertical, Trash2, Download, ListTodo, X, Loader2, FileText } from 'lucide-react';
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

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-center gap-2">
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
                    <Button size="sm" className="h-10 gap-1" asChild>
                        <Link href="/dashboard/candidate/resume-builder/new">
                            <PlusCircle className="h-3.5 w-3.5" /> Generate New
                        </Link>
                    </Button>
                </div>
            </div>
            
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="aspect-square flex flex-col items-center justify-center p-4">
                            <Skeleton className="h-12 w-12" />
                            <Skeleton className="h-4 w-20 mt-4" />
                        </Card>
                    ))}
                </div>
            ) : filteredAndSortedResumes.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredAndSortedResumes.map((resume) => (
                        <Link key={resume.id} href={`/dashboard/candidate/resumes/${resume.id}`}>
                            <Card className="aspect-square flex flex-col items-center justify-center p-4 hover:bg-accent transition-colors cursor-pointer">
                                <FileText className="h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-sm font-medium text-center line-clamp-2">{resume.name}</p>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Resumes Generated Yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Click "Generate New" to create your first AI-powered resume.</p>
                </div>
            )}
        </div>
    );
}
