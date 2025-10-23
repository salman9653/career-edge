

'use client';
import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUserProfileAction, removeDisplayPictureAction, updateDisplayPictureAction } from '@/app/actions';
import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Edit, Globe, Linkedin, Phone, Mail, Briefcase, Building2, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { CompanySize, Socials } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { allBenefits } from '@/lib/benefits';

const initialState = {
  error: null,
  success: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Save Changes'}
    </Button>
  );
}

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}


export function UpdateProfileCard({ 
    profile,
    onSave, 
    onCancel,
    onAvatarChange
}: { 
    profile: any,
    onSave: (updatedProfile: any) => void, 
    onCancel: () => void ,
    onAvatarChange: (url: string | null) => void
}) {
  const [state, formAction] = useActionState(updateUserProfileAction, initialState);
  const { session, updateSession } = useSession();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAvatarPending, startAvatarTransition] = useTransition();

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success',
        description: state.success,
      });
      const formData = new FormData(formRef.current!);
      const newName = formData.get('name') as string;
      const newPhone = formData.get('phone') as string;
      
      const updatedProfile: any = { name: newName, phone: newPhone };

      if(profile.role === 'company') {
        const companySizeValue = formData.get('companySize') as string;
        const [size, employees] = companySizeValue.split('|');
        updatedProfile.companySize = { size, employees };
        updatedProfile.website = formData.get('website') as string;
        updatedProfile.socials = {
            linkedin: formData.get('linkedin') as string,
            twitter: formData.get('twitter') as string,
            naukri: formData.get('naukri') as string,
            glassdoor: formData.get('glassdoor') as string,
        };
        updatedProfile.helplinePhone = formData.get('helplinePhone') as string;
        updatedProfile.helplineEmail = formData.get('helplineEmail') as string;
        updatedProfile.aboutCompany = formData.get('aboutCompany') as string;
        updatedProfile.companyType = formData.get('companyType') as string;
        updatedProfile.foundedYear = formData.get('foundedYear') as string;
        updatedProfile.tags = (formData.get('tags') as string).split(',').map(tag => tag.trim());
        updatedProfile.benefits = formData.getAll('benefits') as string[];
      }
      onSave(updatedProfile);
    }
  }, [state.success, toast, onSave, profile.role]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && session?.uid) {
      startAvatarTransition(async () => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = reader.result as string;
            const formData = new FormData();
            // In a real app, you'd upload to storage, but for proto let's send base64
            // For simplicity, we'll just update it in the user doc directly as a data URI
            const result = await updateDisplayPictureAction(formData); // This action needs to be adapted for base64
            onAvatarChange(base64);
            updateSession({ displayImageUrl: base64 });
            toast({ title: 'Avatar updated!' });
        };
      });
    }
  };

  const handleRemovePicture = () => {
      if(session?.uid) {
        startAvatarTransition(async () => {
            const result = await removeDisplayPictureAction(session.uid);
            if (result.success) {
                toast({ title: 'Avatar removed' });
                onAvatarChange(null);
                updateSession({ displayImageUrl: null });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
        });
      }
  }
  
  const companySizeValue = profile.companySize ? `${profile.companySize.size}|${profile.companySize.employees}` : undefined;

  return (
    <div className="grid grid-cols-[250px_1fr] gap-6">
        <nav className="grid gap-4 text-sm text-muted-foreground sticky top-20 self-start">
            <a href="#profile-summary" className="font-semibold text-primary">Profile Summary</a>
            <a href="#resume">Resume</a>
            <a href="#key-skills">Key Skills</a>
            <a href="#employment">Employment</a>
            <a href="#education">Education</a>
            <a href="#projects">Projects</a>
            <a href="#online-profiles">Online Profiles</a>
            <a href="#personal-details">Personal Details</a>
        </nav>
        <div className="grid gap-6">
            <Card>
                <CardContent className="p-6">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold leading-none tracking-tight">Edit Profile</h2>
                        <p className="text-sm text-muted-foreground">Update your personal and professional information.</p>
                    </div>
                    
                    <form action={formAction} ref={formRef} className="space-y-8">
                    <input type="hidden" name="userId" value={session?.uid} />
                    <input type="hidden" name="role" value={profile.role} />

                        {/* Personal & Contact Section */}
                        <section id="personal-details" className="space-y-4">
                            <h3 className="text-lg font-semibold">Personal & Contact</h3>
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={profile.displayImageUrl ?? undefined} />
                                        <AvatarFallback className="text-3xl bg-dash-primary text-dash-primary-foreground">{getInitials(profile.name)}</AvatarFallback>
                                    </Avatar>
                                    {isAvatarPending && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/gif"
                                    />
                                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isAvatarPending}>
                                        <Edit className="mr-2 h-4 w-4" /> {profile.displayImageUrl ? 'Change' : 'Add'} Picture
                                    </Button>
                                    {profile.displayImageUrl && (
                                        <Button variant="destructive" onClick={handleRemovePicture} disabled={isAvatarPending}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" defaultValue={profile.name} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" name="phone" defaultValue={profile.phone ?? ''} type="tel" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="address">City / Town</Label>
                                    <Input id="address" name="address" defaultValue={profile.address ?? ''} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select name="gender" defaultValue={profile.gender}>
                                        <SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="maritalStatus">Marital Status</Label>
                                    <Select name="maritalStatus" defaultValue={profile.maritalStatus}>
                                        <SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Single">Single</SelectItem>
                                            <SelectItem value="Married">Married</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <Input id="dob" name="dob" type="date" defaultValue={profile.dob} />
                                </div>
                            </div>
                        </section>

                        {/* Career Profile Section */}
                        <section id="career-profile" className="space-y-4 pt-6 border-t">
                            <h3 className="text-lg font-semibold">Career Profile</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="jobTitle">Current Job Title</Label>
                                    <Input id="jobTitle" name="jobTitle" defaultValue={profile.jobTitle ?? ''} placeholder="e.g., Software Engineer"/>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="currentCompany">Current Company</Label>
                                    <Input id="currentCompany" name="currentCompany" defaultValue={profile.currentCompany ?? ''} placeholder="e.g., Google" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="workStatus">Work Status</Label>
                                    <Select name="workStatus" defaultValue={profile.workStatus}>
                                        <SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fresher">Fresher</SelectItem>
                                            <SelectItem value="experienced">Experienced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="experience">Total Experience</Label>
                                    <Select name="experience" defaultValue={profile.experience}>
                                        <SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0-1 Year">0-1 Year</SelectItem>
                                            <SelectItem value="1-3 years">1-3 years</SelectItem>
                                            <SelectItem value="3-5 years">3-5 years</SelectItem>
                                            <SelectItem value="5-7 years">5-7 years</SelectItem>
                                            <SelectItem value="7+ years">7+ years</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="noticePeriod">Notice Period</Label>
                                    <Select name="noticePeriod" defaultValue={profile.noticePeriod}>
                                        <SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Serving">Serving Notice Period</SelectItem>
                                            <SelectItem value="15 days">15 Days or less</SelectItem>
                                            <SelectItem value="1 month">1 Month</SelectItem>
                                            <SelectItem value="2 months">2 Months</SelectItem>
                                            <SelectItem value="3 months">3 Months</SelectItem>
                                            <SelectItem value="more">More than 3 months</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="currentSalary">Current Salary (LPA)</Label>
                                    <Input id="currentSalary" name="currentSalary" type="number" step="0.1" defaultValue={profile.currentSalary ?? ''} placeholder="e.g., 12.5"/>
                                </div>
                            </div>
                        </section>
                        
                        {/* Profile Summary section */}
                        <section id="profile-summary" className="pt-6 border-t space-y-2">
                            <h3 className="text-lg font-semibold">Profile Summary</h3>
                            <Textarea name="profileSummary" defaultValue={profile.profileSummary ?? ''} placeholder="Tell us about yourself..." className="min-h-24"/>
                        </section>

                        {/* Online Profiles Section */}
                        <section id="online-profiles" className="space-y-4 pt-6 border-t">
                            <h3 className="text-lg font-semibold">Online Profiles</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="linkedin">LinkedIn</Label>
                                    <div className="relative">
                                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="linkedin" name="linkedin" defaultValue={profile.linkedin ?? ''} placeholder="https://linkedin.com/in/..." className="pl-9" />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="naukri">Naukri.com</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="naukri" name="naukri" defaultValue={profile.naukri ?? ''} placeholder="Profile URL" className="pl-9" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {state?.error && <Alert variant="destructive" className="mt-2"><AlertDescription>{state.error}</AlertDescription></Alert>}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
                            <SubmitButton />
                        </div>
                    </form>
                </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
