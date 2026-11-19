
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import { getDashboardPath } from "../context/authUtils";

import "./Login.css";

function Login() {
    const { login, user, isAuthenticated } = useAuth();

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Redirect already logged-in users
    if (isAuthenticated && user) {
        return (
            <Navigate
                to={getDashboardPath(user.role)}
                replace
            />
        );
    }

    // Handle login form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email and password");
            return;
        }

        setLoading(true);

        try {
            const loggedInUser = await login({
                email: email.trim(),
                password
            });

            // Redirect according to user role
            navigate(
                getDashboardPath(loggedInUser.role),
                { replace: true }
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to login. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-brand">
                    <h1>StoreRate</h1>
                    <p>Store Rating Management System</p>
                </div>

                <div className="login-heading">
                    <h2>Welcome Back!</h2>
                    <p>Sign in to continue to your account.</p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="login-input-group">
                        <label htmlFor="email">Email Address</label>

                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="login-input-group">
                        <label htmlFor="password">Password</label>

                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                </form>

                <div className="login-footer">
                    <p>
                        Don't have an account?{" "}
                        <Link to="/register">
                            Create an account
                        </Link>
                    </p>
                </div>

            </div>

        </div>
    );
}

export default Login;
