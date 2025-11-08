
'use client';
import { useState, useMemo, useContext } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import type { Job } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CompanyContext } from '@/context/company-context';

type SortKey = 'title' | 'company' | 'datePosted';

interface FavoriteJobsTableProps {
    jobs: Job[];
    loading: boolean;
}

export function FavoriteJobsTable({ jobs, loading }: FavoriteJobsTableProps) {
    const router = useRouter();
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { companies, loading: companiesLoading } = useContext(CompanyContext);

    const jobsWithCompany = useMemo(() => {
      return jobs.map(job => {
          const company = companies.find(c => c.id === job.companyId);
          return {
              ...job,
              company: company ? { name: company.name, logoUrl: company.displayImageUrl } : { name: 'Unknown Company', logoUrl: '' }
          };
      })
    }, [jobs, companies]);

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortKey) => {
        if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />;
        if (sortConfig.direction === 'ascending') return <ArrowUp className="h-4 w-4" />;
        return <ArrowDown className="h-4 w-4" />;
    };

    const filteredAndSortedJobs = useMemo(() => {
        let filtered = [...jobsWithCompany];
        if (searchQuery) {
            filtered = filtered.filter(job =>
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.company.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                let aValue: any, bValue: any;
                if (sortConfig.key === 'company') {
                    aValue = a.company.name;
                    bValue = b.company.name;
                } else if (sortConfig.key === 'datePosted') {
                    aValue = new Date(a.datePosted);
                    bValue = new Date(b.datePosted);
                } else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
                }
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [jobsWithCompany, searchQuery, sortConfig]);

    const handleRowClick = (jobId: string) => {
        router.push(`/dashboard/candidate/jobs/${jobId}`);
    };
    
    const getInitials = (name: string) => {
        if (!name) return '';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    const formatDatePosted = (date: any) => {
      if (!date) return 'N/A';
      const jsDate = date.toDate ? date.toDate() : new Date(date);
      return formatDistanceToNow(jsDate, { addSuffix: true });
    }

    return (
        <div className="space-y-4">
            <div className="relative md:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search saved jobs..."
                    className="w-full rounded-lg bg-background pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Card>
                <div className="relative h-full overflow-auto custom-scrollbar">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[60px] pl-6">S.No.</TableHead>
                                <TableHead>
                                    <button onClick={() => requestSort('title')} className="group flex items-center gap-2">
                                        Job Title {getSortIndicator('title')}
                                    </button>
                                </TableHead>
                                <TableHead>
                                     <button onClick={() => requestSort('company')} className="group flex items-center gap-2">
                                        Company {getSortIndicator('company')}
                                    </button>
                                </TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>
                                    <button onClick={() => requestSort('datePosted')} className="group flex items-center gap-2">
                                        Date Posted {getSortIndicator('datePosted')}
                                    </button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading || companiesLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={6}><Skeleton className="h-5 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredAndSortedJobs.length > 0 ? (
                                filteredAndSortedJobs.map((job, index) => (
                                    <TableRow key={job.id} onClick={() => handleRowClick(job.id)} className="cursor-pointer">
                                        <TableCell className="pl-6">{index + 1}</TableCell>
                                        <TableCell className="font-medium">{job.title}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={job.company.logoUrl} />
                                                    <AvatarFallback>{getInitials(job.company.name)}</AvatarFallback>
                                                </Avatar>
                                                <span>{job.company.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{job.location}</TableCell>
                                        <TableCell>
                                            <Badge variant={job.status === 'Live' ? 'default' : 'outline'}>{job.status}</Badge>
                                        </TableCell>
                                        <TableCell>{formatDatePosted(job.createdAt)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">You haven't saved any jobs yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
