

'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Package, User, Users, Users2, LineChart, Search, Settings, LogOut, Moon, Sun, Briefcase, Library, FileCheck, ClipboardList, BookUser, Book, BookCopy, CreditCard, TicketPercent, Palette, Laptop, Check, ChevronRight, HelpCircle, MessageSquare, Sparkles, PanelLeft, AppWindow } from "lucide-react"
import { useTheme as useNextTheme } from "next-themes"
import { useState } from "react"
import { useTheme } from "@/context/dashboard-theme-context"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Logo } from "./logo"
import type { NavItem } from "@/lib/types"
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
  } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import type { UserSession } from "@/hooks/use-session"
import { DashboardLayoutWrapper } from "@/app/dashboard/layout-wrapper"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { AiChatPopup } from "./ai-chat-popup"
import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet"
import * as SheetPrimitive from "@radix-ui/react-dialog"

const candidateNavItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/candidate/jobs", label: "Jobs", icon: Briefcase },
    { href: "/dashboard/candidate/applications", label: "My Applications", icon: Package },
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
  role: 'candidate' | 'company' | 'admin' | 'manager';
  user: UserSession | null;
}

const SidebarContent = ({ navItems, user }: { navItems: NavItem[], user: UserSession | null }) => {
    const pathname = usePathname();
    const router = useRouter();

    const { setTheme: setNextTheme } = useNextTheme();

    const handleLogout = () => {
        sessionStorage.clear();
        document.cookie = 'firebase-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/');
    }

    const getInitials = (name: string | null) => {
        if (!name) return '';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    const openAppearanceSettings = () => {
        router.push(pathname + '?settings=true&tab=Appearance');
    }

    const openAccountSettings = () => {
        router.push(pathname + '?settings=true&tab=Account');
    }

    return (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-16 items-center gap-3 px-4 lg:px-6 py-12">
                <Logo />
            </div>
            <div className="flex-1 overflow-auto py-2">
                <div className="px-4 mb-4 hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-primary" />
                        <Input
                            type="search"
                            placeholder="Search anything"
                            className="pl-9 w-full themed-clear-button rounded-full"
                        />
                    </div>
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
                <div className="flex items-center gap-0 rounded-md border p-1">
                    <Button
                        asChild
                        variant="ghost"
                        className={cn(
                            "flex flex-1 items-center justify-start gap-2 rounded-l-md px-3 py-2.5 text-muted-foreground transition-all hover:text-dash-primary hover:bg-accent",
                            pathname === '/dashboard/chat' && 'bg-accent text-dash-primary'
                        )}
                    >
                        <Link href="/dashboard/chat">
                            <MessageSquare className="h-5 w-5" />
                            Inbox
                        </Link>
                    </Button>
                    <div className="hidden md:block">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "flex items-center justify-center rounded-r-md p-3 text-muted-foreground transition-all hover:text-dash-primary hover:bg-accent border-l"
                                    )}
                                >
                                    <Sparkles className="h-6 w-6" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent side="right" align="start" className="w-[400px] p-0 rounded-lg overflow-hidden">
                                <AiChatPopup />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="block md:hidden">
                        <Button
                            asChild
                            variant="ghost"
                            className={cn(
                                "flex items-center justify-center rounded-r-md p-3 text-muted-foreground transition-all hover:text-dash-primary hover:bg-accent border-l"
                            )}
                        >
                            <Link href="/dashboard/chat?conversation=career-ai">
                                <Sparkles className="h-6 w-6" />
                            </Link>
                        </Button>
                    </div>
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
    let navItems: NavItem[];
    switch (role) {
        case 'admin':
            navItems = adminNavItems;
            break;
        case 'company':
        case 'manager':
            navItems = companyNavItems;
            break;
        case 'candidate':
            navItems = candidateNavItems;
            break;
        default:
            navItems = [];
    }

    return (
        <>
            <div className="hidden bg-sidebar md:block rounded-r-lg shadow-lg">
                <SidebarContent navItems={navItems} user={user} />
            </div>
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="fixed top-3 left-4 z-40 md:hidden bg-background/50 backdrop-blur-sm"
                    >
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[90%] sm:max-w-sm bg-sidebar">
                    <SheetPrimitive.Title className="sr-only">Navigation Menu</SheetPrimitive.Title>
                    <SidebarContent navItems={navItems} user={user} />
                </SheetContent>
            </Sheet>
        </>
    )
}
