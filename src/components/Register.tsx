import { FormEvent, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({ email: "", password: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState("");

    const { user, signUp } = useAuth();
    const navigate = useNavigate();

    if (user) {
        navigate("/");
        return null;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Reset errors
        setErrors({ email: "", password: "", confirmPassword: "" });
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

        // Attempt sign in
        setLoading(true);
        try {
            await signUp(email, password);
            // Clear form on success
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            // Optionally navigate to another page or show success message
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