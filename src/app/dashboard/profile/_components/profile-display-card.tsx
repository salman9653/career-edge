

'use client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Edit, XCircle, Building, Globe, Linkedin, Phone, Mail, Briefcase, Building2, UserCog, Shield, Info, ChevronDown, ChevronUp, Calendar, Hash, User } from 'lucide-react';
import type { CompanySize, Socials } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { allBenefits } from '@/lib/benefits';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { UserProfile } from '../page';

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

export function ProfileDisplayCard({ profile, onEdit }: ProfileDisplayCardProps) {
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const selectedBenefits = allBenefits.filter(b => profile.benefits?.includes(b.id));
  
  return (
    <Card>
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
        <CardContent className="space-y-8">
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
                 {/* Key Skills */}
                {profile.keySkills && profile.keySkills.length > 0 && (
                <div id="key-skills" className="space-y-4 pt-6 border-t">
                    <h3 className="font-semibold text-lg">Key Skills</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        {profile.keySkills?.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                    </div>
                </div>
                )}
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
