
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import "./UserDashboard.css";

function UserDashboard() {
    const { user, logout } = useAuth();

    const [stores, setStores] = useState([]);
    const [nameSearch, setNameSearch] = useState("");
    const [addressSearch, setAddressSearch] = useState("");
    const [selectedRatings, setSelectedRatings] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Fetch stores whenever search values change
    useEffect(() => {
        const controller = new AbortController();

        const loadStores = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/user/stores", {
                    params: {
                        name: nameSearch,
                        address: addressSearch
                    },
                    signal: controller.signal
                });

                const data = response.data;

                const storeList = Array.isArray(data)
                    ? data
                    : data.stores || [];

                setStores(storeList);

            } catch (err) {
                if (err.name !== "CanceledError") {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load stores. Please try again."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadStores();

        return () => {
            controller.abort();
        };

    }, [nameSearch, addressSearch]);

    // Handle rating selection
    const handleRatingChange = (storeId, rating) => {
        setSelectedRatings((previous) => ({
            ...previous,
            [storeId]: rating
        }));
    };

    // Submit or update rating
    const handleSubmitRating = async (store) => {
        const storeId = store.id;
        const rating = Number(selectedRatings[storeId]);

        if (!rating || rating < 1 || rating > 5) {
            setError("Please select a rating between 1 and 5.");
            return;
        }

        try {
            setError("");
            setMessage("");

            if (
                store.userRating !== null &&
                store.userRating !== undefined
            ) {
                await api.put(`/user/ratings/${storeId}`, {
                    rating
                });

                setMessage("Your rating has been updated successfully!");

            } else {
                await api.post("/user/ratings", {
                    storeId,
                    rating
                });

                setMessage("Your rating has been submitted successfully!");
            }

            setSelectedRatings((previous) => ({
                ...previous,
                [storeId]: ""
            }));

            // Refresh the store list after submitting a rating
            const response = await api.get("/user/stores", {
                params: {
                    name: nameSearch,
                    address: addressSearch
                }
            });

            const data = response.data;

            setStores(
                Array.isArray(data) ? data : data.stores || []
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to submit rating. Please try again."
            );
        }
    };

    return (
        <div className="user-dashboard">

            <header className="user-header">
                <div>
                    <h2>Store Rating System</h2>
                    <p>Welcome, {user?.name || "User"}</p>
                </div>

                <div className="user-header-actions">
                    <Link to="/change-password">
                        Change Password
                    </Link>

                    <button onClick={logout}>
                        Logout
                    </button>
                </div>
            </header>

            <main className="user-main">

                <div className="user-page-title">
                    <h1>Available Stores</h1>
                    <p>Explore stores and share your experience.</p>
                </div>

                <div className="store-search">
                    <input
                        type="text"
                        placeholder="Search by store name"
                        value={nameSearch}
                        onChange={(e) => setNameSearch(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Search by address"
                        value={addressSearch}
                        onChange={(e) => setAddressSearch(e.target.value)}
                    />
                </div>

                {message && (
                    <p className="user-success">{message}</p>
                )}

                {error && (
                    <p className="user-error">{error}</p>
                )}

                {loading ? (
                    <p>Loading stores...</p>
                ) : stores.length === 0 ? (
                    <p className="no-stores">No stores found.</p>
                ) : (
                    <div className="store-list">
                        {stores.map((store) => {
                            const storeId = store.id;
                            const overallRating =
                                store.overallRating ??
                                store.averageRating ??
                                0;

                            const userRating = store.userRating;

                            return (
                                <div className="store-card" key={storeId}>
                                    <div className="store-card-info">
                                        <h3>{store.name}</h3>
                                        <p>{store.address}</p>

                                        <p>
                                            <strong>Overall Rating:</strong>{" "}
                                            {Number(overallRating).toFixed(1)} / 5
                                        </p>

                                        <p>
                                            <strong>Your Rating:</strong>{" "}
                                            {userRating ?? "Not rated yet"}
                                        </p>
                                    </div>

                                    <div className="rating-section">
                                        <label htmlFor={`rating-${storeId}`}>
                                            {userRating !== null &&
                                            userRating !== undefined
                                                ? "Update your rating"
                                                : "Submit your rating"}
                                        </label>

                                        <select
                                            id={`rating-${storeId}`}
                                            value={
                                                selectedRatings[storeId] ??
                                                userRating ??
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleRatingChange(
                                                    storeId,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select rating
                                            </option>

                                            {[1, 2, 3, 4, 5].map((value) => (
                                                <option key={value} value={value}>
                                                    {value} Star{value > 1 ? "s" : ""}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={() => handleSubmitRating(store)}
                                        >
                                            {userRating !== null &&
                                            userRating !== undefined
                                                ? "Update Rating"
                                                : "Submit Rating"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </main>
        </div>
    );
}

export default UserDashboard;
