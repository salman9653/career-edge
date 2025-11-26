/**
 * Firebase Authentication Error Messages
 * Maps Firebase error codes to user-friendly messages
 */

export const firebaseErrorMessages: Record<string, string> = {
  // Authentication Errors
  'auth/invalid-credential': 'Invalid email or password. Please try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Invalid email or password. Please try again.',
  'auth/invalid-login-credentials': 'Invalid email or password. Please try again.',
  
  // Account Creation Errors
  'auth/email-already-in-use': 'This email is already registered. Please log in or use a different email.',
  'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  
  // Password Reset Errors
  'auth/expired-action-code': 'This password reset link has expired. Please request a new one.',
  'auth/invalid-action-code': 'This password reset link is invalid. Please request a new one.',
//   'auth/user-not-found': 'No account found with this email address.',
  
  // Network Errors
  'auth/network-request-failed': 'Network connection failed. Please check your internet and try again.',
  'auth/timeout': 'The request timed out. Please try again.',
  
  // Rate Limiting
  'auth/too-many-requests': 'Too many unsuccessful attempts. Please try again later or reset your password.',
  
  // Token & Session Errors
  'auth/requires-recent-login': 'Please log in again to continue.',
  'auth/session-expired': 'Your session has expired. Please log in again.',
  'auth/invalid-user-token': 'Your session is invalid. Please log in again.',
  'auth/user-token-expired': 'Your session has expired. Please log in again.',
  
  // Permission Errors
  'auth/unauthorized-domain': 'This domain is not authorized for authentication.',
  'auth/web-storage-unsupported': 'Your browser does not support storing authentication data.',
  
  // Multi-factor Authentication
  'auth/multi-factor-auth-required': 'Multi-factor authentication is required.',
  'auth/invalid-verification-code': 'Invalid verification code. Please try again.',
  
  // Popup & Redirect Errors
  'auth/popup-blocked': 'The popup was blocked by your browser. Please allow popups and try again.',
  'auth/popup-closed-by-user': 'The popup was closed before completing authentication.',
  'auth/cancelled-popup-request': 'Only one popup request is allowed at a time.',
  
  // Provider Errors
  'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
  'auth/credential-already-in-use': 'This credential is already associated with a different account.',
  
  // Internal Errors
  'auth/internal-error': 'An internal error occurred. Please try again.',
  'auth/invalid-api-key': 'Invalid API key. Please contact support.',
  'auth/app-deleted': 'The application has been deleted.',
  'auth/app-not-authorized': 'This app is not authorized to use Firebase Authentication.',
  
  // Quota Errors
  'auth/quota-exceeded': 'The quota for this operation has been exceeded. Please try again later.',
  
  // Missing Information
  'auth/missing-email': 'Please enter your email address.',
  'auth/missing-password': 'Please enter your password.',
  
  // Browser Not Supported
  'auth/unsupported-persistence-type': 'Your browser does not support the requested persistence type.',
  'auth/unsupported-tenant-operation': 'This operation is not supported for this tenant.',
};

/**
 * Extracts the Firebase error code from an error message and returns a user-friendly message
 * @param error - The error object or error message from Firebase
 * @returns A user-friendly error message
 */
export function getFirebaseErrorMessage(error: any): string {
  // Handle different error formats
  let errorCode: string | undefined;
  
  if (typeof error === 'string') {
    // Extract error code from string like "Firebase: Error (auth/network-request-failed)."
    const match = error.match(/\(([^)]+)\)/);
    errorCode = match ? match[1] : undefined;
  } else if (error?.code) {
    // Error object with code property
    errorCode = error.code;
  } else if (error?.message) {
    // Error object with message containing code
    const match = error.message.match(/\(([^)]+)\)/);
    errorCode = match ? match[1] : undefined;
  }
  
  // Return mapped message or a generic fallback
  if (errorCode && firebaseErrorMessages[errorCode]) {
    return firebaseErrorMessages[errorCode];
  }
  
  // If we have the original message and it doesn't look like a Firebase error, return it
  const originalMessage = typeof error === 'string' ? error : error?.message;
  if (originalMessage && !originalMessage.includes('Firebase:') && !originalMessage.includes('auth/')) {
    return originalMessage;
  }
  
  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
}
