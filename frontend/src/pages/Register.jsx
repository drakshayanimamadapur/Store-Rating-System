
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Register.css";

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    // Handle registration
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const name = formData.name.trim();
        const email = formData.email.trim().toLowerCase();
        const address = formData.address.trim();
        const password = formData.password;

        // Validate name
        if (name.length < 20 || name.length > 60) {
            setError("Name must contain 20-60 characters.");
            return;
        }

        // Validate address
        if (!address || address.length > 400) {
            setError("Address is required and cannot exceed 400 characters.");
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        // Validate password
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,16}$/;

        if (!passwordRegex.test(password)) {
            setError(
                "Password must be 8-16 characters with an uppercase letter and a special character."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(
                "/auth/register",
                {
                    name,
                    email,
                    address,
                    password
                }
            );

            setSuccess(response.data.message);

            setFormData({
                name: "",
                email: "",
                address: "",
                password: ""
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            <div className="register-card">

                <div className="register-brand">
                    <h1>StoreRate</h1>
                    <p>Store Rating Management System</p>
                </div>

                <div className="register-heading">
                    <h2>Create Account</h2>
                    <p>Register to explore and rate stores.</p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="register-input-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            minLength={20}
                            maxLength={60}
                            required
                        />
                    </div>

                    <div className="register-input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="register-input-group">
                        <label htmlFor="address">Address</label>
                        <textarea
                            id="address"
                            name="address"
                            placeholder="Enter your address"
                            value={formData.address}
                            onChange={handleChange}
                            maxLength={400}
                            required
                        />
                    </div>

                    <div className="register-input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Create your password"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={8}
                            maxLength={16}
                            required
                        />
                    </div>

                    {error && (
                        <div className="register-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="register-success">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="register-button"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                </form>

                <div className="register-footer">
                    <p>
                        Already have an account?{" "}
                        <Link to="/login">Sign In</Link>
                    </p>
                </div>

            </div>

        </div>
    );
}

export default Register;
