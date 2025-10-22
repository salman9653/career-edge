
'use client';

import { useState } from 'react';
import { Search, MessageSquare, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { AiChatPopup } from './ai-chat-popup';
import { useNotifications } from '@/context/notification-context';
import { Badge } from './ui/badge';
import { DashboardSidebar } from './dashboard-sidebar'; // Bit of a hack to get access to NotificationPanel

// This is a temporary solution to avoid circular dependencies.
// Ideally, NotificationPanel would be its own component.
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
    
    const unreadNotifications = notifications.filter(n => !n.isRead);
    const readNotifications = notifications.filter(n => n.isRead);
    
    let notificationsToShow: Notification[] = unreadNotifications;
    const limit = 7;
    
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
import { useRouter } from 'next/navigation';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import type { Notification } from '@/lib/types';


export function MobileSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className="relative flex items-center gap-1 md:hidden">
      <AnimatePresence>
        {!isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-1"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </Button>
             <Button asChild variant="ghost" size="icon">
                <Link href="/dashboard/chat">
                   <MessageSquare className="h-5 w-5"/>
                </Link>
            </Button>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5"/>
                         {unreadCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0">{unreadCount}</Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                 <PopoverContent className="w-screen max-w-sm p-0 mr-4">
                    <NotificationPanel />
                 </PopoverContent>
            </Popover>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 top-1/2 -translate-y-1/2"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 w-48 sm:w-64 rounded-full"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
