

'use client';

import { useState, useEffect, useActionState, useRef } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, Palette, User, Sun, Moon, Laptop, Shield, CheckCircle, XCircle, MessageSquare, LogOut, Trash2, Users, FileText, HelpCircle, ArrowLeft, Settings as SettingsIcon, Upload, Loader2, BookCopy, Mail, Phone, MapPin, Star, CreditCard, ChevronRight, SquareArrowOutUpRight } from 'lucide-react';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChangePasswordCard } from '@/app/dashboard/profile/_components/change-password-card';
import { ColorPicker } from './ui/color-picker';
import { DashboardLayoutWrapper } from '@/app/dashboard/layout-wrapper';
import { updateThemePreferencesAction, updateWhatsNewAction, updateAboutPlatformAction, updateContactInfoAction, submitFeedbackAction, updateTermsAction, updatePolicyAction } from '@/app/dashboard/settings/actions';
import { auth } from '@/lib/firebase/config';
import { sendEmailVerification } from 'firebase/auth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Logo } from './logo';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialTab?: string;
}

const AppearanceSettings = () => {
    const { theme: activeTheme, setTheme: setNextTheme } = useNextTheme();
    const { session, updateSession } = useSession();

    const handleThemeModeChange = async (mode: 'light' | 'dark' | 'system') => {
        setNextTheme(mode);
        if (session) {
            const newPreferences = { ...session.preferences, themeMode: mode };
            updateSession({ preferences: newPreferences });
            await updateThemePreferencesAction({ themeMode: mode });
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium font-headline">Appearance</h3>
                <p className="text-sm text-muted-foreground">
                    Customize the look and feel of your dashboard.
                </p>
            </div>
            <div className="space-y-4">
                <h4 className="font-semibold">Choose your mode</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button variant={activeTheme === 'light' ? 'default' : 'outline'} onClick={() => handleThemeModeChange('light')} className="h-auto flex-col p-4">
                        <Sun className="h-8 w-8 mb-2" />
                        <span>Light</span>
                    </Button>
                    <Button variant={activeTheme === 'dark' ? 'default' : 'outline'} onClick={() => handleThemeModeChange('dark')} className="h-auto flex-col p-4">
                         <Moon className="h-8 w-8 mb-2" />
                        <span>Dark</span>
                    </Button>
                    <Button variant={activeTheme === 'system' ? 'default' : 'outline'} onClick={() => handleThemeModeChange('system')} className="h-auto flex-col p-4">
                        <Laptop className="h-8 w-8 mb-2" />
                        <span>System</span>
                    </Button>
                </div>
            </div>
             <div className="space-y-4">
                <h4 className="font-semibold">Theme color</h4>
                <ColorPicker />
            </div>
            <div className="space-y-4">
                <h4 className="font-semibold">Font</h4>
                <Select defaultValue="inter" disabled>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a font" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="poppins">Poppins</SelectItem>
                    </SelectContent>
                </Select>
                 <p className="text-sm text-muted-foreground">
                    This feature is coming soon.
                </p>
            </div>
        </div>
    )
}

function VerificationButton({ onVerify }: { onVerify: () => Promise<void> }) {
  const [pending, setPending] = useState(false);
  
  const handleClick = async () => {
    setPending(true);
    await onVerify();
    setPending(false);
  }

  return (
    <Button onClick={handleClick} disabled={pending} size="sm">
       {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Verify Email
    </Button>
  );
}

const AccountSettings = ({ onNavigate }: { onNavigate: () => void }) => {
    const { session } = useSession();
    const router = useRouter();
    const { toast } = useToast();

    const handleVerify = async () => {
        const user = auth.currentUser;
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to verify your email.", variant: "destructive" });
            return;
        }
        try {
            await sendEmailVerification(user);
            toast({
                title: "Verification Email Sent",
                description: "Please check your inbox to verify your email address.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "An unknown error occurred.",
                variant: "destructive"
            });
        }
    }

    const goToProfile = () => {
        onNavigate();
        router.push('/dashboard/profile');
    }
    
    const goToCompanyManagers = () => {
        onNavigate();
        router.push('/dashboard/company/managers');
    }

    const handleLogout = () => {
        sessionStorage.clear();
        document.cookie = 'firebase-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/');
    }
    
    const getProfileButtonText = (role?: string) => {
        if (!role) return "Go to Profile";
        return `Go to ${role.charAt(0).toUpperCase() + role.slice(1)} Profile`;
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium font-headline">Account</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account details and settings.
                </p>
            </div>
            <div className="space-y-4">
                <h4 className="font-semibold">Email Address</h4>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                            {session?.email}
                        </p>
                        {session?.emailVerified ? (
                             <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                                <CheckCircle className="mr-2 h-4 w-4"/>
                                Verified
                            </div>
                        ) : (
                             <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                                <XCircle className="mr-2 h-4 w-4"/>
                                Unverified
                            </div>
                        )}
                    </div>
                     {!session?.emailVerified && (
                        <div className="mt-2">
                           <VerificationButton onVerify={handleVerify} />
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold">Profile Details</h4>
                 <p className="text-sm text-muted-foreground">
                    To update your display name, phone number, or profile picture, please visit your profile page.
                </p>
                <Button onClick={goToProfile} variant="secondary">
                    <User className="mr-2 h-4 w-4" />
                    {getProfileButtonText(session?.role)}
                </Button>
            </div>
            {session?.role === 'company' && (
                <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold">Account Managers</h4>
                    <p className="text-sm text-muted-foreground">
                        Manage who has access to your company's account.
                    </p>
                    <Button onClick={goToCompanyManagers} variant="secondary">
                        <Users className="mr-2 h-4 w-4" />
                        Company Account Managers
                    </Button>
                </div>
            )}
             <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold">Log Out</h4>
                <p className="text-sm text-muted-foreground">
                   End your current session and return to the login screen.
                </p>
                <Button onClick={handleLogout} variant="secondary">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </Button>
            </div>
             {session?.role !== 'admin' && (
                <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold text-destructive">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete My Account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete your account and all associated data. This action is irreversible.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {}} disabled className="bg-destructive hover:bg-destructive/90">Delete (Not Implemented)</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
             )}
        </div>
    )
}

const ChatSettings = () => (
    <div>
        <h3 className="text-lg font-medium font-headline">Chat</h3>
        <p className="text-sm text-muted-foreground">This section is under construction.</p>
    </div>
)

const NotificationSettings = () => (
    <div>
        <h3 className="text-lg font-medium font-headline">Notifications</h3>
        <p className="text-sm text-muted-foreground">This section is under construction.</p>
    </div>
)

const SecuritySettings = () => {
    const [view, setView] = useState('main');

    const renderMainView = () => (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium font-headline">Security</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account's security settings.
                </p>
            </div>
            <div className="space-y-2">
                 <Button variant="ghost" className="w-full justify-between" onClick={() => setView('password')}>
                    <span>Change Password</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                 <Button variant="ghost" className="w-full justify-between" onClick={() => setView('2fa')}>
                    <span>Two-Factor Authentication (2FA)</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
    
    const renderDetailView = (title: string, content: React.ReactNode) => (
         <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setView('main')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Security
            </Button>
            <h3 className="text-lg font-medium font-headline">{title}</h3>
            <div className="text-sm text-muted-foreground">{content}</div>
        </div>
    );

    switch(view) {
        case 'password':
            return renderDetailView("Change Password", <ChangePasswordCard />);
        case '2fa':
            return renderDetailView("Two-Factor Authentication (2FA)", (
                 <div className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account.
                    </p>
                    <Button disabled>Enable 2FA (Coming Soon)</Button>
                </div>
            ));
        default:
            return renderMainView();
    }
}

const feedbackInitialState = { error: null, success: false };

function FeedbackSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Submit Feedback
    </Button>
  );
}

const HelpSettings = () => {
    const [view, setView] = useState('main');
    const [loading, setLoading] = useState(false);
    const [whatsNewContent, setWhatsNewContent] = useState<string | null>(null);
    const [aboutContent, setAboutContent] = useState<string | null>(null);
    const [aboutVersion, setAboutVersion] = useState<string | null>(null);
    const [contactInfo, setContactInfo] = useState<{email: string, phone: string, phoneAvailable: string, address: string} | null>(null);
    const [termsContent, setTermsContent] = useState<string | null>(null);
    const [policyContent, setPolicyContent] = useState<string | null>(null);
    const [feedbackState, feedbackFormAction] = useActionState(submitFeedbackAction, feedbackInitialState);
    const feedbackFormRef = useRef<HTMLFormElement>(null);
    const { session } = useSession();
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        if (feedbackState.success) {
            toast({ title: "Feedback Submitted", description: "Thank you for your feedback!" });
            feedbackFormRef.current?.reset();
            setRating(0);
        } else if (feedbackState.error) {
            toast({ variant: 'destructive', title: "Error", description: feedbackState.error });
        }
    }, [feedbackState, toast]);

    useEffect(() => {
        if (view === 'whats-new' || view === 'about' || view === 'contact' || view === 'terms') {
            setLoading(true);
            const docRef = doc(db, 'settings', 'help');
            const unsubscribe = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (view === 'whats-new') {
                        setWhatsNewContent(data['whats-new']?.content || "No updates have been posted yet.");
                    }
                    if (view === 'about') {
                        setAboutContent(data.about?.content || "Our mission is to bridge the gap between talented professionals and innovative companies. We provide the tools and platform for seamless hiring and career growth.");
                        setAboutVersion(data.about?.version || "1.0.0");
                    }
                    if (view === 'contact') {
                        setContactInfo(data.contact || { email: 'support@careeredge.com', phone: '+91 123-456-7890', phoneAvailable: 'Mon-Fri, 9am - 5pm IST', address: '123 Tech Park, Innovation Drive\nBangalore, KA 560100, India' });
                    }
                    if (view === 'terms') {
                        setTermsContent(data.terms?.content || "No Terms of Service have been set.");
                        setPolicyContent(data.policy?.content || "No Privacy Policy have been set.");
                    }
                } else {
                    if (view === 'whats-new') setWhatsNewContent("No updates have been posted yet.");
                    if (view === 'about') {
                        setAboutContent("Our mission is to bridge the gap between talented professionals and innovative companies. We provide the tools and platform for seamless hiring and career growth.");
                        setAboutVersion("1.0.0");
                    }
                    if (view === 'contact') {
                        setContactInfo({ email: 'support@careeredge.com', phone: '+91 123-456-7890', phoneAvailable: 'Mon-Fri, 9am - 5pm IST', address: '123 Tech Park, Innovation Drive\nBangalore, KA 560100, India' });
                    }
                    if (view === 'terms') {
                        setTermsContent("No Terms of Service have been set.");
                        setPolicyContent("No Privacy Policy have been set.");
                    }
                }
                setLoading(false);
            }, (error) => {
                console.error("Error fetching content: ", error);
                setWhatsNewContent("Could not load content.");
                setAboutContent("Could not load content.");
                setContactInfo(null);
                setTermsContent("Could not load content.");
                setPolicyContent("Could not load content.");
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [view]);

    const renderDetailView = (title: string, content: React.ReactNode) => (
        <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setView('main')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Help
            </Button>
            <div className="text-sm text-muted-foreground">{content}</div>
        </div>
    );

    const renderMainView = () => (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium font-headline">Help & Support</h3>
                <p className="text-sm text-muted-foreground">
                    Get help, give feedback, or learn more about Career Edge.
                </p>
            </div>
            <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-between" onClick={() => setView('whats-new')}>
                    <span>What's New</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between" onClick={() => setView('feedback')}>
                    <span>Give Feedback</span>
                     <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between" onClick={() => setView('contact')}>
                    <span>Contact Us</span>
                     <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between" onClick={() => setView('terms')}>
                    <span>Terms and Policies</span>
                     <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between" onClick={() => setView('about')}>
                    <span>About Career Edge</span>
                     <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    switch(view) {
        case 'whats-new':
            return renderDetailView("What's New", 
                loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                <div className="prose prose-sm dark:prose-invert max-w-full">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {whatsNewContent || ''}
                  </ReactMarkdown>
                </div>
            );
        case 'feedback':
            return renderDetailView("Give Feedback", (
                 <form action={feedbackFormAction} ref={feedbackFormRef} className="space-y-4">
                    <h3 className="text-lg font-medium font-headline">Share Your Thoughts</h3>
                    <p className="text-sm text-muted-foreground">
                        We'd love to hear your feedback on how we can improve Career Edge.
                    </p>

                    <div className="space-y-2">
                        <Label>Your Rating</Label>
                        <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                key={star}
                                className={cn(
                                    "h-6 w-6 cursor-pointer transition-colors",
                                    (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                )}
                                onMouseEnter={() => setHoverRating(star)}
                                onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </div>

                    <Textarea 
                        name="feedbackContent"
                        placeholder="Tell us what you think..." 
                        className="min-h-[150px]"
                    />
                    <div className="flex justify-end">
                      <FeedbackSubmitButton />
                    </div>
                </form>
            ));
        case 'contact':
            return renderDetailView("Contact Us", 
                loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium font-headline">Get in Touch</h3>
                        <p className="text-sm text-muted-foreground">
                            We're here to help. Reach out to us through any of the channels below.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <Mail className="h-6 w-6 text-muted-foreground mt-1" />
                            <div>
                                <h4 className="font-semibold">Email Support</h4>
                                <p className="text-muted-foreground">For general inquiries and support.</p>
                                <a href={`mailto:${contactInfo?.email}`} className="text-dash-primary font-medium">{contactInfo?.email}</a>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <Phone className="h-6 w-6 text-muted-foreground mt-1" />
                            <div>
                                <h4 className="font-semibold">Phone Support</h4>
                                <p className="text-muted-foreground">{contactInfo?.phoneAvailable}</p>
                                <a href={`tel:${contactInfo?.phone}`} className="font-medium text-dash-primary hover:underline">{contactInfo?.phone}</a>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <MapPin className="h-6 w-6 text-muted-foreground mt-1" />
                            <div>
                                <h4 className="font-semibold">Our Office</h4>
                                <p className="text-muted-foreground whitespace-pre-line">{contactInfo?.address}</p>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4">
                         <h4 className="font-semibold">Frequently Asked Questions</h4>
                         <Button variant="link" className="p-0 h-auto text-dash-primary" disabled>
                            Browse our FAQs (Coming Soon)
                        </Button>
                    </div>
                </div>
            ));
        case 'terms':
            return renderDetailView("Terms and Policies", (
                 loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                    <Tabs defaultValue="terms">
                        <TabsList>
                            <TabsTrigger value="terms">Terms of Service</TabsTrigger>
                            <TabsTrigger value="policy">Privacy Policy</TabsTrigger>
                        </TabsList>
                        <TabsContent value="terms" className="prose prose-sm dark:prose-invert max-w-full pt-4">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{termsContent || ''}</ReactMarkdown>
                        </TabsContent>
                        <TabsContent value="policy" className="prose prose-sm dark:prose-invert max-w-full pt-4">
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>{policyContent || ''}</ReactMarkdown>
                        </TabsContent>
                    </Tabs>
                )
            ));
        case 'about':
             return renderDetailView("About", 
                loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <div className="space-y-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <Logo />
                        <div className="flex flex-col items-center">
                           <p className="text-xs text-muted-foreground">Version {aboutVersion}</p>
                           <p className="text-xs text-muted-foreground">© 2025 Career Edge. All rights reserved.</p>
                        </div>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-full text-left">
                         <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {aboutContent || ''}
                        </ReactMarkdown>
                    </div>
                </div>
            ));
        default:
            return renderMainView();
    }
}

const SubscriptionsSettings = ({ onNavigate }: { onNavigate: () => void }) => {
    const router = useRouter();

    const goToPage = (path: string) => {
        onNavigate();
        router.push(path);
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium font-headline">Subscriptions and Offers</h3>
                <p className="text-sm text-muted-foreground">Manage all subscription plans and promotional offers.</p>
            </div>
            <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-between" onClick={() => goToPage('/dashboard/admin/subscriptions/company')}>
                    <span>Manage Company Subscriptions</span>
                    <SquareArrowOutUpRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between" onClick={() => goToPage('/dashboard/admin/subscriptions/candidate')}>
                    <span>Manage Candidate Subscriptions</span>
                    <SquareArrowOutUpRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between" onClick={() => goToPage('/dashboard/admin/coupons')}>
                    <span>Manage Offers and Coupons</span>
                    <SquareArrowOutUpRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

const initialState = {
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Save
    </Button>
  );
}

const PlatformSettings = () => {
    const [view, setView] = useState('main');
    const [whatsNewContent, setWhatsNewContent] = useState('');
    const [aboutContent, setAboutContent] = useState('');
    const [aboutVersion, setAboutVersion] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactAddress, setContactAddress] = useState('');
    const [phoneAvailable, setPhoneAvailable] = useState('');
    const [termsContent, setTermsContent] = useState('');
    const [policyContent, setPolicyContent] = useState('');

    const [whatsNewState, whatsNewFormAction] = useActionState(updateWhatsNewAction, initialState);
    const [aboutState, aboutFormAction] = useActionState(updateAboutPlatformAction, initialState);
    const [contactState, contactFormAction] = useActionState(updateContactInfoAction, initialState);
    const [termsState, termsFormAction] = useActionState(updateTermsAction, initialState);
    const [policyState, policyFormAction] = useActionState(updatePolicyAction, initialState);

    const { toast } = useToast();

    useEffect(() => {
        const fetchContent = async () => {
            const docRef = doc(db, 'settings', 'help');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setWhatsNewContent(data['whats-new']?.content || '');
                setAboutContent(data.about?.content || '');
                setAboutVersion(data.about?.version || '');
                setContactEmail(data.contact?.email || '');
                setContactPhone(data.contact?.phone || '');
                setContactAddress(data.contact?.address || '');
                setPhoneAvailable(data.contact?.phoneAvailable || '');
                setTermsContent(data.terms?.content || '');
                setPolicyContent(data.policy?.content || '');
            }
        };
        fetchContent();
    }, []);

    useEffect(() => {
        if (whatsNewState.success) toast({ title: "Success!", description: "What's New content has been updated." });
        else if (whatsNewState.error) toast({ variant: 'destructive', title: "Error", description: whatsNewState.error });
    }, [whatsNewState, toast]);
    
    useEffect(() => {
        if (aboutState.success) toast({ title: "Success!", description: "About Platform content has been updated." });
        else if (aboutState.error) toast({ variant: 'destructive', title: "Error", description: aboutState.error });
    }, [aboutState, toast]);

    useEffect(() => {
        if (contactState.success) toast({ title: "Success!", description: "Contact information has been updated." });
        else if (contactState.error) toast({ variant: 'destructive', title: "Error", description: contactState.error });
    }, [contactState, toast]);

    useEffect(() => {
        if (termsState.success) toast({ title: "Success!", description: "Terms of Service has been updated." });
        else if (termsState.error) toast({ variant: 'destructive', title: "Error", description: termsState.error });
    }, [termsState, toast]);

    useEffect(() => {
        if (policyState.success) toast({ title: "Success!", description: "Privacy Policy has been updated." });
        else if (policyState.error) toast({ variant: 'destructive', title: "Error", description: policyState.error });
    }, [policyState, toast]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, setContent: (content: string) => void) => {
        const file = event.target.files?.[0];
        if (file) {
            const text = await file.text();
            setContent(text);
        }
    };
    
    const renderDetailView = (title: string, content: React.ReactNode) => (
        <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setView('main')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Platform Settings
            </Button>
            {content}
        </div>
    );

    const renderMainView = () => (
         <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium font-headline">Manage Platform Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Global application settings will be configured here.
                </p>
            </div>
            <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-between" onClick={() => setView('whats-new')}>
                    <span>What's New</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between" onClick={() => setView('contact-us')}>
                    <span>Contact Us</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between" onClick={() => setView('terms-policies')}>
                    <span>Terms and policies</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between" onClick={() => setView('about-platform')}>
                    <span>About Platform</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full justify-between" onClick={() => setView('company-manager-roles')}>
                    <span>Company Manager Roles</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
    
    switch(view) {
        case 'whats-new':
            return renderDetailView("What's New", (
                 <form action={whatsNewFormAction} className="space-y-4">
                    <h3 className="text-lg font-medium font-headline">What's New</h3>
                    <p className="text-sm text-muted-foreground">
                        Update the "What's New" content. You can use Markdown for formatting.
                    </p>
                    <input type="hidden" name="content" value={whatsNewContent} />
                    <Textarea 
                        placeholder="Enter what's new content here..." 
                        className="min-h-[200px]"
                        value={whatsNewContent}
                        onChange={(e) => setWhatsNewContent(e.target.value)}
                    />
                    <div className="flex items-center gap-4">
                        <Input id="file-upload-whats-new" type="file" className="hidden" onChange={(e) => handleFileChange(e, setWhatsNewContent)} accept=".md,.txt" />
                        <Label htmlFor="file-upload-whats-new" className="flex-1">
                            <Button asChild variant="outline">
                                <span><Upload className="mr-2 h-4 w-4" /> Upload .txt or .md file</span>
                            </Button>
                        </Label>
                        <SubmitButton />
                    </div>
                </form>
            ));
        case 'about-platform':
            return renderDetailView("About Platform", (
                <form action={aboutFormAction} className="space-y-4">
                    <h3 className="text-lg font-medium font-headline">About Platform</h3>
                    <p className="text-sm text-muted-foreground">
                        Update the app version and "About" content.
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="app-version">App Version</Label>
                        <Input id="app-version" name="version" value={aboutVersion} onChange={(e) => setAboutVersion(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="about-content">About Content</Label>
                        <Textarea 
                            id="about-content"
                            name="content"
                            placeholder="Enter about content here..." 
                            className="min-h-[200px]"
                            value={aboutContent}
                            onChange={(e) => setAboutContent(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Input id="file-upload-about" type="file" className="hidden" onChange={(e) => handleFileChange(e, setAboutContent)} accept=".md,.txt" />
                        <Label htmlFor="file-upload-about" className="flex-1">
                            <Button asChild variant="outline">
                                <span><Upload className="mr-2 h-4 w-4" /> Upload .txt or .md file</span>
                            </Button>
                        </Label>
                        <SubmitButton />
                    </div>
                </form>
            ));
        case 'contact-us':
             return renderDetailView("Contact Us", (
                <form action={contactFormAction} className="space-y-4">
                    <h3 className="text-lg font-medium font-headline">Contact Information</h3>
                    <p className="text-sm text-muted-foreground">
                        Update the public contact information for your platform.
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="contact-email">Support Email</Label>
                        <Input id="contact-email" name="email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact-phone">Support Phone</Label>
                        <Input id="contact-phone" name="phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone-available">Phone Available</Label>
                        <Input id="phone-available" name="phoneAvailable" type="text" value={phoneAvailable} onChange={(e) => setPhoneAvailable(e.target.value)} placeholder="e.g. Mon-Fri, 9am - 5pm IST" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact-address">Office Address</Label>
                        <Textarea id="contact-address" name="address" value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} />
                    </div>
                    <div className="flex justify-end">
                        <SubmitButton />
                    </div>
                </form>
            ));
        case 'terms-policies':
            return renderDetailView("Terms and Policies", (
                <div className="space-y-8">
                    <form action={termsFormAction} className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold">Terms of Service</h3>
                        <input type="hidden" name="content" value={termsContent} />
                        <Textarea value={termsContent} onChange={(e) => setTermsContent(e.target.value)} className="min-h-[150px]" />
                        <div className="flex items-center gap-4">
                            <Input id="file-upload-terms" type="file" className="hidden" onChange={(e) => handleFileChange(e, setTermsContent)} accept=".md,.txt" />
                            <Label htmlFor="file-upload-terms" className="flex-1">
                                <Button asChild variant="outline"><span><Upload className="mr-2 h-4 w-4" /> Upload File</span></Button>
                            </Label>
                            <SubmitButton />
                        </div>
                    </form>
                    <form action={policyFormAction} className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold">Privacy Policy</h3>
                        <input type="hidden" name="content" value={policyContent} />
                        <Textarea value={policyContent} onChange={(e) => setPolicyContent(e.target.value)} className="min-h-[150px]" />
                        <div className="flex items-center gap-4">
                           <Input id="file-upload-policy" type="file" className="hidden" onChange={(e) => handleFileChange(e, setPolicyContent)} accept=".md,.txt" />
                            <Label htmlFor="file-upload-policy" className="flex-1">
                                <Button asChild variant="outline"><span><Upload className="mr-2 h-4 w-4" /> Upload File</span></Button>
                            </Label>
                           <SubmitButton />
                        </div>
                    </form>
                </div>
            ));
        case 'company-manager-roles':
            return renderDetailView("Company Manager Roles", "This section will allow managing roles for company managers. Coming soon!");
        default:
            return renderMainView();
    }
}

export function SettingsDialog({ open, onOpenChange, initialTab = 'Account' }: SettingsDialogProps) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const { session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if(open) {
            const currentTab = searchParams.get('tab') || initialTab;
            setActiveTab(currentTab);
        }
    }, [open, initialTab, searchParams]);

    const handleTabChange = (tabName: string) => {
        setActiveTab(tabName);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tabName);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };
    
    const baseNav = [
        { name: 'Account', icon: User },
        { name: 'Appearance', icon: Palette },
        { name: 'Chat', icon: MessageSquare },
        { name: 'Notifications', icon: Bell },
        { name: 'Security', icon: Shield },
        { name: 'Help', icon: HelpCircle },
    ];
    
    const settingsNav = session?.role === 'admin' 
        ? [...baseNav, { name: 'Subscriptions', icon: CreditCard }, { name: 'Platform Settings', icon: SettingsIcon }]
        : baseNav;


    const renderContent = () => {
        switch (activeTab) {
            case 'Account':
                return <AccountSettings onNavigate={() => onOpenChange(false)} />;
            case 'Appearance':
                return <AppearanceSettings />;
            case 'Chat':
                return <ChatSettings />;
            case 'Notifications':
                return <NotificationSettings />;
            case 'Security':
                return <SecuritySettings />;
            case 'Help':
                return <HelpSettings />;
            case 'Subscriptions':
                return <SubscriptionsSettings onNavigate={() => onOpenChange(false)} />;
            case 'Platform Settings':
                return <PlatformSettings />;
            default:
                return null;
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[600px] p-0 gap-0">
              <DashboardLayoutWrapper>
                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] h-full min-h-0 rounded-lg overflow-hidden">
                    <div className="border-r p-6 flex flex-col gap-6 bg-muted/50">
                       <DialogHeader className="text-left">
                            <DialogTitle className="font-headline text-2xl">Settings</DialogTitle>
                            <DialogDescription>Manage your account and app settings.</DialogDescription>
                        </DialogHeader>
                        <nav className="flex flex-col gap-1">
                            {settingsNav.map((item) => (
                                <Button
                                    key={item.name}
                                    variant={activeTab === item.name ? 'default' : 'ghost'}
                                    onClick={() => handleTabChange(item.name)}
                                    className="justify-start"
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.name}
                                </Button>
                            ))}
                        </nav>
                    </div>
                    <div className="overflow-y-auto p-6 pr-4 custom-scrollbar">
                        {renderContent()}
                    </div>
                </div>
              </DashboardLayoutWrapper>
            </DialogContent>
        </Dialog>
    );
}
