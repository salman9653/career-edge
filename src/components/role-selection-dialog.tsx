
'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, ArrowRight, Sparkles } from 'lucide-react';

interface RoleSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RoleSelectionDialog({ open, onOpenChange }: RoleSelectionDialogProps) {
  const router = useRouter();

  const handleSelection = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] border-primary/10 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="space-y-3 pb-2">
          
          <DialogTitle className="font-headline text-center text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Join Career Edge
          </DialogTitle>
          <DialogDescription className="text-center text-base px-4">
            Choose your path and unlock your potential with our platform
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <Card 
              className="group cursor-pointer border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50 overflow-hidden relative" 
              onClick={() => handleSelection('/signup/candidate')}
            >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="relative z-10 pb-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-blue-600 dark:from-blue-400/20 dark:to-blue-500/10 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-8 w-8" />
                    </div>
                    <CardTitle className="font-headline mt-6 text-center text-2xl">I'm a Candidate</CardTitle>
                </CardHeader>
                <CardContent className="text-center relative z-10 pb-6">
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed min-h-[60px]">
                      Find your dream job, get matched with top companies, practice for interviews, and manage your applications all in one place.
                    </p>
                    <Button 
                      variant="ghost" 
                      className="w-full h-11 rounded-lg group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all"
                    >
                      Get Started 
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                    </Button>
                </CardContent>
            </Card>
            
            <Card 
              className="group cursor-pointer border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50 overflow-hidden relative" 
              onClick={() => handleSelection('/signup/company')}
            >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="relative z-10 pb-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 text-purple-600 dark:from-purple-400/20 dark:to-purple-500/10 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                        <Briefcase className="h-8 w-8" />
                    </div>
                    <CardTitle className="font-headline mt-6 text-center text-2xl">I'm a Company</CardTitle>
                </CardHeader>
                <CardContent className="text-center relative z-10 pb-6">
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed min-h-[60px]">
                      Post job openings, discover top talent, streamline your hiring process, and build your dream team.
                    </p>
                    <Button 
                      variant="ghost" 
                      className="w-full h-11 rounded-lg group-hover:bg-purple-500/10 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-all"
                    >
                      Get Started 
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"/>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
