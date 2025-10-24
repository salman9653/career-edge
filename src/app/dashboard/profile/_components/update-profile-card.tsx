
'use client';
import { useActionState, useEffect, useRef, useState, useTransition, type DragEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUserProfileAction, updateDisplayPictureAction, removeDisplayPictureAction, removeResumeAction } from '@/app/actions';
import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Loader2, Trash2, Edit, Globe, Linkedin, Phone, Mail, Briefcase, Building2, User, Upload, FileText, X, Plus, CalendarIcon, UploadCloud, Download, RefreshCw, File as FileIcon } from 'lucide-react';
import { FaFilePdf, FaFileWord, FaFileImage } from 'react-icons/fa';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { CompanySize, Socials } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { UserProfile } from '../page';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
    profile: UserProfile,
    onSave: (updatedProfile: any) => void, 
    onCancel: () => void ,
    onAvatarChange: (url: string | null) => void
}) {
  const [state, formAction] = useActionState(updateUserProfileAction, initialState);
  const { session, updateSession } = useSession();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [isAvatarPending, startAvatarTransition] = useTransition();
  const [activeSection, setActiveSection] = useState('profile-details');
  
  const [existingResumeFile, setExistingResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResumePending, startResumeTransition] = useTransition();
  const [isDownloadHovered, setIsDownloadHovered] = useState(false);

  const [skills, setSkills] = useState(profile.keySkills || []);
  const [skillInput, setSkillInput] = useState('');
  const suggestedSkills = ['React', 'Node.js', 'TypeScript', 'GraphQL', 'Docker', 'AWS', 'Project Management', 'Agile'];
  const isPending = isAvatarPending || isResumePending;

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
        setExistingResumeFile(file);
    } else {
        setExistingResumeFile(null);
    }
  };

  const handleResumeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleResumeFileSelect(event.target.files?.[0] || null);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files?.[0]) {
        handleResumeFileSelect(event.dataTransfer.files[0]);
    }
  };
  const handleResumeDragOver = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleResumeDragLeave = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleResumeButtonClick = () => resumeInputRef.current?.click();

  const handleRemoveResume = () => {
    if (!session?.uid) return;
     startResumeTransition(async () => {
        const result = await removeResumeAction(session.uid);
        if(result.success) {
            toast({ title: 'Resume removed' });
            setExistingResumeFile(null);
            // The onSnapshot in profile page will update the state
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
     });
  };
  
  const handleResumeDownload = () => {
    if(profile.resume?.data) {
        const link = document.createElement('a');
        link.href = profile.resume.data;
        link.download = profile.resume.name || 'resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileIcon className="h-12 w-12 text-muted-foreground" />;
    if (fileType.includes('pdf')) return <FaFilePdf className="h-12 w-12 text-red-500" />;
    if (fileType.includes('word')) return <FaFileWord className="h-12 w-12 text-blue-500" />;
    if (fileType.startsWith('image')) return <FaFileImage className="h-12 w-12 text-green-500" />;
    return <FileIcon className="h-12 w-12 text-muted-foreground" />;
  }


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
        <Card className="p-4 w-[250px] self-start">
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
        
        <form action={formAction} ref={formRef} className="flex-1 flex flex-col min-h-0">
            <Card className="h-full flex flex-col">
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <CardContent className="p-6">
                            <input type="hidden" name="userId" value={session?.uid} />
                            <input type="hidden" name="role" value={profile.role} />
                            
                            <input 
                                type="file" 
                                name="resumeFile" 
                                ref={resumeInputRef}
                                className="hidden" 
                                onChange={handleResumeFileChange}
                                accept=".pdf,.doc,.docx"
                            />

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
                                        <Input id="name" name="name" defaultValue={profile.name ?? ''} required />
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
                                    <Select name="workStatus" defaultValue={profile.workStatus ?? ''}>
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
                                    <Select name="noticePeriod" defaultValue={profile.noticePeriod ?? ''}>
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
                                        {profile.hasResume && !existingResumeFile ? (
                                            <Card className="relative flex flex-col items-center justify-center p-6 text-center">
                                                <motion.button
                                                    type="button"
                                                    onHoverStart={() => setIsDownloadHovered(true)}
                                                    onHoverEnd={() => setIsDownloadHovered(false)}
                                                    onClick={handleResumeDownload}
                                                    disabled={!profile.resume?.data}
                                                    className="absolute top-4 right-4 flex items-center justify-center overflow-hidden rounded-full bg-secondary text-secondary-foreground"
                                                    style={{ height: '2.5rem' }} // 40px
                                                >
                                                    <motion.div
                                                        animate={{ width: isDownloadHovered ? 'auto' : '2.5rem' }}
                                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                        className="flex items-center justify-center h-full px-3"
                                                    >
                                                        <Download className="h-5 w-5 flex-shrink-0" />
                                                        <AnimatePresence>
                                                        {isDownloadHovered && (
                                                            <motion.span
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -10 }}
                                                            transition={{ duration: 0.2, delay: 0.1 }}
                                                            className="ml-2 whitespace-nowrap"
                                                            >
                                                            Download
                                                            </motion.span>
                                                        )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                </motion.button>

                                                <div className="flex justify-center">{getFileIcon(profile.resume?.type)}</div>
                                                <p className="font-semibold mt-4">{profile.resume?.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                {profile.resume?.type} • {formatFileSize(profile.resume?.size)}
                                                </p>
                                                {profile.resume?.updatedAt && (
                                                  <p className="text-xs text-muted-foreground mt-2">
                                                      Last updated: {formatDistanceToNow(profile.resume.updatedAt.toDate(), { addSuffix: true })}
                                                  </p>
                                                )}
                                                <div className="flex gap-2 mt-6">
                                                    <Button type="button" variant="secondary" size="sm" onClick={handleResumeButtonClick} disabled={isResumePending}><RefreshCw className="mr-2 h-4 w-4"/>Update</Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button type="button" variant="destructive" size="sm" disabled={isResumePending}><Trash2 className="mr-2 h-4 w-4"/>Delete</Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete your uploaded resume.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={handleRemoveResume} disabled={isResumePending} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </Card>
                                        ) : (
                                            <div
                                                className={cn("relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors", isDragging && "border-dash-primary bg-dash-primary/10")}
                                                onDrop={isPending ? undefined : handleDrop}
                                                onDragOver={isPending ? undefined : handleResumeDragOver}
                                                onDragLeave={isPending ? undefined : handleResumeDragLeave}
                                                onClick={isPending ? undefined : handleResumeButtonClick}
                                            >
                                                {existingResumeFile ? (
                                                    <div className="text-center p-4 flex flex-col items-center">
                                                        <div className="flex justify-center">{getFileIcon(existingResumeFile.type)}</div>
                                                        <p className="font-semibold mt-4 text-sm">{existingResumeFile.name}</p>
                                                        <p className="text-xs text-muted-foreground">{existingResumeFile.type} • {formatFileSize(existingResumeFile.size)}</p>
                                                        <Button type="button" variant="link" size="sm" className="text-destructive h-auto p-1 mt-2" onClick={(e) => { e.stopPropagation(); setExistingResumeFile(null); }}>Remove</Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                        <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX (MAX. 750KB)</p>
                                                    </>
                                                )}
                                            </div>
                                        )}
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
                                    <Select name="gender" defaultValue={profile.gender ?? ''}>
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
                                    <Select name="maritalStatus" defaultValue={profile.maritalStatus ?? ''}>
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
                                    <Input id="dob" name="dob" type="hidden" defaultValue={profile.dob ?? ''} />
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
            </Card>
        </form>
    </div>
  );
}
