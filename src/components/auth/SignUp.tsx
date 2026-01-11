import { FormEvent, useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { createUserProfile } from "../../services/userProfile";

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
            const userCredential = await signUp(email, password);
            const newUser = userCredential.user;

            // Create user profile in Firestore
            // If this fails, rollback by deleting the user account to avoid inconsistent state
            try {
                await createUserProfile(newUser.uid, newUser.email || email, displayName.trim());
            } catch (profileError) {
                // Profile creation failed - attempt rollback
                try {
                    await newUser.delete();
                } catch (deleteError) {
                    // Rollback failed - sign out to prevent authenticated state without profile
                    console.error("Failed to rollback user creation:", deleteError);
                    try {
                        await signOut();
                    } catch (signOutError) {
                        console.error("Failed to sign out after rollback failure:", signOutError);
                    }
                    setAuthError("Account created but profile setup failed. Please contact support.");
                    return;
                }
                // Re-throw the profile error to be handled by outer catch
                throw profileError;
            }

            // Navigate to home page
            navigate("/");
        } catch (error: unknown) {
            // Handle Firebase auth errors
            const errorCode = (error as { code?: string })?.code || "";

            if (errorCode === "auth/email-already-in-use") {
                setAuthError("Email already in use");
            } else if (errorCode === "auth/weak-password") {
                setAuthError("Weak password. Please use a stronger password.");
            } else if (errorCode === "auth/invalid-email") {
                setAuthError("Invalid email address");
            } else if (errorCode === "permission-denied") {
                setAuthError("Database configuration error. Please contact support.");
            } else {
                setAuthError("Failed to create an account. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="displayName">Name</label>
                <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoComplete="name"
                />
                {errors.displayName && <div style={{ color: 'red' }}>{errors.displayName}</div>}

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
                    autoComplete="new-password"
                />
                {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}

                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                />
                {errors.confirmPassword && <div style={{ color: 'red' }}>{errors.confirmPassword}</div>}

                {authError && <div style={{ color: 'red' }}>{authError}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? "Signing Up..." : "Sign Up"}
                </button>
            </form>
            <Link to="/signin">Already have an account? Sign In</Link>
        </div>
    );
}