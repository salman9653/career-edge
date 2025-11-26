
'use client';
import { useSession } from '@/hooks/use-session';
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search, Sparkles, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MobileSearch } from '@/components/mobile-search';
import { careerChatAction } from '@/app/actions';

interface Message {
  id: number;
  role: 'user' | 'model';
  text: string;
}

function ChatPageContent() {
    const { session, loading } = useSession();
    const searchParams = useSearchParams();
    const initialConversation = searchParams.get('conversation');
    const [activeConversation, setActiveConversation] = useState<string | null>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (initialConversation) {
            setActiveConversation(initialConversation);
            if (initialConversation === 'career-ai' && messages.length === 0) {
                setMessages([
                { id: 0, role: 'model', text: "Hello! I'm Career AI, your dedicated assistant. How can I help you today?" }
                ]);
            }
        }
    }, [initialConversation, messages.length]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !session) return;

        const newMessages: Message[] = [...messages, { id: Date.now(), role: 'user', text: input }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
        const stream = await careerChatAction({
            message: input,
            history: newMessages.slice(0, -1).map(m => ({ role: m.role, text: m.text })),
            userName: session.displayName,
            userRole: session.role
        });
        
        let aiResponse = '';
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'model', text: '' }]);

        for await (const chunk of stream) {
            aiResponse += chunk;
            setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.role === 'model') {
                return [...prev.slice(0, -1), { ...lastMessage, text: aiResponse }];
            }
            return prev;
            });
        }

        } catch (error) {
        console.error("Error with chat action:", error);
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
        setIsLoading(false);
        }
    };


    if (loading) {
        return (
        <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]">
            {session && <DashboardSidebar role={session.role} user={session} />}
            <div className="flex flex-col max-h-screen">
                <main className="flex flex-1 flex-col overflow-auto custom-scrollbar">
                    <div className="flex-1" />
                </main>
            </div>
        </div>
        );
    }

    if (!session) {
        return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Redirecting to login...</p>
        </div>
        );
    }
    
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DashboardSidebar role={session.role} user={session} />
        <div className="flex flex-col max-h-screen">
            <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:hidden">
                <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">Inbox</h1>
                <MobileSearch />
            </header>
            <main className="flex-1 overflow-auto custom-scrollbar">
                <ResizablePanelGroup
                    direction="horizontal"
                    className="w-full h-full"
                >
                    <ResizablePanel defaultSize={30} minSize={20} maxSize={40} className={cn("flex-col", activeConversation ? "hidden md:flex" : "flex")}>
                        {/* Conversations Sidebar */}
                        <div className="w-full h-full flex flex-col bg-muted/30">
                        <div className="p-4 border-b">
                            <h1 className="font-headline text-2xl font-semibold mb-4 hidden md:block">Inbox</h1>
                            <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search conversations..." className="pl-9 rounded-full" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div 
                                onClick={() => setActiveConversation('career-ai')}
                                className={cn(
                                    "flex items-center gap-3 p-4 cursor-pointer border-l-4 border-transparent",
                                    activeConversation === 'career-ai' && "bg-accent text-accent-foreground border-dash-primary"
                                )}
                            >
                                <Avatar className="h-12 w-12 border-2 border-dash-primary">
                                    <div className="h-full w-full flex items-center justify-center bg-dash-primary/10">
                                        <Sparkles className="h-6 w-6 text-dash-primary" />
                                    </div>
                                </Avatar>
                                <div className="flex-1 truncate">
                                    <p className="font-semibold">Career AI</p>
                                    <p className="text-sm text-muted-foreground truncate">Your personal career assistant.</p>
                                </div>
                            </div>
                        </div>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle className={cn(activeConversation ? "hidden md:flex" : "flex")} />
                    <ResizablePanel defaultSize={70} className={cn("flex-col", activeConversation ? "flex" : "hidden md:flex")}>
                        {/* Chat Window */}
                        <div className="flex flex-1 flex-col h-full">
                            <div className="flex items-center p-4 border-b">
                                <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setActiveConversation(null)}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
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
                            </div>
                            {/* Messages Area */}
                            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                                <div className="space-y-6">
                                {messages.map((message) => (
                                    <div key={message.id} className={cn("flex items-end gap-3", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                        {message.role === 'model' && (
                                            <Avatar className="h-8 w-8">
                                                <div className="h-full w-full flex items-center justify-center bg-dash-primary/10 rounded-full">
                                                    <Sparkles className="h-5 w-5 text-dash-primary" />
                                                </div>
                                            </Avatar>
                                        )}
                                        <div className={cn(
                                            "p-3 rounded-lg max-w-lg",
                                            message.role === 'user' ? 'bg-dash-primary text-dash-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'
                                        )}>
                                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                        </div>
                                        {message.role === 'user' && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={session.displayImageUrl ?? undefined} />
                                                <AvatarFallback>{session.displayName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Message Input */}
                            <div className="p-4 bg-background">
                                <form onSubmit={handleSubmit}>
                                <div className="relative">
                                    <Input 
                                        placeholder="Type your message..." 
                                        className="pr-12 rounded-full h-12"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <Button type="submit" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full h-9 w-9" disabled={isLoading}>
                                        <Send className="h-4 w-4" />
                                        <span className="sr-only">Send</span>
                                    </Button>
                                </div>
                                </form>
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>
        </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
             <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <ChatPageContent />
        </Suspense>
    )
}
