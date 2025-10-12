
'use client';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { MobileSearch } from '@/components/mobile-search';
import { useContext, useMemo, useState, useTransition, useEffect } from 'react';
import { JobContext } from '@/context/job-context';
import { CompanyContext } from '@/context/company-context';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { JobsToolbar, type FilterState } from './_components/jobs-toolbar';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { Bookmark, MapPin, Briefcase, Calendar, Banknote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toggleFavoriteJobAction } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const getFiltersFromParams = (searchParams: URLSearchParams): FilterState => {
    return {
        jobType: searchParams.get('jobType')?.split(',') || [],
        location: searchParams.get('location')?.split(',') || [],
        workExperience: searchParams.get('workExperience')?.split(',') || [],
    };
};

export default function CandidateJobsPage() {
  const { session, loading: sessionLoading, updateSession } = useSession();
  const { jobs, loading: jobsLoading } = useContext(JobContext);
  const { companies, loading: companiesLoading } = useContext(CompanyContext);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<FilterState>(() => getFiltersFromParams(searchParams));
  const [isPending, startTransition] = useTransition();
  
  const [favoriteJobs, setFavoriteJobs] = useState<string[]>(session?.favourite_jobs || []);

  useEffect(() => {
    if (session?.favourite_jobs) {
        setFavoriteJobs(session.favourite_jobs);
    }
  }, [session?.favourite_jobs]);


  const uniqueLocations = useMemo(() => Array.from(new Set(jobs.map(j => j.location).filter(Boolean))), [jobs]);
  const uniqueJobTypes = useMemo(() => Array.from(new Set(jobs.map(j => j.type).filter(Boolean))), [jobs]);

  useEffect(() => {
    setFilters(getFiltersFromParams(searchParams));
  }, [searchParams]);

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
  }, [searchQuery]);

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
  
  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}


  const jobsWithCompany = useMemo(() => {
    return jobs.map(job => {
        const company = companies.find(c => c.id === job.companyId);
        return {
            ...job,
            company: company ? { name: company.name, logoUrl: company.displayImageUrl, dataAiHint: 'company logo' } : { name: 'Unknown Company', logoUrl: 'https://picsum.photos/seed/10/100/100', dataAiHint: 'company logo' }
        };
    })
  }, [jobs, companies]);

  const filteredJobs = useMemo(() => {
    let filtered = jobsWithCompany;
    if (searchQuery) {
        filtered = filtered.filter(job => 
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    if (filters.jobType.length > 0) {
        filtered = filtered.filter(job => filters.jobType.includes(job.type));
    }
    if (filters.location.length > 0) {
        filtered = filtered.filter(job => filters.location.includes(job.location));
    }
    if (filters.workExperience.length > 0) {
        filtered = filtered.filter(job => filters.workExperience.includes(job.workExperience));
    }
    return filtered;
  }, [jobsWithCompany, searchQuery, filters]);

  const loading = sessionLoading || jobsLoading || companiesLoading;

  const formatDatePosted = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.toDate ? date.toDate() : new Date(date);
    return formatDistanceToNow(jsDate, { addSuffix: true });
  }

  const handleToggleFavorite = async (jobId: string) => {
    if (!session) return;
    
    const isFavorited = favoriteJobs.includes(jobId);
    
    // Optimistic UI update
    const newFavoriteJobs = isFavorited
        ? favoriteJobs.filter(id => id !== jobId)
        : [...favoriteJobs, jobId];
    setFavoriteJobs(newFavoriteJobs);
    updateSession({ favourite_jobs: newFavoriteJobs });

    const result = await toggleFavoriteJobAction(jobId, session);
    if (result.error) {
        // Revert UI on error
        setFavoriteJobs(favoriteJobs);
        updateSession({ favourite_jobs: favoriteJobs });
        toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
        });
    }
  };


  if (loading) {
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardSidebar role="candidate" user={session} />
        <div className="flex flex-col max-h-screen">
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
              <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Find Jobs</h1>
              <MobileSearch />
          </header>
          <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:p-6 custom-scrollbar">
             <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-10 flex-1 md:flex-none md:w-64" />
                <Skeleton className="h-10 w-24 hidden md:block" />
            </div>
            <div className="grid gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <Skeleton className="h-24 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (session.role === 'candidate') {
      return (
        <div className="space-y-4">
            <JobsToolbar 
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                filters={filters}
                onFilterChange={handleFilterChange}
                uniqueJobTypes={uniqueJobTypes}
                uniqueLocations={uniqueLocations}
            />
            {filteredJobs.length > 0 ? (
                 <div className="grid gap-4">
                    {filteredJobs.map(job => {
                       const isFavorite = favoriteJobs.includes(job.id);
                       return (
                        <Link href={`/dashboard/candidate/jobs/${job.id}`} key={job.id} className="block">
                            <Card className="hover:bg-accent transition-colors relative group">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                       <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-dash-primary z-10" 
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleFavorite(job.id); }}>
                                            <Bookmark className={cn("h-5 w-5", isFavorite && "fill-current text-dash-primary")} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{isFavorite ? "Remove from saved" : "Save this job"}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <CardContent className="p-4 flex flex-col gap-4">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-12 w-12 rounded-full">
                                            <AvatarImage src={job.company.logoUrl || undefined} alt={`${job.company.name} logo`} />
                                            <AvatarFallback>{getInitials(job.company.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-semibold text-lg line-clamp-1 pr-10">{job.title}</p>
                                            <p className="text-sm text-muted-foreground">{job.company.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {job.location}</div>
                                        <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> {job.type}</div>
                                        <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> {job.workExperience}</div>
                                        {job.salary.min > 0 && job.salary.max > 0 && (
                                            <div className="flex items-center gap-2">
                                                <Banknote className="h-4 w-4" />
                                                <span>{job.salary.min} - {job.salary.max} LPA</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                 <div className="absolute bottom-4 right-4 flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {formatDatePosted(job.createdAt)}
                                </div>
                            </Card>
                       </Link>
                    )})}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No jobs found matching your criteria.</p>
                </div>
            )}
        </div>
      );
    }
    return <p>You do not have permission to view this page.</p>
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role="candidate" user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Find Jobs</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:p-6 custom-scrollbar">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
