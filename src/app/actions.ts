

"use server";

import { analyzeResumeForJobMatching } from "@/ai/flows/resume-analysis-for-job-matching";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc, setDoc, getDoc, FieldValue, deleteField, arrayRemove, writeBatch, increment, arrayUnion } from "firebase/firestore";
import { db, auth, storage } from "@/lib/firebase/config";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Price, Round, Job, AiInterview } from "@/lib/types";
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { randomUUID } from 'crypto';
import { careerChat } from "@/ai/flows/career-chat-flow";
import { streamText } from 'genkit';
import type { CareerChatInput } from "@/ai/flows/career-chat-flow-types";
import { generateAiInterview } from '@/ai/flows/generate-ai-interview-flow';
import type { GenerateAiInterviewInput } from '@/ai/flows/generate-ai-interview-flow-types';
import { regenerateQuestion, refineTone, addFollowUps, regenerateFollowUps, regenerateIntro, regenerateOutro } from '@/ai/flows/edit-ai-interview-flow';
import type { RegenerateQuestionInput, RefineToneInput, AddFollowUpsInput, RegenerateFollowUpsInput, RegenerateIntroInput, RegenerateOutroInput } from '@/ai/flows/edit-ai-interview-flow-types';
import { generateAiQuestions } from "@/ai/flows/generate-ai-questions-flow";
import type { GenerateAiQuestionsInput, GenerateAiQuestionsOutput } from "@/ai/flows/generate-ai-questions-flow-types";


async function fileToDataURI(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    return `data:${file.type};base64,${base64}`;
}

export async function careerChatAction(input: CareerChatInput) {
  const stream = await streamText({
    prompt: `You are Career AI, a helpful and friendly AI assistant for job seekers and hiring managers. Your goal is to provide concise, relevant, and encouraging advice.

You are chatting with ${input.userName}, who is a ${input.userRole}.

Keep your responses brief and to the point.

Conversation History:
${(input.history || []).map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.text}`).join('\n')}

User's new message:
${input.message}`,
    model: 'googleai/gemini-2.5-flash',
  });

  return stream.textStream;
}

export async function analyzeResumeAction(
  prevState: any,
  formData: FormData,
) {
  const resumeFile = formData.get("resume") as File;
  const jobDescription = formData.get("jobDescription") as string;

  if (!resumeFile || resumeFile.size === 0) {
    return { error: "Please upload a resume file." };
  }
  if (!jobDescription) {
    return { error: "Job description is missing." };
  }
  
  try {
    const resumeDataUri = await fileToDataURI(resumeFile);

    const result = await analyzeResumeForJobMatching({
      resumeDataUri,
      jobDescription,
    });
    
    return { result };

  } catch (e: any) {
    console.error(e);
    return { error: e.message || "An unexpected error occurred." };
  }
}

export async function addQuestionAction(prevState: any, formData: FormData) {
  const question = formData.get('question') as string;
  const type = formData.get('type') as 'mcq' | 'subjective' | 'screening' | 'code';
  const difficultyString = formData.get('difficulty') as string;
  const categoryString = formData.get('category') as string;
  const libraryType = formData.get('libraryType') as 'library' | 'custom';
  const addedBy = formData.get('addedBy') as string;
  const addedByName = formData.get('addedByName') as string;
  const from = formData.get('from') as string;
  
  // MCQ, Subjective and Screening specific fields
  const answerSummary = formData.get('answerSummary') as string;
  const options = formData.getAll('options') as string[];
  const correctAnswer = formData.get('correctAnswer') as string;
  const acceptableAnswers = formData.getAll('acceptableAnswer') as string[];
  const isStrict = formData.get('isStrict') === 'on';

  // Coding specific fields
  const functionName = formData.get('functionName') as string;
  const boilerplate = formData.get('boilerplate') as string;
  const constraints = formData.getAll('constraints') as string[];
  const hints = formData.getAll('hints') as string[];

  if (!question || !type || !libraryType || !addedBy) {
    return { error: 'Please fill out all required fields.' };
  }

  let category: string[] = [];
  let difficulty: number = 1; // Default to easy

  if (type === 'screening') {
    category = ['Screening'];
    difficulty = 1; // Screening questions are always easy
  } else {
    if (!difficultyString || !categoryString) {
      return { error: 'Difficulty and category are required for this question type.' };
    }
    category = categoryString.split(',').map(item => item.trim()).filter(item => item);
    const difficultyMap: { [key: string]: number } = { 'easy': 1, 'medium': 2, 'hard': 3 };
    difficulty = difficultyMap[difficultyString] || 1;
  }

  const questionDoc: any = {
    question,
    type,
    difficulty,
    category,
    libraryType,
    addedBy,
    addedByName,
    createdAt: serverTimestamp(),
    status: 'active',
  };

  if (type === 'subjective') {
    if (!answerSummary || answerSummary.trim().length < 10) {
      return { error: 'Answer summary must be at least 10 characters long.' };
    }
    questionDoc.answerSummary = answerSummary;
  }

  if (type === 'mcq') {
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      return { error: 'MCQs must have at least 2 valid options.' };
    }
    if (!correctAnswer) {
      return { error: 'A correct answer must be selected for MCQs.' };
    }
    questionDoc.options = validOptions;
    questionDoc.correctAnswer = correctAnswer;
  }

  if (type === 'screening') {
    const validOptions = options.filter(opt => opt.trim() !== '');
     if (validOptions.length < 2) {
      return { error: 'Screening questions must have at least 2 options.' };
    }
    if (acceptableAnswers.length === 0) {
      return { error: 'An acceptable answer must be selected for Screening questions.' };
    }
    questionDoc.options = validOptions;
    questionDoc.acceptableAnswer = acceptableAnswers;
    questionDoc.isStrict = isStrict;
  }

  if (type === 'code') {
    if (!functionName) {
        return { error: 'Function name is required for coding questions.' };
    }
    questionDoc.functionName = functionName;
    questionDoc.boilerplate = boilerplate;
    questionDoc.constraints = constraints.filter(c => c.trim() !== '');
    questionDoc.hints = hints.filter(h => h.trim() !== '');

    const examples: { input: string; output: string; explanation?: string }[] = [];
    const testCases: { input: string; output: string }[] = [];
    
    let i = 0;
    while(formData.has(`example_input_${i}`)) {
        examples.push({
            input: formData.get(`example_input_${i}`) as string,
            output: formData.get(`example_output_${i}`) as string,
            explanation: formData.get(`example_explanation_${i}`) as string || undefined,
        });
        i++;
    }
    
    let j = 0;
    while(formData.has(`testcase_input_${j}`)) {
        testCases.push({
            input: formData.get(`testcase_input_${j}`) as string,
            output: formData.get(`testcase_output_${j}`) as string,
        });
        j++;
    }
    
    if (examples.length === 0 || examples.some(ex => !ex.input || !ex.output)) {
        return { error: 'At least one complete example is required for coding questions.' };
    }
     if (testCases.length === 0 || testCases.some(tc => !tc.input || !tc.output)) {
        return { error: 'At least one complete test case is required for coding questions.' };
    }

    questionDoc.examples = examples;
    questionDoc.testCases = testCases;
  }

  try {
    const docRef = await addDoc(collection(db, 'questions'), questionDoc);
    
    if(type === 'screening'){
      return { success: true, newQuestionId: docRef.id, from: 'screening' };
    }

    revalidatePath('/dashboard/company/questions');
    revalidatePath('/dashboard/admin/questions');
    
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function generateQuestionsAction(prevState: any, formData: FormData) {
  const jobTitle = formData.get('ai-job-title') as string;
  const keySkills = formData.get('ai-skills') as string;
  const questionType = formData.get('ai-question-type') as 'mcq' | 'subjective';
  const numQuestions = parseInt(formData.get('ai-num-questions') as string, 10);
  const difficulty = formData.get('ai-difficulty') as 'Easy' | 'Medium' | 'Hard';
  const addedBy = formData.get('addedBy') as string;
  const addedByName = formData.get('addedByName') as string;
  const libraryType = formData.get('libraryType') as 'library' | 'custom';
  
  if (!jobTitle || !keySkills || !questionType || !numQuestions || !difficulty) {
    return { error: 'Please fill out all AI generation fields.' };
  }
  
  const input: GenerateAiQuestionsInput = {
      jobTitle,
      keySkills: keySkills.split(',').map(s => s.trim()),
      questionType,
      numQuestions,
      difficulty,
  };
  
  try {
    const result = await generateAiQuestions(input);
    const batch = writeBatch(db);

    const difficultyMap: { [key: string]: number } = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };

    result.questions.forEach(q => {
        const questionRef = doc(collection(db, 'questions'));
        const questionDoc = {
            ...q,
            difficulty: difficultyMap[difficulty],
            libraryType,
            addedBy,
            addedByName,
            createdAt: serverTimestamp(),
            status: 'active',
        };
        batch.set(questionRef, questionDoc);
    });

    await batch.commit();

    revalidatePath('/dashboard/company/questions');
    revalidatePath('/dashboard/admin/questions');

    return { 
        success: true, 
        numQuestions,
        questionType,
        difficulty,
    };
  } catch (e: any) {
    console.error('Error in generateQuestionsAction:', e);
    return { error: e.message || "An unexpected error occurred during AI generation." };
  }
}

export async function updateQuestionStatusAction(questionId: string, newStatus: 'active' | 'inactive') {
  if (!questionId || !newStatus) {
    return { error: 'Invalid input provided.' };
  }

  try {
    const questionRef = doc(db, 'questions', questionId);
    await updateDoc(questionRef, { status: newStatus });
    revalidatePath('/dashboard/admin/questions');
    revalidatePath('/dashboard/company/questions');
    return { error: null };
  } catch (e: any) {
    console.error("Error updating question status:", e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}

export async function deleteQuestionAction(questionId: string) {
  if (!questionId) {
    return { error: 'Invalid question ID provided.' };
  }

  try {
    await deleteDoc(doc(db, 'questions', questionId));
    revalidatePath('/dashboard/admin/questions');
    revalidatePath('/dashboard/company/questions');
    return { error: null };
  } catch (e: any) {
    console.error("Error deleting question:", e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}

export async function updateQuestionAction(prevState: any, formData: FormData) {
  const questionId = formData.get('questionId') as string;
  const question = formData.get('question') as string;
  const type = formData.get('type') as string;
  const difficultyString = formData.get('difficulty') as string;
  const categoryString = formData.get('category') as string;
  const libraryType = formData.get('libraryType') as string;

  // MCQ and Subjective specific fields
  const answerSummary = formData.get('answerSummary') as string;
  const options = formData.getAll('options') as string[];
  const correctAnswer = formData.get('correctAnswer') as string;

  if (!questionId || !question || !type || !difficultyString || !categoryString) {
    return { error: 'Please fill out all required fields.' };
  }

  const category = categoryString.split(',').map(item => item.trim()).filter(item => item);
  const difficultyMap: { [key: string]: number } = {
    'easy': 1,
    'medium': 2,
    'hard': 3,
  };
  const difficulty = difficultyMap[difficultyString] || 1;

  const questionDoc: any = {
    question,
    type,
    difficulty,
    category,
  };

  if (type === 'subjective') {
    if (!answerSummary || answerSummary.trim().length < 10) {
      return { error: 'Answer summary must be at least 10 characters long.' };
    }
    questionDoc.answerSummary = answerSummary;
  }

  if (type === 'mcq') {
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      return { error: 'MCQs must have at least 2 valid options.' };
    }
    if (!correctAnswer) {
      return { error: 'A correct answer must be selected for MCQs.' };
    }
    questionDoc.options = validOptions;
    questionDoc.correctAnswer = correctAnswer;
  }

  try {
    await updateDoc(doc(db, 'questions', questionId), questionDoc);
    if (libraryType === 'library') {
      revalidatePath('/dashboard/admin/questions');
    } else {
      revalidatePath('/dashboard/company/questions');
    }
    return { error: null, success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function addSubscriptionPlanAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  let type = formData.get('type') as 'candidate' | 'company' | 'company-enterprise';
  const currency = formData.get('currency') as string;
  const monthlyAmountString = formData.get('monthly_amount') as string;
  const yearlyAmountString = formData.get('yearly_amount') as string;

  if (!name || !type || !currency || !monthlyAmountString || !yearlyAmountString) {
    return { error: 'Please fill out all required fields.' };
  }

  const monthlyAmount = parseFloat(monthlyAmountString);
  const yearlyAmount = parseFloat(yearlyAmountString);

  if (isNaN(monthlyAmount) || isNaN(yearlyAmount)) {
    return { error: 'Invalid amount entered.' };
  }

  const prices: Price[] = [
    { currency, amount: Math.round(monthlyAmount * 100), cycle: 'monthly' },
    { currency, amount: Math.round(yearlyAmount * 100), cycle: 'yearly' },
  ];

  const features: { name: string; label: string; limit?: string }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('feature_') && value === 'on') {
      const featureName = key.substring(8);
      const limitKey = `limit_${featureName}`;
      const unlimitedKey = `unlimited_${featureName}`;
      
      let limit = formData.get(limitKey) as string | null;
      const isUnlimited = formData.get(unlimitedKey) === 'on';

      if (isUnlimited) {
        limit = 'Unlimited';
      }
      
      const label = featureName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      
      const feature: { name: string, label: string, limit?: string } = { name: featureName, label };
      if (limit) {
        feature.limit = limit;
      }
      features.push(feature);
    }
  }

  if (features.length === 0) {
    return { error: 'Please select at least one feature for the plan.' };
  }

  const planId = `${type}-${name.toLowerCase().replace(/\s+/g, '-')}`;
  if(type === 'company-enterprise'){
    type = 'company-enterprise';
  }


  try {
    await setDoc(doc(db, 'subscriptions', planId), {
      id: planId,
      name,
      type,
      prices,
      features,
      createdAt: serverTimestamp(),
    }, { merge: true });
    revalidatePath('/dashboard/admin/subscriptions');
    return { success: true, error: null };
  } catch (e: any) {
    return { error: e.message, success: false };
  }
}

export async function deleteSubscriptionPlanAction(planId: string) {
  if (!planId) {
    return { error: 'Invalid plan ID provided.' };
  }

  try {
    await deleteDoc(doc(db, 'subscriptions', planId));
    revalidatePath('/dashboard/admin/subscriptions');
    return { success: true, error: null };
  } catch (e: any) {
    return { error: e.message, success: false };
  }
}

export async function addCouponAction(prevState: any, formData: FormData) {
    const type = formData.get('type') as 'coupon' | 'offer';
    let code = formData.get('code') as string;
    const description = formData.get('description') as string;
    const discountType = formData.get('discountType') as 'percentage' | 'fixed';
    const discountValue = parseFloat(formData.get('discountValue') as string);
    const applicablePlans = formData.getAll('applicablePlans') as string[];
    const validFromString = formData.get('validFrom') as string | null;
    const validUntilString = formData.get('validUntil') as string | null;

    if (!description || !discountType || isNaN(discountValue) || applicablePlans.length === 0) {
        return { error: 'Please fill out all required fields.' };
    }

    if (type === 'coupon' && !code) {
        return { error: 'Coupon code is required for type "coupon".' };
    }

    if (type === 'offer' && !code) {
      code = description.toUpperCase().replace(/\s+/g, '-') + '-' + Date.now();
    }

    const couponDoc = {
        code: code.toUpperCase(),
        description,
        type,
        discountType,
        discountValue,
        applicablePlans,
        validFrom: validFromString ? new Date(validFromString) : null,
        validUntil: validUntilString ? new Date(validUntilString) : null,
        createdAt: serverTimestamp(),
        status: 'inactive',
    };

    try {
        await addDoc(collection(db, 'coupons'), couponDoc);
        revalidatePath('/dashboard/admin/coupons');
        return { success: true, error: null };
    } catch (e: any) {
        return { error: e.message, success: false };
    }
}

export async function updateCouponStatusAction(couponId: string, newStatus: 'active' | 'inactive') {
  if (!couponId || !newStatus) {
    return { error: 'Invalid input provided.' };
  }

  try {
    const couponRef = doc(db, 'coupons', couponId);
    await updateDoc(couponRef, { status: newStatus });
    revalidatePath('/dashboard/admin/coupons');
    return { error: null, success: true };
  } catch (e: any) {
    return { error: e.message, success: false };
  }
}

export async function deleteCouponAction(couponId: string) {
  if (!couponId) {
    return { error: 'Invalid coupon ID provided.' };
  }

  try {
    await deleteDoc(doc(db, 'coupons', couponId));
    revalidatePath('/dashboard/admin/coupons');
    return { error: null, success: true };
  } catch (e: any) {
    return { error: e.message, success: false };
  }
}

export async function updateCouponAction(prevState: any, formData: FormData) {
    const couponId = formData.get('couponId') as string;
    const type = formData.get('type') as 'coupon' | 'offer';
    let code = formData.get('code') as string;
    const description = formData.get('description') as string;
    const discountType = formData.get('discountType') as 'percentage' | 'fixed';
    const discountValue = parseFloat(formData.get('discountValue') as string);
    const applicablePlans = formData.getAll('applicablePlans') as string[];
    const validFromString = formData.get('validFrom') as string | null;
    const validUntilString = formData.get('validUntil') as string | null;

    if (!couponId || !description || !discountType || isNaN(discountValue) || applicablePlans.length === 0) {
        return { error: 'Please fill out all required fields.' };
    }

    if (type === 'coupon' && !code) {
        return { error: 'Coupon code is required for type "coupon".' };
    }

    if (type === 'offer' && !code) {
        code = description.toUpperCase().replace(/\s+/g, '-') + '-' + Date.now();
    }
    
    const couponDoc = {
        code: code.toUpperCase(),
        description,
        type,
        discountType,
        discountValue,
        applicablePlans,
        validFrom: validFromString ? new Date(validFromString) : null,
        validUntil: validUntilString ? new Date(validUntilString) : null,
    };

    try {
        await updateDoc(doc(db, 'coupons', couponId), couponDoc);
        revalidatePath('/dashboard/admin/coupons');
        return { success: true, error: null };
    } catch (e: any) {
        return { error: e.message, success: false };
    }
}

export async function updateUserProfileAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const userId = formData.get('userId') as string;
  const role = formData.get('role') as string;
  
  // Company specific fields
  const website = formData.get('website') as string;
  const companySize = formData.get('companySize') as string;
  const linkedin = formData.get('linkedin') as string;
  const twitter = formData.get('twitter') as string;
  const naukri = formData.get('naukri') as string;
  const glassdoor = formData.get('glassdoor') as string;
  const helplinePhone = formData.get('helplinePhone') as string;
  const helplineEmail = formData.get('helplineEmail') as string;
  const aboutCompany = formData.get('aboutCompany') as string;
  const companyType = formData.get('companyType') as string;
  const foundedYear = formData.get('foundedYear') as string;
  const tagsString = formData.get('tags') as string;
  const benefits = formData.getAll('benefits') as string[];

  if (!name || !userId) {
    return { error: 'Missing required fields.' };
  }

  try {
    const userRef = doc(db, 'users', userId);
    const dataToUpdate: any = { name, phone };

    if (role === 'company') {
        if(companySize) {
            const [size, employees] = companySize.split('|');
            dataToUpdate.companySize = { size, employees };
        }
        dataToUpdate.website = website;
        dataToUpdate.socials = { linkedin, twitter, naukri, glassdoor };
        dataToUpdate.helplinePhone = helplinePhone;
        dataToUpdate.helplineEmail = helplineEmail;
        dataToUpdate.aboutCompany = aboutCompany;
        dataToUpdate.companyType = companyType;
        dataToUpdate.foundedYear = foundedYear;
        dataToUpdate.tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
        dataToUpdate.benefits = benefits;
    }
    
    await updateDoc(userRef, dataToUpdate);

    revalidatePath('/dashboard/profile');
    return { success: 'Profile updated successfully.' };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateDisplayPictureAction(formData: FormData) {
    const avatarFile = formData.get('avatar') as File;
    const userId = formData.get('userId') as string;

    if (!avatarFile) {
        return { error: 'No file selected for upload.' };
    }
     if (!userId) {
        return { error: 'User not authenticated.' };
    }

    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        // If a picture already exists, delete it first.
        if (userData?.displayImageUrl) {
            try {
                const oldImageRef = ref(storage, userData.displayImageUrl);
                await deleteObject(oldImageRef);
            } catch (deleteError: any) {
                 if (deleteError.code !== 'storage/object-not-found') {
                    console.warn("Could not delete old avatar:", deleteError);
                }
            }
        }

        const filePath = `display-pics/${userId}/${Date.now()}-${avatarFile.name}`;
        const storageRef = ref(storage, filePath);
        
        await uploadBytes(storageRef, avatarFile);
        const downloadURL = await getDownloadURL(storageRef);

        await updateDoc(userDocRef, {
            displayImageUrl: downloadURL
        });
        
        revalidatePath('/dashboard/profile');
        return { success: true, url: downloadURL };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function removeDisplayPictureAction(userId: string) {
     if (!userId) {
        return { error: 'User not authenticated.' };
    }
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        if (userData?.displayImageUrl) {
            const imageRef = ref(storage, userData.displayImageUrl);
            await deleteObject(imageRef);
            await updateDoc(userDocRef, {
                displayImageUrl: deleteField()
            });
            revalidatePath('/dashboard/profile');
            return { success: true };
        }
        return { success: true, message: 'No avatar to remove.' };

    } catch (error: any) {
         if (error.code === 'storage/object-not-found') {
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, {
                displayImageUrl: deleteField()
            });
            revalidatePath('/dashboard/profile');
            return { success: true, message: 'Image not in storage, but DB link removed.' };
        }
        return { error: error.message };
    }
}

export async function changePasswordAction(prevState: any, formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All fields are required.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match.' };
  }

  const user = auth.currentUser;
  if (!user || !user.email) {
    return { error: 'You must be logged in to change your password. Please refresh the page and try again.' };
  }

  try {
    // Re-authenticate the user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // If re-authentication is successful, update the password
    await updatePassword(user, newPassword);
    
    return { success: 'Password changed successfully.' };

  } catch (error: any) {
    if (error.code === 'auth/wrong-password') {
      return { error: 'The current password you entered is incorrect.' };
    }
    if (error.code === 'auth/user-mismatch') {
        return { error: 'Authentication error. Please sign in again and retry.' };
    }
    return { error: error.message };
  }
}

export async function addManagerAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const designation = formData.get('designation') as string;
  const permissionsRole = formData.get('permissions_role') as string;
  const companyUid = formData.get('company_uid') as string;
  
  if (!name || !email || !designation || !permissionsRole || !companyUid) {
    return { error: 'Please fill out all required fields.' };
  }

  const managerData = {
    name,
    email,
    designation,
    permissions_role: permissionsRole,
    company_uid: companyUid,
    role: 'manager',
    status: 'inactive',
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, 'users'), managerData);
    revalidatePath('/dashboard/profile');
    return { success: true, error: null };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function inviteManagerAction(managerId: string) {
  if (!managerId) {
    return { error: 'Manager ID is missing.' };
  }

  try {
    const invitationToken = randomUUID();
    const managerRef = doc(db, 'users', managerId);
    
    await updateDoc(managerRef, {
      invitationToken: invitationToken,
      status: 'invited',
    });
    
    revalidatePath('/dashboard/profile');
    return { success: true, token: invitationToken };

  } catch (e: any) {
    console.error('Error inviting manager:', e);
    return { error: e.message };
  }
}

export async function updateManagerStatusAction(managerId: string, newStatus: 'active' | 'banned') {
    if (!managerId || !newStatus) {
        return { error: 'Invalid input.' };
    }
    try {
        await updateDoc(doc(db, 'users', managerId), { status: newStatus });
        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateManagerRoleAction(managerId: string, newRole: 'Admin' | 'Editor' | 'Viewer') {
    if (!managerId || !newRole) {
        return { error: 'Invalid input.' };
    }
    try {
        await updateDoc(doc(db, 'users', managerId), { permissions_role: newRole });
        revalidatePath('/dashboard/profile');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function createAssessmentAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const createdBy = formData.get('createdBy') as string;
  const createdByName = formData.get('createdByName') as string;
  
  if (!name || !createdBy || !createdByName) {
    return { error: 'Assessment name and creator details are required.' };
  }

  const docData = {
    name,
    createdBy,
    createdByName,
    assessmentType: formData.get('assessmentType'),
    description: formData.get('description'),
    questionIds: [],
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, 'assessments'), docData);
    return { success: true, assessmentId: docRef.id };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateAssessmentAction(prevState: any, formData: FormData) {
  const assessmentId = formData.get('assessmentId') as string;
  const name = formData.get('name') as string;
  const assessmentType = formData.get('assessmentType') as string;
  const description = formData.get('description') as string;

  if (!assessmentId || !name || !assessmentType) {
    return { error: 'Assessment ID, name, and type are required.' };
  }

  const docData = {
    name,
    assessmentType,
    description,
  };

  try {
    await updateDoc(doc(db, 'assessments', assessmentId), docData);
    revalidatePath(`/dashboard/company/assessments/${assessmentId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
    
export async function updateAssessmentQuestionsAction(prevState: any, formData: FormData) {
  const assessmentId = formData.get('assessmentId') as string;
  const questionIds = formData.getAll('questionIds') as string[];

  if (!assessmentId) {
    return { error: 'Assessment ID is missing.' };
  }
  
  try {
    const assessmentRef = doc(db, 'assessments', assessmentId);
    await updateDoc(assessmentRef, {
      questionIds: questionIds
    });
    revalidatePath(`/dashboard/company/assessments/${assessmentId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function removeQuestionFromAssessmentAction(assessmentId: string, questionId: string) {
    if (!assessmentId || !questionId) {
        return { error: 'Assessment ID or Question ID is missing.' };
    }

    try {
        const assessmentRef = doc(db, 'assessments', assessmentId);
        await updateDoc(assessmentRef, {
            questionIds: arrayRemove(questionId)
        });
        revalidatePath(`/dashboard/company/assessments/${assessmentId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteAssessmentAction(assessmentId: string) {
    if (!assessmentId) {
        return { error: 'Assessment ID is missing.' };
    }

    try {
        await deleteDoc(doc(db, 'assessments', assessmentId));
        revalidatePath('/dashboard/company/assessments');
    } catch (e: any) {
        return { error: e.message };
    }
    redirect('/dashboard/company/assessments');
}

export async function createJobAction(jobData: Omit<Job, 'id' | 'datePosted' | 'recruiter'>, rounds: Round[], createdBy: string, createdByName: string) {
  if (!createdBy || !createdByName) {
    throw new Error('You must be logged in to create a job.');
  }

  const { applicants, ...restOfJobData } = jobData;

  const finalJobData = {
    ...restOfJobData,
    rounds,
    createdBy: createdBy,
    createdByName: createdByName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: 'Live',
  };
  
  try {
    await addDoc(collection(db, 'jobs'), finalJobData);
    revalidatePath('/dashboard/company/jobs');
  } catch (e: any) {
    console.error("Error creating job:", e);
    return { error: e.message };
  }
  redirect('/dashboard/company/jobs');
}
    
export async function updateJobAction(jobId: string, jobData: Omit<Job, 'id' | 'datePosted' | 'recruiter' | 'createdBy' | 'createdByName' | 'createdAt' | 'updatedAt' | 'status' | 'applicants'>, rounds: Round[]) {
  const finalJobData = {
    ...jobData,
    rounds,
    updatedAt: serverTimestamp(),
  };

  try {
    const jobRef = doc(db, 'jobs', jobId);
    await updateDoc(jobRef, finalJobData);
    revalidatePath('/dashboard/company/jobs');
    revalidatePath(`/dashboard/company/jobs/${jobId}`);
  } catch (e: any) {
    console.error("Error updating job:", e);
    return { error: e.message };
  }
  redirect(`/dashboard/company/jobs/${jobId}`);
}

export async function deleteJobAction(jobId: string) {
    if (!jobId) {
        return { error: 'Job ID is missing.' };
    }
    try {
        await deleteDoc(doc(db, 'jobs', jobId));
        revalidatePath('/dashboard/company/jobs');
    } catch (e: any) {
        return { error: e.message };
    }
    redirect('/dashboard/company/jobs');
}

export async function updateJobStatusAction(jobId: string, status: string) {
    if (!jobId || !status) {
        return { error: 'Invalid input.' };
    }
    try {
        const jobRef = doc(db, 'jobs', jobId);
        await updateDoc(jobRef, { status });
        revalidatePath('/dashboard/company/jobs');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function scheduleNextRoundAction(jobId: string, applicantId: string) {
    if (!jobId || !applicantId) {
        return { error: 'Job ID or Applicant ID is missing.' };
    }

    try {
        const jobDocRef = doc(db, 'jobs', jobId);
        const applicantDocRef = doc(db, 'jobs', jobId, 'applicants', applicantId);
        
        const [jobDoc, applicantDoc] = await Promise.all([
            getDoc(jobDocRef),
            getDoc(applicantDocRef)
        ]);

        if (!jobDoc.exists() || !applicantDoc.exists()) {
            return { error: 'Job or applicant not found.' };
        }

        const job = jobDoc.data() as Job;
        const applicant = applicantDoc.data();
        const currentRoundIndex = applicant.activeRoundIndex;
        const nextRoundIndex = currentRoundIndex + 1;

        if (nextRoundIndex >= job.rounds.length) {
            return { error: 'No more rounds to schedule.' };
        }

        const nextRound = job.rounds[nextRoundIndex];
        const updates: any = {};
        let dueDate = null;

        if (nextRound.type === 'assessment') {
            updates.activeRoundIndex = nextRoundIndex;
            updates.status = 'In Progress';
            
            dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 2);

            updates.schedules = arrayUnion({
                roundId: nextRound.id,
                scheduledAt: new Date(),
                dueDate: dueDate,
                status: 'Pending'
            });
        }
        
        await updateDoc(applicantDocRef, updates);
        
        revalidatePath(`/dashboard/company/ats/${jobId}`);
        return { 
            success: true,
            roundName: nextRound.name,
            roundType: nextRound.type,
            dueDate: dueDate?.toISOString() || null
        };

    } catch (e: any) {
        console.error('Error scheduling next round:', e);
        return { error: e.message };
    }
}

export async function generateAiInterviewAction(prevState: any, formData: FormData) {
  const input: GenerateAiInterviewInput = {
    jobTitle: formData.get('jobTitle') as string,
    jobDescription: formData.get('jobDescription') as string,
    keySkills: (formData.get('keySkills') as string).split(',').map(s => s.trim()),
    difficulty: formData.get('difficulty') as GenerateAiInterviewInput['difficulty'],
    tone: formData.get('tone') as GenerateAiInterviewInput['tone'],
    duration: parseInt(formData.get('duration') as string, 10),
  };

  const createdBy = formData.get('createdBy') as string;
  const createdByName = formData.get('createdByName') as string;
  const companyId = formData.get('companyId') as string;

  if (!input.jobTitle || !input.jobDescription || !input.keySkills || !createdBy || !createdByName || !companyId) {
    return { error: 'Please fill out all required fields.' };
  }

  try {
    const interviewData = await generateAiInterview(input);
    
    await addDoc(collection(db, 'ai-interviews'), {
      ...interviewData,
      name: `${input.jobTitle} - AI Interview`,
      jobTitle: input.jobTitle,
      jobDescription: input.jobDescription,
      keySkills: input.keySkills,
      difficulty: input.difficulty,
      tone: input.tone,
      duration: input.duration,
      questionCount: interviewData.questions.length,
      createdBy,
      createdByName,
      companyId,
      createdAt: serverTimestamp(),
    });
    
    revalidatePath('/dashboard/company/templates');
    return { success: true };
  } catch (e: any) {
    console.error('Error generating AI interview:', e);
    return { error: e.message || 'An unexpected error occurred while generating the interview.' };
  }
}

export async function regenerateQuestionAction(input: RegenerateQuestionInput) {
  try {
    return await regenerateQuestion(input);
  } catch (e: any) {
    return { error: e.message || 'Failed to regenerate question.' };
  }
}

export async function refineToneAction(input: RefineToneInput) {
  try {
    return await refineTone(input);
  } catch (e: any) {
    return { error: e.message || 'Failed to refine tone.' };
  }
}

export async function addFollowUpsAction(input: AddFollowUpsInput) {
  try {
    return await addFollowUps(input);
  } catch (e: any) {
    return { error: e.message || 'Failed to add follow-ups.' };
  }
}

export async function regenerateFollowUpsAction(input: RegenerateFollowUpsInput) {
  try {
    return await regenerateFollowUps(input);
  } catch (e: any) {
    return { error: e.message || 'Failed to regenerate follow-ups.' };
  }
}

export async function regenerateIntroAction(input: RegenerateIntroInput) {
  try {
    return await regenerateIntro(input);
  } catch (e: any) {
    return { error: e.message || 'Failed to regenerate intro.' };
  }
}

export async function regenerateOutroAction(input: RegenerateOutroInput) {
  try {
    return await regenerateOutro(input);
  } catch (e: any) {
    return { error: e.message || 'Failed to regenerate outro.' };
  }
}

export async function updateAiInterviewAction(interviewId: string, interviewData: AiInterview) {
  if (!interviewId || !interviewData) {
    return { error: 'Invalid data provided.' };
  }
  
  try {
    const interviewRef = doc(db, 'ai-interviews', interviewId);
    await updateDoc(interviewRef, {
        ...interviewData,
        // any server-side timestamps or updates would go here
    });
    revalidatePath(`/dashboard/company/templates/ai-interviews/${interviewId}`);
    return { success: true };
  } catch (e: any) {
    console.error('Error updating AI interview:', e);
    return { error: e.message || 'An unexpected error occurred.' };
  }
}



