
'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronDown, Share2, Clipboard, Mail, Check, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Label } from './ui/label';

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const WhatsAppIcon = () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24">
      <path fill="currentColor" fillRule="evenodd" d="M12 4a8 8 0 0 0-6.895 12.06l.569.718-.697 2.359 2.32-.648.379.243A8 8 0 1 0 12 4ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.96 9.96 0 0 1-5.016-1.347l-4.948 1.382 1.426-4.829-.006-.007-.033-.055A9.958 9.958 0 0 1 2 12Z" clipRule="evenodd"/>
      <path fill="currentColor" d="M16.735 13.492c-.038-.018-1.497-.736-1.756-.83a1.008 1.008 0 0 0-.34-.075c-.196 0-.362.098-.49.291-.146.217-.587.732-.723.886-.018.02-.042.045-.057.045-.013 0-.239-.093-.307-.123-1.564-.68-2.751-2.313-2.914-2.589-.023-.04-.024-.057-.024-.057.005-.021.058-.074.085-.101.08-.079.166-.182.249-.283l.117-.14c.121-.14.175-.25.237-.375l.033-.066a.68.68 0 0 0-.02-.64c-.034-.069-.65-1.555-.715-1.711-.158-.377-.366-.552-.655-.552-.027 0 0 0-.112.005-.137.005-.883.104-1.213.311-.35.22-.94.924-.94 2.16 0 1.112.705 2.162 1.008 2.561l.041.06c1.161 1.695 2.608 2.951 4.074 3.537 1.412.564 2.081.63 2.461.63.16 0 .288-.013.4-.024l.072-.007c.488-.043 1.56-.599 1.804-1.276.192-.534.243-1.117.115-1.329-.088-.144-.239-.216-.43-.308Z"/>
    </svg>
);

const SMSIcon = () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 10.5h.01M12 10.5h.01M8 10.5h.01M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-6.6a1 1 0 0 0-.69.275l-2.866 2.723A.5.5 0 0 1 8 20.226V16a1 1 0 0 0-1-1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>
    </svg>
);


interface ShareButtonGroupProps {
    jobTitle: string;
    companyName: string;
    jobLink: string;
}

export function ShareButtonGroup({ jobTitle, companyName, jobLink }: ShareButtonGroupProps) {
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(jobLink).then(() => {
          toast({ title: "Job link copied!" });
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 3000);
        }).catch(err => {
          toast({ variant: "destructive", title: "Failed to copy", description: "Could not copy link to clipboard." });
        });
    };

    const handleShare = async (platform: 'email' | 'whatsapp' | 'twitter' | 'sms' | 'native') => {
        const text = `Check out this job: ${jobTitle} at ${companyName}.`;
        const subject = `Job Opportunity: ${jobTitle} at ${companyName}`;

        if (platform === 'native' && navigator.share) {
            try {
                await navigator.share({ title: subject, text: text, url: jobLink });
            } catch (error) {
                console.error("Error using native share:", error);
            }
            return;
        }

        let url = '';
        switch (platform) {
            case 'email':
                url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text + '\n\n' + jobLink)}`;
                break;
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + jobLink)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(jobLink)}`;
                break;
            case 'sms':
                url = `sms:?&body=${encodeURIComponent(text + ' ' + jobLink)}`;
                break;
        }
        window.open(url, '_blank');
    };

    const socialPlatforms = [
        { name: 'Email', icon: Mail, action: () => handleShare('email') },
        { name: 'SMS', icon: SMSIcon, action: () => handleShare('sms') },
        { name: 'Twitter/X', icon: Twitter, action: () => handleShare('twitter') },
        { name: 'WhatsApp', icon: WhatsAppIcon, action: () => handleShare('whatsapp') },
    ]

    return (
        <div className="inline-flex rounded-md shadow-sm">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="secondary" size="sm" className="rounded-r-none border-r">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Share Post</h4>
                            <p className="text-sm text-muted-foreground">Share this job opening with your network.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="job-link">Job Link</Label>
                            <div className="flex items-center space-x-2">
                                <Input id="job-link" value={jobLink} readOnly className="h-8" />
                                <Button size="sm" className="px-3" onClick={handleCopyLink}>
                                    <span className="sr-only">Copy</span>
                                    {isCopied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                             <p className="text-sm text-muted-foreground">Share link via</p>
                             <div className="flex items-center justify-between">
                                 {socialPlatforms.map(platform => (
                                     <div key={platform.name} className="flex flex-col items-center gap-2">
                                         <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={platform.action}>
                                             <platform.icon className="h-5 w-5" />
                                         </Button>
                                         <span className="text-xs text-muted-foreground">{platform.name}</span>
                                     </div>
                                 ))}
                             </div>
                        </div>
                         <Button variant="outline" className="w-full" onClick={() => handleShare('native')}>
                            <Share2 className="mr-2 h-4 w-4" />
                            More Share Options
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
            <Button variant="secondary" size="sm" className="rounded-l-none px-3" onClick={handleCopyLink}>
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4" />}
            </Button>
        </div>
    );
}
