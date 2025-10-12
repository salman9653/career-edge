
'use client';
import { useState, useEffect, useTransition } from 'react';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileDisplayCard } from './_components/profile-display-card';
import { UpdateProfileCard } from './_components/update-profile-card';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { CompanySize, Socials } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Building, Globe, Linkedin, Twitter, Phone, Mail, Briefcase, Building2, ChevronDown, ChevronUp, Info, Calendar } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { allBenefits } from '@/lib/benefits';
import { MobileSearch } from '@/components/mobile-search';

interface UserProfile {
    uid: string;
    email: string;
    name: string;
    role: 'candidate' | 'company' | 'admin' | 'manager';
    phone: string;
    displayImageUrl: string | null;
    emailVerified: boolean;
    companySize?: CompanySize;
    website?: string;
    socials?: Socials;
    helplinePhone?: string;
    helplineEmail?: string;
    company_uid?: string;
    designation?: string;
    permissions_role?: string;
    aboutCompany?: string;
    companyType?: string;
    foundedYear?: string;
    tags?: string[];
    benefits?: string[];
}

interface CompanyProfile extends UserProfile {
    role: 'company';
}

export default function ProfilePage() {
  const { session, loading: sessionLoading, updateSession } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCompanyAboutExpanded, setIsCompanyAboutExpanded] = useState(false);
  
  useEffect(() => {
    if (session?.uid) {
        const fetchUserProfile = async () => {
            setLoading(true);
            const userDocRef = doc(db, 'users', session.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                const profileData: UserProfile = {
                    uid: session.uid,
                    email: data.email || '',
                    name: data.name || session.displayName || '',
                    role: data.role,
                    phone: data.phone || '',
                    displayImageUrl: data.displayImageUrl || null,
                    emailVerified: session.emailVerified || false,
                    companySize: data.companySize,
                    website: data.website,
                    socials: data.socials,
                    helplinePhone: data.helplinePhone,
                    helplineEmail: data.helplineEmail,
                    company_uid: data.company_uid,
                    designation: data.designation,
                    permissions_role: data.permissions_role,
                    aboutCompany: data.aboutCompany,
                    companyType: data.companyType,
                    foundedYear: data.foundedYear,
                    tags: data.tags,
                    benefits: data.benefits
                };
                setUserProfile(profileData);
                
                if (profileData.role === 'manager' && profileData.company_uid) {
                    const companyDocRef = doc(db, 'users', profileData.company_uid);
                    const companyDocSnap = await getDoc(companyDocRef);
                    if(companyDocSnap.exists()){
                        const companyData = companyDocSnap.data();
                        setCompanyProfile({
                            uid: companyDocSnap.id,
                            email: companyData.email,
                            name: companyData.name,
                            role: 'company',
                            phone: companyData.phone,
                            displayImageUrl: companyData.displayImageUrl,
                            emailVerified: false, // Not relevant for this display
                            companySize: companyData.companySize,
                            website: companyData.website,
                            socials: companyData.socials,
                            helplinePhone: companyData.helplinePhone,
                            helplineEmail: companyData.helplineEmail,
                            aboutCompany: companyData.aboutCompany,
                            companyType: companyData.companyType,
                            foundedYear: companyData.foundedYear,
                            tags: companyData.tags,
                            benefits: companyData.benefits,
                        });
                    }
                }
            }
            setLoading(false);
        };
        fetchUserProfile();
    } else if (!sessionLoading) {
        setLoading(false);
    }
  }, [session, sessionLoading]);
  
  const handleSave = (updatedProfile: Partial<UserProfile>) => {
    if (userProfile) {
        const newProfile = { ...userProfile, ...updatedProfile };
        setUserProfile(newProfile);
        updateSession({ 
            displayName: updatedProfile.name,
            phone: updatedProfile.phone,
            companySize: updatedProfile.companySize,
            website: updatedProfile.website,
            socials: updatedProfile.socials,
            helplinePhone: updatedProfile.helplinePhone,
            helplineEmail: updatedProfile.helplineEmail,
            aboutCompany: updatedProfile.aboutCompany,
            companyType: updatedProfile.companyType,
            foundedYear: updatedProfile.foundedYear,
            tags: updatedProfile.tags,
            benefits: updatedProfile.benefits,
        });
    }
    setIsEditing(false);
  }

  const handleAvatarUpdate = (newUrl: string | null) => {
     if (userProfile) {
        const newProfile = { ...userProfile, displayImageUrl: newUrl };
        setUserProfile(newProfile);
        updateSession({ displayImageUrl: newUrl });
    }
  }

  const getProfileTitle = (role: 'candidate' | 'company' | 'admin' | 'manager' | undefined) => {
    if (!role) return 'Profile';
    switch (role) {
      case 'candidate':
        return 'Candidate Profile';
      case 'company':
        return 'Company Profile';
      case 'manager':
        return 'Manager Profile';
      case 'admin':
        return 'Admin Profile';
      default:
        return 'Profile';
    }
  }

  const getWebsiteUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `https://${url}`;
  };

  if (sessionLoading || loading) {
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {session && <DashboardSidebar role={session.role} user={session} />}
        <div className="flex flex-col max-h-screen">
            <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
                <Skeleton className="h-8 w-32" />
                 <MobileSearch />
            </header>
            <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
                <div className="mx-auto grid w-full max-w-4xl gap-6">
                    <Skeleton className="h-64 w-full" />
                </div>
            </main>
        </div>
      </div>
    );
  }

  if (!session || !userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>User profile not found. Please try logging in again.</p>
      </div>
    );
  }

  const getCompanySizeDisplay = (size?: CompanySize) => {
    if (!size || !size.size) return "Not specified";
    return `${size.size} (${size.employees} employees)`;
  }
  const selectedCompanyBenefits = allBenefits.filter(b => companyProfile?.benefits?.includes(b.id));

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role={session.role} user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">{getProfileTitle(userProfile?.role)}</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
            <div className="mx-auto grid w-full max-w-4xl items-start gap-6">
                 {isEditing ? (
                    <UpdateProfileCard
                        name={userProfile.name}
                        phone={userProfile.phone}
                        avatarUrl={userProfile.displayImageUrl}
                        role={userProfile.role}
                        companySize={userProfile.companySize}
                        website={userProfile.website}
                        socials={userProfile.socials}
                        helplinePhone={userProfile.helplinePhone}
                        helplineEmail={userProfile.helplineEmail}
                        aboutCompany={userProfile.aboutCompany}
                        companyType={userProfile.companyType}
                        foundedYear={userProfile.foundedYear}
                        tags={userProfile.tags}
                        benefits={userProfile.benefits}
                        onSave={handleSave}
                        onCancel={() => setIsEditing(false)}
                        onAvatarChange={handleAvatarUpdate}
                    />
                 ) : (
                    <Card>
                        <CardContent className="p-6">
                            <ProfileDisplayCard 
                                name={userProfile.name}
                                email={userProfile.email}
                                phone={userProfile.phone}
                                avatarUrl={userProfile.displayImageUrl}
                                emailVerified={userProfile.emailVerified}
                                onEdit={() => setIsEditing(true)}
                                role={userProfile.role}
                                companySize={userProfile.companySize}
                                website={userProfile.website}
                                socials={userProfile.socials}
                                helplinePhone={userProfile.helplinePhone}
                                helplineEmail={userProfile.helplineEmail}
                                designation={userProfile.designation}
                                permissions_role={userProfile.permissions_role}
                                aboutCompany={userProfile.aboutCompany}
                                companyType={userProfile.companyType}
                                foundedYear={userProfile.foundedYear}
                                tags={userProfile.tags}
                                benefits={userProfile.benefits}
                            />
                        </CardContent>
                    </Card>
                 )}

                 {userProfile.role === 'manager' && companyProfile && !isEditing && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Information</CardTitle>
                            <CardDescription>Details of the company you are associated with.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="flex items-center gap-6">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={companyProfile.displayImageUrl ?? undefined} />
                                    <AvatarFallback className="text-xl bg-dash-primary text-dash-primary-foreground">{getInitials(companyProfile.name)}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <h2 className="text-xl font-bold">{companyProfile.name}</h2>
                                    <p className="text-muted-foreground">{companyProfile.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {companyProfile.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-semibold">Company Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="flex items-start gap-3 text-sm">
                                        <Building className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                        <div>
                                            <p className="text-muted-foreground">Company Size</p>
                                            <p className="font-medium">{getCompanySizeDisplay(companyProfile.companySize)}</p>
                                        </div>
                                    </div>
                                    {companyProfile.foundedYear && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <Calendar className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                            <div>
                                                <p className="text-muted-foreground">Founded</p>
                                                <p className="font-medium">{companyProfile.foundedYear}</p>
                                            </div>
                                        </div>
                                    )}
                                    {companyProfile.companyType && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <Info className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                            <div>
                                                <p className="text-muted-foreground">Company Type</p>
                                                <p className="font-medium">{companyProfile.companyType}</p>
                                            </div>
                                        </div>
                                    )}
                                    {companyProfile.website && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <Globe className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                            <div>
                                                <p className="text-muted-foreground">Website</p>
                                                <Link href={getWebsiteUrl(companyProfile.website)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                                    {companyProfile.website}
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {companyProfile.aboutCompany && (
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-semibold">About Company</h3>
                                    <div className="text-sm text-muted-foreground space-y-2">
                                        <p className={cn(!isCompanyAboutExpanded && "line-clamp-3")}>
                                            {companyProfile.aboutCompany}
                                        </p>
                                        <Button variant="link" size="sm" onClick={() => setIsCompanyAboutExpanded(!isCompanyAboutExpanded)} className="p-0 h-auto text-dash-primary">
                                            {isCompanyAboutExpanded ? 'Show Less' : 'Show More'}
                                            {isCompanyAboutExpanded ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {selectedCompanyBenefits.length > 0 && (
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-semibold">Benefits</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {selectedCompanyBenefits.map(benefit => (
                                            <Card key={benefit.id} className="p-4 flex flex-col items-center justify-center text-center gap-2">
                                                <benefit.icon className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-sm font-medium">{benefit.label}</p>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                             <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-semibold">Company Links</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {companyProfile.socials?.linkedin && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <Linkedin className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                            <div>
                                                <p className="text-muted-foreground">LinkedIn</p>
                                                <Link href={getWebsiteUrl(companyProfile.socials.linkedin)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                                    {companyProfile.socials.linkedin}
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                    {companyProfile.socials?.twitter && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <Twitter className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                            <div>
                                                <p className="text-muted-foreground">Twitter / X</p>
                                                <Link href={getWebsiteUrl(companyProfile.socials.twitter)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                                    {companyProfile.socials.twitter}
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                    {companyProfile.socials?.naukri && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <Briefcase className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                            <div>
                                                <p className="text-muted-foreground">Naukri.com</p>
                                                <Link href={getWebsiteUrl(companyProfile.socials.naukri)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                                    {companyProfile.socials.naukri}
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                    {companyProfile.socials?.glassdoor && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <Building2 className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                            <div>
                                                <p className="text-muted-foreground">Glassdoor</p>
                                                <Link href={getWebsiteUrl(companyProfile.socials.glassdoor)} target="_blank" rel="noopener noreferrer" className="font-medium text-dash-primary hover:underline break-all">
                                                    {companyProfile.socials.glassdoor}
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                           
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-semibold">Company Contact</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 text-sm">
                                        <Phone className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                        <div>
                                            <p className="text-muted-foreground">Contact Phone</p>
                                            <p className="font-medium">{companyProfile.helplinePhone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm">
                                        <Mail className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                        <div>
                                            <p className="text-muted-foreground">Contact Email</p>
                                            <p className="font-medium">{companyProfile.helplineEmail || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                 )}
            </div>
        </main>
      </div>
    </div>
  );
}
