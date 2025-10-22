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

export function MobileSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5"/>
                    </Button>
                </PopoverTrigger>
                 <PopoverContent className="w-[380px] p-0 mr-4">
                    <div className="p-4">
                        <p className="font-semibold">Notifications</p>
                        <div className="text-center text-sm text-muted-foreground py-12">
                            No new notifications
                        </div>
                    </div>
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
