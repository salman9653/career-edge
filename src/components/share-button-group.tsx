
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Share2, Clipboard, Mail, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const WhatsAppIcon = () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24" className="mr-2 h-4 w-4">
      <path fill="currentColor" fillRule="evenodd" d="M12 4a8 8 0 0 0-6.895 12.06l.569.718-.697 2.359 2.32-.648.379.243A8 8 0 1 0 12 4ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.96 9.96 0 0 1-5.016-1.347l-4.948 1.382 1.426-4.829-.006-.007-.033-.055A9.958 9.958 0 0 1 2 12Z" clipRule="evenodd"/>
      <path fill="currentColor" d="M16.735 13.492c-.038-.018-1.497-.736-1.756-.83a1.008 1.008 0 0 0-.34-.075c-.196 0-.362.098-.49.291-.146.217-.587.732-.723.886-.018.02-.042.045-.057.045-.013 0-.239-.093-.307-.123-1.564-.68-2.751-2.313-2.914-2.589-.023-.04-.024-.057-.024-.057.005-.021.058-.074.085-.101.08-.079.166-.182.249-.283l.117-.14c.121-.14.175-.25.237-.375l.033-.066a.68.68 0 0 0-.02-.64c-.034-.069-.65-1.555-.715-1.711-.158-.377-.366-.552-.655-.552-.027 0 0 0-.112.005-.137.005-.883.104-1.213.311-.35.22-.94.924-.94 2.16 0 1.112.705 2.162 1.008 2.561l.041.06c1.161 1.695 2.608 2.951 4.074 3.537 1.412.564 2.081.63 2.461.63.16 0 .288-.013.4-.024l.072-.007c.488-.043 1.56-.599 1.804-1.276.192-.534.243-1.117.115-1.329-.088-.144-.239-.216-.43-.308Z"/>
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

    const handleShare = async () => {
        const shareData = {
          title: `Job Opening: ${jobTitle}`,
          text: `We're hiring for a ${jobTitle} at ${companyName}. Check it out:`,
          url: jobLink,
        };
        try {
          if (navigator.share) {
            await navigator.share(shareData);
          } else {
            handleCopyLink();
          }
        } catch (error) {
          console.error("Error sharing:", error);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(jobLink).then(() => {
          toast({ title: "Job link copied!" });
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 5000);
        }).catch(err => {
          toast({ variant: "destructive", title: "Failed to copy", description: "Could not copy link to clipboard." });
        });
    };

    const handleShareViaWhatsApp = () => {
        const message = `Hello! We're hiring for a *${jobTitle}* at *${companyName}*. We think you could be a great fit for this role.\n\nFind more details and apply here:\n${jobLink}\n\nWe look forward to your application!\n\nBest regards,\nThe ${companyName} Team`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleShareViaEmail = () => {
        const subject = `Job Opportunity: ${jobTitle} at ${companyName}`;
        const body = `Hello,\n\nWe are currently hiring for the position of **${jobTitle}** at **${companyName}**. We came across your profile and believe you could be a great fit for our team.\n\nYou can view the full job description and apply directly through the link below:\n${jobLink}\n\nWe look forward to reviewing your application.\n\nBest regards,\nThe Hiring Team\n${companyName}`;
        const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
    };


    return (
        <div className="inline-flex rounded-md shadow-sm">
            <Button variant="secondary" size="sm" onClick={handleShare} className="rounded-r-none border-r-0">
                <Share2 className="h-4 w-4 mr-2" />
                Share
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm" className="rounded-l-none px-2">
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={handleCopyLink}>
                        {isCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Clipboard className="mr-2 h-4 w-4" />}
                        Copy job link
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleShareViaWhatsApp}><WhatsAppIcon />Share via WhatsApp</DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleShareViaEmail}><Mail className="mr-2 h-4 w-4" />Share via Email</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
