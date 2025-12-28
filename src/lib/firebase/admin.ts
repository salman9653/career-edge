import 'server-only';
import { initializeApp, getApps, getApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

function getServiceAccountCredentials(): ServiceAccount | null {
    // Option 1: Try to load from JSON file in project root
    const serviceAccountPath = path.join(process.cwd(), 'firebase-adminsdk.json');
    if (fs.existsSync(serviceAccountPath)) {
        try {
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
            console.log('[Firebase Admin] Loaded credentials from firebase-adminsdk.json');
            return serviceAccount as ServiceAccount;
        } catch (error) {
            console.error('[Firebase Admin] Error reading service account file:', error);
        }
    }

    // Option 2: Try to load from environment variables
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
        console.log('[Firebase Admin] Loaded credentials from environment variables');
        return {
            projectId,
            clientEmail,
            privateKey,
        } as ServiceAccount;
    }

    console.warn('[Firebase Admin] No credentials found. Some features may not work.');
    return null;
}

export function getAdminApp() {
    if (getApps().length) {
        return getApp();
    }
    
    const credentials = getServiceAccountCredentials();
    
    if (credentials) {
        return initializeApp({
            credential: cert(credentials),
        });
    }
    
    // Fallback for ADC (Application Default Credentials) or Emulators
    console.warn('[Firebase Admin] Initializing without explicit credentials');
    return initializeApp({ 
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID 
    }); 
}

const app = getAdminApp();
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
