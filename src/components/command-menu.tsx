
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
    Briefcase,
    Users,
    Library,
    CreditCard,
    TicketPercent,
    FileCheck,
    BookUser,
    AppWindow,
    FileText as ResumeIcon,
    Home,
    User,
    Palette,
    Settings as SettingsIcon,
    HelpCircle,
    PlusCircle,
    Bot,
    Search as SearchIcon,
    Mail,
    LayoutDashboard,
    Building2,
    BookCopy,
    ListOrdered,
    MessageSquare,
    Bell,
    Command as CommandIcon,
    Code,
    FileText,
    ListChecks,
    ListFilter,
    Shield,
    Sparkles,
} from 'lucide-react';
import { CreateAssessmentDialog } from '@/app/dashboard/company/assessments/_components/create-assessment-dialog';
import { GenerateAiInterviewDialog } from '@/app/dashboard/company/templates/_components/generate-ai-interview-dialog';
import { JobContext } from '@/context/job-context';
import { AssessmentContext } from '@/context/assessment-context';
import { AiInterviewContext } from '@/context/ai-interview-context';
import { GeneratedResumeContext } from '@/context/generated-resume-context';
import { Kbd } from './ui/kbd';
import type { UserSession } from '@/hooks/use-session';

interface CommandItem {
  id: string;
  label: string;
  value: string;
  group: string;
  icon: React.ElementType;
  action: () => void;
  disabled?: boolean;
}

interface CommandHistoryItem {
  id: string;
  count: number;
  lastUsed: number;
}

const useCommandHistory = () => {
    const historyKey = 'command-history';

    const getHistory = React.useCallback((): Record<string, CommandHistoryItem> => {
        try {
            if (typeof window === 'undefined') return {};
            const item = window.localStorage.getItem(historyKey);
            return item ? JSON.parse(item) : {};
        } catch (error) {
            console.error('Error reading command history from localStorage', error);
            return {};
        }
    }, []);

    const trackCommand = React.useCallback((commandId: string) => {
        const history = getHistory();
        const existing = history[commandId];
        const newHistoryItem: CommandHistoryItem = {
            id: commandId,
            count: (existing?.count || 0) + 1,
            lastUsed: Date.now(),
        };
        history[commandId] = newHistoryItem;
        try {
            if(typeof window !== 'undefined') {
                window.localStorage.setItem(historyKey, JSON.stringify(history));
            }
        } catch (error) {
            console.error('Error writing command history to localStorage', error);
        }
    }, [getHistory]);

    const getSuggestions = React.useCallback((allCommands: CommandItem[], role: UserSession['role'] | undefined) => {
        const history = getHistory();
        const historyItems = Object.values(history);
        
        if(historyItems.length === 0) {
            if (role === 'candidate') {
                 return ['candidate-find-jobs', 'nav-my-applications', 'nav-resume-builder', 'candidate-gen-resume', 'candidate-analyze-resume', 'nav-dashboard']
                    .map(id => allCommands.find(cmd => cmd.id === id)).filter(Boolean) as CommandItem[];
            }
            return []; // No default suggestions for other roles yet
        }

        const mostUsed = [...historyItems].sort((a, b) => b.count - a.count);
        const recentlyUsed = [...historyItems].sort((a, b) => b.lastUsed - a.lastUsed);

        const suggestionIds = new Set<string>();

        mostUsed.slice(0, 3).forEach(item => suggestionIds.add(item.id));
        recentlyUsed.forEach(item => {
            if (suggestionIds.size < 6) {
                suggestionIds.add(item.id);
            }
        });

        return Array.from(suggestionIds).map(id => allCommands.find(cmd => cmd.id === id)).filter(Boolean) as CommandItem[];
    }, [getHistory]);
    
    const getTopSettings = React.useCallback((settingCommands: CommandItem[]) => {
        const history = getHistory();
        const historyItems = Object.values(history);
        const settingIds = settingCommands.map(c => c.id);

        const top = historyItems
            .filter(item => settingIds.includes(item.id))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map(item => settingCommands.find(cmd => cmd.id === item.id))
            .filter(Boolean) as CommandItem[];
        
        if (top.length > 0) return top;
        return settingCommands.slice(0,3);

    }, [getHistory]);

    return { trackCommand, getSuggestions, getTopSettings };
};


interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  const { session } = useSession();
  const { trackCommand, getSuggestions, getTopSettings } = useCommandHistory();

  const { jobs } = React.useContext(JobContext);
  const { assessments } = React.useContext(AssessmentContext);
  const { interviews } = React.useContext(AiInterviewContext);
  const { resumes } = React.useContext(GeneratedResumeContext);


  const [isCreateAssessmentOpen, setIsCreateAssessmentOpen] = React.useState(false);
  const [isGenerateAiInterviewOpen, setIsGenerateAiInterviewOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [preselectedAssessmentType, setPreselectedAssessmentType] = React.useState<'mcq' | 'subjective' | 'code' | undefined>(undefined);

  const allCommands = React.useMemo(() => {
    let commands: CommandItem[] = [];
    const run = (action: () => void) => () => {
      onOpenChange(false);
      action();
    }
    
    const openCreateAssessment = (type?: 'mcq' | 'subjective' | 'code') => {
        setPreselectedAssessmentType(type);
        setIsCreateAssessmentOpen(true);
    }

    if (session?.role === 'company' || session?.role === 'manager') {
      commands.push(
        { id: 'post-job', label: 'Post New Job', value: 'post-job', group: 'Actions', icon: PlusCircle, action: run(() => router.push('/dashboard/company/jobs/new')) },
        { id: 'create-assessment', label: 'Create Assessment', value: 'create-assessment', group: 'Actions', icon: AppWindow, action: run(() => openCreateAssessment()) },
        { id: 'create-mcq-assessment', label: 'Create MCQ Assessment', value: 'create-mcq-assessment', group: 'Actions', icon: ListChecks, action: run(() => openCreateAssessment('mcq')) },
        { id: 'create-subjective-assessment', label: 'Create Subjective Assessment', value: 'create-subjective-assessment', group: 'Actions', icon: FileText, action: run(() => openCreateAssessment('subjective')) },
        { id: 'create-coding-assessment', label: 'Create Coding Assessment', value: 'create-coding-assessment', group: 'Actions', icon: Code, action: run(() => openCreateAssessment('code')) },
        { id: 'gen-ai-interview', label: 'Generate AI Interview', value: 'gen-ai-interview', group: 'Actions', icon: Sparkles, action: run(() => setIsGenerateAiInterviewOpen(true)) },
        { id: 'add-custom-question', label: 'Add Custom Question', value: 'add-custom-question', group: 'Actions', icon: Library, action: run(() => router.push('/dashboard/company/questions/new')) },
        { id: 'gen-questions-ai', label: 'Generate Questions with AI', value: 'gen-questions-ai', group: 'Actions', icon: Sparkles, action: run(() => router.push('/dashboard/company/questions/new')) },
        
        { id: 'nav-dashboard', label: 'Dashboard', value: 'nav-dashboard', group: 'Navigation', icon: Home, action: run(() => router.push('/dashboard')) },
        { id: 'nav-ats', label: 'ATS', value: 'nav-ats', group: 'Navigation', icon: FileCheck, action: run(() => router.push('/dashboard/company/ats')) },
        { id: 'nav-job-pipelines', label: 'Job Pipelines', value: 'nav-job-pipelines', group: 'Navigation', icon: FileCheck, action: run(() => router.push('/dashboard/company/ats')) },
        { id: 'nav-crm', label: 'CRM / Talent Pool', value: 'nav-crm', group: 'Navigation', icon: BookUser, action: run(() => router.push('/dashboard/company/crm')) },
        { id: 'nav-jobs', label: 'Job Postings', value: 'nav-jobs', group: 'Navigation', icon: Briefcase, action: run(() => router.push('/dashboard/company/jobs')) },
        { id: 'nav-templates', label: 'Templates', value: 'nav-templates', group: 'Navigation', icon: AppWindow, action: run(() => router.push('/dashboard/company/templates')) },
        { id: 'nav-assessments', label: 'Assessments', value: 'nav-assessments', group: 'Navigation', icon: ListOrdered, action: run(() => router.push('/dashboard/company/templates?tab=assessments')) },
        { id: 'nav-ai-interviews', label: 'AI Interviews', value: 'nav-ai-interviews', group: 'Navigation', icon: Bot, action: run(() => router.push('/dashboard/company/templates?tab=ai-interviews')) },
        { id: 'nav-question-bank', label: 'Question Bank', value: 'nav-question-bank', group: 'Navigation', icon: Library, action: run(() => router.push('/dashboard/company/questions')) },
        { id: 'nav-library-questions', label: 'Library Questions', value: 'nav-library-questions', group: 'Navigation', icon: Library, action: run(() => router.push('/dashboard/company/questions?tab=library')) },
        { id: 'nav-custom-questions', label: 'My Custom Questions', value: 'nav-custom-questions', group: 'Navigation', icon: Library, action: run(() => router.push('/dashboard/company/questions?tab=custom')) },

        ...jobs.map(job => ({ id: `job-${job.id}`, label: job.title, value: `job-${job.id}`, group: 'Jobs', icon: Briefcase, action: run(() => router.push(`/dashboard/company/jobs/${job.id}`)) })),
        ...jobs.map(job => ({ id: `pipeline-${job.id}`, label: job.title, value: `pipeline-${job.id}`, group: 'Job Pipelines', icon: FileCheck, action: run(() => router.push(`/dashboard/company/ats/${job.id}`)) })),
        ...assessments.map(assessment => ({ id: `assessment-${assessment.id}`, label: assessment.name, value: `assessment-${assessment.id}`, group: 'Templates > Assessments', icon: AppWindow, action: run(() => router.push(`/dashboard/company/templates/assessments/${assessment.id}`)) })),
        ...interviews.map(interview => ({ id: `ai-interview-${interview.id}`, label: interview.name, value: `ai-interview-${interview.id}`, group: 'Templates > AI Interviews', icon: Bot, action: run(() => router.push(`/dashboard/company/templates/ai-interviews/${interview.id}`)) }))
      );
    }
    else if (session?.role === 'candidate') {
      commands.push(
        { id: 'candidate-gen-resume', label: 'Generate Resume with AI', value: 'candidate-gen-resume', group: 'Actions', icon: Sparkles, action: run(() => router.push('/dashboard/candidate/resume-builder/new')) },
        { id: 'candidate-analyze-resume', label: 'Analyze Resume', value: 'candidate-analyze-resume', group: 'Actions', icon: Bot, action: run(() => router.push('/dashboard/candidate/jobs')), disabled: false },
        { id: 'candidate-find-jobs', label: 'Find Jobs', value: 'candidate-find-jobs', group: 'Actions', icon: SearchIcon, action: run(() => router.push('/dashboard/candidate/jobs')) },
        { id: 'candidate-job-invites', label: 'Job Invites', value: 'candidate-job-invites', group: 'Navigation', icon: Mail, action: () => {}, disabled: true },
        
        { id: 'nav-dashboard', label: 'Dashboard', value: 'nav-dashboard', group: 'Navigation', icon: Home, action: run(() => router.push('/dashboard')) },
        { id: 'nav-candidate-jobs', label: 'Jobs', value: 'nav-candidate-jobs', group: 'Navigation', icon: Briefcase, action: run(() => router.push('/dashboard/candidate/jobs')) },
        { id: 'nav-my-applications', label: 'My Applications', value: 'nav-my-applications', group: 'Navigation', icon: Briefcase, action: run(() => router.push('/dashboard/candidate/applications')) },
        { id: 'nav-resume-builder', label: 'Resume Builder', value: 'nav-resume-builder', group: 'Navigation', icon: ResumeIcon, action: run(() => router.push('/dashboard/candidate/resume-builder')) },
        { id: 'nav-practice', label: 'Practice', value: 'nav-practice', group: 'Navigation', icon: BookCopy, action: run(() => router.push('/dashboard/candidate/practice')) },
        
        ...resumes.map(resume => ({ id: `resume-${resume.id}`, label: resume.name, value: `resume-${resume.id}`, group: 'Generated Resumes', icon: ResumeIcon, action: run(() => router.push(`/dashboard/candidate/resumes/${resume.id}`)) }))
      );
    }
    else if (session?.role === 'admin') {
      commands.push(
        { id: 'admin-gen-questions', label: 'Generate Questions for Library', value: 'admin-gen-questions', group: 'Actions', icon: Sparkles, action: run(() => router.push('/dashboard/admin/questions/new')) },
        { id: 'admin-manage-subscriptions', label: 'Manage Subscriptions', value: 'admin-manage-subscriptions', group: 'Actions', icon: CreditCard, action: run(() => router.push('/dashboard/admin/subscriptions/company')) },
        { id: 'admin-manage-coupons', label: 'Manage Offers & Coupons', value: 'admin-manage-coupons', group: 'Actions', icon: TicketPercent, action: run(() => router.push('/dashboard/admin/coupons')) },
        { id: 'admin-manage-platform-settings', label: 'Manage Platform Settings', value: 'admin-manage-platform-settings', group: 'Actions', icon: SettingsIcon, action: run(() => router.push('/dashboard?settings=true&tab=Platform Settings')) },
        
        { id: 'nav-dashboard', label: 'Dashboard', value: 'nav-dashboard', group: 'Navigation', icon: Home, action: run(() => router.push('/dashboard')) },
        { id: 'nav-analytics', label: 'Analytics', value: 'nav-analytics', group: 'Navigation', icon: LayoutDashboard, action: run(() => router.push('/dashboard/analytics')) },
        { id: 'nav-manage-companies', label: 'Manage Companies', value: 'nav-manage-companies', group: 'Navigation', icon: Building2, action: run(() => router.push('/dashboard/admin/companies')) },
        { id: 'nav-manage-candidates', label: 'Manage Candidates', value: 'nav-manage-candidates', group: 'Navigation', icon: Users, action: run(() => router.push('/dashboard/admin/candidates')) },
        { id: 'nav-question-library', label: 'Question Library', value: 'nav-question-library', group: 'Navigation', icon: Library, action: run(() => router.push('/dashboard/admin/questions')) },
        { id: 'nav-subscriptions', label: 'Manage Subscriptions', value: 'nav-subscriptions', group: 'Navigation', icon: CreditCard, action: run(() => router.push('/dashboard/admin/subscriptions/company')) },
        { id: 'nav-coupons', label: 'Manage Offers & Coupons', value: 'nav-coupons', group: 'Navigation', icon: TicketPercent, action: run(() => router.push('/dashboard/admin/coupons')) },
      );
    }
    
    commands.push(
      { id: 'nav-inbox', label: 'Inbox', value: 'nav-inbox', group: 'Others', icon: MessageSquare, action: run(() => router.push('/dashboard/chat')) },
      { id: 'nav-notifications', label: 'Notifications History', value: 'nav-notifications', group: 'Others', icon: Bell, action: run(() => router.push('/dashboard/notifications')) }
    );

    const settingsBase = [
        { id: 'settings-profile', label: 'Profile', value: 'settings-profile', group: 'Settings', icon: User, action: run(() => router.push('/dashboard/profile')) },
        { id: 'settings-account', label: 'Account Settings', value: 'settings-account', group: 'Settings', icon: SettingsIcon, action: run(() => router.push('/dashboard?settings=true&tab=Account')) },
        { id: 'settings-appearance', label: 'Appearance', value: 'settings-appearance', group: 'Settings', icon: Palette, action: run(() => router.push('/dashboard?settings=true&tab=Appearance')) },
        { id: 'settings-security', label: 'Security', value: 'settings-security', group: 'Settings', icon: Shield, action: run(() => router.push('/dashboard?settings=true&tab=Security'))},
        { id: 'settings-help', label: 'Help', value: 'settings-help', group: 'Settings', icon: HelpCircle, action: run(() => router.push('/dashboard?settings=true&tab=Help')) },
    ];

    if (session?.role === 'company' || session?.role === 'manager') {
        settingsBase.splice(2, 0, { id: 'settings-managers', label: 'Company Account Managers', value: 'settings-managers', group: 'Settings', icon: Users, action: run(() => router.push('/dashboard/company/managers')) });
    }
    
    commands.push(...settingsBase);

    return commands;
  }, [session, router, onOpenChange, jobs, assessments, interviews, resumes]);
  
  const runCommand = React.useCallback((commandId: string) => {
    const command = allCommands.find(c => c.id === commandId);
    if (command && !command.disabled) {
      trackCommand(commandId);
      command.action();
    }
  }, [trackCommand, allCommands]);
  
  const searchResults = React.useMemo(() => {
    if (!searchValue) return [];
    const lowerCaseSearch = searchValue.toLowerCase();
    return allCommands
      .filter(cmd => 
        cmd.label.toLowerCase().includes(lowerCaseSearch) ||
        cmd.group.toLowerCase().includes(lowerCaseSearch)
      )
      .slice(0, 10);
  }, [searchValue, allCommands]);

  const suggestions = React.useMemo(() => getSuggestions(allCommands, session?.role), [getSuggestions, allCommands, session?.role]);
  
  const topSettings = React.useMemo(() => {
    const settingsCommands = allCommands.filter(c => c.group === 'Settings');
    return getTopSettings(settingsCommands);
  }, [getTopSettings, allCommands]);


  React.useEffect(() => {
    setSearchValue('');
  }, [open]);

  return (
    <>
      <CreateAssessmentDialog open={isCreateAssessmentOpen} onOpenChange={setIsCreateAssessmentOpen} assessmentType={preselectedAssessmentType} />
      <GenerateAiInterviewDialog open={isGenerateAiInterviewOpen} onOpenChange={setIsGenerateAiInterviewOpen} />
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <CommandInput 
            placeholder="Type a command or search..."
            value={searchValue}
            onValueChange={setSearchValue}
        />
        <CommandList className="custom-scrollbar">
            {searchValue ? (
                 <CommandGroup heading="Search Results">
                    {searchResults.length > 0 ? searchResults.map((item) => (
                        <CommandItem key={item.value} onSelect={() => runCommand(item.id)} value={item.value}>
                            <item.icon className="mr-2 h-4 w-4" />
                            <span>{item.label}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{item.group}</span>
                        </CommandItem>
                    )) : <CommandEmpty>No results found.</CommandEmpty>}
                </CommandGroup>
            ) : (
                <>
                <CommandGroup heading="Suggestions">
                    {suggestions.length > 0 ? suggestions.map((item) => (
                        <CommandItem key={item.id} onSelect={() => runCommand(item.id)} value={item.label}>
                            <item.icon className="mr-2 h-4 w-4" />
                            <span>{item.label}</span>
                        </CommandItem>
                    )) : (
                        <div className="py-6 text-center text-sm text-muted-foreground">No suggestions yet. Start using commands to see them here.</div>
                    )}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Settings">
                    {topSettings.map((item) => (
                        <CommandItem key={item.id} onSelect={() => runCommand(item.id)} value={item.label}>
                            <item.icon className="mr-2 h-4 w-4" />
                            <span>{item.label}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
                </>
            )}

        </CommandList>
      </CommandDialog>
    </>
  );
}
