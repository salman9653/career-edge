
'use client';
import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUserProfileAction, removeDisplayPictureAction, updateDisplayPictureAction } from '@/app/actions';
import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Edit, Globe, Linkedin, Twitter, Phone, Mail, Briefcase, Building2 } from 'lucide-react';
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
    name, 
    phone,
    avatarUrl,
    role,
    companySize,
    website,
    socials,
    helplinePhone,
    helplineEmail,
    aboutCompany,
    companyType,
    foundedYear,
    tags,
    benefits,
    onSave, 
    onCancel,
    onAvatarChange
}: { 
    name: string, 
    phone: string, 
    avatarUrl: string | null,
    role: 'candidate' | 'company' | 'admin',
    companySize?: CompanySize,
    website?: string,
    socials?: Socials,
    helplinePhone?: string,
    helplineEmail?: string,
    aboutCompany?: string,
    companyType?: string,
    foundedYear?: string,
    tags?: string[],
    benefits?: string[],
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

      if(role === 'company') {
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
  }, [state.success, toast, onSave, role]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && session?.uid) {
      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("userId", session.uid);
      startAvatarTransition(async () => {
        const result = await updateDisplayPictureAction(formData);
        if (result.success && result.url) {
            toast({ title: 'Avatar updated!' });
            onAvatarChange(result.url);
            updateSession({ displayImageUrl: result.url });
        } else {
            toast({ variant: 'destructive', title: 'Upload failed', description: result.error });
        }
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
  
  const companySizeValue = companySize ? `${companySize.size}|${companySize.employees}` : undefined;

  return (
    <Card>
        <CardContent className="p-6">
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold leading-none tracking-tight">Edit Profile</h2>
                <p className="text-sm text-muted-foreground">Update your display picture, name and contact information.</p>
            </div>
            <div className="flex items-center gap-6">
                <div className="relative">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={avatarUrl ?? undefined} />
                        <AvatarFallback className="text-3xl bg-dash-primary text-dash-primary-foreground">{getInitials(name)}</AvatarFallback>
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
                        <Edit className="mr-2 h-4 w-4" /> {avatarUrl ? 'Change' : 'Add'} Picture
                    </Button>
                    {avatarUrl && (
                         <Button variant="destructive" onClick={handleRemovePicture} disabled={isAvatarPending}>
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </Button>
                    )}
                </div>
            </div>

            <form action={formAction} ref={formRef} className="space-y-4">
                <input type="hidden" name="userId" value={session?.uid} />
                <input type="hidden" name="role" value={role} />
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={name} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" defaultValue={phone ?? ''} type="tel" />
                </div>
                
                 {role === 'company' && (
                    <>
                    <div className="space-y-4 pt-4 border-t">
                        <div className="grid gap-2">
                            <Label htmlFor="aboutCompany" className="font-semibold">About Company</Label>
                            <Textarea id="aboutCompany" name="aboutCompany" defaultValue={aboutCompany} placeholder="Describe your company..." className="min-h-24"/>
                        </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold">Company Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="companySize">Company Size</Label>
                                <Select name="companySize" defaultValue={companySizeValue}>
                                    <SelectTrigger><SelectValue placeholder="Select size..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Startup|1-100">Startup (1-100)</SelectItem>
                                        <SelectItem value="Medium|100-500">Medium (100-500)</SelectItem>
                                        <SelectItem value="Enterprise|500+">Enterprise (500+)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="website">Website</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="website" name="website" defaultValue={website ?? ''} className="pl-9"/>
                                </div>
                            </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <Label htmlFor="companyType">Company Type</Label>
                                <Input id="companyType" name="companyType" defaultValue={companyType ?? ''} placeholder="e.g. Private, Public, Government" />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="foundedYear">Founded Year</Label>
                                <Input id="foundedYear" name="foundedYear" defaultValue={foundedYear ?? ''} placeholder="e.g. 2010" />
                            </div>
                         </div>
                          <div className="grid gap-2">
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input id="tags" name="tags" defaultValue={tags?.join(', ') ?? ''} placeholder="e.g. B2B, IT Services, Consulting" />
                        </div>
                        <div className="space-y-4 pt-4 border-t">
                          <h3 className="font-semibold">Benefits</h3>
                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {allBenefits.map(benefit => (
                                <div key={benefit.id} className="flex items-center gap-2">
                                    <Checkbox 
                                        id={`benefit-${benefit.id}`} 
                                        name="benefits"
                                        value={benefit.id}
                                        defaultChecked={benefits?.includes(benefit.id)}
                                    />
                                    <Label htmlFor={`benefit-${benefit.id}`} className="font-normal flex items-center gap-2">
                                        <benefit.icon className="h-4 w-4 text-muted-foreground" />
                                        {benefit.label}
                                    </Label>
                                </div>
                              ))}
                          </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <Label htmlFor="linkedin">LinkedIn</Label>
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="linkedin" name="linkedin" defaultValue={socials?.linkedin ?? ''} placeholder="https://linkedin.com/company/..." className="pl-9" />
                                </div>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="twitter">Twitter / X</Label>
                                <div className="relative">
                                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="twitter" name="twitter" defaultValue={socials?.twitter ?? ''} placeholder="https://x.com/..." className="pl-9" />
                                </div>
                            </div>
                         </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <Label htmlFor="naukri">Naukri.com</Label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="naukri" name="naukri" defaultValue={socials?.naukri ?? ''} placeholder="https://naukri.com/company/..." className="pl-9" />
                                </div>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="glassdoor">Glassdoor</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="glassdoor" name="glassdoor" defaultValue={socials?.glassdoor ?? ''} placeholder="https://glassdoor.com/overview/..." className="pl-9" />
                                </div>
                            </div>
                         </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold">Company Contact Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="helplinePhone">Contact Phone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="helplinePhone" name="helplinePhone" defaultValue={helplinePhone ?? ''} className="pl-9" />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="helplineEmail">Contact Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="helplineEmail" name="helplineEmail" type="email" defaultValue={helplineEmail ?? ''} className="pl-9" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {state?.error && <Alert variant="destructive" className="mt-2"><AlertDescription>{state.error}</AlertDescription></Alert>}
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
                    <SubmitButton />
                </div>
            </form>
        </div>
        </CardContent>
    </Card>
  );
}
