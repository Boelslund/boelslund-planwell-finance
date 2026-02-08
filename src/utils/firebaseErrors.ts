/**
 * Maps Firebase Auth error codes to user-friendly error messages
 * @param error - The Firebase error object or any error with a code property
 * @returns User-friendly error message
 */
export function mapFirebaseAuthError(error: unknown): string {
  const errorCode = (error as { code?: string })?.code || "";
  
  // Sign In specific errors
  if (errorCode === "auth/wrong-password") {
    return "Incorrect password";
  }
  if (errorCode === "auth/user-not-found") {
    return "No account found with this email";
  }
  if (errorCode === "auth/invalid-credential") {
    return "Invalid credentials. Please check your email and password.";
  }
  
  // Sign Up specific errors
  if (errorCode === "auth/email-already-in-use") {
    return "Email already in use";
  }
  if (errorCode === "auth/weak-password") {
    return "Weak password. Please use a stronger password.";
  }
  if (errorCode === "auth/invalid-email") {
    return "Invalid email address";
  }
  
  // Password Reset specific errors
  if (errorCode === "auth/too-many-requests") {
    return "Too many requests. Please try again later.";
  }
  
  // Profile creation specific errors
  if (errorCode === "permission-denied") {
    return "Database configuration error. Please contact support.";
  }
  
  // Rollback failure
  if (errorCode === "rollback-failed") {
    return "Account created but profile setup failed. Please contact support.";
  }
  
  // Default error message
  return "An error occurred. Please try again.";
}
