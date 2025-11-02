
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
    BookCopy,
    Home,
    User,
    Palette,
    Settings as SettingsIcon,
    HelpCircle,
    PlusCircle,
    Bot,
    Search as SearchIcon,
    Mail,
    FileText
} from 'lucide-react';
import type { NavItem } from '@/lib/types';
import { CreateAssessmentDialog } from '@/app/dashboard/company/assessments/_components/create-assessment-dialog';
import { GenerateAiInterviewDialog } from '@/app/dashboard/company/templates/_components/generate-ai-interview-dialog';


interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  const { session } = useSession();
  const [isCreateAssessmentOpen, setIsCreateAssessmentOpen] = React.useState(false);
  const [isGenerateAiInterviewOpen, setIsGenerateAiInterviewOpen] = React.useState(false);

  const runCommand = React.useCallback((command: () => unknown) => {
    onOpenChange(false)
    command()
  }, [onOpenChange])


  const commandGroups = React.useMemo(() => {
    const candidateActions = [
        { action: () => router.push('/dashboard/candidate/resume-builder/new'), label: 'Generate Resume', icon: ResumeIcon },
        { action: () => {}, label: 'Analyze Resume', icon: Bot, disabled: true },
        { action: () => router.push('/dashboard/candidate/jobs'), label: 'Find Jobs', icon: SearchIcon },
        { action: () => {}, label: 'Job Invites', icon: Mail, disabled: true },
    ];

    const companyActions = [
        { action: () => router.push('/dashboard/company/jobs/new'), label: 'Post New Job', icon: PlusCircle },
        { action: () => setIsCreateAssessmentOpen(true), label: 'Create Assessment', icon: AppWindow },
        { action: () => setIsGenerateAiInterviewOpen(true), label: 'Generate AI Interview', icon: Bot },
        { action: () => router.push('/dashboard/company/questions/new'), label: 'Generate Questions', icon: FileText },
    ];

    const adminActions = [
        { action: () => router.push('/dashboard/admin/questions/new'), label: 'Generate Questions for Library', icon: Library },
        { action: () => router.push('/dashboard/admin/subscriptions/company'), label: 'Manage Subscriptions', icon: CreditCard },
        { action: () => router.push('/dashboard/admin/coupons'), label: 'Manage Offers & Coupons', icon: TicketPercent },
        { action: () => router.push('/dashboard?settings=true&tab=Platform+Settings'), label: 'Manage Platform Settings', icon: SettingsIcon },
    ]

    const settingsCommands = [
      { action: () => router.push('/dashboard/profile'), label: 'Profile', icon: User },
      { action: () => router.push('/dashboard?settings=true&tab=Account'), label: 'Account Settings', icon: SettingsIcon },
      { action: () => router.push('/dashboard?settings=true&tab=Appearance'), label: 'Appearance Settings', icon: Palette },
      { action: () => router.push('/dashboard?settings=true&tab=Help'), label: 'Help', icon: HelpCircle },
    ];

    let roleBasedActions: { action: () => void; label: string; icon: React.ElementType, disabled?: boolean }[] = [];

    if (session?.role === 'admin') {
      roleBasedActions = adminActions;
    } else if (session?.role === 'company' || session?.role === 'manager') {
      roleBasedActions = companyActions;
    } else if (session?.role === 'candidate') {
      roleBasedActions = candidateActions;
    }

    return [
      {
        heading: 'Suggestions',
        commands: roleBasedActions.map(item => ({
            ...item,
            onSelect: item.disabled ? () => {} : () => runCommand(item.action)
        }))
      },
      {
        heading: 'Settings',
        commands: settingsCommands.map(item => ({
            ...item,
            onSelect: () => runCommand(item.action)
        }))
      }
    ];

  }, [session, router, runCommand]);

  return (
    <>
      <CreateAssessmentDialog open={isCreateAssessmentOpen} onOpenChange={setIsCreateAssessmentOpen} />
      <GenerateAiInterviewDialog open={isGenerateAiInterviewOpen} onOpenChange={setIsGenerateAiInterviewOpen} />
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList className="custom-scrollbar">
          <CommandEmpty>No results found.</CommandEmpty>
          {commandGroups.map((group, index) => (
            <React.Fragment key={group.heading}>
              <CommandGroup heading={group.heading}>
                {group.commands.map(({ icon: Icon, label, onSelect, disabled }) => (
                  <CommandItem key={label} onSelect={onSelect} disabled={disabled} className="cursor-pointer">
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              {index < commandGroups.length - 1 && <CommandSeparator />}
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
