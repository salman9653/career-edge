
'use client';
import { useState, useMemo, useTransition, useEffect, useContext } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import type { Job, Applicant } from '@/lib/types';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { CompanyContext } from '@/context/company-context';

type SortKey = 'title' | 'company' | 'appliedDate';

export interface Application extends Job {
    company: {
        name: string;
        logoUrl?: string;
    };
    applicantData: Applicant;
}

interface ApplicationsTableProps {
    applications: Application[];
    loading: boolean;
}

export function ApplicationsTable({ applications, loading }: ApplicationsTableProps) {
    const router = useRouter();
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredAndSortedApplications = useMemo(() => {
        let filtered = [...applications];
        if (searchQuery) {
            filtered = filtered.filter(app =>
                app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.company.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                let aValue: any, bValue: any;
                if (sortConfig.key === 'company') {
                    aValue = a.company.name;
                    bValue = b.company.name;
                } else if (sortConfig.key === 'appliedDate') {
                    aValue = new Date(a.applicantData.appliedAt);
                    bValue = new Date(b.applicantData.appliedAt);
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
    }, [applications, searchQuery, sortConfig]);

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

    const formatDateApplied = (date: any) => {
        if (!date) return 'N/A';
        const jsDate = date.toDate ? date.toDate() : new Date(date);
        return format(jsDate, "dd MMM yyyy");
    }

    const getStatusVariant = (status: Applicant['status']) => {
        switch (status) {
            case 'Screening Passed': return 'default';
            case 'Screening Failed': return 'destructive';
            case 'Hired': return 'default';
            case 'Rejected': return 'destructive';
            default: return 'outline';
        }
    }

    return (
        <div className="space-y-4">
            <div className="relative md:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search applications..."
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
                                    <button onClick={() => requestSort('appliedDate')} className="group flex items-center gap-2">
                                        Date Applied {getSortIndicator('appliedDate')}
                                    </button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={6}><Skeleton className="h-5 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredAndSortedApplications.length > 0 ? (
                                filteredAndSortedApplications.map((app, index) => (
                                    <TableRow key={app.id} onClick={() => handleRowClick(app.id)} className="cursor-pointer">
                                        <TableCell className="pl-6">{index + 1}</TableCell>
                                        <TableCell className="font-medium">{app.title}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={app.company.logoUrl} />
                                                    <AvatarFallback>{getInitials(app.company.name)}</AvatarFallback>
                                                </Avatar>
                                                <span>{app.company.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{app.location}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(app.applicantData.status)}>{app.applicantData.status || "Submitted"}</Badge>
                                        </TableCell>
                                        <TableCell>{formatDateApplied(app.applicantData.appliedAt)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">You haven't applied to any jobs yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
