
import { useState } from "react";
import api from "../services/api";
import "./AddUser.css";

function AddUser() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        password: "",
        role: "USER"
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const name = formData.name.trim();
        const email = formData.email.trim();
        const address = formData.address.trim();

        if (name.length < 20 || name.length > 60) {
            setError("Name must contain 20 to 60 characters.");
            return;
        }

        if (address.length > 400) {
            setError("Address cannot exceed 400 characters.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,16}$/;

        if (!passwordRegex.test(formData.password)) {
            setError(
                "Password must be 8-16 characters with at least one uppercase letter and one special character."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/admin/users", {
                name,
                email,
                address,
                password: formData.password,
                role: formData.role
            });

            setSuccess(
                response.data?.message || "User created successfully!"
            );

            setFormData({
                name: "",
                email: "",
                address: "",
                password: "",
                role: "USER"
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                (err.request
                    ? "Cannot connect to the server. Check whether your backend is running."
                    : "Something went wrong. Please try again.")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-user-page">
            <div className="add-user-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Enter full name"
                            value={formData.name}
                            onChange={handleChange}
                            minLength={20}
                            maxLength={60}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter email address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <textarea
                            id="address"
                            name="address"
                            placeholder="Enter address"
                            value={formData.address}
                            onChange={handleChange}
                            maxLength={400}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Create password"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={8}
                            maxLength={16}
                            required
                        />
                        <small>
                            8-16 characters, at least one uppercase
                            letter and one special character.
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">User Role</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="USER">Normal User</option>
                            <option value="ADMIN">Administrator</option>
                        </select>
                    </div>

                    {error && (
                        <p className="form-error" role="alert">{error}</p>
                    )}

                    {success && (
                        <p className="form-success" role="status">{success}</p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create User"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddUser;
