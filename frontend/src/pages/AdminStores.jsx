
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./AdminStores.css";

function AdminStores() {
    const [stores, setStores] = useState([]);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [order, setOrder] = useState("ASC");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const fetchStores = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/admin/stores", {
                    params: {
                        name: search,
                        email: search,
                        address: search,
                        sortBy,
                        order
                    }
                });

                if (!active) return;

                const data = response.data;
                const storeList = Array.isArray(data)
                    ? data
                    : data.stores || [];

                setStores(storeList);
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load stores."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchStores();

        return () => {
            active = false;
        };
    }, [search, sortBy, order]);

    return (
        <div className="admin-stores-layout">

            <aside className="stores-sidebar">
                <h2>StoreRate</h2>
                <p className="stores-sidebar-label">ADMIN PANEL</p>

                <Link to="/admin">Dashboard</Link>
                <Link to="/admin/users">Manage Users</Link>
                <Link to="/admin/stores" className="active">
                    Manage Stores
                </Link>
            </aside>

            <main className="stores-main">

                <header className="stores-header">
                    <div>
                        <h1>Manage Stores</h1>
                        <p>View and manage registered stores.</p>
                    </div>

                    <Link
                        to="/admin/add-store"
                        className="add-store-button"
                    >
                        + Add Store
                    </Link>
                </header>

                <section className="stores-content">

                    <div className="stores-toolbar">

                        <input
                            type="text"
                            placeholder="Search by name, email or address..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="name">Name</option>
                            <option value="email">Email</option>
                            <option value="address">Address</option>
                            <option value="rating">Rating</option>
                        </select>

                        <button
                            onClick={() =>
                                setOrder(
                                    order === "ASC" ? "DESC" : "ASC"
                                )
                            }
                        >
                            {order === "ASC"
                                ? "Ascending ↑"
                                : "Descending ↓"}
                        </button>

                    </div>

                    <div className="stores-table-card">

                        {loading ? (
                            <p className="stores-message">
                                Loading stores...
                            </p>
                        ) : error ? (
                            <p className="stores-error">{error}</p>
                        ) : stores.length === 0 ? (
                            <p className="stores-message">
                                No stores found.
                            </p>
                        ) : (

                            <div className="stores-table-scroll">
                                <table className="stores-table">

                                    <thead>
                                        <tr>
                                            <th>Store Name</th>
                                            <th>Email</th>
                                            <th>Address</th>
                                            <th>Overall Rating</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {stores.map((store) => (
                                            <tr key={store.id}>
                                                <td>{store.name}</td>
                                                <td>{store.email}</td>
                                                <td>{store.address}</td>
                                                <td>
                                                    {Number(
                                                        store.overallRating ??
                                                        store.averageRating ??
                                                        store.rating ??
                                                        0
                                                    ).toFixed(1)} / 5
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>
                        )}

                    </div>

                    <p className="stores-count">
                        Total stores displayed: {stores.length}
                    </p>

                </section>
            </main>
        </div>
    );
}

export default AdminStores;
