
'use client';

import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function AiChatPopup() {
  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <div className="h-full w-full flex items-center justify-center bg-dash-primary/10 rounded-full">
              <Sparkles className="h-5 w-5 text-dash-primary" />
            </div>
          </Avatar>
          <div>
            <p className="font-semibold">Career AI</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/dashboard/chat">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Go to full inbox page</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>
      {/* Messages Area */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
        <div className="flex-1" />
        <div className="space-y-6">
          <div className="flex items-end gap-3 justify-start">
            <Avatar className="h-8 w-8">
              <div className="h-full w-full flex items-center justify-center bg-dash-primary/10 rounded-full">
                <Sparkles className="h-5 w-5 text-dash-primary" />
              </div>
            </Avatar>
            <div className="p-3 rounded-lg rounded-bl-none bg-muted max-w-lg">
              <p className="text-sm">
                Hello! I'm Career AI, your dedicated assistant. I'm currently getting ready to help you supercharge your workflow and will be fully operational soon!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 bg-background border-t">
        <div className="relative">
          <Input placeholder="Type your message..." className="pr-12 rounded-full h-12" />
          <Button type="submit" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full h-9 w-9">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
