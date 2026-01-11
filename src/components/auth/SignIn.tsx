import { FormEvent, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

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
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}

        {authError && <div style={{ color: 'red' }}>{authError}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
      <Link to="/signup">Don't have an account? Sign Up</Link>
    </div>
  );
}