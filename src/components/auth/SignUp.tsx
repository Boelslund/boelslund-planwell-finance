import { FormEvent, useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { createUserProfile } from "../../services/userProfile";
import { FormInput } from "../common/FormInput";
import { ErrorMessage } from "../common/ErrorMessage";
import { mapFirebaseAuthError } from "../../utils/firebaseErrors";

export function SignUp() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ displayName: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const { user, signUp, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  /**
   * Handles user sign up with profile creation and rollback on failure
   */
  const handleSignUpWithProfile = async () => {
    const userCredential = await signUp(email, password);
    const newUser = userCredential.user;

    try {
      await createUserProfile(newUser.uid, newUser.email || email, displayName.trim());
    } catch (profileError) {
      // Profile creation failed - attempt cleanup
      await handleProfileCreationFailure(newUser, profileError);
    }
  };

  /**
   * Handles profile creation failure with appropriate rollback
   */
  const handleProfileCreationFailure = async (newUser: { delete: () => Promise<void> }, profileError: unknown) => {
    try {
      // Try to delete the user account
      await newUser.delete();
    } catch (deleteError) {
      // If delete fails, sign out to prevent authenticated state without profile
      console.error("Failed to rollback user creation:", deleteError);
      try {
        await signOut();
      } catch (signOutError) {
        console.error("Failed to sign out after rollback failure:", signOutError);
      }
      // Set error and throw to prevent navigation - use original error code for proper mapping
      const error = { code: "rollback-failed", message: "Account created but profile setup failed. Please contact support." };
      throw error;
    }
    // Re-throw the original error to be handled by the outer catch
    throw profileError;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({ displayName: "", email: "", password: "", confirmPassword: "" });
    setAuthError("");

    // Validate
    let hasErrors = false;
    if (!displayName.trim()) {
      setErrors((prev) => ({ ...prev, displayName: "Name is required" }));
      hasErrors = true;
    }

    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      hasErrors = true;
    }
    // Note: Browser's type="email" handles format validation

    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }));
      hasErrors = true;
    } else if (password.length < 8) {
      setErrors((prev) => ({ ...prev, password: "Password must be at least 8 characters" }));
      hasErrors = true;
    }

    if (!confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Please confirm your password" }));
      hasErrors = true;
    } else if (password !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      hasErrors = true;
    }

    if (hasErrors) return;

    // Attempt sign up
    setLoading(true);
    try {
      await handleSignUpWithProfile();
      // Navigate to home page
      navigate("/");
    } catch (error: unknown) {
      setAuthError(mapFirebaseAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <form
        onSubmit={handleSubmit}
        aria-busy={loading}
        noValidate
      >
        <FormInput
          id="displayName"
          label="Name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={errors.displayName}
          autoComplete="name"
        />

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
          autoComplete="new-password"
        />

        <FormInput
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        {authError && <ErrorMessage id="authError">{authError}</ErrorMessage>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
      <Link to="/signin">Already have an account? Sign In</Link>
    </div>
  );
}
