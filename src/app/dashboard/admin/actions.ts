
'use server';

import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { revalidatePath } from 'next/cache';

export async function updateCompanyStatusAction(companyId: string, newStatus: 'Active' | 'Inactive' | 'Banned') {
    try {
        const companyRef = doc(db, 'users', companyId);
        await updateDoc(companyRef, { status: newStatus });
        revalidatePath('/dashboard/admin/companies');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function updateCompanyPlanAction(companyId: string, newPlan: string) {
    try {
        const companyRef = doc(db, 'users', companyId);
        await updateDoc(companyRef, { subscription: newPlan });
        revalidatePath('/dashboard/admin/companies');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function deleteCompanyAction(companyId: string) {
    try {
        await deleteDoc(doc(db, 'users', companyId));
        revalidatePath('/dashboard/admin/companies');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
