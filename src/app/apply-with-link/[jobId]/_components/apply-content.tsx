'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Job, Socials, CompanySize } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/logo';
import { Briefcase, MapPin, Banknote, Building, Calendar, Loader2, XCircle, PauseCircle, Info, Lock, Globe, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSession } from '@/hooks/use-session';
import { allBenefits } from '@/lib/benefits';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Company {
    name: string;
    displayImageUrl?: string;
    aboutCompany?: string;
    website?: string;
    helplinePhone?: string;
    helplineEmail?: string;
    benefits?: string[];
    socials?: Socials;
    companySize?: CompanySize;
    companyType?: string;
    foundedYear?: string;
}

interface ApplyWithLinkContentProps {
    jobId: string;
}

export default function ApplyWithLinkContent({ jobId }: ApplyWithLinkContentProps) {
    const router = useRouter();
    const { session, loading: sessionLoading } = useSession();

    const [job, setJob] = useState<Job | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isAboutExpanded, setIsAboutExpanded] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [isCompanyCardExpanded, setIsCompanyCardExpanded] = useState(false);

    const descriptionLineCount = useMemo(() => {
        return job?.description?.split('\n').length || 0;
    }, [job?.description]);
    
    const aboutLineCount = useMemo(() => {
        return company?.aboutCompany?.split('\n').length || 0;
    }, [company?.aboutCompany]);

    const selectedBenefits = useMemo(() => {
        if (!company?.benefits) return [];
        return allBenefits.filter(b => company.benefits?.includes(b.id));
    }, [company?.benefits]);

    const getWebsiteUrl = (url?: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    };

    useEffect(() => {
        if (jobId) {
            const fetchJobAndCompany = async () => {
                setLoading(true);
                setError(null);
                try {
                    const jobDocRef = doc(db, 'jobs', jobId);
                    const jobDocSnap = await getDoc(jobDocRef);

                    if (jobDocSnap.exists()) {
                        const jobData = { id: jobDocSnap.id, ...jobDocSnap.data() } as Job;
                        setJob(jobData);

                        if(jobData.companyId) {
                            const companyDocRef = doc(db, 'users', jobData.companyId);
                            const companyDocSnap = await getDoc(companyDocRef);

                            if(companyDocSnap.exists()) {
                                setCompany(companyDocSnap.data() as Company);
                            } else {
                                 setError('The company associated with this job could not be found.');
                            }
                        } else {
                            setError('Company information is missing for this job.');
                        }
                    } else {
                        setError('This job posting could not be found. It may have been removed or the link is incorrect.');
                    }
                } catch (err) {
                    console.error("Error fetching job:", err);
                    setError('An unexpected error occurred while trying to load the job posting.');
                } finally {
                    setLoading(false);
                }
            }
            fetchJobAndCompany();
        }
    }, [jobId]);

    const handleApply = () => {
        setIsApplying(true);
        if (session) {
            if (session.role === 'candidate') {
                router.push(`/dashboard/candidate/jobs/${jobId}`);
            } else if (session.role === 'admin') {
                router.push(`/dashboard/admin/companies/jobs/${jobId}`);
            } else { // company or manager
                router.push(`/dashboard/company/jobs/${jobId}`);
            }
        } else {
            router.push(`/login?redirectJobId=${jobId}`);
        }
    };
    
    const getButtonText = () => {
        if (!session) return 'Apply Now';
        if (session.role === 'candidate') return 'Apply Now';
        return 'Visit Job Page';
    };

    const getInitials = (name?: string) => {
        if (!name) return '';
        const names = name.split(' ');
        return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
    }
    
    const locationDisplay = job?.preference === 'Remote' ? 'Remote' : `${job?.location} (${job?.preference})`;
    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        const jsDate = date.toDate ? date.toDate() : new Date(date);
        return format(jsDate, "dd MMM yyyy");
    }
    
    const renderDescription = () => {
        switch(job?.status) {
            case 'Live':
                return (
                    <div>
                        <h3 className="font-semibold mb-2">Job Description</h3>
                        <div 
                            className={cn("prose dark:prose-invert max-w-full text-sm text-muted-foreground", !isDescriptionExpanded && "line-clamp-[10]")}
                            dangerouslySetInnerHTML={{ __html: job.description }}
                        />
                        {descriptionLineCount > 10 && (
                             <Button variant="link" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="p-0 h-auto">
                                {isDescriptionExpanded ? 'Show Less' : 'Show More'}
                            </Button>
                        )}
                    </div>
                );
            case 'Draft':
                return (
                    <Card className="bg-muted/30 border-dashed">
                        <CardContent className="p-8 text-center space-y-2">
                             <div className="flex justify-center mb-2">
                                <div className="h-12 w-12 rounded-full bg-secondary/80 flex items-center justify-center">
                                    <Info className="h-6 w-6 text-foreground"/>
                                </div>
                            </div>
                            <h3 className="font-semibold">Job Not Yet Published</h3>
                            <p className="text-sm text-muted-foreground">This job posting is currently not yet open for applications, Please check back later.</p>
                        </CardContent>
                    </Card>
                )
            case 'On-hold':
                return (
                    <Card className="bg-muted/30 border-dashed">
                        <CardContent className="p-8 text-center space-y-2">
                             <div className="flex justify-center mb-2">
                                <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                    <PauseCircle className="h-6 w-6 text-yellow-600"/>
                                </div>
                            </div>
                            <h3 className="font-semibold">Applications on Hold</h3>
                            <p className="text-sm text-muted-foreground">This job posting is temporarily on hold and is not accepting new applications at this time. Please check back later, as applications may resume in the future.</p>
                        </CardContent>
                    </Card>
                )
            case 'Closed':
                return (
                    <Card className="bg-muted/30 border-dashed">
                        <CardContent className="p-8 text-center space-y-2">
                             <div className="flex justify-center mb-2">
                                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <Lock className="h-6 w-6 text-destructive"/>
                                </div>
                            </div>
                            <h3 className="font-semibold">Job Closed</h3>
                            <p className="text-sm text-muted-foreground">This job is no longer accepting applications.</p>
                        </CardContent>
                    </Card>
                )
            default:
                return null;
        }
    }


    if (loading || sessionLoading) {
        return (
             <div className="flex min-h-screen flex-col items-center bg-secondary p-4">
                <div className="mt-12 mb-8 flex justify-center"><Logo /></div>
                <Card className="w-full max-w-3xl">
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-5 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
             </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4 text-center">
                 <div className="mb-8"><Logo /></div>
                <Card className="w-full max-w-lg p-8">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                <XCircle className="h-6 w-6 text-destructive"/>
                        </div>
                    </div>
                    <CardTitle className="font-headline text-2xl mb-2">Job Not Found</CardTitle>
                    <CardDescription>{error}</CardDescription>
                    <Button onClick={() => router.push('/')} className="mt-6">Go to Homepage</Button>
                </Card>
            </div>
        )
    }

    if (!job) return null;

    return (
        <div className="min-h-screen bg-secondary py-12 px-4">
             <div className="mb-8 flex justify-center">
                <Logo />
            </div>
            <div className="w-full max-w-3xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                                <Badge variant="outline" className="mb-2">{job.type}</Badge>
                                <CardTitle className="font-headline text-3xl">{job.title}</CardTitle>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={company?.displayImageUrl} />
                                            <AvatarFallback>{getInitials(company?.name)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-semibold text-foreground">{company?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4"/>
                                        <span>Posted on {formatDate(job.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                            <Button size="lg" className="w-full sm:w-auto" onClick={handleApply} disabled={isApplying || (job.status !== 'Live' && !session)}>
                                {isApplying ? <Loader2 className="animate-spin" /> : getButtonText()}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground border-t border-b py-4">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{locationDisplay}</span>
                            </div>
                            {job.salary.min > 0 && job.salary.max > 0 && (
                                <div className="flex items-center gap-2">
                                    <Banknote className="h-4 w-4" />
                                    <span>{job.salary.min} LPA to {job.salary.max} LPA</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                <span>{job.workExperience} experience</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                <span>{job.positions} positions</span>
                            </div>
                        </div>
                        {renderDescription()}
                    </CardContent>
                </Card>
                {company && (
                    <Collapsible open={isCompanyCardExpanded} onOpenChange={setIsCompanyCardExpanded} asChild>
                        <Card>
                            <CardHeader className="flex flex-col items-start gap-4">
                                <div className="w-full flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsCompanyCardExpanded(!isCompanyCardExpanded)}>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={company?.displayImageUrl} />
                                            <AvatarFallback>{getInitials(company?.name)}</AvatarFallback>
                                        </Avatar>
                                        <CardTitle className="font-headline text-2xl">{company.name}</CardTitle>
                                    </div>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            {isCompanyCardExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>
                                <div className='flex items-center gap-2'>
                                  {company.website && (
                                      <Button variant="outline" size="sm" asChild>
                                          <Link href={getWebsiteUrl(company.website)} target="_blank" rel="noopener noreferrer">
                                              <Globe className="h-4 w-4 mr-2" />
                                              Visit
                                          </Link>
                                      </Button>
                                  )}
                                  <TooltipProvider>
                                      <Tooltip>
                                          <TooltipTrigger asChild>
                                              <Button variant="secondary" size="sm" disabled>See other jobs</Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                              <p>Other jobs by {company.name}</p>
                                          </TooltipContent>
                                      </Tooltip>
                                  </TooltipProvider>
                                </div>
                            </CardHeader>
                            <CollapsibleContent>
                                <CardContent className="space-y-6">
                                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground border-t border-b py-4">
                                        {company.companySize && (
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4" />
                                                <span>{company.companySize.size} ({company.companySize.employees} employees)</span>
                                            </div>
                                        )}
                                        {company.companyType && (
                                            <div className="flex items-center gap-2">
                                                <Info className="h-4 w-4" />
                                                <span>{company.companyType}</span>
                                            </div>
                                        )}
                                        {company.foundedYear && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>Founded in {company.foundedYear}</span>
                                            </div>
                                        )}
                                    </div>
                                {company.aboutCompany && (
                                    <div>
                                            <Collapsible>
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="link" className="p-0 h-auto text-sm">
                                                        About the company
                                                        <ChevronDown className="ml-1 h-4 w-4" />
                                                    </Button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <p className={cn("text-sm text-muted-foreground whitespace-pre-wrap pt-2")}>
                                                        {company.aboutCompany}
                                                    </p>
                                                </CollapsibleContent>
                                            </Collapsible>
                                    </div>
                                )}
                                {selectedBenefits.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Benefits & Perks</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {selectedBenefits.map(benefit => (
                                                <div key={benefit.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <benefit.icon className="h-5 w-5 text-primary" />
                                                    <span>{benefit.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {company.helplinePhone && (
                                            <div className="flex items-start gap-3 text-sm">
                                                <Phone className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                                <div>
                                                    <p className="text-muted-foreground">Contact Phone</p>
                                                    <p className="font-medium">{company.helplinePhone}</p>
                                                </div>
                                            </div>
                                    )}
                                        {company.helplineEmail && (
                                            <div className="flex items-start gap-3 text-sm">
                                                <Mail className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                                <div>
                                                    <p className="text-muted-foreground">Contact Email</p>
                                                    <p className="font-medium">{company.helplineEmail}</p>
                                                </div>
                                            </div>
                                    )}
                                </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                )}
            </div>
        </div>
    );
}
