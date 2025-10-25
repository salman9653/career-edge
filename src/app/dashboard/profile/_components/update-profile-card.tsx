
'use client';
import { useActionState, useEffect, useRef, useState, useTransition, type DragEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUserProfileAction, updateDisplayPictureAction, removeDisplayPictureAction, removeResumeAction } from '@/app/actions';
import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Trash2, Edit, Globe, Linkedin, Phone, Mail, Briefcase, Building2, User, Upload, FileText, X, Plus, CalendarIcon, UploadCloud, Download, RefreshCw, Github, FolderKanban } from 'lucide-react';
import { FaFilePdf, FaFileWord, FaFileImage } from 'react-icons/fa';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { CompanySize, Socials, UserProfile, Resume, Employment } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
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
} from "@/components/ui/alert-dialog";
import { skillsData, type Skill } from '@/lib/skills-data';
import { Checkbox } from '@/components/ui/checkbox';

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);


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

interface LanguageProficiency {
    language: string;
    proficiency: string;
    canRead: boolean;
    canWrite: boolean;
    canSpeak: boolean;
}

const EmploymentForm = ({ employment, onSave, onCancel }: { employment: Employment | null, onSave: (employment: Employment) => void, onCancel: () => void }) => {
    const [designation, setDesignation] = useState(employment?.designation || '');
    const [company, setCompany] = useState(employment?.company || '');
    const [isCurrent, setIsCurrent] = useState(employment?.isCurrent || false);
    const [startDate, setStartDate] = useState<Date | undefined>(employment?.startDate ? new Date(employment.startDate) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(employment?.endDate ? new Date(employment.endDate) : undefined);
    const [responsibilities, setResponsibilities] = useState(employment?.responsibilities || '');

    const handleSave = () => {
        const newEmployment: Employment = {
            id: employment?.id || Date.now().toString(),
            designation,
            company,
            isCurrent,
            startDate: startDate!.toISOString(),
            endDate: isCurrent ? null : endDate!.toISOString(),
            responsibilities
        };
        onSave(newEmployment);
    };

    return (
        <Card className="mt-4">
            <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="designation">Designation</Label>
                        <Input id="designation" value={designation} onChange={e => setDesignation(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" value={company} onChange={e => setCompany(e.target.value)} />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, 'PPP') : 'Select start date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent><Calendar mode="single" selected={startDate} onSelect={setStartDate} /></PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label>End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground", isCurrent && "opacity-50 cursor-not-allowed")} disabled={isCurrent}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, 'PPP') : 'Select end date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent><Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={isCurrent} /></PopoverContent>
                        </Popover>
                    </div>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="isCurrent" checked={isCurrent} onCheckedChange={(checked) => setIsCurrent(!!checked)} />
                    <Label htmlFor="isCurrent">I currently work here</Label>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="responsibilities">Responsibilities / Key Achievements</Label>
                    <Textarea id="responsibilities" value={responsibilities} onChange={e => setResponsibilities(e.target.value)} className="min-h-32" />
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </CardContent>
        </Card>
    );
};

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
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResumePending, startResumeTransition] = useTransition();
  const [isDownloadHovered, setIsDownloadHovered] = useState(false);

  const [skills, setSkills] = useState(profile.keySkills || []);
  const [skillInput, setSkillInput] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState<Skill[]>([]);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  const [dob, setDob] = useState<Date | undefined>(profile.dob ? new Date(profile.dob) : undefined);
  
  const [languages, setLanguages] = useState<LanguageProficiency[]>(profile.languages || []);
  const [employments, setEmployments] = useState<Employment[]>(profile.employment || []);
  const [isAddingEmployment, setIsAddingEmployment] = useState(false);
  const [editingEmployment, setEditingEmployment] = useState<Employment | null>(null);
  
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
            } else if (!['keySkills', 'languages'].includes(key) && !key.startsWith('dob-')) {
                // @ts-ignore
                newProfile[key] = value;
            }
        }
      newProfile.keySkills = skills;
      newProfile.languages = languages;
      newProfile.employment = employments;
      
       const day = formData.get('dob-day');
       const month = formData.get('dob-month');
       const year = formData.get('dob-year');
       if (day && month && year) {
           newProfile.dob = new Date(`${year}-${month}-${day}`).toISOString();
       }

      onSave(newProfile);
    }
  }, [state.success, toast, onSave, profile.role, skills, languages, employments]);

  // Logic for skill suggestions
  useEffect(() => {
    let newSuggestions: Skill[] = [];

    if (skills.length === 0) {
        // Show initial random suggestions from various categories
        const categories = [...new Set(skillsData.map(s => s.category))];
        categories.forEach(cat => {
            const skillsInCategory = skillsData.filter(s => s.category === cat && !skills.includes(s.name));
            if (skillsInCategory.length > 0) {
                newSuggestions.push(skillsInCategory[Math.floor(Math.random() * skillsInCategory.length)]);
            }
        });
        newSuggestions = [...new Set(newSuggestions)].slice(0, 8); // Remove duplicates and limit
    } else {
        const lastSkillName = skills[skills.length - 1];
        const lastSkill = skillsData.find(s => s.name === lastSkillName);

        if (lastSkill) {
            // Add related skills
            const related = lastSkill.related_skills
                .map(id => skillsData.find(s => s.id === id))
                .filter((s): s is Skill => !!s && !skills.includes(s.name));
            newSuggestions.push(...related);

            // Add other skills from the same category
            const categorySkills = skillsData
                .filter(s => s.category === lastSkill.category && s.name !== lastSkill.name && !skills.includes(s.name) && !related.some(rel => rel.id === s.id))
                .sort(() => 0.5 - Math.random()); // Shuffle
            
            newSuggestions.push(...categorySkills);
        }
    }
    
    // Remove duplicates and limit to 8 suggestions
    const uniqueSuggestions = Array.from(new Set(newSuggestions.map(s => s.id))).map(id => newSuggestions.find(s => s.id === id)).filter(Boolean) as Skill[];
    setSuggestedSkills(uniqueSuggestions.slice(0, 8));

  }, [skills]);

  

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
        setSelectedFile(file);
    } else {
        setSelectedFile(null);
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
            setSelectedFile(null);
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

  const handleAddSkill = (skillName: string) => {
    const trimmedSkill = skillName.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
        setSkills([...skills, trimmedSkill])
    }
    setSkillInput('');
    setIsAutocompleteOpen(false);
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
  
  const getSimplifiedFileType = (mimeType?: string) => {
    if (!mimeType) return 'File';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word')) {
        if (mimeType.includes('openxmlformats')) return 'docx';
        return 'doc';
    }
    if (mimeType.startsWith('image')) return mimeType.split('/')[1]?.toLowerCase() || 'image';
    return mimeType;
  }

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileText className="h-12 w-12 text-muted-foreground" />;
    const simpleType = getSimplifiedFileType(fileType);
    if (simpleType === 'pdf') return <FaFilePdf className="h-12 w-12 text-red-500" />;
    if (simpleType === 'doc' || simpleType === 'docx') return <FaFileWord className="h-12 w-12 text-blue-500" />;
    if (fileType.startsWith('image')) return <FaFileImage className="h-12 w-12 text-green-500" />;
    return <FileText className="h-12 w-12 text-muted-foreground" />;
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
  
  const autocompleteSkills = skillsData.filter(skill => {
    if (skills.includes(skill.name)) return false;
    if (!skillInput) return false;
    const searchLower = skillInput.toLowerCase();
    return skill.name.toLowerCase().includes(searchLower) || skill.other_names.some(o => o.toLowerCase().includes(searchLower));
  }).slice(0, 5);
  
  const handleAddLanguage = () => {
    setLanguages([...languages, { language: '', proficiency: '', canRead: false, canWrite: false, canSpeak: false }]);
  };

  const handleLanguageChange = (index: number, field: keyof LanguageProficiency, value: string | boolean) => {
    const newLanguages = [...languages];
    (newLanguages[index] as any)[field] = value;
    setLanguages(newLanguages);
  };
  
  const handleRemoveLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const handleSaveEmployment = (employment: Employment) => {
        if (editingEmployment) {
            setEmployments(employments.map(emp => emp.id === employment.id ? employment : emp));
        } else {
            setEmployments([...employments, employment]);
        }
        setIsAddingEmployment(false);
        setEditingEmployment(null);
    };

    const handleDeleteEmployment = (id: string) => {
        setEmployments(employments.filter(emp => emp.id !== id));
    };


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
                            
                            <input type="hidden" name="keySkills" value={skills.join(',')} />
                            <input type="hidden" name="languages" value={JSON.stringify(languages)} />
                            <input type="hidden" name="employment" value={JSON.stringify(employments)} />

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
                                          <div className="flex items-center rounded-md border border-input focus-within:border-b-ring focus-within:border-b-2 transition-colors">
                                            <Select defaultValue="+91">
                                              <SelectTrigger className="w-24 border-0 rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="+91">+91 (IN)</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <Input
                                              id="phone"
                                              name="phone"
                                              defaultValue={profile.phone ?? ''}
                                              type="tel"
                                              className="border-0 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                            />
                                          </div>
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
                                        {profile.hasResume && !selectedFile ? (
                                            <Card className="relative flex flex-col items-center justify-center p-6 text-center">
                                                <motion.button
                                                    type="button"
                                                    onHoverStart={() => setIsDownloadHovered(true)}
                                                    onHoverEnd={() => setIsDownloadHovered(false)}
                                                    onClick={handleResumeDownload}
                                                    disabled={!profile.resume?.data}
                                                    className="absolute top-4 right-4 flex items-center justify-center overflow-hidden rounded-full bg-secondary text-secondary-foreground"
                                                    style={{ height: '2.5rem' }} 
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
                                                    Type: {getSimplifiedFileType(profile.resume?.type)} &bull; Size: {formatFileSize(profile.resume?.size)}
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
                                        ) : selectedFile ? (
                                             <Card className="relative flex flex-col items-center justify-center p-6 text-center">
                                                <div className="flex justify-center">{getFileIcon(selectedFile.type)}</div>
                                                <p className="font-semibold mt-4 text-sm">{selectedFile.name}</p>
                                                <p className="text-xs text-muted-foreground">Type: {getSimplifiedFileType(selectedFile.type)} &bull; Size: {formatFileSize(selectedFile.size)}</p>
                                                <div className="flex gap-2 mt-6">
                                                    <Button type="button" variant="secondary" size="sm" onClick={handleResumeButtonClick} disabled={isPending}><RefreshCw className="mr-2 h-4 w-4"/>Change</Button>
                                                    <Button type="button" variant="destructive" size="sm" disabled={isPending} onClick={() => setSelectedFile(null)}><X className="mr-2 h-4 w-4"/>Remove</Button>
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
                                                <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX (MAX. 750KB)</p>
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
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Your skills</Label>
                                            <div className="min-h-[80px] p-2 flex flex-wrap gap-2">
                                                {skills.map((skill: string) => (
                                                    <Badge key={skill} variant="secondary" className="flex items-center gap-1 text-base py-1">
                                                        {skill}
                                                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="rounded-full hover:bg-black/20 p-0.5">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                onKeyDown={handleSkillKeyDown}
                                                onFocus={() => setIsAutocompleteOpen(true)}
                                                onBlur={() => setTimeout(() => setIsAutocompleteOpen(false), 150)}
                                                placeholder="Add skills and press Enter"
                                            />
                                            {isAutocompleteOpen && skillInput && autocompleteSkills.length > 0 && (
                                                <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto">
                                                    <CardContent className="p-2">
                                                        {autocompleteSkills.map(skill => (
                                                            <Button
                                                                key={skill.id}
                                                                type="button"
                                                                variant="ghost"
                                                                className="w-full justify-start"
                                                                onMouseDown={() => handleAddSkill(skill.name)}
                                                            >
                                                                {skill.name}
                                                            </Button>
                                                        ))}
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </div>
                                        <div className="space-y-2 pt-4">
                                        <Label>Or you can select from the suggested set of skills</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {suggestedSkills.map(skill => (
                                                    <Button key={skill.id} type="button" variant="outline" size="sm" onClick={() => handleAddSkill(skill.name)}>
                                                        {skill.name} <Plus className="ml-1 h-4 w-4" />
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                             {activeSection === 'employment' && (
                                <section className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold">Employment History</h3>
                                        <p className="text-sm text-muted-foreground">Detail your professional experience.</p>
                                    </div>
                                    <div className="space-y-4">
                                        {employments.length === 0 && !isAddingEmployment && !editingEmployment ? (
                                            <div className="text-center py-12 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
                                                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                                                <h3 className="mt-4 text-lg font-semibold">No Employment Yet</h3>
                                                <p className="mt-1 text-sm text-muted-foreground">You haven't created any work experience yet, Add your work experience.</p>
                                                <Button className="mt-6" variant="secondary" type="button" onClick={() => setIsAddingEmployment(true)}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Employment
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                {employments.map(emp => (
                                                    editingEmployment?.id === emp.id ? (
                                                        <EmploymentForm key={emp.id} employment={editingEmployment} onSave={handleSaveEmployment} onCancel={() => setEditingEmployment(null)} />
                                                    ) : (
                                                        <Card key={emp.id} className="p-4">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <p className="font-semibold">{emp.designation}</p>
                                                                    <p className="text-sm text-muted-foreground">{emp.company}</p>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        {format(new Date(emp.startDate), 'MMM yyyy')} - {emp.isCurrent ? 'Present' : emp.endDate ? format(new Date(emp.endDate), 'MMM yyyy') : ''}
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button variant="ghost" size="icon" onClick={() => setEditingEmployment(emp)}><Edit className="h-4 w-4" /></Button>
                                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteEmployment(emp.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    )
                                                ))}
                                                {isAddingEmployment && <EmploymentForm employment={null} onSave={handleSaveEmployment} onCancel={() => setIsAddingEmployment(false)} />}
                                                {!isAddingEmployment && !editingEmployment && (
                                                    <Button type="button" variant="outline" onClick={() => setIsAddingEmployment(true)}>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add Another Employment
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </section>
                            )}
                            
                            {(activeSection === 'education' || activeSection === 'projects') && (
                                <div className="text-center py-12">
                                    <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">Under Construction</h3>
                                    <p className="text-sm text-muted-foreground">The form for the &quot;{navItems.find(i => i.id === activeSection)?.label}&quot; section will be here.</p>
                                </div>
                            )}
                            
                            {activeSection === 'online-profiles' && (
                                <section className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold">Online Profiles</h3>
                                        <p className="text-sm text-muted-foreground">Add links to your professional profiles.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="socials.github">GitHub</Label>
                                            <div className="relative">
                                                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input id="socials.github" name="socials.github" defaultValue={profile.socials?.github ?? ''} placeholder="https://github.com/..." className="pl-9" />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="socials.twitter">Twitter / X</Label>
                                            <div className="relative">
                                                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input id="socials.twitter" name="socials.twitter" defaultValue={profile.socials?.twitter ?? ''} placeholder="https://x.com/..." className="pl-9" />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="socials.linkedin">LinkedIn</Label>
                                            <div className="relative">
                                                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input id="socials.linkedin" name="socials.linkedin" defaultValue={profile.socials?.linkedin ?? ''} placeholder="https://linkedin.com/in/..." className="pl-9" />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="socials.naukri">Naukri.com</Label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input id="socials.naukri" name="socials.naukri" defaultValue={profile.socials?.naukri ?? ''} placeholder="https://naukri.com/mnjuser/..." className="pl-9" />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="socials.glassdoor">Glassdoor</Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input id="socials.glassdoor" name="socials.glassdoor" defaultValue={profile.socials?.glassdoor ?? ''} placeholder="https://glassdoor.co.in/..." className="pl-9" />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="socials.indeed">Indeed</Label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input id="socials.indeed" name="socials.indeed" defaultValue={profile.socials?.indeed ?? ''} placeholder="https://profile.indeed.com/..." className="pl-9" />
                                            </div>
                                        </div>
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="portfolio">Portfolio</Label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input id="portfolio" name="portfolio" defaultValue={profile.portfolio ?? ''} placeholder="https://your-portfolio.com" className="pl-9" />
                                            </div>
                                        </div>
                                    </div>
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
                                    <Label>Date of Birth</Label>
                                    <div className="flex rounded-md border border-input focus-within:border-b-ring focus-within:border-b-2 transition-colors">
                                        <Select name="dob-day" defaultValue={dob ? String(dob.getDate()) : undefined}>
                                            <SelectTrigger className="w-24 border-0 rounded-r-none focus:ring-0 focus-visible:ring-0">
                                                <SelectValue placeholder="Day" />
                                            </SelectTrigger>
                                            <SelectContent>{Array.from({ length: 31 }, (_, i) => i + 1).map(day => <SelectItem key={day} value={String(day)}>{day}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <Select name="dob-month" defaultValue={dob ? String(dob.getMonth() + 1) : undefined}>
                                            <SelectTrigger className="flex-1 border-y-0 rounded-none focus:ring-0 focus-visible:ring-0"><SelectValue placeholder="Month" /></SelectTrigger>
                                            <SelectContent>{Array.from({ length: 12 }, (_, i) => i + 1).map(month => <SelectItem key={month} value={String(month)}>{format(new Date(2000, month - 1), 'MMMM')}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <Select name="dob-year" defaultValue={dob ? String(dob.getFullYear()) : undefined}>
                                            <SelectTrigger className="w-32 border-0 rounded-l-none focus:ring-0 focus-visible:ring-0"><SelectValue placeholder="Year" /></SelectTrigger>
                                            <SelectContent>{Array.from({ length: 70 }, (_, i) => new Date().getFullYear() - 18 - i).map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Permanent Address</Label>
                                    <div className="space-y-4">
                                        <Textarea name="permanentAddress.address" placeholder="Street Address" defaultValue={profile.permanentAddress?.address ?? ''}/>
                                        <div className="grid grid-cols-2 gap-4">
                                        <Input name="permanentAddress.city" placeholder="City" defaultValue={profile.permanentAddress?.city ?? ''}/>
                                        <Input name="permanentAddress.state" placeholder="State" defaultValue={profile.permanentAddress?.state ?? ''}/>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                        <Input name="permanentAddress.country" placeholder="Country" defaultValue={profile.permanentAddress?.country ?? ''}/>
                                        <Input name="permanentAddress.pincode" placeholder="Pin Code" defaultValue={profile.permanentAddress?.pincode ?? ''}/>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                  <Label className="font-semibold text-lg">Language Proficiency</Label>
                                  {languages.map((lang, index) => (
                                    <div key={index} className="p-4 border rounded-lg space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>Language</Label>
                                          <Select value={lang.language} onValueChange={(value) => handleLanguageChange(index, 'language', value)}>
                                            <SelectTrigger><SelectValue placeholder="Select Language"/></SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="English">English</SelectItem>
                                              <SelectItem value="Hindi">Hindi</SelectItem>
                                              <SelectItem value="Spanish">Spanish</SelectItem>
                                              <SelectItem value="French">French</SelectItem>
                                              <SelectItem value="German">German</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Proficiency</Label>
                                          <Select value={lang.proficiency} onValueChange={(value) => handleLanguageChange(index, 'proficiency', value)}>
                                            <SelectTrigger><SelectValue placeholder="Select Proficiency"/></SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="Beginner">Beginner</SelectItem>
                                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                                              <SelectItem value="Advanced">Advanced</SelectItem>
                                              <SelectItem value="Proficient">Proficient</SelectItem>
                                              <SelectItem value="Expert">Expert</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-12">
                                          <div className="flex items-center gap-2">
                                            <Checkbox id={`read-${index}`} checked={lang.canRead} onCheckedChange={(checked) => handleLanguageChange(index, 'canRead', !!checked)}/>
                                            <Label htmlFor={`read-${index}`} className="font-normal">Read</Label>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Checkbox id={`write-${index}`} checked={lang.canWrite} onCheckedChange={(checked) => handleLanguageChange(index, 'canWrite', !!checked)}/>
                                            <Label htmlFor={`write-${index}`} className="font-normal">Write</Label>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Checkbox id={`speak-${index}`} checked={lang.canSpeak} onCheckedChange={(checked) => handleLanguageChange(index, 'canSpeak', !!checked)}/>
                                            <Label htmlFor={`speak-${index}`} className="font-normal">Speak</Label>
                                          </div>
                                        </div>
                                        <Button variant="link" size="sm" type="button" onClick={() => handleRemoveLanguage(index)} className="text-destructive p-0 h-auto">Delete</Button>
                                      </div>
                                    </div>
                                  ))}
                                  <Button type="button" variant="link" onClick={handleAddLanguage}>+ Add another language</Button>
                                </div>
                            </section>
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
