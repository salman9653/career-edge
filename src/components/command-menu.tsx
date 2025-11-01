
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
    HelpCircle
} from 'lucide-react';
import type { NavItem } from '@/lib/types';


interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  const { session } = useSession();

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  const commandGroups = React.useMemo(() => {
    const candidateCommands: NavItem[] = [
      { href: '/dashboard/candidate/jobs', label: 'Find Jobs', icon: Briefcase },
      { href: '/dashboard/candidate/applications', label: 'My Applications', icon: BookCopy },
      { href: '/dashboard/candidate/resume-builder', label: 'Generate Resume', icon: ResumeIcon },
    ];
    const companyCommands: NavItem[] = [
      { href: '/dashboard/company/ats', label: 'ATS', icon: FileCheck },
      { href: '/dashboard/company/crm', label: 'CRM', icon: BookUser },
      { href: '/dashboard/company/jobs', label: 'Job Postings', icon: Briefcase },
      { href: '/dashboard/company/templates', label: 'Assessments', icon: AppWindow },
      { href: '/dashboard/company/templates?tab=ai-interviews', label: 'AI Interviews', icon: AppWindow },
      { href: '/dashboard/company/questions?tab=library', label: 'Library Questions', icon: Library },
      { href: '/dashboard/company/questions?tab=custom', label: 'Custom Questions', icon: Library },
    ];
    const adminCommands: NavItem[] = [
      { href: '/dashboard/admin/companies', label: 'Manage Companies', icon: Briefcase },
      { href: '/dashboard/admin/candidates', label: 'Manage Candidates', icon: Users },
      { href: '/dashboard/admin/questions', label: 'Question Library', icon: Library },
      { href: '/dashboard/admin/subscriptions', label: 'Subscription Plans', icon: CreditCard },
      { href: '/dashboard/admin/coupons', label: 'Offers & Coupons', icon: TicketPercent },
    ];

    const settingsCommands = [
      { action: () => router.push('/dashboard/profile'), label: 'Profile', icon: User },
      { action: () => router.push('/dashboard?settings=true&tab=Account'), label: 'Account Settings', icon: SettingsIcon },
      { action: () => router.push('/dashboard?settings=true&tab=Appearance'), label: 'Appearance Settings', icon: Palette },
      { action: () => router.push('/dashboard?settings=true&tab=Help'), label: 'Help', icon: HelpCircle },
    ];

    let roleBasedCommands: NavItem[] = [];
    if (session?.role === 'admin') roleBasedCommands = adminCommands;
    else if (session?.role === 'company' || session?.role === 'manager') roleBasedCommands = companyCommands;
    else if (session?.role === 'candidate') roleBasedCommands = candidateCommands;

    return [
      {
        heading: 'Suggestions',
        commands: roleBasedCommands.map(item => ({
            ...item,
            action: () => router.push(item.href)
        }))
      },
      {
        heading: 'Settings',
        commands: settingsCommands
      }
    ];

  }, [session, router]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {commandGroups.map((group) => (
          <CommandGroup key={group.heading} heading={group.heading}>
            {group.commands.map(({ icon: Icon, label, action }) => (
              <CommandItem key={label} onSelect={() => runCommand(action)} value={label}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
