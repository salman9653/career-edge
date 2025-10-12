
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy } from 'lucide-react';

interface InviteLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteLink: string;
}

export function InviteLinkDialog({ open, onOpenChange, inviteLink }: InviteLinkDialogProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setHasCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setHasCopied(false), 2000);
    }, (err) => {
      toast({ variant: 'destructive', title: 'Failed to copy', description: 'Could not copy link to clipboard.' });
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manager Invitation Link</DialogTitle>
          <DialogDescription>
            Share this link with the manager to allow them to activate their account. This link can only be used once.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                Link
                </Label>
                <Input
                id="link"
                defaultValue={inviteLink}
                readOnly
                />
            </div>
            <Button type="button" size="sm" className="px-3" onClick={copyToClipboard}>
                <span className="sr-only">Copy</span>
                {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    