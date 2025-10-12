
'use server';

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';

interface ApplyForJobInput {
  jobId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
}

export async function applyForJobAction(input: ApplyForJobInput) {
  const { jobId, candidateId, candidateName, candidateEmail } = input;

  if (!jobId || !candidateId) {
    return { error: 'Job ID or Candidate ID is missing.' };
  }

  try {
    // This is the key part: we define the path to a new document
    // inside the 'applicants' subcollection of a specific job.
    const applicantRef = doc(db, 'jobs', jobId, 'applicants', candidateId);

    // The data for the new document.
    const applicationData = {
      candidateId,
      candidateName,
      candidateEmail,
      status: 'Submitted',
      appliedAt: serverTimestamp(),
      activeRoundIndex: 0,
    };

    // When we call setDoc, Firestore sees the path and automatically
    // creates the 'applicants' subcollection if it's the first document.
    await setDoc(applicantRef, applicationData);

    revalidatePath(`/dashboard/candidate/jobs/${jobId}`);
    revalidatePath(`/dashboard/candidate/applications`);
    return { success: true };
  } catch (error: any) {
    console.error('Error applying for job:', error);
    return { error: 'Could not submit application. Please try again.' };
  }
}
