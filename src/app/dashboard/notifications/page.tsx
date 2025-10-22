'use client';

import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { MobileSearch } from '@/components/mobile-search';
import { useNotifications } from '@/context/notification-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Bell, Loader2 } from 'lucide-react';
import type { Notification } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function NotificationsPage() {
  const { session, loading: sessionLoading } = useSession();
  const { notifications, loading: notificationsLoading, markAsRead } = useNotifications();
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

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <div className="flex min-h-screen items-center justify-center"><p>Redirecting to login...</p></div>;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar role={session.role} user={session} />
      <div className="flex flex-col max-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
            <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Notifications</h1>
            <MobileSearch />
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:p-6">
           <Card className="flex-1 flex flex-col">
                <CardHeader>
                    <CardTitle>All Notifications</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                        <div className="space-y-3">
                        {notificationsLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
                                        !n.isRead && "bg-blue-500/10"
                                    )}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarFallback>{getInitials(n.senderName)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-sm">{n.message}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true })}
                                            </p>
                                        </div>
                                         {!n.isRead && (
                                            <div className="h-2.5 w-2.5 rounded-full bg-dash-primary mt-2" />
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-sm text-muted-foreground py-12">
                                <Bell className="mx-auto h-8 w-8 mb-2" />
                                No notifications yet.
                            </div>
                        )}
                        </div>
                    </ScrollArea>
                </CardContent>
           </Card>
        </main>
      </div>
    </div>
  );
}
