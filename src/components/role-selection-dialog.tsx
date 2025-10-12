
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
import { Briefcase, Users, ArrowRight } from 'lucide-react';

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
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-center text-2xl">Join Career Edge</DialogTitle>
          <DialogDescription className="text-center">
            Are you looking for your next career opportunity or trying to find the perfect candidate?
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => handleSelection('/signup/candidate')}>
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Users className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline mt-4 text-center">I'm a Candidate</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4 text-sm min-h-[40px]">Find your dream job, get matched with top companies, practice for interviews, and manage your applications all in one place.</p>
                    <Button variant="ghost">Sign Up <ArrowRight className="ml-2"/></Button>
                </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => handleSelection('/signup/company')}>
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline mt-4 text-center">I'm a Company</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4 text-sm min-h-[40px]">Post job openings, track applicants, and find the perfect fit for your team.</p>
                    <Button variant="ghost">Sign Up <ArrowRight className="ml-2"/></Button>
                </CardContent>
            </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
