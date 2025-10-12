

import Image from "next/image"
import { File, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { mockJobs } from "@/lib/mock-data"
import { ResumeAnalysis } from "@/components/resume-analysis"

export default function JobApplicantsPage({ params }: { params: { id: string } }) {
  const job = mockJobs.find(j => j.id === params.id) ?? mockJobs[0];
  const applicants = job.applicants;

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role="company" />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
             <h1 className="font-headline text-xl font-semibold md:ml-0 ml-10">Applicants for {job.title}</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle className="font-headline">{job.title}</CardTitle>
                  <CardDescription>{job.description}</CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                    <span>Edit Job</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Image
                            alt={`${job.company.name} logo`}
                            className="aspect-square rounded-md object-cover"
                            height="20"
                            src={job.company.logoUrl}
                            width="20"
                            data-ai-hint={job.company.dataAiHint}
                        />
                        {job.company.name}
                    </div>
                    <div>{job.location}</div>
                    <div>{job.type}</div>
                </div>
              </CardContent>
            </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>AI Resume Analysis</CardTitle>
                    <CardDescription>Upload a resume to analyze it against the job description.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResumeAnalysis jobDescription={job.description} />
                </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Applicants</CardTitle>
              <CardDescription>
                Manage applicants for the {job.title} position.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      <span className="sr-only">Image</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Applied
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicants.map(applicant => (
                    <TableRow key={applicant.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          alt="Product image"
                          className="aspect-square rounded-full object-cover"
                          height="64"
                          src={applicant.avatarUrl}
                          width="64"
                          data-ai-hint={applicant.dataAiHint}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{applicant.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">New</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(applicant.appliedDate), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Analyze Resume</DropdownMenuItem>
                            <DropdownMenuItem>Contact</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {applicants.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">No applicants yet.</TableCell>
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
