import { FormEvent, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// TODO: DRY violation - Error styling (style={{ color: 'red' }}) is repeated across all forms
// Create a reusable ErrorMessage component or use CSS classes
// TODO: DRY violation - Form validation pattern is duplicated in SignIn, SignUp, and PasswordReset
// Extract validation logic to a shared hook or utility function
// TODO: DRY violation - Firebase error code mapping is duplicated across auth components
// Extract to a shared utility function like mapFirebaseAuthError(errorCode)

export function PasswordReset() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({ email: "", generic: "" });
  const [mailSent, setMailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const successMessageRef = useRef<HTMLDivElement>(null);

  const { resetPassword } = useAuth();

  // Focus the success message when it appears for better screen reader feedback
  useEffect(() => {
    if (mailSent && successMessageRef.current) {
      successMessageRef.current.focus();
    }
  }, [mailSent]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setErrors({ email: "", generic: "" });

    // TODO: DRY violation - This validation pattern is repeated in all auth forms
    // Extract to a reusable validateForm function or custom hook
    // Validate
    let hasErrors = false;
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      hasErrors = true;
    }
    // Note: Browser's type="email" handles format validation

    if (hasErrors) return;

    setLoading(true);
    try {
      await resetPassword(email);

      setMailSent(true);
      setEmail("");
    } catch (error: unknown) {
      // TODO: DRY violation - Firebase error code mapping duplicated across auth components
      // Extract to shared utility: mapFirebaseAuthError(error) => userFriendlyMessage
      const errorCode = (error as { code?: string })?.code || "";
      if (errorCode === "auth/user-not-found") {
        // Avoid account enumeration: treat as success and show the same UI
        setMailSent(true);
        setEmail("");
        return;
      } else if (errorCode === "auth/invalid-email") {
        setErrors((prev) => ({ ...prev, email: "Invalid email address" }));
      } else if (errorCode === "auth/too-many-requests") {
        setErrors((prev) => ({ ...prev, generic: "Too many requests. Please try again later." }));
      } else {
        setErrors((prev) => ({ ...prev, generic: "Password reset failed. Please try again." }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      <p>Enter your email to receive a password reset link.</p>
      {mailSent && (
        <div 
          ref={successMessageRef}
          role="status" 
          aria-live="polite"
          tabIndex={-1}
          style={{ color: 'green', outline: 'none' }}
        >
          <p>Password reset email sent! Please check your inbox.</p>
          <p style={{ fontSize: '0.9em' }}>If you don't see the email, please check your spam folder.</p>
        </div>
      )}
      {/* TODO: DRY violation - Form input pattern (label + input + error display) is repeated
          across all forms and fields. Consider creating a FormField or FormInput component */}
      <form
        onSubmit={handleSubmit}
        aria-busy={loading}
        noValidate
      >
        {errors.email && <div id="email-error" style={{ color: 'red' }}>{errors.email}</div>}
        {errors.generic && <div id="generic-error" style={{ color: 'red' }}>{errors.generic}</div>}
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setMailSent(false);
            setErrors({ email: "", generic: "" });
          }}
          autoComplete="email"
          autoFocus
          aria-describedby={errors.email ? "email-error" : errors.generic ? "generic-error" : undefined}
          aria-invalid={errors.email ? true : undefined}
          aria-required="true"
          required
        />
        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      <Link to="/signin">Back to Sign In</Link>
    </div>
  );
}