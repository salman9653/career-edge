
'use client';
import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUserProfileAction, updateDisplayPictureAction, removeDisplayPictureAction } from '@/app/actions';
import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Edit, Globe, Linkedin, Phone, Mail, Briefcase, Building2, User, Upload, FileText, X, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { CompanySize, Socials } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { DragEvent } from 'react';
import type { UserProfile } from '../page';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';


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
  const [activeSection, setActiveSection] = useState('profile-details');
  
  const [existingResume, setExistingResume] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [skills, setSkills] = useState(profile.keySkills || []);
  const [skillInput, setSkillInput] = useState('');
  const suggestedSkills = ['React', 'Node.js', 'TypeScript', 'GraphQL', 'Docker', 'AWS', 'Project Management', 'Agile'];

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success',
        description: state.success,
      });
      const formData = new FormData(formRef.current!);
      const newProfile: Partial<UserProfile> = {};
        for (const [key, value] of formData.entries()) {
            if (key.includes('.')) {
                const [parent, child] = key.split('.');
                // @ts-ignore
                if (!newProfile[parent]) newProfile[parent] = {};
                // @ts-ignore
                newProfile[parent][child] = value;
            } else {
                 // @ts-ignore
                newProfile[key] = value;
            }
        }
      onSave(newProfile);
    }
  }, [state.success, toast, onSave, profile.role]);

   const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && session?.uid) {
      startAvatarTransition(async () => {
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('userId', session.uid);
        const result = await updateDisplayPictureAction(formData);
        if (result.success && result.url) {
            onAvatarChange(result.url);
            updateSession({ displayImageUrl: result.url });
            toast({ title: 'Avatar updated!' });
        } else {
            toast({ title: 'Upload failed', description: result.error, variant: 'destructive' });
        }
      });
    }
  };

  const handleRemoveAvatar = async () => {
    if (!session?.uid) return;
    startAvatarTransition(async () => {
        const result = await removeDisplayPictureAction(session.uid);
         if (result.success) {
            onAvatarChange(null);
            updateSession({ displayImageUrl: null });
            toast({ title: 'Avatar removed!' });
        } else {
            toast({ title: 'Failed to remove avatar', description: result.error, variant: 'destructive' });
        }
    });
  }

  const handleResumeFileSelect = (file: File | null) => {
    if (file && (file.type.includes('pdf') || file.type.includes('document'))) {
        setExistingResume(file);
    } else {
        setExistingResume(null);
    }
  };

  const handleResumeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleResumeFileSelect(event.target.files?.[0] || null);
  };

  const handleResumeDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files?.[0]) {
        handleResumeFileSelect(event.dataTransfer.files[0]);
    }
  };
  const handleResumeDragOver = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleResumeDragLeave = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleResumeButtonClick = () => document.getElementById('resume-upload-input')?.click();

  const handleAddSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill: string) => skill !== skillToRemove));
  };
  
  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
  };


  const navItems = [
    { id: 'profile-details', label: 'Profile Details' },
    { id: 'career-profile', label: 'Career Profile' },
    { id: 'resume', label: 'Resume' },
    { id: 'key-skills', label: 'Key Skills' },
    { id: 'employment', label: 'Employment' },
    { id: 'education', label: 'Education' },
    { id: 'projects', label: 'Projects' },
    { id: 'online-profiles', label: 'Online Profiles' },
    { id: 'personal-details', label: 'Personal Details' },
  ];

  return (
    <div className="flex gap-6 h-full w-full">
        <Card className="p-4 w-[250px]">
            <nav className="grid gap-1 text-sm">
                {navItems.map(item => (
                    <Button 
                        key={item.id} 
                        variant={activeSection === item.id ? 'default' : 'ghost'} 
                        className="justify-start"
                        onClick={() => setActiveSection(item.id)}
                    >
                        {item.label}
                    </Button>
                ))}
            </nav>
        </Card>
        
        <Card className="flex-1 flex flex-col">
            <form action={formAction} ref={formRef} className="flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <CardContent className="p-6">
                        <input type="hidden" name="userId" value={session?.uid} />
                        <input type="hidden" name="role" value={profile.role} />

                        {activeSection === 'profile-details' && (
                            <section className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold">Profile Details</h3>
                                    <p className="text-sm text-muted-foreground">Your personal and contact information.</p>
                                </div>
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
                                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isAvatarPending}>
                                            <Edit className="mr-2 h-4 w-4" /> {profile.displayImageUrl ? 'Change' : 'Add'} Picture
                                        </Button>
                                         {profile.displayImageUrl && (
                                            <Button type="button" variant="destructive" size="sm" onClick={handleRemoveAvatar} disabled={isAvatarPending}>
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
                                <div className="space-y-2">
                                    <Label htmlFor="profileSummary">Profile Summary</Label>
                                    <Textarea name="profileSummary" id="profileSummary" defaultValue={profile.profileSummary ?? ''} placeholder="A brief summary about your professional background..." className="min-h-32"/>
                                </div>
                            </section>
                        )}
                        
                        {activeSection === 'career-profile' && (
                          <section className="space-y-6">
                             <div>
                                <h3 className="text-lg font-semibold">Career Profile</h3>
                                <p className="text-sm text-muted-foreground">Your current professional status.</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="jobTitle">Current Job Title</Label>
                                  <Input id="jobTitle" name="jobTitle" defaultValue={profile.jobTitle ?? ''} placeholder="e.g. Software Engineer"/>
                                </div>
                                 <div className="grid gap-2">
                                  <Label htmlFor="currentCompany">Current Company</Label>
                                  <Input id="currentCompany" name="currentCompany" defaultValue={profile.currentCompany ?? ''} placeholder="e.g. Innovate Inc."/>
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
                                  <Label htmlFor="experience">Total Years of Experience</Label>
                                  <Input id="experience" name="experience" type="number" defaultValue={profile.experience ?? ''} />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="noticePeriod">Notice Period</Label>
                                   <Select name="noticePeriod" defaultValue={profile.noticePeriod}>
                                      <SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Immediate">Immediate</SelectItem>
                                        <SelectItem value="15 Days">15 Days</SelectItem>
                                        <SelectItem value="1 Month">1 Month</SelectItem>
                                        <SelectItem value="2 Months">2 Months</SelectItem>
                                        <SelectItem value="3 Months">3 Months</SelectItem>
                                      </SelectContent>
                                   </Select>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="currentSalary">Current Salary (LPA)</Label>
                                  <Input id="currentSalary" name="currentSalary" defaultValue={profile.currentSalary ?? ''} placeholder="e.g. 12.5"/>
                                </div>
                              </div>
                          </section>
                        )}

                        {activeSection === 'resume' && (
                            <section className="space-y-6">
                                 <div>
                                    <h3 className="text-lg font-semibold">Resume</h3>
                                    <p className="text-sm text-muted-foreground">Upload your latest resume. This will be used for AI analysis.</p>
                                </div>
                                 <div className="space-y-2">
                                    <input type="file" id="resume-upload-input" ref={fileInputRef} onChange={handleResumeFileChange} accept=".pdf,.doc,.docx" className="hidden" name="resumeFile"/>
                                    <div
                                        className={cn("relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors", isDragging && "border-dash-primary bg-dash-primary/10")}
                                        onDrop={handleResumeDrop} onDragOver={handleResumeDragOver} onDragLeave={handleResumeDragLeave} onClick={handleResumeButtonClick}
                                    >
                                        {existingResume ? (
                                            <div className="text-center">
                                                <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                                <p className="font-semibold">{existingResume.name}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeSection === 'key-skills' && (
                            <section className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold">Key Skills</h3>
                                    <p className="text-sm text-muted-foreground">Add skills that best define your expertise.</p>
                                </div>
                                <input type="hidden" name="keySkills" value={skills.join(',')} />
                                <Card className="p-4">
                                    <CardContent className="p-0">
                                        <div className="space-y-2">
                                            <Label>Your skills</Label>
                                            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-20 bg-background">
                                                {skills.map((skill: string) => (
                                                    <Badge key={skill} variant="secondary" className="flex items-center gap-1.5 text-base">
                                                        {skill}
                                                        <button onClick={() => handleRemoveSkill(skill)}><X className="h-4 w-4" /></button>
                                                    </Badge>
                                                ))}
                                                <Input
                                                  value={skillInput}
                                                  onChange={(e) => setSkillInput(e.target.value)}
                                                  onKeyDown={handleSkillKeyDown}
                                                  placeholder="Add skills"
                                                  className="flex-1 border-none focus-visible:ring-0 shadow-none p-0 h-auto bg-transparent"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2 mt-4">
                                          <Label>Or you can select from the suggested set of skills</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {suggestedSkills.filter(s => !skills.includes(s)).map(skill => (
                                                  <Button key={skill} type="button" variant="outline" size="sm" onClick={() => handleAddSkill(skill)}>
                                                    {skill} <Plus className="ml-1 h-4 w-4" />
                                                  </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </section>
                        )}
                        
                        {activeSection === 'personal-details' && (
                          <section className="space-y-6">
                            <div>
                              <h3 className="text-lg font-semibold">Personal Details</h3>
                              <p className="text-sm text-muted-foreground">This information helps us personalize your experience.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "justify-start text-left font-normal",
                                            !profile.dob && "text-muted-foreground"
                                        )}
                                        >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {profile.dob ? format(new Date(profile.dob), "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                        mode="single"
                                        selected={profile.dob ? new Date(profile.dob) : undefined}
                                        onSelect={(date) => {
                                            // You would need to update the state here if you want it to be reactive
                                        }}
                                        initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Input id="dob" name="dob" type="hidden" value={profile.dob} />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="permanentAddress">Permanent Address</Label>
                                <Input id="permanentAddress" name="permanentAddress" defaultValue={profile.permanentAddress ?? ''} />
                              </div>
                               <div className="grid gap-2 col-span-2">
                                <Label htmlFor="languages">Languages</Label>
                                <Input id="languages" name="languages" defaultValue={profile.languages?.join(', ') ?? ''} placeholder="e.g., English, Hindi, Spanish" />
                              </div>
                            </div>
                          </section>
                        )}

                         {(activeSection === 'employment' || activeSection === 'education' || activeSection === 'projects' || activeSection === 'online-profiles') && (
                            <div className="text-center py-12">
                                <h3 className="text-lg font-semibold">Under Construction</h3>
                                <p className="text-sm text-muted-foreground">The form for the &quot;{navItems.find(i => i.id === activeSection)?.label}&quot; section will be here.</p>
                            </div>
                        )}
                        
                        {state?.error && <Alert variant="destructive" className="mt-2"><AlertDescription>{state.error}</AlertDescription></Alert>}
                    </CardContent>
                </ScrollArea>
                 </div>
                 <div className="flex justify-end gap-2 p-6 border-t">
                        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
                        <SubmitButton />
                    </div>
                </form>
        </Card>
    </div>
  );
}
