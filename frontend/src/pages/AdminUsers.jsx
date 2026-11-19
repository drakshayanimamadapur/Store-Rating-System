
import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminUsers.css";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [order, setOrder] = useState("ASC");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/admin/users", {
                    params: {
                        name: search,
                        email: search,
                        address: search,
                        role,
                        sortBy,
                        order
                    }
                });

                if (!active) return;

                const data = response.data;
                setUsers(
                    Array.isArray(data) ? data : data.users || []
                );
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load users. Please try again."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchUsers();

        return () => {
            active = false;
        };
    }, [search, role, sortBy, order]);

    return (
        <section className="users-content">
            <div className="users-toolbar">
                <input
                    type="text"
                    placeholder="Search by name, email or address..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="USER">Normal User</option>
                    <option value="STORE_OWNER">Store Owner</option>
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="address">Address</option>
                    <option value="role">Role</option>
                </select>

                <button
                    className="sort-button"
                    onClick={() =>
                        setOrder(order === "ASC" ? "DESC" : "ASC")
                    }
                >
                    {order === "ASC" ? "Ascending ↑" : "Descending ↓"}
                </button>
            </div>

            <div className="users-table-card">
                {loading ? (
                    <p className="users-message">Loading users...</p>
                ) : error ? (
                    <p className="users-error">{error}</p>
                ) : users.length === 0 ? (
                    <p className="users-message">No users found.</p>
                ) : (
                    <div className="table-scroll">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Address</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>{item.email}</td>
                                        <td>{item.address}</td>
                                        <td>
                                            <span className={`role-badge ${String(item.role || "").toLowerCase().replace("_", "-")}`}>
                                                {item.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <p className="users-count">
                Total users displayed: {users.length}
            </p>
        </section>
    );
}

export default AdminUsers;
