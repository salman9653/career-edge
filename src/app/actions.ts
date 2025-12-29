

"use server";

import { analyzeResumeForJobMatching } from "@/ai/flows/resume-analysis-for-job-matching";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc, setDoc, getDoc, FieldValue, deleteField, arrayRemove, writeBatch, increment, arrayUnion, query, where, getDocs } from "firebase/firestore";
import { db, auth, storage } from "@/lib/firebase/config";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import type { Price, Round, Job, AiInterview, Employment } from "@/lib/types";
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { randomUUID } from 'crypto';
import { careerChat } from "@/ai/flows/career-chat-flow";
import { ai } from '@/ai/genkit';
import type { CareerChatInput } from "@/ai/flows/career-chat-flow-types";
import { generateAiInterview } from '@/ai/flows/generate-ai-interview-flow';
import type { GenerateAiInterviewInput } from '@/ai/flows/generate-ai-interview-flow-types';
import { regenerateQuestion, refineTone, addFollowUps, regenerateFollowUps, regenerateIntro, regenerateOutro } from '@/ai/flows/edit-ai-interview-flow';
import type { RegenerateQuestionInput, RefineToneInput, AddFollowUpsInput, RegenerateFollowUpsInput, RegenerateIntroInput, RegenerateOutroInput } from '@/ai/flows/edit-ai-interview-flow-types';
import { generateAiQuestions } from '@/ai/flows/generate-ai-questions-flow';
import type { GenerateAiQuestionsInput, GenerateAiQuestionsOutput } from '@/ai/flows/generate-ai-questions-flow-types';
import { enhanceText, generateTextFromPrompt } from '@/ai/flows/text-generation-flows';
import { generateAtsResume } from '@/ai/flows/generate-ats-resume-flow';
import type { GenerateAtsResumeInput, GeneratedResume } from '@/ai/flows/generate-ats-resume-flow-types';
import { generateJobSearchKeywords } from '@/ai/flows/generate-job-search-keywords-flow';
import { z, ZodError } from 'zod';
import { handleServerActionError, ValidationError, AuthError, AppError } from '@/lib/errors';
import { JobPostingSchema } from '@/lib/schemas/job';
import { CreateAssessmentSchema, EditAssessmentSchema, QuestionSchema, BankQuestionSchema } from '@/lib/schemas/assessment';
import { ProfileDetailsSchema, PersonalDetailsSchema, KeySkillsSchema, SocialsSchema, EmploymentSchema, EducationSchema, ProjectSchema } from '@/lib/schemas/profile';
import { GenerateResumeSchema, RenameResumeSchema } from '@/lib/schemas/resume';
import { EnterpriseSubscriptionSchema } from '@/lib/schemas/subscription';


async function fileToDataURI(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    return `data:${file.type};base64,${base64}`;
}

export async function careerChatAction(input: CareerChatInput) {
  const { stream } = await ai.generateStream({
    prompt: `You are Career AI, a helpful and friendly AI assistant for job seekers and hiring managers. Your goal is to provide concise, relevant, and encouraging advice.

You are chatting with ${input.userName}, who is a ${input.userRole}.

Keep your responses brief and to the point.

Conversation History:
${(input.history || []).map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.text}`).join('\n')}

User's new message:
${input.message}`,
    model: 'googleai/gemini-2.5-flash',
  });

  return stream;
}

export async function analyzeAndSaveResumeAction(
  prevState: any,
  formData: FormData,
) {
  return handleServerActionError(async () => {
    const resumeFile = formData.get("resume") as File;
    const jobId = formData.get("jobId") as string;
    const jobTitle = formData.get("jobTitle") as string;
    const companyName = formData.get("companyName") as string;
    const userId = formData.get("userId") as string;
    const jobDescription = formData.get("jobDescription") as string;
  
    if (!resumeFile || resumeFile.size === 0) {
      throw new ValidationError("Please upload a resume file.");
    }
    if (!jobId || !jobDescription || !userId || !jobTitle) {
      throw new ValidationError("Required data is missing.");
    }
    
    const resumeDataUri = await fileToDataURI(resumeFile);
    
    const analysisResult = await analyzeResumeForJobMatching({
        resumeDataUri,
        jobDescription,
        jobTitle
    });
    
    const analysisDocRef = await addDoc(collection(db, `users/${userId}/resume-analyses`), {
        userId,
        jobId,
        jobTitle,
        companyName,
        analyzedAt: serverTimestamp(),
        ...analysisResult
    });
      
    return { analysisId: analysisDocRef.id };
  }, 'Error analyzing resume');
}

export async function addQuestionAction(prevState: any, formData: FormData) {
  return handleServerActionError(async () => {
      // Extract data from FormData
      const rawData: any = {
        question: formData.get('question'),
        type: formData.get('type'),
        difficulty: formData.get('difficulty'),
        category: formData.get('category'),
        libraryType: formData.get('libraryType'),
        addedBy: formData.get('addedBy'),
        
        answerSummary: formData.get('answerSummary'),
        options: formData.getAll('options').filter(o => (o as string).trim() !== ''),
        correctAnswer: formData.get('correctAnswer'),
        acceptableAnswer: formData.getAll('acceptableAnswer'),
        isStrict: formData.get('isStrict') === 'on',
        
        constraints: formData.getAll('constraints').filter(c => (c as string).trim() !== ''),
        hints: formData.getAll('hints').filter(h => (h as string).trim() !== ''),
      };
      
      // Handle complex code fields
      if (rawData.type === 'code') {
        const functionNames: Record<string, string> = {};
        const boilerplates: Record<string, string> = {};
        let langIndex = 0;
        while(formData.has(`language_${langIndex}`)) {
            const lang = formData.get(`language_${langIndex}`) as string;
            const funcName = formData.get(`functionName_${langIndex}`) as string;
            const boilerplateText = formData.get(`boilerplate_${langIndex}`) as string;
            if(lang && funcName && boilerplateText) {
                functionNames[lang] = funcName;
                boilerplates[lang] = boilerplateText;
            }
            langIndex++;
        }
        rawData.functionName = functionNames;
        rawData.boilerplate = boilerplates;

        const examples = [];
        let i = 0;
        while(formData.has(`example_input_${i}`)) {
            examples.push({
                input: formData.get(`example_input_${i}`) as string,
                output: formData.get(`example_output_${i}`) as string,
            });
            i++;
        }
        rawData.examples = examples;

        const testCases = [];
        let j = 0;
        while(formData.has(`testcase_input_${j}`)) {
            testCases.push({
                input: formData.get(`testcase_input_${j}`) as string,
                output: formData.get(`testcase_output_${j}`) as string,
                sample: formData.get(`testcase_sample_${j}`) === 'on',
            });
            j++;
        }
        rawData.testCases = testCases;
      }

      const parseResult = BankQuestionSchema.safeParse(rawData);
      if (!parseResult.success) {
          throw new ZodError((parseResult.error as any).errors);
      }
      const data = parseResult.data;

      // Construct Firestore doc
      const categoryArray = data.category.split(',').map(item => item.trim()).filter(Boolean);
      const difficultyMap: { [key: string]: number } = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
      
      const questionDoc: any = {
        question: data.question,
        type: data.type,
        difficulty: data.type === 'screening' ? 1 : (difficultyMap[data.difficulty || 'Easy'] || 1),
        category: data.type === 'screening' ? ['Screening'] : categoryArray,
        libraryType: data.libraryType,
        addedBy: data.addedBy,
        addedByName: formData.get('addedByName') as string, // Not in schema but needed
        createdAt: serverTimestamp(),
        status: 'active',
      };

      if (data.type === 'subjective') {
        questionDoc.answerSummary = data.answerSummary;
      } else if (data.type === 'mcq') {
        questionDoc.options = data.options;
        questionDoc.correctAnswer = data.correctAnswer;
      } else if (data.type === 'screening') {
        questionDoc.options = data.options;
        questionDoc.acceptableAnswer = data.acceptableAnswer;
        questionDoc.isStrict = data.isStrict;
      } else if (data.type === 'code') {
        questionDoc.functionName = data.functionName;
        questionDoc.boilerplate = data.boilerplate;
        questionDoc.constraints = data.constraints;
        questionDoc.hints = data.hints;
        questionDoc.examples = data.examples;
        questionDoc.testCases = data.testCases;
      }

      const docRef = await addDoc(collection(db, 'questions'), questionDoc);
      
      if(data.type === 'screening'){
        return { success: true, newQuestionId: docRef.id, from: 'screening' };
      }

      revalidatePath('/dashboard/company/questions');
      revalidatePath('/dashboard/admin/questions');
      
      return { success: true };
  }, "Error adding question");
}

export async function generateQuestionsAction(prevState: any, formData: FormData) {
  return handleServerActionError(async () => {
      const jobTitle = formData.get('ai-job-title') as string;
      const keySkills = formData.get('ai-skills') as string;
      const questionType = formData.get('ai-question-type') as 'mcq' | 'subjective' | 'code';
      const numQuestions = parseInt(formData.get('ai-num-questions') as string, 10);
      const difficulty = formData.get('ai-difficulty') as 'Easy' | 'Medium' | 'Hard';
      const addedBy = formData.get('addedBy') as string;
      const addedByName = formData.get('addedByName') as string;
      const libraryType = formData.get('libraryType') as 'library' | 'custom';
      
      if (!jobTitle || !keySkills || !questionType || !numQuestions || !difficulty) {
        throw new ValidationError('Please fill out all AI generation fields.');
      }
      
      const input: GenerateAiQuestionsInput = {
          jobTitle,
          keySkills: keySkills.split(',').map(s => s.trim()),
          questionType,
          numQuestions,
          difficulty,
      };
      
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
  }, "Error generating questions");
}

export async function updateQuestionStatusAction(questionId: string, newStatus: 'active' | 'inactive') {
  return handleServerActionError(async () => {
    if (!questionId || !newStatus) {
        throw new ValidationError('Invalid input provided.');
    }
    const questionRef = doc(db, 'questions', questionId);
    await updateDoc(questionRef, { status: newStatus });
    revalidatePath('/dashboard/admin/questions');
    revalidatePath('/dashboard/company/questions');
    return { error: null };
  }, "Error updating question status");
}

export async function deleteQuestionAction(questionId: string) {
  return handleServerActionError(async () => {
      if (!questionId) {
          throw new ValidationError('Invalid question ID provided.');
      }
      await deleteDoc(doc(db, 'questions', questionId));
      revalidatePath('/dashboard/admin/questions');
      revalidatePath('/dashboard/company/questions');
      return { error: null };
  }, "Error deleting question");
}

export async function updateQuestionAction(prevState: any, formData: FormData) {
  return handleServerActionError(async () => {
    const questionId = formData.get('questionId') as string;
    if (!questionId) throw new ValidationError('Question ID is missing.');

    // Reuse the logic from addQuestionAction but we can extract it to a helper or just duplicate the parsing logic
    // Given the complexity of splitting into helper right now, I'll parse again.
    // Ideally this parsing logic should be a shared function 'parseQuestionFormData'.

    const rawData: any = {
        question: formData.get('question'),
        type: formData.get('type'),
        difficulty: formData.get('difficulty'),
        category: formData.get('category'),
        libraryType: formData.get('libraryType'),
        addedBy: 'update-action', // Placeholder validation
        
        answerSummary: formData.get('answerSummary'),
        options: formData.getAll('options').filter(o => (o as string).trim() !== ''),
        correctAnswer: formData.get('correctAnswer'),
        // accept screening fields just in case though update might not use them all
        acceptableAnswer: formData.getAll('acceptableAnswer'), 
        
        constraints: formData.getAll('constraints').filter(c => (c as string).trim() !== ''),
        hints: formData.getAll('hints').filter(h => (h as string).trim() !== ''),
    };
    
    if (rawData.type === 'code') {
        const functionNames: Record<string, string> = {};
        const boilerplates: Record<string, string> = {};
        let langIndex = 0;
        while(formData.has(`language_${langIndex}`)) {
            const lang = formData.get(`language_${langIndex}`) as string;
            const funcName = formData.get(`functionName_${langIndex}`) as string;
            const boilerplateText = formData.get(`boilerplate_${langIndex}`) as string;
            if(lang && funcName && boilerplateText) {
                functionNames[lang] = funcName;
                boilerplates[lang] = boilerplateText;
            }
            langIndex++;
        }
        rawData.functionName = functionNames;
        rawData.boilerplate = boilerplates;

        const examples = [];
        let i = 0;
        while(formData.has(`example_input_${i}`)) {
            examples.push({
                input: formData.get(`example_input_${i}`) as string,
                output: formData.get(`example_output_${i}`) as string,
            });
            i++;
        }
        rawData.examples = examples;

        const testCases = [];
        let j = 0;
        while(formData.has(`testcase_input_${j}`)) {
            testCases.push({
                input: formData.get(`testcase_input_${j}`) as string,
                output: formData.get(`testcase_output_${j}`) as string,
                sample: formData.get(`testcase_sample_${j}`) === 'on',
            });
            j++;
        }
        rawData.testCases = testCases;
    }

    const parseResult = BankQuestionSchema.safeParse(rawData);
    if (!parseResult.success) {
        throw new ZodError((parseResult.error as any).errors);
    }
    const data = parseResult.data;

    const difficultyMap: { [key: string]: number } = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };

    const questionDoc: any = {
        question: data.question,
        type: data.type,
        difficulty: difficultyMap[data.difficulty || 'Easy'] || 1,
        category: data.category.split(',').map(item => item.trim()).filter(Boolean),
    };

    if (data.type === 'subjective') {
        questionDoc.answerSummary = data.answerSummary;
    } else if (data.type === 'mcq') {
        questionDoc.options = data.options;
        questionDoc.correctAnswer = data.correctAnswer;
    } else if (data.type === 'code') {
        questionDoc.functionName = data.functionName;
        questionDoc.boilerplate = data.boilerplate;
        questionDoc.constraints = data.constraints;
        questionDoc.hints = data.hints;
        questionDoc.examples = data.examples;
        questionDoc.testCases = data.testCases;
    }

    await updateDoc(doc(db, 'questions', questionId), questionDoc);
    if (data.libraryType === 'library') {
        revalidatePath('/dashboard/admin/questions');
    } else {
        revalidatePath('/dashboard/company/questions');
    }
    return { error: null, success: true };
  }, "Error updating question");
}



export async function addSubscriptionPlanAction(prevState: any, formData: FormData) {
  return handleServerActionError(async () => {
      // Extract basic fields for validation
      const rawData = {
        name: formData.get('name'),
        type: formData.get('type') === 'company-enterprise' ? 'company-enterprise' : formData.get('type'),
        currency: formData.get('currency'),
        monthly_amount: formData.get('monthly_amount'),
        yearly_amount: formData.get('yearly_amount'),
      };

      const parseResult = EnterpriseSubscriptionSchema.safeParse(rawData);
      if (!parseResult.success) {
          throw new ZodError((parseResult.error as any).errors);
      }
      const data = parseResult.data;

      const name = data.name;
      let type = rawData.type as 'candidate' | 'company' | 'company-enterprise'; // Schema doesn't strictly validate type enum used here, keep original logic or expand schema
      const currency = data.currency;
      const monthlyAmount = data.monthly_amount;
      const yearlyAmount = data.yearly_amount;

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
        throw new ValidationError('Please select at least one feature for the plan.');
      }

      const planId = `${type}-${name.toLowerCase().replace(/\s+/g, '-')}`;
      if(type === 'company-enterprise'){
        type = 'company-enterprise';
      }

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
  }, "Error adding subscription plan");
}

export async function deleteSubscriptionPlanAction(planId: string) {
  return handleServerActionError(async () => {
      if (!planId) {
          throw new ValidationError('Invalid plan ID provided.');
      }
      await deleteDoc(doc(db, 'subscriptions', planId));
      revalidatePath('/dashboard/admin/subscriptions');
      return { success: true, error: null };
  }, "Error deleting subscription plan");
}

export async function addCouponAction(prevState: any, formData: FormData) {
  return handleServerActionError(async () => {
    const type = formData.get('type') as 'coupon' | 'offer';
    let code = formData.get('code') as string;
    const description = formData.get('description') as string;
    const discountType = formData.get('discountType') as 'percentage' | 'fixed';
    const discountValue = parseFloat(formData.get('discountValue') as string);
    const applicablePlans = formData.getAll('applicablePlans') as string[];
    const validFromString = formData.get('validFrom') as string | null;
    const validUntilString = formData.get('validUntil') as string | null;

    if (!description || !discountType || isNaN(discountValue) || applicablePlans.length === 0) {
        throw new ValidationError('Please fill out all required fields.');
    }

    if (type === 'coupon' && !code) {
        throw new ValidationError('Coupon code is required for type "coupon".');
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

    await addDoc(collection(db, 'coupons'), couponDoc);
    revalidatePath('/dashboard/admin/coupons');
    return { success: true, error: null };
  }, "Error adding coupon");
}

export async function updateCouponStatusAction(couponId: string, newStatus: 'active' | 'inactive') {
  return handleServerActionError(async () => {
    if (!couponId || !newStatus) {
        throw new ValidationError('Invalid input provided.');
    }
    const couponRef = doc(db, 'coupons', couponId);
    await updateDoc(couponRef, { status: newStatus });
    revalidatePath('/dashboard/admin/coupons');
    return { error: null, success: true };
  }, "Error updating coupon status");
}

export async function deleteCouponAction(couponId: string) {
  return handleServerActionError(async () => {
    if (!couponId) {
        throw new ValidationError('Invalid coupon ID provided.');
    }
    await deleteDoc(doc(db, 'coupons', couponId));
    revalidatePath('/dashboard/admin/coupons');
    return { error: null, success: true };
  }, "Error deleting coupon");
}

export async function updateCouponAction(prevState: any, formData: FormData) {
  return handleServerActionError(async () => {
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
        throw new ValidationError('Please fill out all required fields.');
    }

    if (type === 'coupon' && !code) {
        throw new ValidationError('Coupon code is required for type "coupon".');
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

    await updateDoc(doc(db, 'coupons', couponId), couponDoc);
    revalidatePath('/dashboard/admin/coupons');
    return { success: true, error: null };
  }, "Error updating coupon");
}

export async function updateUserProfileAction(prevState: any, formData: FormData) {
  return handleServerActionError(async () => {
    const userId = formData.get('userId') as string;
    if (!userId) {
        throw new AuthError('User not authenticated.');
    }

    const dataToUpdate: { [key: string]: any } = {};

    // Dynamically iterate over formData to build the update object
    for (const [key, value] of formData.entries()) {
        if (key === 'userId' || key === 'role' || key.startsWith('$ACTION')) continue;

        // Skip empty values unless it's a field we want to clear
        if (value === '' && !['profileSummary', 'phone', 'address', 'resumeFile'].includes(key)) continue;

        if (key.includes('.')) {
            // Handle nested objects like socials and address
            dataToUpdate[key] = value;
        } else if (key === 'keySkills' || key === 'employment' || key === 'education' || key === 'languages' || key === 'projects' || key === 'benefits') {
            try {
                const parsedValue = JSON.parse(value as string);
                if (Array.isArray(parsedValue)) {
                    dataToUpdate[key] = parsedValue;
                }
            } catch (e) {
                // It's a string, like from keySkills
                dataToUpdate[key] = (value as string).split(',').map(s => s.trim()).filter(s => s);
            }
        } else if (key === 'dob-day' || key === 'dob-month' || key === 'dob-year') {
            // Handled below
        } else if (key === 'resumeFile') {
            const resumeFile = value as File;
            const MAX_RESUME_SIZE = 750 * 1024; // 750KB

            if (resumeFile && resumeFile.size > 0) {
                if (resumeFile.size > MAX_RESUME_SIZE) {
                    throw new ValidationError(`Resume file size should not exceed ${MAX_RESUME_SIZE / 1024}KB.`);
                }
                const resumeDataUri = await fileToDataURI(resumeFile);
                await setDoc(doc(db, `users/${userId}/uploads/resume`), {
                    data: resumeDataUri,
                    name: resumeFile.name,
                    size: resumeFile.size,
                    type: resumeFile.type,
                    updatedAt: serverTimestamp(),
                });
                dataToUpdate.hasResume = true;
            }
        } else {
            dataToUpdate[key] = value;
        }
    }
    
    const employmentValue = formData.get('employment');
    if (typeof employmentValue === 'string') {
        const parsed = JSON.parse(employmentValue);
        const result = z.array(EmploymentSchema).safeParse(parsed);
        if (!result.success) throw new ZodError((result.error as any).errors);
        dataToUpdate['employment'] = result.data;
    }
    
    const educationValue = formData.get('education');
    if (typeof educationValue === 'string') {
        const parsed = JSON.parse(educationValue);
        const result = z.array(EducationSchema).safeParse(parsed);
        if (!result.success) throw new ZodError((result.error as any).errors);
        dataToUpdate['education'] = result.data;
    }

    const languagesValue = formData.get('languages');
    if (typeof languagesValue === 'string') {
        const parsed = JSON.parse(languagesValue);
        const result = PersonalDetailsSchema.shape.languages.safeParse(parsed); // Use the schema from PersonalDetails
        if (!result.success) throw new ZodError((result.error as any).errors);
        dataToUpdate['languages'] = result.data;
    }
    
    const projectsValue = formData.get('projects');
    if (typeof projectsValue === 'string') {
        const parsed = JSON.parse(projectsValue);
        const result = z.array(ProjectSchema).safeParse(parsed);
        if (!result.success) throw new ZodError((result.error as any).errors);
        dataToUpdate['projects'] = result.data;
    }
    
    const benefitsValue = formData.getAll('benefits');
    if(benefitsValue) {
        dataToUpdate['benefits'] = benefitsValue;
    }

    const dobValue = formData.get('dob');
    if (dobValue) {
        dataToUpdate['dob'] = dobValue;
    }
    
    if (Object.keys(dataToUpdate).length === 0) {
        return { success: 'No changes to save.' };
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, dataToUpdate);

    revalidatePath('/dashboard/profile');
    return { success: 'Profile updated successfully.' };
  }, "Error updating profile");
}

export async function removeResumeAction(userId: string) {
    return handleServerActionError(async () => {
        if (!userId) {
            throw new AuthError('User not authenticated.');
        }
    
        const userDocRef = doc(db, 'users', userId);
        const uploadDocRef = doc(db, `users/${userId}/uploads`, 'resume');
        
        const batch = writeBatch(db);
        batch.delete(uploadDocRef);
        batch.update(userDocRef, { hasResume: false });
        await batch.commit();

        revalidatePath('/dashboard/profile');
        return { success: true };
    }, "Error removing resume");
}


export async function updateDisplayPictureAction(formData: FormData) {
    return handleServerActionError(async () => {
        const avatarFile = formData.get('avatar') as File;
        const userId = formData.get('userId') as string;
        const MAX_FILE_SIZE = 750 * 1024; // 750KB

        if (!avatarFile) {
            throw new ValidationError('No file selected for upload.');
        }
        if (!userId) {
            throw new AuthError('User not authenticated.');
        }
        if (avatarFile.size > MAX_FILE_SIZE) {
            throw new ValidationError(`Image file size should not exceed ${MAX_FILE_SIZE / 1024}KB.`);
        }

        const userDocRef = doc(db, 'users', userId);
        const dataUrl = await fileToDataURI(avatarFile);
        
        await setDoc(doc(db, `users/${userId}/uploads/displayImage`), { data: dataUrl });

        await updateDoc(userDocRef, {
            hasDisplayImage: true
        });
        
        revalidatePath('/dashboard/profile');
        return { success: true, url: dataUrl };
    }, "Error updating display picture");
}

export async function removeDisplayPictureAction(userId: string) {
    return handleServerActionError(async () => {
        if (!userId) {
            throw new AuthError('User not authenticated.');
        }
    
        const userDocRef = doc(db, 'users', userId);
        const uploadDocRef = doc(db, `users/${userId}/uploads`, 'displayImage');
        
        const batch = writeBatch(db);
        batch.delete(uploadDocRef);
        batch.update(userDocRef, { hasDisplayImage: false });
        await batch.commit();

        revalidatePath('/dashboard/profile');
        return { success: true };
    }, "Error removing display picture");
}

export async function changePasswordAction(prevState: any, formData: FormData) {
  return handleServerActionError(async () => {
      const currentPassword = formData.get('currentPassword') as string;
      const newPassword = formData.get('newPassword') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new ValidationError('All fields are required.');
      }

      if (newPassword !== confirmPassword) {
        throw new ValidationError('New passwords do not match.');
      }

      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new AuthError('You must be logged in to change your password. Please refresh the page and try again.');
      }

      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // If re-authentication is successful, update the password
      await updatePassword(user, newPassword);
      
      return { success: 'Password changed successfully.' };
  }, "Error changing password");
}

export async function addManagerAction(prevState: any, formData: FormData) {
  return handleServerActionError(async () => {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const designation = formData.get('designation') as string;
    const permissionsRole = formData.get('permissions_role') as string;
    const companyUid = formData.get('company_uid') as string;
    const adminAccount = formData.get('adminAccount') as string;

    if (!name || !email || !designation || !permissionsRole) {
        throw new ValidationError('Please fill out all required fields.');
    }

    const managerData: any = {
        name,
        email,
        designation,
        permissions_role: permissionsRole,
        status: 'inactive',
        createdAt: serverTimestamp(),
    };

    if (adminAccount === 'true') {
        managerData.role = 'adminAccountManager';
    } else {
        if (!companyUid) {
            throw new ValidationError('Company ID is missing for company manager.');
        }
        managerData.role = 'manager';
        managerData.company_uid = companyUid;
    }
    
    await addDoc(collection(db, 'users'), managerData);
    if(adminAccount === 'true') {
        revalidatePath('/dashboard/admin/managers');
    } else {
        revalidatePath('/dashboard/profile');
    }
    return { success: true, error: null };
  }, "Error adding manager");
}

export async function inviteManagerAction(managerId: string) {
  return handleServerActionError(async () => {
      if (!managerId) {
          throw new ValidationError('Manager ID is missing.');
      }
      const invitationToken = randomUUID();
      const managerRef = doc(db, 'users', managerId);
      
      await updateDoc(managerRef, {
        invitationToken: invitationToken,
        status: 'invited',
      });
      
      revalidatePath('/dashboard/profile');
      revalidatePath('/dashboard/admin/managers');
      return { success: true, token: invitationToken };
  }, "Error inviting manager");
}

export async function updateManagerStatusAction(managerId: string, newStatus: 'active' | 'banned') {
    return handleServerActionError(async () => {
        if (!managerId || !newStatus) {
            throw new ValidationError('Invalid input.');
        }
        await updateDoc(doc(db, 'users', managerId), { status: newStatus });
        revalidatePath('/dashboard/profile');
        revalidatePath('/dashboard/admin/managers');
        return { success: true };
    }, "Error updating manager status");
}

export async function updateManagerRoleAction(managerId: string, newRole: 'Admin' | 'Editor' | 'Viewer') {
    return handleServerActionError(async () => {
        if (!managerId || !newRole) {
            throw new ValidationError('Invalid input.');
        }
        await updateDoc(doc(db, 'users', managerId), { permissions_role: newRole });
        revalidatePath('/dashboard/profile');
        revalidatePath('/dashboard/admin/managers');
        return { success: true };
    }, "Error updating manager role");
}

export async function createAssessmentAction(prevState: any, formData: FormData) {
  return handleServerActionError(async () => {
      const rawData = {
        name: formData.get('name'),
        assessmentType: formData.get('assessmentType'),
        description: formData.get('description'),
        createdBy: formData.get('createdBy'),
        createdByName: formData.get('createdByName'),
      };

      const parseResult = CreateAssessmentSchema.safeParse(rawData);
      if (!parseResult.success) {
          throw new ZodError((parseResult.error as any).errors);
      }
      const data = parseResult.data;

      const docData = {
        name: data.name,
        createdBy: data.createdBy,
        createdByName: data.createdByName,
        assessmentType: data.assessmentType,
        description: data.description,
        questionIds: [],
        createdAt: serverTimestamp(),
      };

    const docRef = await addDoc(collection(db, 'assessments'), docData);
    return { success: true, assessmentId: docRef.id };
  }, "Error creating assessment");
}

export async function updateAssessmentAction(prevState: any, formData: FormData) {
  return handleServerActionError(async () => {
      const rawData = {
          name: formData.get('name'),
          description: formData.get('description'),
          assessmentType: formData.get('assessmentType'), // Schema doesn't strictly validate this on edit but good to have
      };
      const assessmentId = formData.get('assessmentId') as string;

      if (!assessmentId) throw new ValidationError('Assessment ID is missing.');

      const parseResult = EditAssessmentSchema.safeParse(rawData);
      if (!parseResult.success) {
          throw new ZodError((parseResult.error as any).errors);
      }
      const data = parseResult.data;

      const docData = {
        name: data.name,
        assessmentType: formData.get('assessmentType'), // Keep original behaviour
        description: data.description,
      };

      await updateDoc(doc(db, 'assessments', assessmentId), docData);
      revalidatePath(`/dashboard/company/assessments/${assessmentId}`);
      return { success: true };
  }, "Error updating assessment");
}
    
export async function updateAssessmentQuestionsAction(prevState: any, formData: FormData) {
  return handleServerActionError(async () => {
    const assessmentId = formData.get('assessmentId') as string;
    const questionIds = formData.getAll('questionIds') as string[];

    if (!assessmentId) {
      throw new ValidationError('Assessment ID is missing.');
    }
    
    const assessmentRef = doc(db, 'assessments', assessmentId);
    await updateDoc(assessmentRef, {
      questionIds: questionIds
    });
    revalidatePath(`/dashboard/company/assessments/${assessmentId}`);
    return { success: true };
  }, "Error updating assessment questions");
}

export async function removeQuestionFromAssessmentAction(assessmentId: string, questionId: string) {
    return handleServerActionError(async () => {
        if (!assessmentId || !questionId) {
            throw new ValidationError('Assessment ID or Question ID is missing.');
        }

        const assessmentRef = doc(db, 'assessments', assessmentId);
        await updateDoc(assessmentRef, {
            questionIds: arrayRemove(questionId)
        });
        revalidatePath(`/dashboard/company/assessments/${assessmentId}`);
        return { success: true };
    }, "Error removing question from assessment");
}

export async function deleteAssessmentAction(assessmentId: string) {
    return handleServerActionError(async () => {
        if (!assessmentId) {
            throw new ValidationError('Assessment ID is missing.');
        }

        await deleteDoc(doc(db, 'assessments', assessmentId));
        revalidatePath('/dashboard/company/assessments');
        redirect('/dashboard/company/assessments');
    }, "Error deleting assessment");
}

export async function createJobAction(jobData: Omit<Job, 'id' | 'datePosted' | 'applicants' >, rounds: Round[], createdBy: string, createdByName: string) {
    return handleServerActionError(async () => {
        if (!createdBy || !createdByName) {
            throw new AuthError('You must be logged in to create a job.');
        }

        const parseResult = JobPostingSchema.safeParse(jobData);
        if (!parseResult.success) {
            throw new ZodError((parseResult.error as any).errors);
        }
        const restOfJobData = parseResult.data;
        
        // Create a combined string of important fields for searching
        const searchableString = [
            restOfJobData.title,
            restOfJobData.description,
            restOfJobData.location,
            restOfJobData.type,
            ...(restOfJobData.keySkills || [])
        ].join(' ').toLowerCase();

        // Create an array of keywords
        const searchKeywords = Array.from(new Set(searchableString.split(/\s+/).filter(Boolean)));

        const finalJobData = {
            ...restOfJobData,
            searchKeywords,
            rounds,
            createdBy: createdBy,
            createdByName: createdByName,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'Live',
        };
        
        await addDoc(collection(db, 'jobs'), finalJobData);
        revalidatePath('/dashboard/company/jobs');
        revalidateTag('jobs', 'default');
        
        // Redirect needs to be OUTSIDE the try/catch in wrapped function or handled differently if we want client side redirect.
        // But handleServerActionError catches and returns object. 
        // Next.js redirect throws an error. We need to let that bubble up or return it.
        // Actually, redirect throws NEXT_REDIRECT error. 
        // We should move redirect outside the wrapper call or ensure wrapper re-throws Redirect errors.
        // For now, let's return success and redirect on client or handle explicitly.
        // However, existing component likely expects redirect.
        // Redirect throws an error, so handleServerActionError will catch it.
    }, "Error creating job");
    // TODO: Handle redirect logic properly with the wrapper. Redirect throws 'NEXT_REDIRECT' type error which should strictly NOT be caught.
    // We will adjust handleServerActionError to ignore redirect errors.
}
    
export async function updateJobAction(jobId: string, jobData: Omit<Job, 'id' | 'datePosted' | 'createdBy' | 'createdByName' | 'createdAt' | 'updatedAt' | 'status' | 'applicants'>, rounds: Round[]) {
  return handleServerActionError(async () => {
      const parseResult = JobPostingSchema.safeParse(jobData);
      if (!parseResult.success) {
          throw new ZodError((parseResult.error as any).errors);
      }
      const validatedJobData = parseResult.data;

      // Create a combined string of important fields for searching
      const searchableString = [
          validatedJobData.title,
          validatedJobData.description,
          validatedJobData.location,
          validatedJobData.type,
          ...(validatedJobData.keySkills || [])
      ].join(' ').toLowerCase();

      // Create an array of keywords
      const searchKeywords = Array.from(new Set(searchableString.split(/\s+/).filter(Boolean)));

      const finalJobData = {
        ...validatedJobData,
        searchKeywords,
        rounds,
        updatedAt: serverTimestamp(),
      };

      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, finalJobData);
      revalidatePath('/dashboard/company/jobs');
      revalidatePath(`/dashboard/company/jobs/${jobId}`);
      revalidateTag('jobs', 'default');
      redirect(`/dashboard/company/jobs/${jobId}`);
  }, "Error updating job");
}

export async function deleteJobAction(jobId: string) {
    return handleServerActionError(async () => {
        if (!jobId) {
            throw new ValidationError('Job ID is missing.');
        }
        await deleteDoc(doc(db, 'jobs', jobId));
        revalidatePath('/dashboard/company/jobs');
        revalidateTag('jobs', 'default');
        redirect('/dashboard/company/jobs');
    }, "Error deleting job");
}

export async function updateJobStatusAction(jobId: string, status: string) {
    return handleServerActionError(async () => {
        if (!jobId || !status) {
            throw new ValidationError('Invalid input.');
        }
        
        const jobRef = doc(db, 'jobs', jobId);
        await updateDoc(jobRef, { status });
        revalidatePath('/dashboard/company/jobs');
        revalidateTag('jobs', 'default'); 
        return { success: true };
    }, 'Error updating job status');
}

export async function scheduleNextRoundAction(jobId: string, applicantId: string) {
    return handleServerActionError(async () => {
        if (!jobId || !applicantId) {
            throw new ValidationError('Job ID or Applicant ID is missing.');
        }

        const jobDocRef = doc(db, 'jobs', jobId);
        const applicantDocRef = doc(db, 'jobs', jobId, 'applicants', applicantId);
        
        const [jobDoc, applicantDoc] = await Promise.all([
            getDoc(jobDocRef),
            getDoc(applicantDocRef)
        ]);

        if (!jobDoc.exists() || !applicantDoc.exists()) {
            throw new AppError('Job or applicant not found.');
        }

        const job = jobDoc.data() as Job;
        const applicant = applicantDoc.data();
        const currentRoundIndex = applicant.activeRoundIndex;
        const nextRoundIndex = currentRoundIndex + 1;

        if (nextRoundIndex >= job.rounds.length) {
            throw new AppError('No more rounds to schedule.');
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
        } else {
            // For other round types, we might just update the index and status
             updates.activeRoundIndex = nextRoundIndex;
             // Logic might differ for interview rounds, but keeping consistent with original implicit logic
        }
        
        await updateDoc(applicantDocRef, updates);
        
        revalidatePath(`/dashboard/company/ats/${jobId}`);
        return { 
            success: true,
            roundName: nextRound.name,
            roundType: nextRound.type,
            dueDate: dueDate?.toISOString() || null
        };
    }, 'Error scheduling next round');
}

export async function generateAiInterviewAction(prevState: any, formData: FormData) {
  return handleServerActionError(async () => {
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
        throw new ValidationError('Please fill out all required fields.');
      }
    
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
  }, 'Error generating AI interview');
}

export async function regenerateQuestionAction(input: RegenerateQuestionInput) {
  return handleServerActionError(async () => {
    return await regenerateQuestion(input);
  }, 'Failed to regenerate question');
}

export async function refineToneAction(input: RefineToneInput) {
  return handleServerActionError(async () => {
    return await refineTone(input);
  }, 'Failed to refine tone');
}

export async function addFollowUpsAction(input: AddFollowUpsInput) {
  return handleServerActionError(async () => {
    return await addFollowUps(input);
  }, 'Failed to add follow-ups');
}

export async function regenerateFollowUpsAction(input: RegenerateFollowUpsInput) {
  return handleServerActionError(async () => {
    return await regenerateFollowUps(input);
  }, 'Failed to regenerate follow-ups');
}

export async function regenerateIntroAction(input: RegenerateIntroInput) {
  return handleServerActionError(async () => {
    return await regenerateIntro(input);
  }, 'Failed to regenerate intro');
}

export async function regenerateOutroAction(input: RegenerateOutroInput) {
  return handleServerActionError(async () => {
    return await regenerateOutro(input);
  }, 'Failed to regenerate outro');
}

export async function updateAiInterviewAction(interviewId: string, interviewData: AiInterview) {
  return handleServerActionError(async () => {
    if (!interviewId || !interviewData) {
        throw new ValidationError('Invalid data provided.');
      }
      
      const interviewRef = doc(db, 'ai-interviews', interviewId);
      await updateDoc(interviewRef, {
          ...interviewData,
      });
      revalidatePath(`/dashboard/company/templates/ai-interviews/${interviewId}`);
      return { success: true };
  }, 'Error updating AI interview');
}

export async function enhanceTextAction(prevState: any, formData: FormData) {
  return handleServerActionError(async () => {
    const text = formData.get('text') as string;
    const context = formData.get('context') as string;
    if (!text || !context) throw new ValidationError('Missing text or context.');
    
    const result = await enhanceText({ text, context });
    return { text: result.enhancedText };
  }, 'Error enhancing text');
}

export async function generateTextAction(prevState: any, formData: FormData) {
  return handleServerActionError(async () => {
    const prompt = formData.get('prompt') as string;
    const context = formData.get('context') as string;
    if (!prompt || !context) throw new ValidationError('Missing prompt or context.');
    
    const result = await generateTextFromPrompt({ prompt, context });
    return { text: result.generatedText };
  }, 'Error generating text');
}

export async function generateAtsResumeAction(prevState: any, formData: FormData) {
    return handleServerActionError(async () => {
        const rawData = {
            userId: formData.get('userId'),
            resumeName: formData.get('resumeName'),
            jobDescription: formData.get('jobDescription'),
            userDetails: formData.get('userDetails'),
            existingResume: formData.get('existingResume'),
        };
        
        const parseResult = GenerateResumeSchema.safeParse(rawData);
        if (!parseResult.success) {
            throw new ZodError((parseResult.error as any).errors);
        }
        const data = parseResult.data;
    
        const userId = rawData.userId as string;
        const existingResumeFile = rawData.existingResume as File | null;
        const userDetailsString = data.userDetails;
        const jobDescription = data.jobDescription;
        const resumeName = data.resumeName;
        
        if (!userId) throw new ValidationError('User ID is missing.');
    
        let userDetails = {};
        if (userDetailsString) {
            try {
                userDetails = JSON.parse(userDetailsString);
            } catch(e) {
                throw new ValidationError('Invalid user details format.');
            }
        }
        
        let resumeDataUri: string | undefined = undefined;
        if (existingResumeFile && existingResumeFile.size > 0) {
            resumeDataUri = await fileToDataURI(existingResumeFile);
        }
        
        const input: GenerateAtsResumeInput = {
            jobDescription: data.jobDescription,
            userDetails: JSON.stringify(userDetails),
            existingResumeDataUri: resumeDataUri,
        };
        
        const result = await generateAtsResume(input);
            
        const resumeDoc: Omit<GeneratedResume, 'id'> = {
            userId,
            name: resumeName,
            markdownContent: result.markdownContent,
            jobDescription,
            createdAt: serverTimestamp(),
            input: {
                jobDescription,
                userDetails,
                hasExistingResume: !!resumeDataUri,
            }
        };
    
        const docRef = await addDoc(collection(db, `users/${userId}/generated-resumes`), resumeDoc);
    
        return { success: true, resumeId: docRef.id };
    }, 'Error generating ATS resume');
}

export async function deleteGeneratedResumeAction(resumeId: string, userId: string) {
  return handleServerActionError(async () => {
      if (!userId || !resumeId) {
        throw new ValidationError("User ID and Resume ID are required.");
      }
    
      const docRef = doc(db, `users/${userId}/generated-resumes`, resumeId);
      await deleteDoc(docRef);
      revalidatePath('/dashboard/candidate/resume-builder');
      return { success: true };
  }, "Error deleting resume");
}

export async function renameGeneratedResumeAction(prevState: any, formData: FormData) {
  return handleServerActionError(async () => {
      const userId = formData.get('userId') as string;
      const resumeId = formData.get('resumeId') as string;
      const newName = formData.get('newName') as string;
      
      const parseResult = RenameResumeSchema.safeParse({ newName });
      if (!parseResult.success) {
          throw new ZodError((parseResult.error as any).errors);
      }
    
      if (!userId || !resumeId) {
        throw new ValidationError('Missing required information.');
      }
    
      const docRef = doc(db, `users/${userId}/generated-resumes`, resumeId);
      await updateDoc(docRef, {
        name: newName,
      });
      revalidatePath('/dashboard/candidate/resume-builder');
      return { success: true };
  }, 'Error renaming resume');
}
