'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { submitAssessmentFeedbackAction } from '@/app/dashboard/candidate/actions';

interface FeedbackContentProps {
    jobId: string;
    roundId: string;
}

export default function FeedbackContent({ jobId, roundId }: FeedbackContentProps) {
    const router = useRouter();
    const { session, loading: sessionLoading } = useSession();
    const { toast } = useToast();

    const numericRoundId = parseInt(roundId, 10);
    
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!session?.uid) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit feedback.' });
            return;
        }

        setIsSubmitting(true);
        const result = await submitAssessmentFeedbackAction({
            jobId,
            roundId: numericRoundId,
            candidateId: session.uid,
            rating,
            feedback,
        });

        if (result.success) {
            toast({ title: 'Feedback Submitted!', description: 'Thank you for your valuable input.' });
            router.push('/dashboard/candidate/applications');
        } else {
            toast({ variant: 'destructive', title: 'Submission Failed', description: result.error });
        }
        setIsSubmitting(false);
    };

    if (sessionLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">Assessment Complete!</CardTitle>
                    <CardDescription>Thank you for completing the assessment. Please share your experience.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="font-semibold">How was your experience?</Label>
                        <div className="flex gap-2 justify-center" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={cn(
                                        "h-8 w-8 cursor-pointer transition-all",
                                        (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'
                                    )}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="feedback-comment" className="font-semibold">Any additional comments?</Label>
                        <Textarea 
                            id="feedback-comment"
                            placeholder="Tell us what you liked or what we can improve..."
                            className="min-h-[120px]"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                    </div>
                     <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => router.push('/dashboard/candidate/applications')}>Skip</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting || (rating === 0 && feedback.trim() === '')}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Feedback
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
