
import Link from "next/link"
import { PlusCircle, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { mockJobs } from "@/lib/mock-data"


export default function CompanyJobsPage() {
  const jobs = mockJobs;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[300px_1fr]">
      <DashboardSidebar role="company" />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-4 bg-background px-4 md:px-6 sticky top-0 z-30">
            <h1 className="font-headline text-xl font-semibold">Job Postings</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-8 md:p-8 custom-scrollbar">
            <div className="flex items-center">
                <div className="ml-auto flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 gap-1">
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                    </span>
                </Button>
                <Button size="sm" className="h-8 gap-1" asChild>
                    <Link href="/company/jobs/new">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Post a Job
                        </span>
                    </Link>
                </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                <CardTitle>Job Postings</CardTitle>
                <CardDescription>
                    Manage your job postings and view applicants.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">
                        Date Posted
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                        Applicants
                        </TableHead>
                        <TableHead>
                        <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {jobs.map(job => (
                        <TableRow key={job.id}>
                            <TableCell className="font-medium">
                                <Link href={`/company/jobs/${job.id}`} className="hover:underline">
                                    {job.title}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">Live</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {new Date(job.datePosted).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {job.applicants.length}
                            </TableCell>
                            <TableCell>
                                <Button size="sm" asChild>
                                    <Link href={`/company/jobs/${job.id}`}>View</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                     {jobs.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">No jobs posted yet.</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
                <CardFooter>
                <div className="text-xs text-muted-foreground">
                    Showing <strong>1-{jobs.length}</strong> of <strong>{jobs.length}</strong> products
                </div>
                </CardFooter>
            </Card>
        </main>
      </div>
    </div>
  )
}
