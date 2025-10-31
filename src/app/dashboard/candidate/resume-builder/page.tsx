
'use client';

import Link from 'next/link';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, FileText, MoreVertical, Trash2, Download, Edit } from 'lucide-react';
import { MobileSearch } from '@/components/mobile-search';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';

const mockGeneratedResumes = [
    { id: '1', name: 'Resume for Google SWE', createdAt: '2024-05-20T10:00:00Z', jobTitle: 'Software Engineer', company: 'Google' },
    { id: '2', name: 'Resume for Microsoft PM', createdAt: '2024-05-18T14:30:00Z', jobTitle: 'Product Manager', company: 'Microsoft' },
];

export default function ResumeBuilderPage() {
    const { session } = useSession();

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <DashboardSidebar role={session?.role || 'candidate'} user={session} />
            <div className="flex flex-col max-h-screen">
                <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
                    <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Resume Builder</h1>
                    <MobileSearch />
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 custom-scrollbar">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Generated Resumes</CardTitle>
                                    <CardDescription>View, edit, and download your AI-generated resumes.</CardDescription>
                                </div>
                                <Button asChild>
                                    <Link href="/dashboard/candidate/resume-builder/new">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Generate New Resume
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Resume Name</TableHead>
                                        <TableHead>Target Job</TableHead>
                                        <TableHead>Date Created</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockGeneratedResumes.map(resume => (
                                        <TableRow key={resume.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/candidate/resumes/${resume.id}`)}>
                                            <TableCell className="font-medium">{resume.name}</TableCell>
                                            <TableCell>{resume.jobTitle} at {resume.company}</TableCell>
                                            <TableCell>{new Date(resume.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                        <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Download PDF</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                     {mockGeneratedResumes.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24">
                                                You haven't generated any resumes yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    )
}
