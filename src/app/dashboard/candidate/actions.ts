
'use server';

import { doc, setDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';
import { UserSession } from '@/hooks/use-session';
import type { Question, Job, Round, ApplicantRoundResult, Schedule, Applicant } from '@/lib/types';

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

    // Create a notification for the company
    const notificationData = {
        recipientId: jobData.companyId,
        senderId: candidateId,
        senderName: candidateName,
        type: 'NEW_APPLICATION',
        message: `${candidateName} has applied for the position of ${jobData.title}.`,
        link: `/dashboard/company/ats/${jobId}`,
        isRead: false,
        createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, 'notifications'), notificationData);

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
  startedAt: string;
}

export async function submitAssessmentAction(input: SubmitAssessmentInput) {
    const { jobId, roundId, candidateId, answers, startedAt } = input;

    if (!jobId || !roundId || !candidateId) {
        return { error: 'Missing required information.' };
    }

    try {
        const submittedAt = new Date();
        const timeTaken = submittedAt.getTime() - new Date(startedAt).getTime();

        const applicantDocRef = doc(db, 'jobs', jobId, 'applicants', candidateId);
        const [jobDoc, applicantDoc] = await Promise.all([
            getDoc(doc(db, 'jobs', jobId)),
            getDoc(applicantDocRef),
        ]);

        if (!jobDoc.exists()) return { error: "Job not found." };
        if (!applicantDoc.exists()) return { error: "Applicant data not found." };

        const jobData = jobDoc.data() as Job;
        const applicantData = applicantDoc.data() as Applicant;
        
        const currentRound = jobData.rounds.find(r => r.id === roundId);
        if (!currentRound) return { error: "Round not found." };

        let score = 0;
        let resultStatus: 'Passed' | 'Failed' | 'Pending' = 'Pending';

        if (currentRound.type === 'assessment' && currentRound.assessmentId) {
            const assessmentDoc = await getDoc(doc(db, 'assessments', currentRound.assessmentId));
            if(assessmentDoc.exists()) {
                const assessmentData = assessmentDoc.data();
                const questionIds = assessmentData.questionIds || [];
                let correctCount = 0;

                for (const answer of answers) {
                    const qDoc = await getDoc(doc(db, 'questions', answer.questionId));
                    if (qDoc.exists()) {
                        const question = qDoc.data() as Question;
                        if (question.type === 'mcq' && question.correctAnswer === answer.answer) {
                            correctCount++;
                        }
                    }
                }
                score = questionIds.length > 0 ? Math.round((correctCount / questionIds.length) * 100) : 0;
                
                if (currentRound.selectionCriteria) {
                    resultStatus = score >= currentRound.selectionCriteria ? 'Passed' : 'Failed';
                }
            }
        }
        
        const roundResult: ApplicantRoundResult = {
            roundId,
            status: resultStatus,
            answers,
            score,
            completedAt: submittedAt.toISOString(),
            timeTaken,
            startedAt,
        };

        const existingResults = applicantData.roundResults || [];
        const newRoundResults = [...existingResults, roundResult];

        const schedules = applicantData.schedules || [];
        const scheduleIndex = schedules.findIndex(s => s.roundId === roundId);
        if (scheduleIndex > -1) {
            schedules[scheduleIndex].status = 'Attempted';
        }

        const updates: any = { roundResults: newRoundResults, schedules };
        const isLastRound = jobData.rounds.length === roundId + 1;

        if (currentRound.autoProceed && resultStatus === 'Passed' && !isLastRound) {
            updates.activeRoundIndex = roundId + 1;
            updates.status = 'In Progress';

            const nextRound = jobData.rounds[roundId + 1];
            if(nextRound && nextRound.type === 'assessment') {
                 let dueDate = new Date();
                 dueDate.setDate(dueDate.getDate() + 2);
                 const newSchedule: Schedule = {
                    roundId: nextRound.id,
                    scheduledAt: new Date().toISOString(),
                    dueDate: dueDate.toISOString(),
                    status: 'Pending'
                 };
                 updates.schedules = [...schedules, newSchedule];
            }
        } else {
            updates.status = resultStatus === 'Passed' ? 'In Progress' : resultStatus === 'Failed' ? 'Rejected' : 'In Progress';
        }
        
        await updateDoc(applicantDocRef, updates);
        
        revalidatePath(`/dashboard/candidate/applications`);
        return { success: true };

    } catch (error: any) {
        console.error('Error submitting assessment:', error);
        return { error: 'Could not submit your assessment. Please try again.' };
    }
}

interface SubmitFeedbackInput {
    jobId: string;
    roundId: number;
    candidateId: string;
    rating: number;
    feedback: string;
}

export async function submitAssessmentFeedbackAction(input: SubmitFeedbackInput) {
    const { jobId, roundId, candidateId, rating, feedback } = input;

    if (!jobId || !roundId || !candidateId) {
        return { error: 'Missing required information.' };
    }
    
    try {
        const applicantDocRef = doc(db, 'jobs', jobId, 'applicants', candidateId);
        const applicantDoc = await getDoc(applicantDocRef);

        if (!applicantDoc.exists()) {
            return { error: "Applicant not found." };
        }

        const applicantData = applicantDoc.data() as Applicant;
        const roundResults = applicantData.roundResults || [];
        
        const roundResultIndex = roundResults.findIndex(r => r.roundId === roundId);

        if (roundResultIndex === -1) {
            return { error: "Round result not found." };
        }
        
        roundResults[roundResultIndex].feedback = {
            rating,
            comment: feedback,
            submittedAt: new Date().toISOString(),
        };

        await updateDoc(applicantDocRef, { roundResults });

        return { success: true };

    } catch (error: any) {
        console.error("Error submitting feedback:", error);
        return { error: "Failed to submit feedback." };
    }
}
