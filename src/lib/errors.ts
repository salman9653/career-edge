import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(message: string, public code: string = 'UNKNOWN_ERROR', public statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

type ServerActionResponse<T> = {
    success?: boolean;
    error?: string;
    data?: T;
    [key: string]: any; 
};

export async function handleServerActionError<T>(
    action: () => Promise<T>,
    errorMessage: string = 'An unexpected error occurred.'
): Promise<ServerActionResponse<T> | T> {
    try {
        return await action();
    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT' || error.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }

        console.error(`Action Error: ${errorMessage}`, error);

        if (error instanceof ZodError) {
             // Extract the first error message or join them
            const message = (error as any).errors.map((e: any) => e.message).join(', ');
            return { error: `Validation failed: ${message}`, success: false } as any; 
        }

        if (error instanceof AppError) {
            return { error: error.message, success: false } as any;
        }

        if (error instanceof Error) {
             // Handle generic Errors (potentially sensitive info in dev, sanitize for prod if needed)
             // For now, we return message if likely safe or fallback
             return { error: error.message || errorMessage, success: false } as any;
        }

        return { error: errorMessage, success: false } as any;
    }
}
