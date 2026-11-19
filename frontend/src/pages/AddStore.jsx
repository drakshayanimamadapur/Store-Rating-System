
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AddStore.css";

function AddStore() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const name = formData.name.trim();
        const email = formData.email.trim();
        const address = formData.address.trim();

        if (name.length < 20 || name.length > 60) {
            setError("Store name must be between 20 and 60 characters.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (address.length > 400) {
            setError("Address must not exceed 400 characters.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/admin/stores", {
                name,
                email,
                address
            });

            setSuccess(
                response.data.message || "Store added successfully!"
            );

            setFormData({
                name: "",
                email: "",
                address: ""
            });

            setTimeout(() => {
                navigate("/admin/stores");
            }, 1200);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to add store. Please check the backend."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-store-page">
            <div className="add-store-card">

                <div className="add-store-header">
                    <h2>Add New Store</h2>
                    <p>Enter the store details below.</p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Store Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter store name"
                            value={formData.name}
                            onChange={handleChange}
                            minLength="20"
                            maxLength="60"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter store email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <textarea
                            name="address"
                            placeholder="Enter store address"
                            value={formData.address}
                            onChange={handleChange}
                            maxLength="400"
                            rows="4"
                            required
                        />
                    </div>

                    {error && (
                        <p className="error-message">{error}</p>
                    )}

                    {success && (
                        <p className="success-message">{success}</p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Adding Store..." : "Add Store"}
                    </button>

                </form>

                <Link to="/admin/stores" className="back-link">
                    ← Back to Manage Stores
                </Link>

            </div>
        </div>
    );
}

export default AddStore;
