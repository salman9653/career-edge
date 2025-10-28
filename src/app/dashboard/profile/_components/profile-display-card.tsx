
'use client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Edit, XCircle, Building, Globe, Linkedin, Phone, Mail, Briefcase, Building2, UserCog, Shield, Info, ChevronDown, ChevronUp, Calendar, Hash, User, Github, FileText, Download, Languages, MapPin, Cake, UserSquare, Link as LinkIcon } from 'lucide-react';
import type { CompanySize, Socials, UserProfile, Employment, Education } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { allBenefits } from '@/lib/benefits';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format, formatDistanceToNow, differenceInMonths } from 'date-fns';

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);


interface ProfileDisplayCardProps {
    profile: UserProfile;
    onEdit: () => void;
}

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

const getCompanySizeDisplay = (size?: CompanySize) => {
    if (!size || !size.size) return "Not specified";
    return `${size.size} (${size.employees} employees)`;
}

const getWebsiteUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `https://${url}`;
};

const calculateDuration = (startDate: string, endDate: string | null, isCurrent: boolean) => {
    const start = new Date(startDate);
    const end = isCurrent ? new Date() : endDate ? new Date(endDate) : new Date();
    const months = differenceInMonths(end, start);
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0 && remainingMonths === 0) return "Less than a month";
    
    let result = '';
    if (years > 0) result += `${years} year${years > 1 ? 's' : ''}`;
    if (remainingMonths > 0) {
        if (years > 0) result += ', ';
        result += `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
    return result;
};


export function ProfileDisplayCard({ profile, onEdit }: ProfileDisplayCardProps) {
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [showAllEmployment, setShowAllEmployment] = useState(false);
  const [showAllEducation, setShowAllEducation] = useState(false);
  const selectedBenefits = allBenefits.filter(b => profile.benefits?.includes(b.id));

  const sortedEmployment = (profile.employment && profile.employment.length > 0)
    ? [...profile.employment].sort((a, b) => {
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    })
    : [];

  const latestEmployment = sortedEmployment[0] || null;

  const educationOrder: Education['level'][] = ['Doctorate/PhD', 'Masters/Post-Graduations', 'Graduation/Diploma', 'Class 12th', 'Class 10th'];
  const sortedEducation = (profile.education && profile.education.length > 0)
    ? [...profile.education].sort((a, b) => {
        const aLevel = educationOrder.indexOf(a.level);
        const bLevel = educationOrder.indexOf(b.level);
        if (aLevel !== bLevel) {
            return aLevel - bLevel;
        }
        const aYear = a.endYear || a.passingYear || 0;
        const bYear = b.endYear || b.passingYear || 0;
        return bYear - aYear;
      })
    : [];
  
  const latestEducation = sortedEducation[0] || null;
  
  return (
    <Card className="h-full flex flex-col">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline text-2xl">Profile Information</CardTitle>
                    <CardDescription>Your personal details and contact information.</CardDescription>
                </div>
                <Button variant="outline" onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                </Button>
            </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-8 overflow-y-auto custom-scrollbar">
            {/* Section 1: Basic Info */}
            <div id="profile-summary" className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.displayImageUrl ?? undefined} />
                    <AvatarFallback className="text-3xl bg-dash-primary text-dash-primary-foreground">{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-2 flex-1">
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                    <div className="flex items-center gap-2">
                        <p className="text-muted-foreground">{profile.email}</p>
                        {profile.emailVerified ? (
                            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                                <CheckCircle className="h-4 w-4"/>
                                Verified
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                                <XCircle className="h-4 w-4"/>
                                Unverified
                            </div>
                        )}
                    </div>
                    {profile.phone && <p className="text-muted-foreground">{profile.phone}</p>}
                    {profile.role === 'manager' && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            {profile.designation && (
                                <div className="flex items-center gap-1">
                                    <UserCog className="h-4 w-4" />
                                    <span>{profile.designation}</span>
                                </div>
                            )}
                            {profile.permissions_role && (
                                <div className="flex items-center gap-1">
                                    <Shield className="h-4 w-4" />
                                    <span>{profile.permissions_role}</span>
                                </div>
                            )}
                        </div>
                    )}
                     {profile.profileSummary && <p className="text-sm text-muted-foreground pt-2">{profile.profileSummary}</p>}
                </div>
            </div>
           
            {profile.role === 'candidate' && (
                <>
                {/* Career Profile */}
                <div id="career-profile" className="space-y-4 pt-6 border-t">
                    <h3 className="font-semibold text-lg">Career Profile</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Current Job Title</p>
                            <p className="font-medium">{profile.jobTitle || 'Not specified'}</p>
                        </div>
                         <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Current Company</p>
                            <p className="font-medium">{profile.currentCompany || 'Not specified'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Total Experience</p>
                            <p className="font-medium">{profile.experience || 'Not specified'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Notice Period</p>
                            <p className="font-medium">{profile.noticePeriod || 'Not specified'}</p>
                        </div>
                    </div>
                </div>

                {/* Resume */}
                {profile.hasResume && profile.resume && (
                     <div id="resume" className="space-y-4 pt-6 border-t">
                        <h3 className="font-semibold text-lg">Resume</h3>
                         <div className="flex items-center gap-4 p-4 border rounded-lg bg-secondary">
                             <FileText className="h-8 w-8 text-muted-foreground" />
                             <div className="flex-1">
                                 <p className="font-medium">{profile.resume.name}</p>
                                 <p className="text-xs text-muted-foreground">Last updated: {formatDistanceToNow(profile.resume.updatedAt.toDate(), { addSuffix: true })}</p>
                             </div>
                             <Button variant="outline" size="sm" asChild>
                                 <a href={profile.resume.data} download={profile.resume.name}>
                                     <Download className="mr-2 h-4 w-4" /> Download
                                 </a>
                             </Button>
                         </div>
                     </div>
                )}

                 {/* Key Skills */}
                {profile.keySkills && profile.keySkills.length > 0 && (
                <div id="key-skills" className="space-y-4 pt-6 border-t">
                    <h3 className="font-semibold text-lg">Key Skills</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        {profile.keySkills?.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                    </div>
                </div>
                )}
                {/* Employment */}
                {sortedEmployment.length > 0 && (
                     <div id="employment" className="space-y-4 pt-6 border-t">
                        <h3 className="font-semibold text-lg">Recent Employment</h3>
                        <div className="space-y-4">
                             {(showAllEmployment ? sortedEmployment : [latestEmployment]).map(employment => (
                                <Card key={employment.id} className="p-4">
                                    <div>
                                        <p className="font-semibold">{employment.designation}</p>
                                        <p className="text-sm text-muted-foreground">{employment.company} &bull; {employment.employmentType}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(employment.startDate), 'MMM yyyy')} - {employment.isCurrent ? 'Present' : employment.endDate ? format(new Date(employment.endDate), 'MMM yyyy') : 'N/A'}
                                            <span className="mx-2 text-gray-400">&bull;</span>
                                            {calculateDuration(employment.startDate, employment.endDate, employment.isCurrent)}
                                        </p>
                                        <p className="text-sm mt-2">{employment.jobProfile}</p>
                                    </div>
                                </Card>
                            ))}
                            {sortedEmployment.length > 1 && (
                                <Button variant="link" className="p-0 h-auto" onClick={() => setShowAllEmployment(!showAllEmployment)}>
                                    {showAllEmployment ? 'Show less' : `+ ${sortedEmployment.length - 1} more employment`}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Education */}
                {sortedEducation.length > 0 && (
                     <div id="education" className="space-y-4 pt-6 border-t">
                        <h3 className="font-semibold text-lg">Highest Education</h3>
                        <div className="space-y-4">
                            {(showAllEducation ? sortedEducation : [latestEducation]).map(education => (
                                <Card key={education.id} className="p-4">
                                    <div>
                                        {education.level === 'Class 10th' || education.level === 'Class 12th' ? (
                                            <>
                                                <p className="font-semibold">{education.level}</p>
                                                <p className="text-sm text-muted-foreground">{education.board} &bull; {education.school}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Passed in {education.passingYear}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-semibold">{education.course} in {education.specialization}</p>
                                                <p className="text-sm text-muted-foreground">{education.university}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {education.startYear} - {education.endYear} &bull; {education.courseType}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </Card>
                            ))}
                            {sortedEducation.length > 1 && (
                                <Button variant="link" className="p-0 h-auto" onClick={() => setShowAllEducation(!showAllEducation)}>
                                    {showAllEducation ? 'Show less' : `+ ${sortedEducation.length - 1} more education`}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Projects */}
                {profile.projects && profile.projects.length > 0 && (
                     <div id="projects" className="space-y-4 pt-6 border-t">
                        <h3 className="font-semibold text-lg">Projects</h3>
                        <div className="space-y-4">
                            {profile.projects.map(proj => (
                                 <Card key={proj.id} className="p-4">
                                     <div>
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold">{proj.projectTitle}</p>
                                            <Badge variant="outline" className="capitalize">{proj.projectStatus}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{proj.clientName || 'Personal Project'}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(proj.workedFrom.year, proj.workedFrom.month - 1), 'MMM yyyy')} - 
                                            {proj.projectStatus === 'finished' && proj.workedTill ? ` ${format(new Date(proj.workedTill.year, proj.workedTill.month - 1), 'MMM yyyy')}` : ' Present'}
                                        </p>
                                        {proj.projectUrl && <a href={getWebsiteUrl(proj.projectUrl)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 flex items-center gap-1"><LinkIcon className="h-3 w-3" /> Link to project</a>}
                                        <p className="text-sm mt-2">{proj.projectDetails}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}


                 <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-lg">Online Profiles</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {profile.socials?.github && (
                            <div className="flex items-start gap-3 text-sm">
                                <Github className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">GitHub</p>
                                    <Link href={getWebsiteUrl(profile.socials.github)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                        {profile.socials.github}
                                    </Link>
                                </div>
                            </div>
                        )}
                        {profile.socials?.twitter && (
                            <div className="flex items-start gap-3 text-sm">
                                <Twitter className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">Twitter / X</p>
                                    <Link href={getWebsiteUrl(profile.socials.twitter)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                        {profile.socials.twitter}
                                    </Link>
                                </div>
                            </div>
                        )}
                        {profile.socials?.linkedin && (
                            <div className="flex items-start gap-3 text-sm">
                                <Linkedin className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">LinkedIn</p>
                                    <Link href={getWebsiteUrl(profile.socials.linkedin)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                        {profile.socials.linkedin}
                                    </Link>
                                </div>
                            </div>
                        )}
                         {profile.socials?.naukri && (
                            <div className="flex items-start gap-3 text-sm">
                                <Briefcase className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">Naukri.com</p>
                                    <Link href={getWebsiteUrl(profile.socials.naukri)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                        {profile.socials.naukri}
                                    </Link>
                                </div>
                            </div>
                        )}
                        {profile.socials?.glassdoor && (
                            <div className="flex items-start gap-3 text-sm">
                                <Building2 className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">Glassdoor</p>
                                    <Link href={getWebsiteUrl(profile.socials.glassdoor)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                        {profile.socials.glassdoor}
                                    </Link>
                                </div>
                            </div>
                        )}
                        {profile.socials?.indeed && (
                            <div className="flex items-start gap-3 text-sm">
                                <Briefcase className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">Indeed</p>
                                    <Link href={getWebsiteUrl(profile.socials.indeed)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                        {profile.socials.indeed}
                                    </Link>
                                </div>
                            </div>
                        )}
                          {profile.portfolio && (
                            <div className="flex items-start gap-3 text-sm">
                                <Globe className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">Portfolio</p>
                                    <Link href={getWebsiteUrl(profile.portfolio)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                        {profile.portfolio}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Personal Details */}
                 <div id="personal-details" className="space-y-4 pt-6 border-t">
                    <h3 className="font-semibold text-lg">Personal Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-2"><Cake className="h-4 w-4" /> Date of Birth</p>
                            <p className="font-medium">{profile.dob ? format(new Date(profile.dob), 'PPP') : 'Not specified'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-2"><UserSquare className="h-4 w-4" /> Gender</p>
                            <p className="font-medium">{profile.gender || 'Not specified'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-2"><Hash className="h-4 w-4" /> Marital Status</p>
                            <p className="font-medium">{profile.maritalStatus || 'Not specified'}</p>
                        </div>
                         <div className="space-y-1 col-span-2">
                            <p className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> Address</p>
                            <p className="font-medium whitespace-pre-line">{profile.permanentAddress ? `${profile.permanentAddress.address}\n${profile.permanentAddress.city}, ${profile.permanentAddress.state} - ${profile.permanentAddress.pincode}` : 'Not specified'}</p>
                        </div>
                         {profile.languages && profile.languages.length > 0 && (
                            <div className="space-y-2 col-span-2">
                                <p className="text-sm text-muted-foreground flex items-center gap-2"><Languages className="h-4 w-4" /> Languages</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.languages.map((lang, index) => <Badge key={index} variant="secondary">{lang.language} ({lang.proficiency})</Badge>)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                </>
            )}

            {profile.role === 'company' && (
                <>
                {/* Section 2: About & Core Details */}
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold">Company Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 text-sm">
                            <Building className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                            <div>
                                <p className="text-muted-foreground">Company Size</p>
                                <p className="font-medium">{getCompanySizeDisplay(profile.companySize)}</p>
                            </div>
                        </div>
                        {profile.foundedYear && (
                            <div className="flex items-start gap-3 text-sm">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">Founded</p>
                                    <p className="font-medium">{profile.foundedYear}</p>
                                </div>
                            </div>
                        )}
                        {profile.companyType && (
                            <div className="flex items-start gap-3 text-sm">
                                <Info className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">Company Type</p>
                                    <p className="font-medium">{profile.companyType}</p>
                                </div>
                            </div>
                        )}
                        {profile.website && (
                            <div className="flex items-start gap-3 text-sm">
                                <Globe className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">Website</p>
                                    <Link href={getWebsiteUrl(profile.website)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                        {profile.website}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {profile.aboutCompany && (
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold">About Company</h3>
                        <div className="text-sm text-muted-foreground space-y-2">
                            <p className={cn(!isAboutExpanded && "line-clamp-3")}>
                                {profile.aboutCompany}
                            </p>
                            <Button variant="link" size="sm" onClick={() => setIsAboutExpanded(!isAboutExpanded)} className="p-0 h-auto text-dash-primary">
                                {isAboutExpanded ? 'Show Less' : 'Show More'}
                                {isAboutExpanded ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                )}
                {selectedBenefits.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold">Benefits</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {selectedBenefits.map(benefit => (
                                <Card key={benefit.id} className="p-4 flex flex-col items-center justify-center text-center gap-2">
                                    <benefit.icon className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm font-medium">{benefit.label}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
                {/* Section 3: Company Links */}
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold">Company Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.socials?.linkedin && (
                            <div className="flex items-start gap-3 text-sm">
                                <Linkedin className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">LinkedIn</p>
                                    <Link href={getWebsiteUrl(profile.socials.linkedin)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                        {profile.socials.linkedin}
                                    </Link>
                                </div>
                            </div>
                        )}
                        {profile.socials?.twitter && (
                            <div className="flex items-start gap-3 text-sm">
                                <Twitter className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">Twitter / X</p>
                                    <Link href={getWebsiteUrl(profile.socials.twitter)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                        {profile.socials.twitter}
                                    </Link>
                                </div>
                            </div>
                        )}
                        {profile.socials?.naukri && (
                            <div className="flex items-start gap-3 text-sm">
                                <Briefcase className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">Naukri.com</p>
                                    <Link href={getWebsiteUrl(profile.socials.naukri)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                        {profile.socials.naukri}
                                    </Link>
                                </div>
                            </div>
                        )}
                        {profile.socials?.glassdoor && (
                            <div className="flex items-start gap-3 text-sm">
                                <Building2 className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                <div>
                                    <p className="text-muted-foreground">Glassdoor</p>
                                    <Link href={getWebsiteUrl(profile.socials.glassdoor)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                        {profile.socials.glassdoor}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Section 4: Company Contact */}
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold">Company Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 text-sm">
                            <Phone className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                            <div>
                                <p className="text-muted-foreground">Contact Phone</p>
                                <p className="font-medium">{profile.helplinePhone || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <Mail className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                            <div>
                                <p className="text-muted-foreground">Contact Email</p>
                                <p className="font-medium">{profile.helplineEmail || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                </>
            )}
        </CardContent>
    </Card>
  );
}
