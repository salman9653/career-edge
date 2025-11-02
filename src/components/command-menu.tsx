
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import {
  Command,
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
    FileText,
    LayoutDashboard,
    Building2,
    BookCopy,
    ListOrdered,
    Shield,
    Sparkles, // Added Sparkles import
} from 'lucide-react';
import { CreateAssessmentDialog } from '@/app/dashboard/company/assessments/_components/create-assessment-dialog';
import { GenerateAiInterviewDialog } from '@/app/dashboard/company/templates/_components/generate-ai-interview-dialog';
import { JobContext } from '@/context/job-context';
import { AssessmentContext } from '@/context/assessment-context';
import { AiInterviewContext } from '@/context/ai-interview-context';

interface CommandItem {
  id: string;
  label: string;
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
            window.localStorage.setItem(historyKey, JSON.stringify(history));
        } catch (error) {
            console.error('Error writing command history to localStorage', error);
        }
    }, [getHistory]);

    const getSuggestions = React.useCallback((allCommands: CommandItem[]) => {
        const history = getHistory();
        const historyItems = Object.values(history);

        const mostUsed = [...historyItems].sort((a, b) => b.count - a.count);
        const recentlyUsed = [...historyItems].sort((a, b) => b.lastUsed - a.lastUsed);

        const suggestionIds = new Set<string>();

        // Add most used (up to 3)
        mostUsed.slice(0, 3).forEach(item => suggestionIds.add(item.id));
        // Add recently used, filling up to 6
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

        return historyItems
            .filter(item => settingIds.includes(item.id))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map(item => settingCommands.find(cmd => cmd.id === item.id))
            .filter(Boolean) as CommandItem[];

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

  const { jobs, loading: jobsLoading } = React.useContext(JobContext);
  const { assessments, loading: assessmentsLoading } = React.useContext(AssessmentContext);
  const { interviews, loading: interviewsLoading } = React.useContext(AiInterviewContext);

  const [isCreateAssessmentOpen, setIsCreateAssessmentOpen] = React.useState(false);
  const [isGenerateAiInterviewOpen, setIsGenerateAiInterviewOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const runCommand = React.useCallback((commandId: string) => {
    const command = allCommands.find(c => c.id === commandId);
    if (command && !command.disabled) {
      trackCommand(commandId);
      onOpenChange(false);
      command.action();
    }
  }, [allCommands, onOpenChange, trackCommand]);

  const allCommands = React.useMemo(() => {
    let commands: CommandItem[] = [];

    // Company Account Commands
    if (session?.role === 'company' || session?.role === 'manager') {
      commands.push(
        { id: 'post-job', label: 'Post New Job', group: 'Actions', icon: PlusCircle, action: () => router.push('/dashboard/company/jobs/new') },
        { id: 'create-assessment', label: 'Create Assessment', group: 'Actions', icon: AppWindow, action: () => setIsCreateAssessmentOpen(true) },
        { id: 'gen-ai-interview', label: 'Generate AI Interview', group: 'Actions', icon: Bot, action: () => setIsGenerateAiInterviewOpen(true) },
        { id: 'add-custom-question', label: 'Add Custom Question', group: 'Actions', icon: Library, action: () => router.push('/dashboard/company/questions/new') },
        { id: 'gen-questions-ai', label: 'Generate Questions with AI', group: 'Actions', icon: Sparkles, action: () => router.push('/dashboard/company/questions/new') },
        { id: 'nav-dashboard', label: 'Dashboard', group: 'Navigation', icon: Home, action: () => router.push('/dashboard') },
        { id: 'nav-ats', label: 'ATS', group: 'Navigation', icon: FileCheck, action: () => router.push('/dashboard/company/ats') },
        { id: 'nav-crm', label: 'CRM / Talent Pool', group: 'Navigation', icon: BookUser, action: () => router.push('/dashboard/company/crm') },
        { id: 'nav-jobs', label: 'Job Postings', group: 'Navigation', icon: Briefcase, action: () => router.push('/dashboard/company/jobs') },
        { id: 'nav-templates', label: 'Templates', group: 'Navigation', icon: AppWindow, action: () => router.push('/dashboard/company/templates') },
        { id: 'nav-assessments', label: 'Assessments', group: 'Navigation', icon: ListOrdered, action: () => router.push('/dashboard/company/templates?tab=assessments') },
        { id: 'nav-ai-interviews', label: 'AI Interviews', group: 'Navigation', icon: Bot, action: () => router.push('/dashboard/company/templates?tab=ai-interviews') },
        { id: 'nav-question-bank', label: 'Question Bank', group: 'Navigation', icon: Library, action: () => router.push('/dashboard/company/questions') },
        ...jobs.map(job => ({ id: `job-${job.id}`, label: job.title, group: 'Jobs', icon: Briefcase, action: () => router.push(`/dashboard/company/jobs/${job.id}`) })),
        ...jobs.map(job => ({ id: `pipeline-${job.id}`, label: job.title, group: 'Job Pipelines', icon: FileCheck, action: () => router.push(`/dashboard/company/ats/${job.id}`) })),
        ...assessments.map(assessment => ({ id: `assessment-${assessment.id}`, label: assessment.name, group: 'Templates', icon: AppWindow, action: () => router.push(`/dashboard/company/templates/assessments/${assessment.id}`) })),
        ...interviews.map(interview => ({ id: `ai-interview-${interview.id}`, label: interview.name, group: 'Templates', icon: Bot, action: () => router.push(`/dashboard/company/templates/ai-interviews/${interview.id}`) }))
      );
    }
    // Candidate Account Commands
    else if (session?.role === 'candidate') {
      commands.push(
        { id: 'candidate-find-jobs', label: 'Find Jobs', group: 'Actions', icon: SearchIcon, action: () => router.push('/dashboard/candidate/jobs') },
        { id: 'candidate-gen-resume', label: 'Generate Resume with AI', group: 'Actions', icon: Sparkles, action: () => router.push('/dashboard/candidate/resume-builder/new') },
        { id: 'candidate-analyze-resume', label: 'Analyze Resume', group: 'Actions', icon: Bot, action: () => {}, disabled: true },
        { id: 'candidate-job-invites', label: 'Job Invites', group: 'Actions', icon: Mail, action: () => {}, disabled: true },
        { id: 'nav-dashboard', label: 'Dashboard', group: 'Navigation', icon: Home, action: () => router.push('/dashboard') },
        { id: 'nav-my-applications', label: 'My Applications', group: 'Navigation', icon: Briefcase, action: () => router.push('/dashboard/candidate/applications') },
        { id: 'nav-resume-builder', label: 'Resume Builder', group: 'Navigation', icon: ResumeIcon, action: () => router.push('/dashboard/candidate/resume-builder') },
        { id: 'nav-practice', label: 'Practice', group: 'Navigation', icon: BookCopy, action: () => router.push('/dashboard/candidate/practice') },
      );
    }
    // Admin Account Commands
    else if (session?.role === 'admin') {
      commands.push(
        { id: 'admin-gen-questions', label: 'Generate Questions for Library', group: 'Actions', icon: Sparkles, action: () => router.push('/dashboard/admin/questions/new') },
        { id: 'nav-dashboard', label: 'Dashboard', group: 'Navigation', icon: Home, action: () => router.push('/dashboard') },
        { id: 'nav-analytics', label: 'Analytics', group: 'Navigation', icon: LayoutDashboard, action: () => router.push('/dashboard/analytics') },
        { id: 'nav-manage-companies', label: 'Manage Companies', group: 'Navigation', icon: Building2, action: () => router.push('/dashboard/admin/companies') },
        { id: 'nav-manage-candidates', label: 'Manage Candidates', group: 'Navigation', icon: Users, action: () => router.push('/dashboard/admin/candidates') },
        { id: 'nav-question-library', label: 'Question Library', group: 'Navigation', icon: Library, action: () => router.push('/dashboard/admin/questions') },
        { id: 'nav-subscriptions', label: 'Manage Subscriptions', group: 'Navigation', icon: CreditCard, action: () => router.push('/dashboard/admin/subscriptions/company') },
        { id: 'nav-coupons', label: 'Manage Offers & Coupons', group: 'Navigation', icon: TicketPercent, action: () => router.push('/dashboard/admin/coupons') },
      );
    }


    const settingsBase = [
        { id: 'settings-profile', label: 'Profile', group: 'Settings', icon: User, action: () => router.push('/dashboard/profile') },
        { id: 'settings-account', label: 'Account Settings', group: 'Settings', icon: SettingsIcon, action: () => router.push('/dashboard?settings=true&tab=Account') },
        { id: 'settings-appearance', label: 'Appearance', group: 'Settings', icon: Palette, action: () => router.push('/dashboard?settings=true&tab=Appearance') },
        { id: 'settings-security', label: 'Security', group: 'Settings', icon: Shield, action: () => router.push('/dashboard?settings=true&tab=Security')},
        { id: 'settings-help', label: 'Help', group: 'Settings', icon: HelpCircle, action: () => router.push('/dashboard?settings=true&tab=Help') },
    ];
    if (session?.role === 'company' || session?.role === 'manager') {
        settingsBase.splice(2, 0, { id: 'settings-managers', label: 'Company Account Managers', group: 'Settings', icon: Users, action: () => router.push('/dashboard/company/managers') });
    }
    commands.push(...settingsBase);

    return commands;
  }, [session, router, jobs, assessments, interviews]);
  
  const searchResults = React.useMemo(() => {
    if (!searchValue) return [];
    return allCommands
      .filter(cmd => cmd.label.toLowerCase().includes(searchValue.toLowerCase()))
      .slice(0, 6);
  }, [searchValue, allCommands]);

  const suggestions = React.useMemo(() => getSuggestions(allCommands), [getSuggestions, allCommands]);
  const topSettings = React.useMemo(() => getTopSettings(allCommands.filter(c => c.group === 'Settings')), [getTopSettings, allCommands]);


  React.useEffect(() => {
    // Reset search on open/close
    setSearchValue('');
  }, [open]);

  return (
    <>
      <CreateAssessmentDialog open={isCreateAssessmentOpen} onOpenChange={setIsCreateAssessmentOpen} />
      <GenerateAiInterviewDialog open={isGenerateAiInterviewOpen} onOpenChange={setIsGenerateAiInterviewOpen} />
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <CommandInput 
            placeholder="Type a command or search..."
            value={searchValue}
            onValueChange={setSearchValue}
        />
        <CommandList className="custom-scrollbar">
          <CommandEmpty>No results found.</CommandEmpty>

            {searchValue ? (
                 <CommandGroup heading="Search Results">
                    {searchResults.map((item) => (
                        <CommandItem key={item.id} onSelect={() => runCommand(item.id)} value={item.label}>
                            <item.icon className="mr-2 h-4 w-4" />
                            <span>{item.label}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{item.group}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            ) : (
                <>
                {suggestions.length > 0 && (
                    <CommandGroup heading="Suggestions">
                    {suggestions.map((item) => (
                        <CommandItem key={item.id} onSelect={() => runCommand(item.id)} value={item.label}>
                            <item.icon className="mr-2 h-4 w-4" />
                            <span>{item.label}</span>
                        </CommandItem>
                    ))}
                    </CommandGroup>
                )}

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
