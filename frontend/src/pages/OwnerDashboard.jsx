
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import "./OwnerDashboard.css";

function OwnerDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/owner/dashboard");

                setDashboard(response.data.data || response.data);
            } catch (err) {
                console.error("Owner dashboard error:", err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load Store Owner Dashboard"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleChangePassword = () => {
        navigate("/change-password");
    };

    if (loading) {
        return (
            <div className="owner-loading">
                Loading Store Owner Dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="owner-error">
                <h2>Unable to Load Dashboard</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>
                    Try Again
                </button>
            </div>
        );
    }

    if (!dashboard) {
        return <div className="owner-error">No dashboard data available.</div>;
    }

    const store = dashboard.store || {};
    const summary = dashboard.summary || {};
    const distribution = dashboard.distribution || {};
    const ratings = dashboard.ratings || [];

    const averageRating = Number(summary.averageRating || 0);
    const totalRatings = Number(summary.totalRatings || 0);

    return (
        <div className="owner-dashboard">

            {/* SIDEBAR */}
            <aside className="owner-sidebar">
                <h2>Store Rating</h2>

                <div className="owner-profile">
                    <div className="owner-avatar">SO</div>
                    <h3>{user?.name || "Store Owner"}</h3>
                    <p>Store Owner</p>
                </div>

                <nav className="owner-nav">
                    <button className="active">
                        Dashboard
                    </button>

                    <button onClick={handleChangePassword}>
                        Change Password
                    </button>

                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="owner-main">

                <div className="owner-header">
                    <div>
                        <h1>Store Owner Dashboard</h1>
                        <p>Welcome back, {user?.name || "Store Owner"}!</p>
                    </div>
                </div>

                {/* STORE DETAILS */}
                <section className="owner-store-card">
                    <h2>My Store Details</h2>

                    <div className="owner-store-details">
                        <div>
                            <span>Store Name</span>
                            <h3>{store.name || "Not available"}</h3>
                        </div>

                        <div>
                            <span>Store Email</span>
                            <h3>{store.email || "Not available"}</h3>
                        </div>

                        <div>
                            <span>Store Address</span>
                            <h3>{store.address || "Not available"}</h3>
                        </div>
                    </div>
                </section>

                {/* STATISTICS */}
                <section className="owner-stats">

                    <div className="owner-stat-card">
                        <p>Average Rating</p>
                        <h2>{averageRating.toFixed(1)} / 5</h2>
                        <div className="owner-stars">★★★★★</div>
                    </div>

                    <div className="owner-stat-card">
                        <p>Total Ratings</p>
                        <h2>{totalRatings}</h2>
                        <span>Customer ratings received</span>
                    </div>

                </section>

                {/* RATING DISTRIBUTION */}
                <section className="owner-section">
                    <h2>Rating Distribution</h2>

                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = Number(distribution[star] || 0);
                        const percentage =
                            totalRatings > 0
                                ? (count / totalRatings) * 100
                                : 0;

                        return (
                            <div className="owner-rating-row" key={star}>
                                <span>{star} ★</span>

                                <div className="owner-progress">
                                    <div
                                        className="owner-progress-fill"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>

                                <span>{count}</span>
                            </div>
                        );
                    })}
                </section>

                {/* CUSTOMER RATINGS */}
                <section className="owner-section">
                    <h2>Customer Ratings</h2>

                    {ratings.length === 0 ? (
                        <p className="owner-empty">
                            No customer ratings available yet.
                        </p>
                    ) : (
                        <div className="owner-table-wrapper">
                            <table className="owner-table">
                                <thead>
                                    <tr>
                                        <th>Customer Name</th>
                                        <th>Email</th>
                                        <th>Rating</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {ratings.map((rating) => (
                                        <tr key={rating.id}>
                                            <td>
                                                {rating.customerName || "N/A"}
                                            </td>

                                            <td>
                                                {rating.customerEmail || "N/A"}
                                            </td>

                                            <td className="owner-rating-stars">
                                                {"★".repeat(
                                                    Number(rating.rating) || 0
                                                )}
                                                {"☆".repeat(
                                                    5 - (Number(rating.rating) || 0)
                                                )}
                                            </td>

                                            <td>
                                                {rating.createdAt
                                                    ? new Date(
                                                        rating.createdAt
                                                    ).toLocaleDateString()
                                                    : "N/A"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}

export default OwnerDashboard;
