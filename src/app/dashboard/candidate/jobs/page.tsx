
'use client';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MobileSearch } from '@/components/mobile-search';
import { useContext, useMemo, useState, useTransition, useEffect } from 'react';
import { JobContext } from '@/context/job-context';
import { CompanyContext } from '@/context/company-context';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { JobsToolbar, type FilterState } from './_components/jobs-toolbar';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Bookmark, MapPin, Briefcase, Calendar, Banknote, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toggleFavoriteJobAction } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { generateJobSearchKeywords } from '@/ai/flows/generate-job-search-keywords-flow';
import type { Job } from '@/lib/types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

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
  const [locationQuery, setLocationQuery] = useState(searchParams.get('loc') || '');
  const [filters, setFilters] = useState<FilterState>(() => getFiltersFromParams(searchParams));
  const [isTransitionPending, startTransition] = useTransition();

  const [favoriteJobs, setFavoriteJobs] = useState<string[]>(session?.favourite_jobs || []);
  const [recommendedJobIds, setRecommendedJobIds] = useState<string[]>([]);
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(true);
  
  const [isSearchActive, setIsSearchActive] = useState(!!searchParams.get('q') || !!searchParams.get('loc') || filters.jobType.length > 0 || filters.location.length > 0 || filters.workExperience.length > 0);

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

  const handleSearchSubmit = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) params.set('q', searchQuery); else params.delete('q');
    if (locationQuery) params.set('loc', locationQuery); else params.delete('loc');
    
    startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
    });
    setIsSearchActive(true);
  }
  
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
     setIsSearchActive(true);
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

  useEffect(() => {
    const getRecommendations = async () => {
        if (!session?.uid || jobsWithCompany.length === 0 || isSearchActive) {
            setIsRecommendationLoading(false);
            return;
        }
        
        const cacheKey = `recommendations-${session.uid}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        const now = new Date().getTime();
        const TEN_MINUTES = 10 * 60 * 1000;

        if (cachedData) {
            const { timestamp, ids } = JSON.parse(cachedData);
            if (now - timestamp < TEN_MINUTES) {
                setRecommendedJobIds(ids);
                setIsRecommendationLoading(false);
                return;
            }
        }

        setIsRecommendationLoading(true);
        try {
            const keywords = await generateJobSearchKeywords({
              candidateProfile: {
                jobTitle: session.jobTitle || '',
                keySkills: session.keySkills || [],
                profileSummary: session.profileSummary || '',
              },
              searchHistory: [], // TODO: Implement search history tracking
            });

            if (keywords.keywords.length === 0) {
              setRecommendedJobIds([]);
              setIsRecommendationLoading(false);
              return;
            }

            const recommendedJobsQuery = query(
              collection(db, 'jobs'),
              where('searchKeywords', 'array-contains-any', keywords.keywords.slice(0, 10)) // Firestore 'array-contains-any' limit
            );
            const querySnapshot = await getDocs(recommendedJobsQuery);
            const jobIds = querySnapshot.docs.map(doc => doc.id);
            
            setRecommendedJobIds(jobIds);
            sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, ids: jobIds }));

        } catch (error) {
            console.error("Failed to get job recommendations:", error);
            toast({
                variant: "destructive",
                title: "AI Recommendation Error",
                description: "Could not fetch personalized job recommendations.",
            });
        } finally {
            setIsRecommendationLoading(false);
        }
    };
    getRecommendations();
  }, [session, jobsWithCompany, isSearchActive, toast]);


  const displayedJobs = useMemo(() => {
    let filtered = jobsWithCompany;

    if (isSearchActive) {
        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(job => 
                job.title.toLowerCase().includes(lowerCaseQuery) ||
                job.company.name.toLowerCase().includes(lowerCaseQuery) ||
                job.keySkills?.some(skill => skill.toLowerCase().includes(lowerCaseQuery))
            );
        }
        if(locationQuery) {
             filtered = filtered.filter(job => 
                job.location.toLowerCase().includes(locationQuery.toLowerCase())
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
    } else {
        if (recommendedJobIds.length > 0) {
             filtered = recommendedJobIds.map(id => jobsWithCompany.find(job => job.id === id)).filter((j): j is Job & { company: any } => !!j);
        } else if (!isRecommendationLoading) {
            // Fallback to all jobs if recommendations are empty or failed
            filtered = jobsWithCompany;
        } else {
            filtered = [];
        }
    }
    
    return filtered;
  }, [jobsWithCompany, searchQuery, locationQuery, filters, isSearchActive, recommendedJobIds, isRecommendationLoading]);

  const loading = sessionLoading || jobsLoading || companiesLoading || isTransitionPending;

  const formatDatePosted = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.toDate ? date.toDate() : new Date(date);
    return formatDistanceToNow(jsDate, { addSuffix: true });
  }

  const handleToggleFavorite = async (jobId: string) => {
    if (!session) return;
    
    const isFavorited = favoriteJobs.includes(jobId);
    
    const newFavoriteJobs = isFavorited
        ? favoriteJobs.filter(id => id !== jobId)
        : [...favoriteJobs, jobId];
    setFavoriteJobs(newFavoriteJobs);
    updateSession({ favourite_jobs: newFavoriteJobs });

    const result = await toggleFavoriteJobAction(jobId, session);
    if (result.error) {
        setFavoriteJobs(favoriteJobs);
        updateSession({ favourite_jobs: favoriteJobs });
        toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
        });
    }
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            <div className="space-y-4">
                <JobsToolbar 
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    locationQuery={locationQuery}
                    onLocationQueryChange={setLocationQuery}
                    onSearchSubmit={handleSearchSubmit}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    uniqueJobTypes={uniqueJobTypes}
                    uniqueLocations={uniqueLocations}
                />
                
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                    {isSearchActive ? 'Search Results' : 'Jobs for you'}
                    {!isSearchActive && <Sparkles className="h-5 w-5 text-dash-primary" />}
                    </h2>
                    {!isSearchActive && <p className="text-sm text-muted-foreground">AI Recommendations</p>}
                </div>

                {loading || isRecommendationLoading ? (
                    <div className="grid gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i}>
                                <CardContent className="p-4">
                                    <Skeleton className="h-24 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : displayedJobs.length > 0 ? (
                    <div className="grid gap-4">
                        {displayedJobs.map(job => {
                        const isFavorite = favoriteJobs.includes(job.id);
                        return (
                            <Card asChild key={job.id} className="hover:bg-accent transition-colors relative group">
                                <Link href={`/dashboard/candidate/jobs/${job.id}`}>
                                <CardHeader>
                                        <div className="flex items-start gap-4">
                                            <Avatar className="h-12 w-12 rounded-lg">
                                                <AvatarImage src={job.company.logoUrl || undefined} alt={`${job.company.name} logo`} />
                                                <AvatarFallback className="rounded-lg">{getInitials(job.company.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-semibold text-lg line-clamp-1">{job.title}</p>
                                                <p className="text-sm text-muted-foreground">{job.company.name}</p>
                                            </div>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                    <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 text-muted-foreground hover:text-dash-primary z-10" 
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleFavorite(job.id); }}>
                                                            <Bookmark className={cn("h-5 w-5", isFavorite && "fill-current text-dash-primary")} />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{isFavorite ? "Remove from saved" : "Save this job"}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                                <CardFooter className="p-4 pt-0">
                                    <div className="absolute bottom-4 right-4 flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {formatDatePosted(job.createdAt)}
                                    </div>
                                </CardFooter>
                                </Link>
                        </Card>
                        )})}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Jobs Found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {isSearchActive ? "Try adjusting your search or filters." : "We couldn't find any recommendations for you yet. Try adding more skills to your profile!"}
                        </p>
                    </div>
                )}
            </div>
            <div className="hidden lg:block">
              <div className="sticky top-20">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Jobs you might like</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <p className="text-muted-foreground">jobs ads will be displayed here</p>
                    </CardContent>
                </Card>
              </div>
            </div>
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
