import { FormEvent, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// TODO: DRY violation - Error styling (style={{ color: 'red' }}) is repeated across all forms
// Create a reusable ErrorMessage component or use CSS classes
// TODO: DRY violation - Form validation pattern is duplicated in SignIn, SignUp, and PasswordReset
// Extract validation logic to a shared hook or utility function
// TODO: DRY violation - Form state management pattern (errors, loading, authError) is repeated
// Consider creating a custom useAuthForm hook

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  // TODO: DRY violation - This redirect pattern is duplicated in SignIn and SignUp
  // Consider creating a custom hook like useAuthRedirect()
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({ email: "", password: "" });
    setAuthError("");

    // TODO: DRY violation - This validation pattern is repeated in all auth forms
    // Extract to a reusable validateForm function or custom hook
    // Validate
    let hasErrors = false;
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      hasErrors = true;
    }
    // Note: Browser's type="email" handles format validation

    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      hasErrors = true;
    }

    if (hasErrors) return;

    // Attempt sign in
    setLoading(true);
    try {
      await signIn(email, password);
      // Navigate to home
      navigate("/");
    } catch (error: unknown) {
      // TODO: DRY violation - Firebase error code mapping duplicated across auth components
      // Extract to shared utility: mapFirebaseAuthError(error) => userFriendlyMessage
      // Handle Firebase auth errors
      const errorCode = (error as { code?: string })?.code || "";
      if (errorCode === "auth/wrong-password") {
        setAuthError("Incorrect password");
      } else if (errorCode === "auth/user-not-found") {
        setAuthError("No account found with this email");
      } else if (errorCode === "auth/invalid-credential") {
        setAuthError("Invalid credentials. Please check your email and password.");
      } else {
        setAuthError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      {/* TODO: DRY violation - Form input pattern (label + input + error display) is repeated
          across all forms and fields. Consider creating a FormField or FormInput component */}
      <form
        onSubmit={handleSubmit}
        aria-busy={loading}
        noValidate
      >
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          aria-required="true"
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && <div id="email-error" style={{ color: 'red' }}>{errors.email}</div>}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          aria-required="true"
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && <div id="password-error" style={{ color: 'red' }}>{errors.password}</div>}

        {authError && <div style={{ color: 'red' }}>{authError}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
      <div>
        <Link to="/signup">Don't have an account? Sign Up</Link>
      </div>
      <div>
        <Link to="/password-reset">Forgot Password?</Link>
      </div>
    </div>
  );
}