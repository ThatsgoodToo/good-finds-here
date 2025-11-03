import { toast } from "sonner";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Centralized error handling utility for consistent error logging and user feedback
 */

interface ErrorWithMessage {
  message: string;
}

interface SupabaseErrorDetails {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

/**
 * Type guard to check if error is a Supabase PostgrestError
 */
function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error
  );
}

/**
 * Type guard to check if error has a message property
 */
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * Extract user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (isPostgrestError(error)) {
    return error.message || 'A database error occurred';
  }
  
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Get detailed error information for logging
 */
function getErrorDetails(error: unknown): SupabaseErrorDetails {
  if (isPostgrestError(error)) {
    return {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    };
  }
  
  return {
    message: getErrorMessage(error),
  };
}

/**
 * Log error to console with consistent formatting
 */
export function logError(context: string, error: unknown): void {
  const details = getErrorDetails(error);
  console.error(`[${context}]`, details);
}

/**
 * Handle Supabase errors with logging and user feedback
 * @param error - The error to handle (PostgrestError or generic Error)
 * @param context - Context string for logging (e.g., "Loading coupons")
 * @param userMessage - Optional custom user-facing message
 */
export function handleSupabaseError(
  error: unknown,
  context: string,
  userMessage?: string
): void {
  // Log the error with full details
  logError(context, error);
  
  // Show user-friendly toast
  const message = userMessage || getErrorMessage(error);
  toast.error(message, {
    description: context,
  });
}

/**
 * Handle error without showing toast (for silent logging)
 */
export function handleSilentError(context: string, error: unknown): void {
  logError(context, error);
}
