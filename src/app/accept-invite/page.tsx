
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, writeBatch, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';


interface ManagerProfile {
    id: string;
    name: string;
    email: string;
    designation: string;
    permissions_role: string;
    status: 'active' | 'inactive' | 'invited';
    company_uid?: string;
    companyLogo?: string;
    createdAt?: any;
    role: string;
}

function AcceptInviteContents() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const token = searchParams.get('token');

    const [manager, setManager] = useState<ManagerProfile | null>(null);
    const [companyName, setCompanyName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'details' | 'password' | 'done'>('details');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invitation token is missing or invalid.');
            setLoading(false);
            return;
        }

        const fetchInvitation = async () => {
            try {
                const q = query(collection(db, 'users'), where('invitationToken', '==', token));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setError('This invitation is invalid or has already been used.');
                    setLoading(false);
                    return;
                }

                const managerDoc = querySnapshot.docs[0];
                const managerData = managerDoc.data();

                if (managerData.status !== 'invited') {
                     setError('This invitation has already been accepted or is no longer valid.');
                     setLoading(false);
                     return;
                }

                const managerProfile: ManagerProfile = {
                    id: managerDoc.id,
                    name: managerData.name,
                    email: managerData.email,
                    designation: managerData.designation,
                    permissions_role: managerData.permissions_role,
                    status: managerData.status,
                    company_uid: managerData.company_uid,
                    createdAt: managerData.createdAt,
                    role: managerData.role,
                };

                // If it's a company manager, fetch company details
                if (managerData.company_uid) {
                    const companyDoc = await getDoc(doc(db, 'users', managerData.company_uid));
                    if (companyDoc.exists()) {
                        const companyData = companyDoc.data();
                        setCompanyName(companyData.name);
                        managerProfile.companyLogo = companyData.displayImageUrl;
                    } else {
                         setError('The company that invited you no longer exists.');
                         setLoading(false);
                         return;
                    }
                } else if (managerData.role === 'adminAccountManager') {
                    // It's a platform admin invitation
                    setCompanyName('Career Edge Platform');
                    managerProfile.companyLogo = '/logo.png'; // Use the platform logo
                } else {
                    setError('The invitation is missing necessary details.');
                    setLoading(false);
                    return;
                }
                
                setManager(managerProfile);

            } catch (err) {
                setError('An error occurred while validating your invitation.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInvitation();
    }, [token]);

    const handleAccept = () => {
        setStep('password');
    }

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Passwords do not match.' });
            return;
        }
        if (!manager) return;

        setIsSubmitting(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, manager.email, password);
            const user = userCredential.user;
            
            await updateProfile(user, { displayName: manager.name });

            // Approach 1: Re-create the document with the Auth UID
            const batch = writeBatch(db);

            // 1. Define the new document reference with the Auth UID
            const newManagerRef = doc(db, 'users', user.uid);
            
            // 2. Define the data for the new document, copying from the old one
            const newManagerData: any = {
                uid: user.uid,
                name: manager.name,
                email: manager.email,
                role: manager.role,
                permissions_role: manager.permissions_role,
                designation: manager.designation,
                createdAt: manager.createdAt,
                status: 'active',
                preferences: { themeMode: 'system', themeColor: 'Aubergine' } // Default preferences
            };

            if (manager.company_uid) {
                newManagerData.company_uid = manager.company_uid;
            }

            // 3. Create the new document in the batch
            batch.set(newManagerRef, newManagerData);
            
            // 4. Delete the original invitation document
            const oldManagerRef = doc(db, 'users', manager.id);
            batch.delete(oldManagerRef);

            // 5. Commit the atomic operation
            await batch.commit();

            toast({ title: 'Account Activated!', description: 'You will be redirected to the login page.' });
            setStep('done');

            setTimeout(() => {
                router.push('/login');
            }, 3000);

        } catch (err: any) {
            console.error(err);
            toast({ variant: 'destructive', title: 'Activation Failed', description: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const getInitials = (name: string) => {
        if (!name) return '';
        if (name === "Career Edge Platform") return "CE";
        const names = name.split(' ');
        return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
    }

    if (loading) {
        return (
            <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Validating your invitation...</p>
                </div>
            </CardContent>
        )
    }
    if (error) {
        return (
            <CardContent className="py-12">
                 <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                             <XCircle className="h-6 w-6 text-destructive"/>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold">Invitation Invalid</h2>
                    <p className="text-muted-foreground mt-2">{error}</p>
                    <Button onClick={() => router.push('/')} className="mt-6">Go to Homepage</Button>
                </div>
            </CardContent>
        )
    }
    if(manager) {
        if (step === 'details') {
            return (
                <>
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-2xl">You're Invited!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex flex-col items-center gap-2 text-center">
                         <Avatar className="h-16 w-16 text-xl mb-2">
                            <AvatarImage src={manager.companyLogo} />
                            <AvatarFallback>{getInitials(companyName)}</AvatarFallback>
                        </Avatar>
                        <p className="text-muted-foreground">You have been invited to join</p>
                        <p className="font-semibold text-lg">{companyName}</p>
                     </div>
                     <div className="flex items-center gap-4 p-4 rounded-lg border bg-secondary/50 mt-4">
                        <Avatar className="h-16 w-16 text-xl">
                            <AvatarFallback>{getInitials(manager.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{manager.name}</p>
                            <p className="text-sm text-muted-foreground">{manager.email}</p>
                            <p className="text-sm text-muted-foreground">{manager.designation}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
                         <ShieldCheck className="h-5 w-5 text-primary"/>
                        <div>
                            <p className="font-semibold">Role: {manager.permissions_role}</p>
                            <p className="text-xs text-muted-foreground">You are being invited with {manager.permissions_role} permissions.</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleAccept}>Accept Invitation</Button>
                </CardFooter>
                </>
            );
        }
        if (step === 'password') {
            return (
                 <>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Create Your Account</CardTitle>
                        <CardDescription>Set a password to activate your account for {manager.email}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <form onSubmit={handleCreateAccount} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                        {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                    </button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pr-10" />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                    </button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Activate Account'}
                            </Button>
                         </form>
                    </CardContent>
                 </>
            )
        }
         if (step === 'done') {
            return (
                <CardContent className="py-12">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-500"/>
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold">Account Activated!</h2>
                        <p className="text-muted-foreground mt-2">You will be redirected to the login page shortly.</p>
                    </div>
                </CardContent>
            )
        }
    }
    return null;
}


export default function AcceptInvitePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
            <div className="mb-8">
                <Logo />
            </div>
            <Card className="w-full max-w-md">
               <Suspense fallback={
                    <CardContent className="py-12">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-muted-foreground">Loading Invitation...</p>
                        </div>
                    </CardContent>
               }>
                <AcceptInviteContents />
               </Suspense>
            </Card>
        </div>
    )
}
