

'use client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Edit, XCircle, Building, Globe, Linkedin, Twitter, Phone, Mail, Briefcase, Building2, UserCog, Shield, Info, ChevronDown, ChevronUp, Calendar, Hash } from 'lucide-react';
import type { CompanySize, Socials } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { allBenefits } from '@/lib/benefits';
import { Card } from '@/components/ui/card';

interface ProfileDisplayCardProps {
    name: string;
    email: string;
    phone: string;
    avatarUrl?: string | null;
    emailVerified: boolean;
    onEdit: () => void;
    role: 'candidate' | 'company' | 'admin' | 'manager';
    companySize?: CompanySize;
    website?: string;
    socials?: Socials;
    helplinePhone?: string;
    helplineEmail?: string;
    designation?: string;
    permissions_role?: string;
    aboutCompany?: string;
    companyType?: string;
    foundedYear?: string;
    tags?: string[];
    benefits?: string[];
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

export function ProfileDisplayCard({ name, email, phone, avatarUrl, emailVerified, onEdit, role, companySize, website, socials, helplinePhone, helplineEmail, designation, permissions_role, aboutCompany, companyType, foundedYear, tags, benefits }: ProfileDisplayCardProps) {
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const selectedBenefits = allBenefits.filter(b => benefits?.includes(b.id));
  
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-semibold leading-none tracking-tight">Profile Information</h2>
                <p className="text-sm text-muted-foreground">Your personal details and contact information.</p>
            </div>
            <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
            </Button>
        </div>

        {/* Section 1: Basic Info */}
        <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback className="text-3xl bg-dash-primary text-dash-primary-foreground">{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
                <h2 className="text-2xl font-bold">{name}</h2>
                <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">{email}</p>
                    {emailVerified ? (
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
                 {phone && <p className="text-muted-foreground">{phone}</p>}
                 {role === 'manager' && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {designation && (
                            <div className="flex items-center gap-1">
                                <UserCog className="h-4 w-4" />
                                <span>{designation}</span>
                            </div>
                        )}
                         {permissions_role && (
                            <div className="flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                <span>{permissions_role}</span>
                            </div>
                        )}
                    </div>
                 )}
            </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            {tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>
        
        {role === 'company' && (
            <>
            {/* Section 2: About & Core Details */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Company Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 text-sm">
                        <Building className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                        <div>
                            <p className="text-muted-foreground">Company Size</p>
                            <p className="font-medium">{getCompanySizeDisplay(companySize)}</p>
                        </div>
                    </div>
                     {foundedYear && (
                        <div className="flex items-start gap-3 text-sm">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                            <div>
                                <p className="text-muted-foreground">Founded</p>
                                <p className="font-medium">{foundedYear}</p>
                            </div>
                        </div>
                    )}
                     {companyType && (
                        <div className="flex items-start gap-3 text-sm">
                            <Info className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                            <div>
                                <p className="text-muted-foreground">Company Type</p>
                                <p className="font-medium">{companyType}</p>
                            </div>
                        </div>
                    )}
                    {website && (
                         <div className="flex items-start gap-3 text-sm">
                            <Globe className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                            <div>
                                <p className="text-muted-foreground">Website</p>
                                <Link href={getWebsiteUrl(website)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                    {website}
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {aboutCompany && (
                 <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold">About Company</h3>
                     <div className="text-sm text-muted-foreground space-y-2">
                        <p className={cn(!isAboutExpanded && "line-clamp-3")}>
                            {aboutCompany}
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
                    {socials?.linkedin && (
                        <div className="flex items-start gap-3 text-sm">
                            <Linkedin className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                            <div>
                                <p className="text-muted-foreground">LinkedIn</p>
                                <Link href={getWebsiteUrl(socials.linkedin)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                    {socials.linkedin}
                                </Link>
                            </div>
                        </div>
                    )}
                    {socials?.twitter && (
                        <div className="flex items-start gap-3 text-sm">
                            <Twitter className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                            <div>
                                <p className="text-muted-foreground">Twitter / X</p>
                                <Link href={getWebsiteUrl(socials.twitter)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                    {socials.twitter}
                                </Link>
                            </div>
                        </div>
                    )}
                     {socials?.naukri && (
                        <div className="flex items-start gap-3 text-sm">
                            <Briefcase className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                            <div>
                                <p className="text-muted-foreground">Naukri.com</p>
                                <Link href={getWebsiteUrl(socials.naukri)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                    {socials.naukri}
                                </Link>
                            </div>
                        </div>
                    )}
                    {socials?.glassdoor && (
                        <div className="flex items-start gap-3 text-sm">
                            <Building2 className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                            <div>
                                <p className="text-muted-foreground">Glassdoor</p>
                                <Link href={getWebsiteUrl(socials.glassdoor)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                    {socials.glassdoor}
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
                            <p className="font-medium">{helplinePhone || 'Not provided'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                        <Mail className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                        <div>
                            <p className="text-muted-foreground">Contact Email</p>
                            <p className="font-medium">{helplineEmail || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
            </div>
            </>
        )}
    </div>
  );
}
