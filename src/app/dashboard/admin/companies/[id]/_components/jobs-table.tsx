
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/lib/types";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface JobsTableProps {
    jobs: Job[];
    loading: boolean;
}

export function JobsTable({ jobs, loading }: JobsTableProps) {
    const router = useRouter();

    const formatDate = (date: any) => {
        if (!date) return "N/A";
        const jsDate = date.toDate ? date.toDate() : new Date(date);
        return format(jsDate, "dd MMM yyyy");
    };

    const handleRowClick = (jobId: string) => {
        router.push(`/dashboard/admin/companies/jobs/${jobId}`);
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[60px]">S.No.</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Positions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted On</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center">Loading jobs...</TableCell>
                    </TableRow>
                ) : jobs.length > 0 ? (
                    jobs.map((job, index) => (
                        <TableRow key={job.id} onClick={() => handleRowClick(job.id)} className="cursor-pointer">
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{job.title}</TableCell>
                            <TableCell>{job.type}</TableCell>
                            <TableCell>{job.positions}</TableCell>
                            <TableCell><Badge variant={job.status === 'Live' ? 'default' : 'outline'}>{job.status}</Badge></TableCell>
                            <TableCell>{formatDate(job.createdAt)}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">No jobs posted by this company.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

