import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function PasswordReset() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({ email: "", generic: "" });
  const [mailSent, setMailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setErrors({ email: "", generic: "" });

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
      const errorCode = (error as { code?: string })?.code || "";
      if (errorCode === "auth/user-not-found") {
        // Security: Don't reveal if email exists - show same success message
        setMailSent(true);
        setEmail("");
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
        <div style={{ color: 'green' }} aria-label="Password reset email sent! Please check your inbox and spam folder.">
          <p>Password reset email sent! Please check your inbox.</p>
          <p style={{ fontSize: '0.9em' }}>If you don't see the email, please check your spam folder.</p>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        aria-busy={loading}
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