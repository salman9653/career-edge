
'use server';

import { doc, setDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';
import { UserSession } from '@/hooks/use-session';
import type { Question, Job, Round, ApplicantRoundResult } from '@/lib/types';

interface ApplyForJobInput {
  jobId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  answers?: { questionId: string; answer: string }[];
}

export async function applyForJobAction(input: ApplyForJobInput) {
  const { jobId, candidateId, candidateName, candidateEmail, answers } = input;

  if (!jobId || !candidateId) {
    return { error: 'Job ID or Candidate ID is missing.' };
  }

  try {
    const jobDocRef = doc(db, 'jobs', jobId);
    const jobDocSnap = await getDoc(jobDocRef);
    if (!jobDocSnap.exists()) {
        return { error: 'Job not found.' };
    }
    const jobData = jobDocSnap.data() as Job;
    const firstRound = jobData.rounds?.[0];

    let applicationStatus: 'Submitted' | 'Screening Passed' | 'Screening Failed' = 'Submitted';
    let activeRoundIndex = 0;
    const roundResults: ApplicantRoundResult[] = [];

    // If it's a screening round and there are answers, evaluate them.
    if (firstRound?.type === 'screening' && answers) {
        const questionIds = firstRound.questionIds || [];
        const questions: Question[] = [];
        for (const id of questionIds) {
            const qDoc = await getDoc(doc(db, 'questions', id));
            if (qDoc.exists()) {
                questions.push({ id: qDoc.id, ...qDoc.data() } as Question);
            }
        }
        
        let correctCount = 0;
        let failedStrict = false;

        for (const answer of answers) {
            const question = questions.find(q => q.id === answer.questionId);
            if (!question || !question.acceptableAnswer) continue;

            const isCorrect = question.acceptableAnswer.includes(answer.answer);

            if (isCorrect) {
                correctCount++;
            } else if (question.isStrict) {
                failedStrict = true;
                break; // Instant fail on strict question
            }
        }
        
        const screeningRoundResult: ApplicantRoundResult = {
            roundId: firstRound.id,
            status: 'Pending',
            answers: answers,
            completedAt: new Date().toISOString(),
        };

        if (failedStrict) {
            applicationStatus = 'Screening Failed';
            screeningRoundResult.status = 'Failed';
        } else {
            applicationStatus = 'Screening Passed';
            activeRoundIndex = 0; // Candidate has completed round 0, but is not in round 1 yet.
            screeningRoundResult.status = 'Passed';
            screeningRoundResult.score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
        }
        roundResults.push(screeningRoundResult);
    }


    const applicantRef = doc(db, 'jobs', jobId, 'applicants', candidateId);
    
    const applicationData: any = {
      candidateId,
      candidateName,
      candidateEmail,
      status: applicationStatus,
      appliedAt: serverTimestamp(),
      activeRoundIndex,
      roundResults,
    };
    
    await setDoc(applicantRef, applicationData);

    revalidatePath(`/dashboard/candidate/jobs/${jobId}`);
    revalidatePath(`/dashboard/candidate/applications`);
    return { success: true, roundResults };
  } catch (error: any) {
    console.error('Error applying for job:', error);
    return { error: 'Could not submit application. Please try again.' };
  }
}

export async function toggleFavoriteJobAction(jobId: string, user: UserSession) {
  if (!user || !user.uid) {
    return { error: 'You must be logged in to favorite a job.' };
  }
  
  const userDocRef = doc(db, 'users', user.uid);
  const isCurrentlyFavorite = user.favourite_jobs?.includes(jobId);

  try {
    if (isCurrentlyFavorite) {
      await updateDoc(userDocRef, {
        favourite_jobs: arrayRemove(jobId)
      });
    } else {
      await updateDoc(userDocRef, {
        favourite_jobs: arrayUnion(jobId)
      });
    }
    revalidatePath('/dashboard/candidate/jobs');
    return { success: true, added: !isCurrentlyFavorite };
  } catch (error: any) {
    console.error('Error toggling favorite job:', error);
    return { error: 'Could not update your favorites. Please try again.' };
  }
}

interface SubmitAssessmentInput {
  jobId: string;
  roundId: number;
  candidateId: string;
  answers: { questionId: string; answer: string }[];
}

export async function submitAssessmentAction(input: SubmitAssessmentInput) {
    const { jobId, roundId, candidateId, answers } = input;

    if (!jobId || !roundId || !candidateId) {
        return { error: 'Missing required information.' };
    }

    try {
        const applicantDocRef = doc(db, 'jobs', jobId, 'applicants', candidateId);
        
        const roundResult: ApplicantRoundResult = {
            roundId,
            status: 'Pending', // Status to be updated after grading
            answers,
            completedAt: new Date().toISOString(),
        };

        await updateDoc(applicantDocRef, {
            roundResults: arrayUnion(roundResult),
            // Optionally update applicant status here if needed
        });
        
        revalidatePath(`/dashboard/candidate/applications`);
        return { success: true };

    } catch (error: any) {
        console.error('Error submitting assessment:', error);
        return { error: 'Could not submit your assessment. Please try again.' };
    }
}
