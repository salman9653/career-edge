
'use client';
import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Skeleton } from '@/components/ui/skeleton';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { CompanySize, Socials, UserProfile, Resume } from '@/lib/types';
import { MobileSearch } from '@/components/mobile-search';
import { ProfileDisplayCard } from './_components/profile-display-card';
import { UpdateProfileCard } from './_components/update-profile-card';

export default function ProfilePage() {
  const { session, loading: sessionLoading, updateSession } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (session?.uid) {
        const userDocRef = doc(db, 'users', session.uid);
        const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                let displayImageUrl = data.displayImageUrl || null;
                if(data.hasDisplayImage && !displayImageUrl) {
                    const imageDoc = await getDoc(doc(db, `users/${session.uid}/uploads/displayImage`));
                    if (imageDoc.exists()) {
                        displayImageUrl = imageDoc.data().data;
                    }
                }
                
                let resume: Resume | null = null;
                if(data.hasResume) {
                    const resumeDoc = await getDoc(doc(db, `users/${session.uid}/uploads/resume`));
                    if (resumeDoc.exists()) {
                        resume = resumeDoc.data() as Resume;
                    }
                }


                const profileData: UserProfile = {
                    uid: session.uid,
                    email: data.email || '',
                    name: data.name || session.displayName || '',
                    role: data.role,
                    phone: data.phone || '',
                    displayImageUrl: displayImageUrl,
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
                    benefits: data.benefits,
                    jobTitle: data.jobTitle,
                    currentCompany: data.currentCompany,
                    address: data.address,
                    workStatus: data.workStatus,
                    experience: data.experience,
                    noticePeriod: data.noticePeriod,
                    currentSalary: data.currentSalary,
                    resume: resume,
                    hasResume: data.hasResume || false,
                    profileSummary: data.profileSummary,
                    keySkills: data.keySkills,
                    employment: data.employment,
                    education: data.education,
                    projects: data.projects,
                    linkedin: data.linkedin,
                    naukri: data.naukri,
                    gender: data.gender,
                    maritalStatus: data.maritalStatus,
                    dob: data.dob,
                    permanentAddress: data.permanentAddress,
                    languages: data.languages,
                };
                setUserProfile(profileData);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    } else if (!sessionLoading) {
        setLoading(false);
    }
  }, [session, sessionLoading]);
  
  const handleSave = (updatedProfile: Partial<UserProfile>) => {
    if (userProfile) {
        const newProfile = { ...userProfile, ...updatedProfile };
        setUserProfile(newProfile);
        const sessionUpdate: Partial<UserProfile> = { ...updatedProfile };
        
        if (updatedProfile.name) {
            sessionUpdate.displayName = updatedProfile.name;
        }

        updateSession(sessionUpdate);
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
                <div className="mx-auto grid w-full max-w-6xl gap-6">
                    <Skeleton className="h-[600px] w-full" />
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

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role={session.role} user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">{isEditing ? 'Edit Profile' : getProfileTitle(userProfile?.role)}</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6 custom-scrollbar">
            <div className="mx-auto w-full max-w-6xl flex-1 flex">
                 {isEditing ? (
                    <UpdateProfileCard
                        profile={userProfile}
                        onSave={handleSave}
                        onCancel={() => setIsEditing(false)}
                        onAvatarChange={handleAvatarUpdate}
                    />
                 ) : (
                    <ProfileDisplayCard
                        profile={userProfile}
                        onEdit={() => setIsEditing(true)}
                    />
                 )}
            </div>
        </main>
      </div>
    </div>
  );
}
