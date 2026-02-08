import { FormEvent, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FormInput } from "../common/FormInput";
import { ErrorMessage } from "../common/ErrorMessage";
import { mapFirebaseAuthError } from "../../utils/firebaseErrors";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const { user, signIn } = useAuth();
  const navigate = useNavigate();

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
      setAuthError(mapFirebaseAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      <form
        onSubmit={handleSubmit}
        aria-busy={loading}
        noValidate
      >
        <FormInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
        />

        <FormInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />

        {authError && <ErrorMessage>{authError}</ErrorMessage>}

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