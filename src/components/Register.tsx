import { FormEvent, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { createUserProfile } from "../services/userProfile";

export function Register() {
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({ displayName: "", email: "", password: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState("");

    const { user, signUp } = useAuth();
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
            // If this fails, we should not proceed as it would leave user in inconsistent state
            await createUserProfile(newUser.uid, newUser.email || email, displayName.trim());

            // Clear form on success
            setDisplayName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            // Navigate to home page
            navigate("/");
        } catch (error: unknown) {
            // Handle Firebase auth errors
            const errorCode = (error as { code?: string })?.code || "";
            const errorMessage = (error as { message?: string })?.message || "";

            if (errorCode === "auth/email-already-in-use") {
                setAuthError("Email already in use");
            } else if (errorCode === "auth/weak-password") {
                setAuthError("Weak password. Please use a stronger password.");
            } else if (errorCode === "auth/invalid-email") {
                setAuthError("Invalid email address");
            } else if (errorMessage.includes('Missing or insufficient permissions')) {
                setAuthError("Database configuration error. Please contact support.");
            } else {
                setAuthError("Failed to create an account. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <title>Sign Up</title>
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="displayName">Name</label>
                <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                />
                {errors.displayName && <div style={{ color: 'red' }}>{errors.displayName}</div>}

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}

                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && <div style={{ color: 'red' }}>{errors.confirmPassword}</div>}

                {authError && <div style={{ color: 'red' }}>{authError}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? "Signing Up..." : "Sign Up"}
                </button>
            </form>
            <Link to="/login">Already have an account? Log In</Link>
        </div>
    )
}