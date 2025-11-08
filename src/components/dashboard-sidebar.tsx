
'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Package, User, Users, Users2, LineChart, Search, Settings, LogOut, Moon, Sun, Briefcase, Library, FileCheck, ClipboardList, BookUser, Book, BookCopy, CreditCard, TicketPercent, Palette, Laptop, Check, ChevronRight, HelpCircle, MessageSquare, Sparkles, PanelLeft, AppWindow, Bell, FileText as ResumeIcon, Command } from "lucide-react"
import { useTheme as useNextTheme } from "next-themes"
import { useState, useContext, useTransition, useEffect } from "react"
import { useTheme } from "@/context/dashboard-theme-context"
import { formatDistanceToNow } from 'date-fns'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Logo } from "./logo"
import type { NavItem, Notification } from "@/lib/types"
import { Input } from "./ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
    DropdownMenuSubContent
  } from "./ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import type { UserSession } from "@/hooks/use-session"
import { DashboardLayoutWrapper } from "@/app/dashboard/layout-wrapper"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { AiChatPopup } from "./ai-chat-popup"
import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet"
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from "@/context/notification-context"
import { ScrollArea } from "./ui/scroll-area"
import { Badge } from "./ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Kbd } from "./ui/kbd"

const candidateNavItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/candidate/jobs", label: "Jobs", icon: Briefcase },
    { href: "/dashboard/candidate/applications", label: "My Applications", icon: Package },
    { href: "/dashboard/candidate/resume-builder", label: "Resume Builder", icon: ResumeIcon },
    { href: "/dashboard/candidate/practice", label: "Practice", icon: Book },
];

const companyNavItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/analytics", label: "Analytics", icon: LineChart },
    { href: "/dashboard/company/ats", label: "ATS", icon: FileCheck },
    { href: "/dashboard/company/crm", label: "CRM", icon: BookUser },
    { href: "/dashboard/company/jobs", label: "Job Postings", icon: Briefcase },
    { href: "/dashboard/company/templates", label: "Templates", icon: AppWindow },
    { href: "/dashboard/company/questions", label: "Question Bank", icon: Library },
];

const adminNavItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/analytics", label: "Analytics", icon: LineChart },
    { href: "/dashboard/admin/companies", label: "Manage Companies", icon: Briefcase },
    { href: "/dashboard/admin/candidates", label: "Manage Candidates", icon: Users },
    { href: "/dashboard/admin/questions", label: "Question Library", icon: Library },
    { href: "/dashboard/admin/practice", label: "Manage Practice Module", icon: BookCopy },
]

interface DashboardSidebarProps {
  role: 'candidate' | 'company' | 'admin' | 'manager' | 'adminAccountManager';
  user: UserSession | null;
}

const NotificationPanel = () => {
    const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
    const router = useRouter();

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        router.push(notification.link);
    };
    
    const getInitials = (name: string) => {
        if (!name) return '';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    // Show all unread, and if less than a limit, fill with recent read ones.
    const limit = 7;
    const unreadNotifications = notifications.filter(n => !n.isRead);
    const readNotifications = notifications.filter(n => n.isRead);
    
    let notificationsToShow: Notification[] = unreadNotifications;
    if (unreadNotifications.length < limit) {
        const remainingCount = limit - unreadNotifications.length;
        notificationsToShow = [
            ...unreadNotifications,
            ...readNotifications.slice(0, remainingCount)
        ];
    }
    

    return (
        <div className="flex flex-col h-[400px]">
            <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                    <p className="font-semibold">Notifications</p>
                    {unreadCount > 0 && (
                        <Button variant="link" size="sm" className="p-0 h-auto" onClick={markAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-3 p-4">
                    {notifications.length > 0 ? (
                        <TooltipProvider>
                        {notificationsToShow.map((n) => (
                            <div
                                key={n.id}
                                className={cn(
                                    "p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
                                    !n.isRead && "bg-blue-500/10",
                                    n.isRead && "opacity-70 hover:opacity-100"
                                )}
                                onClick={() => handleNotificationClick(n)}
                            >
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8 mt-1">
                                        <AvatarFallback>{getInitials(n.senderName)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-sm">
                                            {n.applicantCount && n.applicantCount > 1 ? (
                                                <div>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="font-bold cursor-pointer hover:underline">
                                                                {n.applicantCount} new candidates
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <ul className="list-disc list-inside">
                                                                {n.newApplicantNames?.map((name, i) => <li key={i}>{name}</li>)}
                                                            </ul>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    {` have applied for `}
                                                    <span className="font-bold">{n.jobTitle}</span>.
                                                </div>
                                            ) : (
                                                <div>{n.message}</div>
                                            )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true })}
                                        </p>
                                    </div>
                                     {!n.isRead && (
                                        <div className="h-2 w-2 rounded-full bg-dash-primary mt-2" />
                                    )}
                                </div>
                            </div>
                        ))}
                        </TooltipProvider>
                    ) : (
                        <div className="text-center text-sm text-muted-foreground py-12">
                             <Bell className="mx-auto h-8 w-8 mb-2" />
                            No new notifications
                        </div>
                    )}
                </div>
            </ScrollArea>
             <div className="p-2 border-t text-center">
                <Button variant="link" size="sm" asChild>
                    <Link href="/dashboard/notifications">
                        Show all notifications
                    </Link>
                </Button>
            </div>
        </div>
    );
};

const SidebarContent = ({ role, user }: DashboardSidebarProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const { setTheme: setNextTheme } = useNextTheme();
    const { unreadCount } = useNotifications();

    let navItems: NavItem[];
    switch (role) {
        case 'admin':
        case 'adminAccountManager':
             navItems = adminNavItems; break;
        case 'company':
        case 'manager': navItems = companyNavItems; break;
        case 'candidate': default: navItems = candidateNavItems; break;
    }

    const handleLogout = () => {
        sessionStorage.clear();
        document.cookie = 'firebase-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/');
    };

    const getInitials = (name: string | null) => {
        if (!name) return '';
        const names = name.split(' ');
        if (names.length > 1) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const openAppearanceSettings = () => router.push(pathname + '?settings=true&tab=Appearance');
    const openAccountSettings = () => router.push(pathname + '?settings=true&tab=Account');

    const handleSearchClick = () => {
        // This will be handled by the layout component
        const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
        document.dispatchEvent(event);
    }

    return (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-16 items-center gap-3 px-4 lg:px-6 py-12">
                <Logo />
            </div>
            <div className="flex-1 overflow-auto py-2">
                 <div className="px-4 mb-4">
                    <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={handleSearchClick}>
                        <Search className="mr-2 h-4 w-4" />
                        Search...
                        <div className="ml-auto flex items-center gap-1">
                            <Kbd><Command className="h-3 w-3" /></Kbd>
                            <Kbd>K</Kbd>
                        </div>
                    </Button>
                </div>
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-dash-primary hover:bg-accent",
                                (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && "bg-accent text-dash-primary"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-4 space-y-2">
                 <div className="flex items-center justify-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-11 w-11 rounded-lg bg-muted/50 relative">
                                <Bell className="h-5 w-5"/>
                                {unreadCount > 0 && (
                                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0">{unreadCount}</Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                         <PopoverContent className="w-[380px] p-0 mr-4">
                            <NotificationPanel />
                         </PopoverContent>
                    </Popover>
                    <Button asChild variant="ghost" size="icon" className="h-11 w-11 rounded-lg bg-muted/50">
                        <Link href="/dashboard/chat">
                           <MessageSquare className="h-5 w-5"/>
                        </Link>
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-lg bg-muted/50">
                                <Sparkles className="h-5 w-5"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent side="right" align="start" className="w-[400px] p-0 rounded-lg overflow-hidden">
                            <AiChatPopup />
                        </PopoverContent>
                    </Popover>
                </div>
                
                {user && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" className="w-full justify-start gap-3 rounded-lg h-auto p-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user.displayImageUrl ?? undefined} alt={user.displayName} />
                                <AvatarFallback className="bg-dash-primary text-dash-primary-foreground">{getInitials(user.displayName)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-left">
                                <span className="text-sm font-semibold leading-none">{user.displayName}</span>
                                <span className="text-xs leading-none text-muted-foreground mt-1">
                                    {user.email}
                                </span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuPortal>
                    <DropdownMenuContent className="w-64 mb-2 rounded-lg" align="end" forceMount>
                        <DashboardLayoutWrapper>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.displayImageUrl ?? undefined} alt={user.displayName} />
                                    <AvatarFallback className="bg-dash-primary text-dash-primary-foreground">{getInitials(user.displayName)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.displayName}</p>

                                    <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                    </p>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="rounded-md">
                            <Link href="/dashboard/profile">
                                <User className="mr-2" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                         <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="rounded-md">
                            <Palette className="mr-2" />
                            <span>Theme</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                            <DropdownMenuSubContent className="rounded-lg">
                                <DropdownMenuItem onClick={() => setNextTheme("light")} className="rounded-md">
                                    <Sun className="mr-2"/> Light
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setNextTheme("dark")} className="rounded-md">
                                    <Moon className="mr-2"/> Dark
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setNextTheme("system")} className="rounded-md">
                                    <Laptop className="mr-2"/> System
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={openAppearanceSettings} className="rounded-md justify-between">
                                    <span>Appearance settings</span>
                                    <ChevronRight />
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuItem onSelect={openAccountSettings} className="rounded-md">
                            <Settings className="mr-2" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-500/10 rounded-md">
                            <LogOut className="mr-2"/>Log out
                        </DropdownMenuItem>
                        </DashboardLayoutWrapper>
                    </DropdownMenuContent>
                    </DropdownMenuPortal>
                </DropdownMenu>
                )}
            </div>
        </div>
    )
}

export function DashboardSidebar({ role, user }: DashboardSidebarProps) {
    return (
        <>
            <div className="hidden border-r bg-sidebar md:block">
                <SidebarContent role={role} user={user} />
            </div>
             <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden fixed top-3 left-4 z-40"
                    >
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-full max-w-[280px]">
                    <SidebarContent role={role} user={user} />
                </SheetContent>
            </Sheet>
        </>
    )
}
