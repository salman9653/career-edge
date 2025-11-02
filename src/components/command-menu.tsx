
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


interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  const { session } = useSession();

  const runCommand = React.useCallback((command: () => unknown) => {
    onOpenChange(false)
    command()
  }, [onOpenChange])


  const commandGroups = React.useMemo(() => {
    const candidateNav: NavItem[] = [
      { href: '/dashboard/candidate/jobs', label: 'Find Jobs', icon: Briefcase },
      { href: '/dashboard/candidate/applications', label: 'My Applications', icon: BookCopy },
    ];
    const companyNav: NavItem[] = [
      { href: '/dashboard/company/ats', label: 'ATS', icon: FileCheck },
      { href: '/dashboard/company/crm', label: 'CRM', icon: BookUser },
      { href: '/dashboard/company/jobs', label: 'Job Postings', icon: Briefcase },
      { href: '/dashboard/company/templates', label: 'Templates', icon: AppWindow },
    ];
    const adminNav: NavItem[] = [
      { href: '/dashboard/admin/companies', label: 'Manage Companies', icon: Briefcase },
      { href: '/dashboard/admin/candidates', label: 'Manage Candidates', icon: Users },
      { href: '/dashboard/admin/questions', label: 'Question Library', icon: Library },
      { href: '/dashboard/admin/subscriptions/company', label: 'Subscription Plans', icon: CreditCard },
      { href: '/dashboard/admin/coupons', label: 'Offers & Coupons', icon: TicketPercent },
    ];

    const candidateActions = [
        { action: () => router.push('/dashboard/candidate/resume-builder/new'), label: 'Generate Resume', icon: ResumeIcon },
        { action: () => {}, label: 'Analyze Resume', icon: Bot, disabled: true },
        { action: () => router.push('/dashboard/candidate/jobs'), label: 'Find Jobs', icon: SearchIcon },
        { action: () => {}, label: 'Job Invites', icon: Mail, disabled: true },
    ];

    const companyActions = [
        { action: () => router.push('/dashboard/company/jobs/new'), label: 'Post New Job', icon: PlusCircle },
        { action: () => router.push('/dashboard/company/templates?tab=assessments'), label: 'Create Assessment', icon: AppWindow },
        { action: () => router.push('/dashboard/company/templates?tab=ai-interviews'), label: 'Generate AI Interview', icon: Bot },
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

    let roleBasedNav: NavItem[] = [];
    let roleBasedActions: { action: () => void; label: string; icon: React.ElementType, disabled?: boolean }[] = [];

    if (session?.role === 'admin') {
      roleBasedNav = adminNav;
      roleBasedActions = adminActions;
    } else if (session?.role === 'company' || session?.role === 'manager') {
      roleBasedNav = companyNav;
      roleBasedActions = companyActions;
    } else if (session?.role === 'candidate') {
      roleBasedNav = candidateNav;
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
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
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
  );
}
