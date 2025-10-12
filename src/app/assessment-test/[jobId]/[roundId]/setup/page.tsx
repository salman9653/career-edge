

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { Logo } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, Video, CheckCircle, AlertTriangle, ChevronRight, Mic, Wifi, FileText, RefreshCw, XCircle, Briefcase, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { GradientButton } from '@/components/ui/gradient-button';
import { Label } from '@/components/ui/label';
import { SpeedMeter } from '@/components/ui/speed-meter';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Job } from '@/lib/types';
import Link from 'next/link';

type SetupStepStatus = 'active' | 'pending' | 'complete';
type SetupStepKey = 'systemCheck' | 'networkCheck' | 'finalInstructions';

interface CompanyInfo {
    name: string;
    logo?: string;
}

const SetupStep = ({ icon: Icon, title, status }: { icon: React.ElementType, title: string, status: SetupStepStatus }) => {
    return (
        <div className={cn(
            "flex items-center gap-4 p-3 rounded-lg transition-colors",
            status === 'active' && "bg-white/20",
            status === 'pending' && "text-white/60",
        )}>
            <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center border-2",
                status === 'active' && "bg-white text-dash-primary border-white",
                status === 'pending' && "border-white/60",
                status === 'complete' && "bg-white text-dash-primary border-white"
            )}>
                 {status === 'complete' ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </div>
            <span className="font-medium">{title}</span>
        </div>
    )
}

export default function AssessmentSetupPage() {
    const router = useRouter();
    const params = useParams();
    const { session, loading: sessionLoading } = useSession();
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    
    const [view, setView] = useState<'instructions' | 'testing'>('instructions');
    const [currentStep, setCurrentStep] = useState<SetupStepKey>('systemCheck');
    const [completedSteps, setCompletedSteps] = useState<SetupStepKey[]>([]);

    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedMic, setSelectedMic] = useState<string>('');
    const [networkStatus, setNetworkStatus] = useState<'untested' | 'testing' | 'stable' | 'unstable'>('untested');
    const [speed, setSpeed] = useState(0);
    const [isTestingNetwork, setIsTestingNetwork] = useState(false);
    const [acceptedInstructions, setAcceptedInstructions] = useState(false);
    const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

    const jobId = params.jobId as string;

    useEffect(() => {
        if (jobId) {
            const fetchCompanyInfo = async () => {
                const jobDoc = await getDoc(doc(db, 'jobs', jobId));
                if (jobDoc.exists()) {
                    const jobData = jobDoc.data() as Job;
                    if (jobData.companyId) {
                        const companyDoc = await getDoc(doc(db, 'users', jobData.companyId));
                        if (companyDoc.exists()) {
                            const companyData = companyDoc.data();
                            setCompanyInfo({ name: companyData.name, logo: companyData.displayImageUrl });
                        }
                    }
                }
            };
            fetchCompanyInfo();
        }
    }, [jobId]);

    const requestPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            
            setHasCameraPermission(true);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }

            setHasMicPermission(true);
            const devices = await navigator.mediaDevices.enumerateDevices();
            const mics = devices.filter(device => device.kind === 'audioinput');
            setAudioDevices(mics);
            if (mics.length > 0) {
                setSelectedMic(mics[0].deviceId);
            }

        } catch (error) {
            console.error('Error accessing media devices:', error);
            setHasCameraPermission(false);
            setHasMicPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera & Mic Access Denied',
              description: 'Please enable camera and microphone permissions in your browser settings.',
            });
        }
    }

    const handleStartSystemCheck = async () => {
        setView('testing');
        await requestPermissions();
    };
    
    useEffect(() => {
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
             if (animationIntervalRef.current) {
                clearInterval(animationIntervalRef.current);
            }
        }
    }, []);
    
    const proceedToNextStep = () => {
        if (currentStep === 'systemCheck') {
            setCompletedSteps(prev => [...prev, 'systemCheck']);
            setCurrentStep('networkCheck');
        } else if (currentStep === 'networkCheck') {
            setCompletedSteps(prev => [...prev, 'networkCheck']);
            setCurrentStep('finalInstructions');
        }
    }
    
    const animateSpeed = (finalSpeed: number) => {
        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current);
        }
        const duration = 1000; // 1 second
        const stepTime = 20; // update every 20ms
        const totalSteps = duration / stepTime;
        const increment = finalSpeed / totalSteps;
        let currentSpeed = 0;

        animationIntervalRef.current = setInterval(() => {
            currentSpeed += increment;
            if (currentSpeed >= finalSpeed) {
                setSpeed(finalSpeed);
                if (animationIntervalRef.current) {
                   clearInterval(animationIntervalRef.current);
                }
            } else {
                setSpeed(currentSpeed);
            }
        }, stepTime);
    }

    const handleTestNetwork = async () => {
      setNetworkStatus('testing');
      setIsTestingNetwork(true);
      setSpeed(0);

      const testImageUrl = 'https://speed.cloudflare.com/__down?bytes=1000000';
      const imageSizeInBytes = 1000000;

      if (!navigator.onLine) {
        setNetworkStatus('unstable');
        setIsTestingNetwork(false);
        return;
      }
      
      try {
        const startTime = new Date().getTime();
        const response = await fetch(`${testImageUrl}&t=${startTime}`, { cache: 'no-store' });
        
        if (!response.ok) {
          throw new Error('Failed to fetch test file');
        }
        
        await response.blob();
        const endTime = new Date().getTime();
        const durationInSeconds = (endTime - startTime) / 1000;
        
        let finalSpeed = 0;
        if (durationInSeconds > 0) {
            const speedInBps = imageSizeInBytes / durationInSeconds;
            finalSpeed = (speedInBps * 8) / (1024 * 1024);
        }
        
        animateSpeed(finalSpeed);
        setNetworkStatus(finalSpeed > 1 ? 'stable' : 'unstable');

      } catch (error) {
        console.error('Network test failed:', error);
        setNetworkStatus('unstable');
        animateSpeed(0);
      } finally {
        setIsTestingNetwork(false);
      }
    }

    const handleStartAssessmentClick = () => {
        if (params.jobId && params.roundId) {
            router.push(`/assessment-test/${params.jobId}/${params.roundId}/test`);
        }
    }
    
    const renderSystemCheck = () => {
        if (view === 'instructions') {
            return (
                <div className="space-y-8 flex flex-col justify-between flex-1">
                    <div>
                        <h2 className="text-3xl font-bold font-headline mb-6">Webcam & Mic Mandatory for Assessment</h2>
                        <ul className="space-y-4 text-muted-foreground list-disc pl-5">
                            <li>Always keep your Camera and Microphone ON and working during the assessment.</li>
                            <li>Please do not leave your Laptop/PC while the test is going on.</li>
                            <li>Sit in a quiet, well-lit area so the camera can detect your face and background clearly.</li>
                            <li>The test will be terminated if the webcam or microphone is turned off at any time.</li>
                            <li>Press "Setup Camera & Mic" to test your devices and proceed.</li>
                        </ul>
                    </div>
                    <div className="self-start">
                        <GradientButton onClick={handleStartSystemCheck}>
                            Setup Camera & Mic
                        </GradientButton>
                    </div>
                </div>
            );
        }
        return (
             <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex-1">
                    <h2 className="text-3xl font-bold font-headline mb-6">Webcam & Mic Mandatory for Assessment</h2>
                    {hasCameraPermission === false || hasMicPermission === false ? (
                        <Alert variant="destructive" className="flex flex-col items-center justify-center text-center p-6">
                            <AlertTriangle className="h-8 w-8 mb-2" />
                            <AlertTitle className="text-lg font-semibold">Camera & Mic Access Required</AlertTitle>
                            <AlertDescription>
                                To proceed with the assessment, please grant access to your camera and microphone in your browser settings.
                            </AlertDescription>
                            <Button onClick={requestPermissions} className="mt-4">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                        </Alert>
                    ) : (
                        <>
                        <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                        </div>
                        {hasCameraPermission === null && (
                            <Alert className="mt-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <AlertTitle>Checking permissions...</AlertTitle>
                                <AlertDescription>
                                    Please allow access to your camera and microphone when prompted.
                                </AlertDescription>
                            </Alert>
                        )}

                        {hasCameraPermission === true && hasMicPermission === true && (
                            <>
                                <Alert variant="default" className="border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 mt-4">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <AlertTitle>Looking good!</AlertTitle>
                                    <AlertDescription>
                                        Your camera and microphone are connected.
                                    </AlertDescription>
                                </Alert>
                                <div className="space-y-2 mt-4">
                                    <Label htmlFor="mic-select">Select Microphone</Label>
                                    <Select value={selectedMic} onValueChange={setSelectedMic}>
                                        <SelectTrigger id="mic-select">
                                            <SelectValue placeholder="Select a microphone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {audioDevices.map(device => (
                                                <SelectItem key={device.deviceId} value={device.deviceId}>
                                                    {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
                        </>
                    )}
                </div>
                <div className="mt-8 flex justify-end">
                    <Button disabled={!hasCameraPermission || !hasMicPermission} onClick={proceedToNextStep}>
                        Next: Network Check
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>
        );
    }
    
    const renderNetworkCheck = () => (
         <div className="space-y-8 flex flex-col justify-between flex-1">
            <div>
                <h2 className="text-3xl font-bold font-headline mb-6">Stable Internet Connection</h2>
                {networkStatus === 'untested' && (
                     <ul className="space-y-4 text-muted-foreground list-disc pl-5">
                        <li>Use a stable internet connection while giving the test.</li>
                        <li>It is preferred to use a wifi connection rather than using mobile hotspot.</li>
                        <li>Press "Test Internet" to check your connection speed and stability.</li>
                    </ul>
                )}
            </div>

            {(networkStatus !== 'untested') && (
                <div className="space-y-4">
                    <SpeedMeter speed={speed} />
                    {networkStatus === 'stable' && (
                        <Alert variant="default" className="border-green-500 bg-green-500/10 text-green-700 dark:text-green-400">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <AlertTitle>Network Stable</AlertTitle>
                            <AlertDescription>
                                Your internet connection is sufficient for the assessment.
                            </AlertDescription>
                        </Alert>
                    )}
                    {networkStatus === 'unstable' && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Network Unstable</AlertTitle>
                            <AlertDescription>
                                Your internet connection appears to be unstable. Please switch to a better network and try again.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}
            
            <div className="flex items-center justify-between">
                <GradientButton onClick={handleTestNetwork} disabled={networkStatus === 'testing'}>
                    {networkStatus === 'testing' ? <Loader2 className="animate-spin" /> : (networkStatus === 'unstable' || networkStatus === 'stable') ? 'Test Again' : 'Test Internet'}
                </GradientButton>
                 <Button disabled={networkStatus !== 'stable'} onClick={proceedToNextStep}>
                    Next: Final Instructions
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    );

    const renderFinalInstructions = () => (
        <div className="space-y-6 flex flex-col justify-between flex-1">
            <div>
                <h2 className="text-3xl font-bold font-headline mb-2">Instructions</h2>
                <p className="text-amber-600 dark:text-amber-400 text-sm font-medium mb-6">Please read instructions carefully before you start</p>
                <ScrollArea className="h-[400px] pr-4">
                    <ul className="space-y-3 text-muted-foreground list-disc pl-5 text-sm">
                        <li>You'll not be able to get back to previous questions, so mark the answers carefully.</li>
                        <li>If you move out of the Camera View Point, your test will be terminated.</li>
                        <li>If the system notices background noise, the test will be terminated.</li>
                        <li>If multiple faces or any other device is detected, your test will be terminated.</li>
                        <li>If you move your mouse/cursor out of the test window, it will also be marked suspicious.</li>
                        <li>Engaging in any form of malpractice will result in immediate termination of the test.</li>
                        <li>Ensure you have a stable power supply for your device.</li>
                    </ul>
                </ScrollArea>
            </div>
             <div className="space-y-6">
                <div className="flex items-start space-x-3">
                    <Checkbox id="accept-instructions" checked={acceptedInstructions} onCheckedChange={(checked) => setAcceptedInstructions(!!checked)} className="mt-1" />
                    <Label htmlFor="accept-instructions" className="font-normal text-muted-foreground">
                       I accept all the instructions and I make sure that I'll not violate any of the mentioned instructions.
                    </Label>
                </div>
                <GradientButton disabled={!acceptedInstructions} className="w-full" onClick={handleStartAssessmentClick}>
                    Start Assessment
                </GradientButton>
            </div>
        </div>
    )
    
    const renderContent = () => {
        switch(currentStep) {
            case 'systemCheck':
                return renderSystemCheck();
            case 'networkCheck':
                return renderNetworkCheck();
            case 'finalInstructions':
                return renderFinalInstructions();
            default:
                return null;
        }
    }

    const getStepStatus = (step: SetupStepKey): SetupStepStatus => {
        if (completedSteps.includes(step)) {
            return 'complete';
        }
        if (step === currentStep) {
            return 'active';
        }
        return 'pending';
    }

    const getInitials = (name: string | null | undefined) => {
        if (!name) return '';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    return (
        <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
             <div className="flex items-center justify-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                    <span className="font-headline text-lg font-bold text-foreground">Career Edge</span>
                    <Avatar className="h-12 w-12">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#667EEA] to-[#764BA2] text-white">
                            <Briefcase className="h-6 w-6" />
                        </div>
                    </Avatar>
                </div>
                 {companyInfo && (
                    <>
                        <div className="relative flex items-center">
                            <div className="h-px w-16 bg-border"></div>
                            <Link href="#" className="h-6 w-6 rounded-full border bg-background flex items-center justify-center absolute left-1/2 -translate-x-1/2">
                                <LinkIcon className="h-3 w-3 text-muted-foreground" />
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={companyInfo.logo} />
                                <AvatarFallback>{getInitials(companyInfo.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-lg">{companyInfo.name}</span>
                        </div>
                    </>
                 )}
            </div>
            
            <Card className="w-full max-w-4xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] min-h-[700px]">
                    {/* Left Sidebar */}
                    <div className="p-6 text-white bg-gradient-to-br from-[#667EEA] to-[#764BA2] flex flex-col">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold mb-2">Setup Steps</h2>
                            <p className="text-sm text-white/80 mb-6">Complete these steps to ensure you're ready for the assessment.</p>
                            <div className="space-y-3">
                                <SetupStep icon={Video} title="System Check" status={getStepStatus('systemCheck')} />
                                <SetupStep icon={Wifi} title="Network Check" status={getStepStatus('networkCheck')} />
                                <SetupStep icon={FileText} title="Final Instructions" status={getStepStatus('finalInstructions')} />
                            </div>
                        </div>
                        {session && (
                            <div className="mt-6 pt-6 border-t border-white/20">
                                 <div className="flex items-center gap-3 rounded-lg p-3 bg-black/20">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={session.displayImageUrl ?? undefined} />
                                        <AvatarFallback className="text-sm bg-muted text-muted-foreground">{getInitials(session.displayName)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm">{session.displayName}</p>
                                        <p className="text-xs text-white/80">{session.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Right Content */}
                    <div className="p-8 md:p-12 flex flex-col">
                        {renderContent()}
                    </div>
                </div>
            </Card>
        </div>
    );
}

    
