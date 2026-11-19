
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import "./ChangePassword.css";

function ChangePassword() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (newPassword.length < 8 || newPassword.length > 16) {
            setError("Password must contain 8 to 16 characters.");
            return;
        }

        const passwordPattern =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,16}$/;

        if (!passwordPattern.test(newPassword)) {
            setError(
                "Password must contain at least one uppercase letter and one special character."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        if (currentPassword === newPassword) {
            setError("New password must be different from current password.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.put("/auth/password", {
                currentPassword,
                newPassword
            });

            setMessage(
                response.data.message ||
                "Password changed successfully."
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to change password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="change-password-page">

            <div className="password-card">

                <div className="password-heading">
                    <h2>Change Password</h2>
                    <p>Update your account password securely.</p>
                </div>

                {message && (
                    <div className="password-success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="password-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="password-field">
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) =>
                                setCurrentPassword(e.target.value)
                            }
                            placeholder="Enter current password"
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="password-field">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) =>
                                setNewPassword(e.target.value)
                            }
                            placeholder="Enter new password"
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="password-field">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                        />
                    </div>

                    <p className="password-hint">
                        Password must be 8–16 characters and contain
                        at least one uppercase letter and one special character.
                    </p>

                    <button
                        type="submit"
                        className="password-submit"
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>

                </form>

                <div className="password-footer">
                    <Link to="/">
                        Back to Dashboard
                    </Link>

                    <button
                        type="button"
                        className="password-logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>

            </div>

        </div>
    );
}

export default ChangePassword;
