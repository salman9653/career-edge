
'use client';
import { useState, useMemo, useTransition, useEffect, useContext } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { File, PlusCircle, Search, ArrowUpDown, ArrowUp, ArrowDown, ListTodo, X, Trash2, Edit, Share2, Clipboard, Mail, MoreVertical, ChevronsUpDown, Loader2, AlertTriangle, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { FilterSheet } from './filter-sheet';
import type { Job } from '@/lib/types';
import { JobContext } from '@/context/job-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { deleteJobAction, updateJobStatusAction } from '@/app/actions';
import { useSession } from '@/hooks/use-session';

const WhatsAppIcon = () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24" className="mr-2 h-4 w-4">
      <path fill="currentColor" fillRule="evenodd" d="M12 4a8 8 0 0 0-6.895 12.06l.569.718-.697 2.359 2.32-.648.379.243A8 8 0 1 0 12 4ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.96 9.96 0 0 1-5.016-1.347l-4.948 1.382 1.426-4.829-.006-.007-.033-.055A9.958 9.958 0 0 1 2 12Z" clipRule="evenodd"/>
      <path fill="currentColor" d="M16.735 13.492c-.038-.018-1.497-.736-1.756-.83a1.008 1.008 0 0 0-.34-.075c-.196 0-.362.098-.49.291-.146.217-.587.732-.723.886-.018.02-.042.045-.057.045-.013 0-.239-.093-.307-.123-1.564-.68-2.751-2.313-2.914-2.589-.023-.04-.024-.057-.024-.057.005-.021.058-.074.085-.101.08-.079.166-.182.249-.283l.117-.14c.121-.14.175-.25.237-.375l.033-.066a.68.68 0 0 0-.02-.64c-.034-.069-.65-1.555-.715-1.711-.158-.377-.366-.552-.655-.552-.027 0 0 0-.112.005-.137.005-.883.104-1.213.311-.35.22-.94.924-.94 2.16 0 1.112.705 2.162 1.008 2.561l.041.06c1.161 1.695 2.608 2.951 4.074 3.537 1.412.564 2.081.63 2.461.63.16 0 .288-.013.4-.024l.072-.007c.488-.043 1.56-.599 1.804-1.276.192-.534.243-1.117.115-1.329-.088-.144-.239-.216-.43-.308Z"/>
    </svg>
);


type SortKey = 'title' | 'datePosted' | 'applicants' | 'type';
export interface FilterState {
    status: string[];
    jobType: string[];
    location: string[];
}

const getFiltersFromParams = (searchParams: URLSearchParams): FilterState => {
    return {
        status: searchParams.get('status')?.split(',') || [],
        jobType: searchParams.get('jobType')?.split(',') || [],
        location: searchParams.get('location')?.split(',') || [],
    };
};

export function JobsTable() {
    const { jobs, loading } = useContext(JobContext);
    const { session } = useSession();
    const { toast } = useToast();
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
    
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [filters, setFilters] = useState<FilterState>(() => getFiltersFromParams(searchParams));
    const [isPending, startTransition] = useTransition();

    const [isSelectModeActive, setIsSelectModeActive] = useState(false);
    const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    
    const uniqueLocations = useMemo(() => Array.from(new Set(jobs.map(j => j.location))), [jobs]);
    const uniqueJobTypes = useMemo(() => Array.from(new Set(jobs.map(j => j.type))), [jobs]);
    
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

    const filteredAndSortedJobs = useMemo(() => {
        let sortableItems = [...jobs];
        
        if (searchQuery) {
            sortableItems = sortableItems.filter(job =>
                job.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filtering logic will go here
        if (filters.status.length > 0) {
            sortableItems = sortableItems.filter(job => filters.status.includes(job.status));
        }
        if (filters.jobType.length > 0) {
            sortableItems = sortableItems.filter(job => filters.jobType.includes(job.type));
        }
        if (filters.location.length > 0) {
            sortableItems = sortableItems.filter(job => filters.location.includes(job.location));
        }

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;
                if (sortConfig.key === 'applicants') {
                    aValue = a.applicants?.length || 0;
                    bValue = b.applicants?.length || 0;
                } else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
                }
                
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [jobs, searchQuery, sortConfig, filters]);

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        const jsDate = date.toDate ? date.toDate() : new Date(date);
        return format(jsDate, "dd MMM yyyy");
    }

    const toggleSelectMode = () => {
        setIsSelectModeActive(!isSelectModeActive);
        setSelectedJobs([]);
    }

    const handleSelectAll = (checked: boolean) => {
        setSelectedJobs(checked ? filteredAndSortedJobs.map(j => j.id) : []);
    }

    const handleRowSelect = (jobId: string, checked: boolean) => {
        setSelectedJobs(prev => checked ? [...prev, jobId] : prev.filter(id => id !== jobId));
    }

    const handleRowClick = (jobId: string) => {
        if (isSelectModeActive) {
            handleRowSelect(jobId, !selectedJobs.includes(jobId));
        } else {
            router.push(`/dashboard/company/jobs/${jobId}`);
        }
    };
    
    const getInitials = (name: string) => {
        if (!name) return '';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    const statusOptions = ['Live', 'Draft', 'On-hold', 'Closed'];

    const handleChangeStatus = async (jobId: string, newStatus: string) => {
        const result = await updateJobStatusAction(jobId, newStatus);
        if (result?.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Success", description: `Job status updated to ${newStatus}.` });
        }
    }

    const getJobLink = (jobId: string) => `${window.location.origin}/apply-with-link/${jobId}`;

    const handleCopyLink = (jobId: string) => {
      const link = getJobLink(jobId);
      navigator.clipboard.writeText(link).then(() => {
        toast({ title: "Job link copied!" });
      }).catch(err => {
        toast({ variant: "destructive", title: "Failed to copy", description: "Could not copy link to clipboard." });
      });
    };
  
    const handleShare = async (job: Job) => {
      if (!job) return;
      const shareData = {
        title: `Job Opening: ${job.title}`,
        text: `We're hiring for a ${job.title} at ${session?.name}. Check it out:`,
        url: getJobLink(job.id),
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          handleCopyLink(job.id);
        }
      } catch (error) {
        console.error("Error sharing:", error);
      }
    };
  
    const handleShareViaWhatsApp = (job: Job) => {
      if (!job) return;
      const message = `Hello! We're hiring for a *${job.title}* at *${session?.name}*. We think you could be a great fit for this role.

Find more details and apply here:
${getJobLink(job.id)}

We look forward to your application!

Best regards,
The ${session?.name} Team`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    };
  
    const handleShareViaEmail = (job: Job) => {
      if (!job) return;
      const subject = `Job Opportunity: ${job.title} at ${session?.name}`;
      const body = `Hello,

We are currently hiring for the position of **${job.title}** at **${session?.name}**. We came across your profile and believe you could be a great fit for our team.

You can view the full job description and apply directly through the link below:
${getJobLink(job.id)}

We look forward to reviewing your application.

Best regards,
The Hiring Team
${session?.name}`;
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    };


    return (
        <>
            <div className="flex items-center gap-2">
                {isSelectModeActive ? (
                     <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <span className="text-sm font-medium">{selectedJobs.length} selected</span>
                            <Button variant="ghost" size="sm" onClick={toggleSelectMode} className="h-10 gap-1 text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                                <span>Cancel</span>
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
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
                                        <AlertDialogDescription>This will permanently delete {selectedJobs.length} job postings.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => toast({ title: 'Delete not implemented' })} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
                                placeholder="Search jobs..."
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
                            <FilterSheet filters={filters} onFilterChange={handleFilterChange} uniqueLocations={uniqueLocations} uniqueJobTypes={uniqueJobTypes} />
                            <Button size="sm" variant="secondary" className="h-10 gap-1">
                                <File className="h-3.5 w-3.5" /> Export
                            </Button>
                            <Button size="sm" className="h-10 gap-1" asChild>
                                <Link href="/dashboard/company/jobs/new">
                                    <PlusCircle className="h-3.5 w-3.5" /> Post New Job
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
                        <TableHead className="w-[60px] pl-6">
                            {isSelectModeActive ? <Checkbox onCheckedChange={(checked) => handleSelectAll(!!checked)} /> : 'S.No.'}
                        </TableHead>
                        <TableHead>
                            <button onClick={() => requestSort('title')} className="group flex items-center gap-2">
                                Job Title {getSortIndicator('title')}
                            </button>
                        </TableHead>
                        <TableHead>Assigned Recruiter</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                            <button onClick={() => requestSort('type')} className="group flex items-center gap-2">
                                Job Type {getSortIndicator('type')}
                            </button>
                        </TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>
                             <button onClick={() => requestSort('applicants')} className="group flex items-center gap-2">
                                Applications {getSortIndicator('applicants')}
                            </button>
                        </TableHead>
                        <TableHead>
                            <button onClick={() => requestSort('datePosted')} className="group flex items-center gap-2">
                                Posted On {getSortIndicator('datePosted')}
                            </button>
                        </TableHead>
                        <TableHead className="text-right pr-6">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}><TableCell colSpan={9}><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                            ))
                        ) : filteredAndSortedJobs.length > 0 ? (
                            filteredAndSortedJobs.map((job, index) => (
                                <TableRow key={job.id} onClick={() => handleRowClick(job.id)} className="cursor-pointer" data-state={selectedJobs.includes(job.id) && "selected"}>
                                    <TableCell className="w-[60px] pl-6" onClick={(e) => {if(isSelectModeActive) e.stopPropagation()}}>
                                        {isSelectModeActive ? (
                                            <Checkbox checked={selectedJobs.includes(job.id)} onCheckedChange={(checked) => handleRowSelect(job.id, !!checked)} />
                                        ) : ( index + 1 )}
                                    </TableCell>
                                    <TableCell className="font-medium">{job.title}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                             <Avatar className="h-6 w-6 text-xs">
                                                <AvatarFallback>{getInitials(job.recruiter.name)}</AvatarFallback>
                                             </Avatar>
                                            <span>{job.recruiter.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={job.status === 'Live' ? 'default' : 'outline'}>{job.status}</Badge>
                                    </TableCell>
                                    <TableCell>{job.type}</TableCell>
                                    <TableCell>{job.location}</TableCell>
                                    <TableCell>{job.applicants?.length || 0}</TableCell>
                                    <TableCell>{formatDate(job.createdAt)}</TableCell>
                                    <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger><Share2 className="mr-2 h-4 w-4"/>Share</DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuItem onSelect={() => handleCopyLink(job.id)}><Clipboard className="mr-2 h-4 w-4"/>Copy Job Link</DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => handleShare(job)}><Share2 className="mr-2 h-4 w-4"/>Share Job Link</DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => handleShareViaWhatsApp(job)}><WhatsAppIcon />Share via WhatsApp</DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => handleShareViaEmail(job)}><Mail className="mr-2 h-4 w-4"/>Share via Email</DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger><ChevronsUpDown className="mr-2 h-4 w-4"/>Change Status</DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            {statusOptions.filter(status => status !== job.status).map(status => (
                                                                <DropdownMenuItem key={status} onSelect={() => handleChangeStatus(job.id, status)}>
                                                                    {status}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/company/jobs/edit/${job.id}`}>
                                                        <Edit className="mr-2 h-4 w-4"/>Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4"/>Delete
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the &quot;{job.title}&quot; job posting.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteJobAction(job.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
                                <TableCell colSpan={9} className="text-center h-24">No jobs found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                </div>
            </Card>
        </>
    )
}
