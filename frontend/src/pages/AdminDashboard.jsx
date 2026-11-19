
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/useAuth";
import "./AdminDashboard.css";

function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [section, setSection] = useState("dashboard");

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStores: 0,
        totalRatings: 0
    });

    const [users, setUsers] = useState([]);
    const [stores, setStores] = useState([]);
    const [storeOwners, setStoreOwners] = useState([]);

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [sortOrder, setSortOrder] = useState("ASC");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [temporaryPassword, setTemporaryPassword] = useState("");

    // Store Owner password reset states
    const [selectedOwner, setSelectedOwner] = useState(null);
    const [newOwnerPassword, setNewOwnerPassword] = useState("");
    const [showResetForm, setShowResetForm] = useState(false);

    const [showOwnerForm, setShowOwnerForm] = useState(false);

    const [userForm, setUserForm] = useState({
        name: "",
        email: "",
        address: "",
        password: "",
        role: "USER"
    });

    const [storeForm, setStoreForm] = useState({
        name: "",
        email: "",
        address: ""
    });

    const [ownerForm, setOwnerForm] = useState({
        name: "",
        email: "",
        address: ""
    });

    // Load dashboard data
    const refreshDashboard = async () => {
        setLoading(true);
        setError("");

        try {
            const [
                statsResponse,
                usersResponse,
                storesResponse,
                ownersResponse
            ] = await Promise.all([
                api.get("/admin/dashboard"),
                api.get("/admin/users"),
                api.get("/admin/stores"),
                api.get("/admin/store-owners")
            ]);

            const statistics =
                statsResponse.data?.statistics ||
                statsResponse.data ||
                {};

            setStats({
                totalUsers: Number(statistics.totalUsers || 0),
                totalStores: Number(statistics.totalStores || 0),
                totalRatings: Number(statistics.totalRatings || 0)
            });

            setUsers(
                usersResponse.data?.users ||
                (Array.isArray(usersResponse.data)
                    ? usersResponse.data
                    : [])
            );

            setStores(
                storesResponse.data?.stores ||
                (Array.isArray(storesResponse.data)
                    ? storesResponse.data
                    : [])
            );

            setStoreOwners(ownersResponse.data?.storeOwners || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load dashboard data. Please check your backend."
            );
        } finally {
            setLoading(false);
        }
    };

    // Initial dashboard loading
    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            setError("");

            try {
                const [
                    statsResponse,
                    usersResponse,
                    storesResponse,
                    ownersResponse
                ] = await Promise.all([
                    api.get("/admin/dashboard"),
                    api.get("/admin/users"),
                    api.get("/admin/stores"),
                    api.get("/admin/store-owners")
                ]);

                const statistics =
                    statsResponse.data?.statistics ||
                    statsResponse.data ||
                    {};

                setStats({
                    totalUsers: Number(statistics.totalUsers || 0),
                    totalStores: Number(statistics.totalStores || 0),
                    totalRatings: Number(statistics.totalRatings || 0)
                });

                setUsers(
                    usersResponse.data?.users ||
                    (Array.isArray(usersResponse.data)
                        ? usersResponse.data
                        : [])
                );

                setStores(
                    storesResponse.data?.stores ||
                    (Array.isArray(storesResponse.data)
                        ? storesResponse.data
                        : [])
                );

                setStoreOwners(ownersResponse.data?.storeOwners || []);

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load dashboard data. Please check your backend."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    // Logout
    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    // Change dashboard section
    const showSection = (name) => {
        setSection(name);
        setSearch("");
        setRoleFilter("");
        setError("");
        setSuccess("");
        setTemporaryPassword("");
        setShowOwnerForm(false);
        setShowResetForm(false);
        setSelectedOwner(null);
        setNewOwnerPassword("");
    };

    // Filter users
    const filteredUsers = useMemo(() => {
        return users
            .filter((item) => {
                const searchText = search.toLowerCase();

                const matchesSearch =
                    String(item.name || "").toLowerCase().includes(searchText) ||
                    String(item.email || "").toLowerCase().includes(searchText) ||
                    String(item.address || "").toLowerCase().includes(searchText);

                const matchesRole =
                    !roleFilter || item.role === roleFilter;

                return matchesSearch && matchesRole;
            })
            .sort((a, b) => {
                const result = String(a.name || "").localeCompare(
                    String(b.name || "")
                );

                return sortOrder === "ASC" ? result : -result;
            });
    }, [users, search, roleFilter, sortOrder]);

    // Filter stores
    const filteredStores = useMemo(() => {
        return stores
            .filter((item) => {
                const searchText = search.toLowerCase();

                return (
                    String(item.name || "").toLowerCase().includes(searchText) ||
                    String(item.email || "").toLowerCase().includes(searchText) ||
                    String(item.address || "").toLowerCase().includes(searchText)
                );
            })
            .sort((a, b) => {
                const result = String(a.name || "").localeCompare(
                    String(b.name || "")
                );

                return sortOrder === "ASC" ? result : -result;
            });
    }, [stores, search, sortOrder]);

    // Filter Store Owners
    const filteredOwners = useMemo(() => {
        return storeOwners.filter((owner) => {
            const searchText = search.toLowerCase();

            return (
                String(owner.storeName || "").toLowerCase().includes(searchText) ||
                String(owner.storeEmail || "").toLowerCase().includes(searchText) ||
                String(owner.storeAddress || "").toLowerCase().includes(searchText)
            );
        });
    }, [storeOwners, search]);

    // User form changes
    const handleUserChange = (e) => {
        const { name, value } = e.target;

        setUserForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Store form changes
    const handleStoreChange = (e) => {
        const { name, value } = e.target;

        setStoreForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Store Owner form changes
    const handleOwnerChange = (e) => {
        const { name, value } = e.target;

        setOwnerForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Add normal user
    const handleAddUser = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const name = userForm.name.trim();
        const email = userForm.email.trim();
        const address = userForm.address.trim();

        if (name.length < 20 || name.length > 60) {
            setError("Name must contain 20 to 60 characters.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (address.length > 400) {
            setError("Address cannot exceed 400 characters.");
            return;
        }

        if (!/^(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,16}$/.test(userForm.password)) {
            setError(
                "Password must be 8-16 characters with an uppercase letter and special character."
            );
            return;
        }

        try {
            setSubmitting(true);

            const response = await api.post("/admin/users", {
                name,
                email,
                address,
                password: userForm.password,
                role: userForm.role
            });

            setSuccess(
                response.data?.message || "User created successfully."
            );

            setUserForm({
                name: "",
                email: "",
                address: "",
                password: "",
                role: "USER"
            });

            await refreshDashboard();

        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to create user."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Add store
    const handleAddStore = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const name = storeForm.name.trim();
        const email = storeForm.email.trim();
        const address = storeForm.address.trim();

        if (name.length < 20 || name.length > 60) {
            setError("Store name must contain 20 to 60 characters.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (address.length > 400) {
            setError("Address cannot exceed 400 characters.");
            return;
        }

        try {
            setSubmitting(true);

            const response = await api.post("/admin/stores", {
                name,
                email,
                address
            });

            setSuccess(
                response.data?.message || "Store added successfully."
            );

            setStoreForm({
                name: "",
                email: "",
                address: ""
            });

            await refreshDashboard();

        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to add store."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Create Store Owner
    const handleAddStoreOwner = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setTemporaryPassword("");

        const name = ownerForm.name.trim();
        const email = ownerForm.email.trim();
        const address = ownerForm.address.trim();

        if (name.length < 20 || name.length > 60) {
            setError("Store name must contain 20 to 60 characters.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (address.length > 400) {
            setError("Store address cannot exceed 400 characters.");
            return;
        }

        try {
            setSubmitting(true);

            const response = await api.post("/admin/store-owners", {
                name,
                email,
                address
            });

            setSuccess(
                response.data?.message ||
                "Store Owner created successfully."
            );

            setTemporaryPassword(
                response.data?.temporaryPassword || ""
            );

            setOwnerForm({
                name: "",
                email: "",
                address: ""
            });

            await refreshDashboard();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to create Store Owner."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Reset Store Owner Password
    const handleResetOwnerPassword = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!selectedOwner) {
            setError("Please select a Store Owner.");
            return;
        }

        const ownerEmail =
            selectedOwner.ownerEmail ||
            selectedOwner.storeEmail ||
            selectedOwner.email;

        if (!ownerEmail) {
            setError("Store Owner email address was not found.");
            return;
        }

        if (!/^(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,16}$/.test(newOwnerPassword)) {
            setError(
                "Password must be 8-16 characters with an uppercase letter and special character."
            );
            return;
        }

        try {
            setSubmitting(true);

            const response = await api.put(
                "/admin/store-owners/reset-password",
                {
                    email: ownerEmail,
                    newPassword: newOwnerPassword
                }
            );

            setSuccess(
                response.data?.message ||
                "Store Owner password reset successfully."
            );

            setNewOwnerPassword("");
            setSelectedOwner(null);
            setShowResetForm(false);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to reset Store Owner password."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Sidebar menu
    const menuGroups = [
        {
            title: "MAIN MENU",
            items: [
                { id: "dashboard", label: "Dashboard", icon: "▦" }
            ]
        },
        {
            title: "USER MANAGEMENT",
            items: [
                { id: "users", label: "Manage Users", icon: "♙" },
                { id: "add-user", label: "Add User", icon: "＋" },
                { id: "owners", label: "Store Owners", icon: "♧" }
            ]
        },
        {
            title: "STORE MANAGEMENT",
            items: [
                { id: "stores", label: "Manage Stores", icon: "▣" },
                { id: "add-store", label: "Add Store", icon: "＋" }
            ]
        },
        {
            title: "SYSTEM",
            items: [
                { id: "ratings", label: "Ratings", icon: "☆" },
                { id: "password", label: "Change Password", icon: "⚙" }
            ]
        }
    ];

    const pageTitles = {
        dashboard: "Dashboard Overview",
        users: "Manage Users",
        "add-user": "Add New User",
        owners: "Store Owners",
        stores: "Manage Stores",
        "add-store": "Add New Store",
        ratings: "Ratings Overview",
        password: "Account Settings"
    };

    // User table
    const renderUserTable = (list) => (
        <div className="table-wrapper">
            <table className="admin-data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Role</th>
                    </tr>
                </thead>

                <tbody>
                    {list.map((item) => (
                        <tr key={item.id}>
                            <td className="table-name">{item.name}</td>
                            <td>{item.email}</td>
                            <td>{item.address}</td>
                            <td>
                                <span
                                    className={`role-pill ${String(item.role || "")
                                        .toLowerCase()
                                        .replace("_", "-")}`}
                                >
                                    {item.role}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {list.length === 0 && (
                <p className="empty-state">No users found.</p>
            )}
        </div>
    );

    // Store table
    const renderStoreTable = (list) => (
        <div className="table-wrapper">
            <table className="admin-data-table">
                <thead>
                    <tr>
                        <th>Store Name</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Overall Rating</th>
                    </tr>
                </thead>

                <tbody>
                    {list.map((store) => (
                        <tr key={store.id}>
                            <td className="table-name">{store.name}</td>
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

            {list.length === 0 && (
                <p className="empty-state">No stores found.</p>
            )}
        </div>
    );

    // Store Owners table
    const renderStoreOwnerTable = (list) => (
        <div className="table-wrapper">
            <table className="admin-data-table">
                <thead>
                    <tr>
                        <th>Store Name</th>
                        <th>Email</th>
                        <th>Store Address</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {list.map((owner) => (
                        <tr key={owner.ownerId}>
                            <td className="table-name">
                                {owner.storeName}
                            </td>

                            <td>
                                {owner.ownerEmail ||
                                    owner.storeEmail ||
                                    owner.email}
                            </td>

                            <td>{owner.storeAddress}</td>

                            <td>
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => {
                                        setSelectedOwner(owner);
                                        setNewOwnerPassword("");
                                        setShowResetForm(true);
                                        setError("");
                                        setSuccess("");
                                    }}
                                >
                                    Reset Password
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {list.length === 0 && (
                <p className="empty-state">
                    No Store Owners found. Add your first Store Owner.
                </p>
            )}
        </div>
    );

    return (
        <div className="admin-shell">

            {/* Sidebar */}
            <aside className="admin-sidebar">

                <div className="admin-brand">
                    <div className="brand-symbol">S</div>

                    <div>
                        <h2>StoreRate</h2>
                        <span>MANAGEMENT</span>
                    </div>
                </div>

                <div className="sidebar-caption">WORKSPACE</div>

                <nav className="admin-menu">
                    {menuGroups.map((group) => (
                        <div className="menu-group" key={group.title}>
                            <p className="menu-heading">
                                {group.title}
                            </p>

                            {group.items.map((item) => (
                                <button
                                    key={item.id}
                                    className={`menu-item ${
                                        section === item.id ? "selected" : ""
                                    }`}
                                    onClick={() => {
                                        if (item.id === "password") {
                                            navigate("/change-password");
                                        } else {
                                            showSection(item.id);
                                        }
                                    }}
                                >
                                    <span className="menu-icon">
                                        {item.icon}
                                    </span>

                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase() || "A"}
                        </div>

                        <div className="sidebar-user-info">
                            <strong>{user?.name || "Administrator"}</strong>
                            <span>Administrator</span>
                        </div>
                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        ↪ <span>Sign out</span>
                    </button>
                </div>
            </aside>

            {/* Main workspace */}
            <main className="admin-workspace">

                <header className="topbar">
                    <div className="topbar-title">
                        <span>Workspace</span>
                        <h1>{pageTitles[section]}</h1>
                    </div>

                    <div className="topbar-actions">
                        <div className="admin-search">
                            <span>⌕</span>

                            <input
                                type="search"
                                placeholder="Search in current section..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="topbar-profile">
                            <div className="profile-avatar">
                                {user?.name?.charAt(0).toUpperCase() || "A"}
                            </div>

                            <div>
                                <strong>{user?.name || "Admin"}</strong>
                                <span>Administrator</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="admin-content">

                    {error && (
                        <div className="notice error-notice">
                            {error}
                            <button onClick={() => setError("")}>×</button>
                        </div>
                    )}

                    {success && (
                        <div className="notice success-notice">
                            {success}
                            <button onClick={() => setSuccess("")}>×</button>
                        </div>
                    )}

                    {loading && (
                        <p className="loading-line">
                            Loading dashboard data...
                        </p>
                    )}

                    {/* Dashboard overview */}
                    {section === "dashboard" && (
                        <>
                            <div className="welcome-row">
                                <div>
                                    <p className="eyebrow">OVERVIEW</p>
                                    <h2>
                                        Welcome back, {user?.name || "Admin"} 👋
                                    </h2>
                                    <p>
                                        Here is what's happening with your platform today.
                                    </p>
                                </div>

                                <button
                                    className="primary-button"
                                    onClick={refreshDashboard}
                                    disabled={loading}
                                >
                                    ↻ Refresh Data
                                </button>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card blue-stat">
                                    <div className="stat-top">
                                        <span>Total Users</span>
                                        <span className="stat-icon">♙</span>
                                    </div>
                                    <strong>{stats.totalUsers}</strong>
                                    <small>Registered platform users</small>
                                </div>

                                <div className="stat-card purple-stat">
                                    <div className="stat-top">
                                        <span>Total Stores</span>
                                        <span className="stat-icon">▣</span>
                                    </div>
                                    <strong>{stats.totalStores}</strong>
                                    <small>Stores on your platform</small>
                                </div>

                                <div className="stat-card orange-stat">
                                    <div className="stat-top">
                                        <span>Store Owners</span>
                                        <span className="stat-icon">♧</span>
                                    </div>
                                    <strong>{storeOwners.length}</strong>
                                    <small>Registered store owners</small>
                                </div>

                                <div className="stat-card green-stat">
                                    <div className="stat-top">
                                        <span>Total Ratings</span>
                                        <span className="stat-icon">☆</span>
                                    </div>
                                    <strong>{stats.totalRatings}</strong>
                                    <small>Customer ratings submitted</small>
                                </div>
                            </div>

                            <div className="dashboard-grid">
                                <section className="panel quick-panel">
                                    <div className="panel-heading">
                                        <div>
                                            <h3>Quick Actions</h3>
                                            <p>Manage your platform</p>
                                        </div>
                                    </div>

                                    <div className="quick-actions">
                                        <button onClick={() => showSection("add-user")}>
                                            <span className="quick-icon">＋</span>
                                            <span>
                                                <strong>Add User</strong>
                                                <small>Create an account</small>
                                            </span>
                                        </button>

                                        <button onClick={() => showSection("users")}>
                                            <span className="quick-icon">♙</span>
                                            <span>
                                                <strong>View Users</strong>
                                                <small>Manage user accounts</small>
                                            </span>
                                        </button>

                                        <button onClick={() => showSection("add-store")}>
                                            <span className="quick-icon">▣</span>
                                            <span>
                                                <strong>Add Store</strong>
                                                <small>Register a store</small>
                                            </span>
                                        </button>

                                        <button onClick={() => showSection("stores")}>
                                            <span className="quick-icon">▤</span>
                                            <span>
                                                <strong>View Stores</strong>
                                                <small>Manage stores</small>
                                            </span>
                                        </button>

                                        <button onClick={() => showSection("owners")}>
                                            <span className="quick-icon">♧</span>
                                            <span>
                                                <strong>Store Owners</strong>
                                                <small>Manage store owners</small>
                                            </span>
                                        </button>
                                    </div>
                                </section>

                                <section className="panel summary-panel">
                                    <div className="panel-heading">
                                        <div>
                                            <h3>Platform Summary</h3>
                                            <p>Current database records</p>
                                        </div>
                                    </div>

                                    <div className="summary-line">
                                        <span>Users</span>
                                        <strong>{stats.totalUsers}</strong>
                                    </div>

                                    <div className="summary-line">
                                        <span>Stores</span>
                                        <strong>{stats.totalStores}</strong>
                                    </div>

                                    <div className="summary-line">
                                        <span>Store owners</span>
                                        <strong>{storeOwners.length}</strong>
                                    </div>

                                    <div className="summary-line">
                                        <span>Ratings</span>
                                        <strong>{stats.totalRatings}</strong>
                                    </div>
                                </section>
                            </div>

                            <section className="panel recent-panel">
                                <div className="panel-heading">
                                    <div>
                                        <h3>Recently Listed Users</h3>
                                        <p>Users returned by your database</p>
                                    </div>

                                    <button
                                        className="text-button"
                                        onClick={() => showSection("users")}
                                    >
                                        View all users →
                                    </button>
                                </div>

                                {renderUserTable(users.slice(0, 5))}
                            </section>
                        </>
                    )}

                    {/* Manage users */}
                    {section === "users" && (
                        <section className="panel">
                            <div className="panel-heading">
                                <div>
                                    <h3>All Users</h3>
                                    <p>Search, filter and manage registered accounts</p>
                                </div>

                                <button
                                    className="primary-button"
                                    onClick={() => showSection("add-user")}
                                >
                                    + Add User
                                </button>
                            </div>

                            <div className="table-toolbar">
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="">All Roles</option>
                                    <option value="ADMIN">Administrator</option>
                                    <option value="USER">Normal User</option>
                                    <option value="STORE_OWNER">Store Owner</option>
                                </select>

                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        setSortOrder(
                                            sortOrder === "ASC" ? "DESC" : "ASC"
                                        )
                                    }
                                >
                                    Name {sortOrder === "ASC" ? "↑" : "↓"}
                                </button>
                            </div>

                            {renderUserTable(filteredUsers)}

                            <p className="table-footnote">
                                Showing {filteredUsers.length} users
                            </p>
                        </section>
                    )}

                    {/* Store Owners */}
                    {section === "owners" && (
                        <>
                            <section className="panel">
                                <div className="panel-heading">
                                    <div>
                                        <h3>Store Owners</h3>
                                        <p>
                                            View and manage store owner accounts
                                        </p>
                                    </div>

                                    <button
                                        className="primary-button"
                                        onClick={() => {
                                            setShowOwnerForm(!showOwnerForm);
                                            setError("");
                                            setSuccess("");
                                            setTemporaryPassword("");
                                        }}
                                    >
                                        {showOwnerForm
                                            ? "Close Form"
                                            : "+ Add Store Owner"}
                                    </button>
                                </div>

                                {renderStoreOwnerTable(filteredOwners)}

                                <p className="table-footnote">
                                    Showing {filteredOwners.length} Store Owners
                                </p>
                            </section>

                            {/* Add Store Owner form */}
                            {showOwnerForm && (
                                <section className="panel form-panel">
                                    <div className="panel-heading">
                                        <div>
                                            <h3>Create Store Owner</h3>
                                            <p>
                                                Add a store and create its owner login account
                                            </p>
                                        </div>
                                    </div>

                                    <form
                                        className="admin-form"
                                        onSubmit={handleAddStoreOwner}
                                    >
                                        <div className="form-grid">
                                            <label>
                                                Store Name
                                                <input
                                                    name="name"
                                                    value={ownerForm.name}
                                                    onChange={handleOwnerChange}
                                                    minLength="20"
                                                    maxLength="60"
                                                    required
                                                    placeholder="Enter store name (20–60 characters)"
                                                />
                                            </label>

                                            <label>
                                                Email Address
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={ownerForm.email}
                                                    onChange={handleOwnerChange}
                                                    required
                                                    placeholder="Enter store owner email"
                                                />
                                            </label>

                                            <label className="full-field">
                                                Store Address
                                                <textarea
                                                    name="address"
                                                    value={ownerForm.address}
                                                    onChange={handleOwnerChange}
                                                    maxLength="400"
                                                    required
                                                    placeholder="Enter store address"
                                                />
                                            </label>
                                        </div>

                                        <div className="form-actions">
                                            <button
                                                type="button"
                                                className="secondary-button"
                                                onClick={() => {
                                                    setShowOwnerForm(false);
                                                    setOwnerForm({
                                                        name: "",
                                                        email: "",
                                                        address: ""
                                                    });
                                                    setTemporaryPassword("");
                                                }}
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                className="primary-button"
                                                type="submit"
                                                disabled={submitting}
                                            >
                                                {submitting
                                                    ? "Creating..."
                                                    : "Create Store Owner"}
                                            </button>
                                        </div>
                                    </form>

                                    {temporaryPassword && (
                                        <div className="notice success-notice">
                                            <div>
                                                <strong>
                                                    Store Owner account created successfully.
                                                </strong>

                                                <p>
                                                    Temporary Password:{" "}
                                                    <strong>{temporaryPassword}</strong>
                                                </p>

                                                <small>
                                                    Copy and share this password securely.
                                                    It may not be shown again.
                                                </small>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Reset Store Owner Password form */}
                            {showResetForm && selectedOwner && (
                                <section className="panel form-panel">
                                    <div className="panel-heading">
                                        <div>
                                            <h3>Reset Store Owner Password</h3>
                                            <p>
                                                Store: {selectedOwner.storeName}
                                            </p>
                                            <p>
                                                Email: {
                                                    selectedOwner.ownerEmail ||
                                                    selectedOwner.storeEmail ||
                                                    selectedOwner.email
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <form
                                        className="admin-form"
                                        onSubmit={handleResetOwnerPassword}
                                    >
                                        <div className="form-grid">
                                            <label className="full-field">
                                                New Password

                                                <input
                                                    type="password"
                                                    value={newOwnerPassword}
                                                    onChange={(e) =>
                                                        setNewOwnerPassword(e.target.value)
                                                    }
                                                    minLength="8"
                                                    maxLength="16"
                                                    required
                                                    placeholder="Enter new password"
                                                />

                                                <small>
                                                    8-16 characters, including an uppercase
                                                    letter and a special character.
                                                </small>
                                            </label>
                                        </div>

                                        <div className="form-actions">
                                            <button
                                                type="button"
                                                className="secondary-button"
                                                onClick={() => {
                                                    setShowResetForm(false);
                                                    setSelectedOwner(null);
                                                    setNewOwnerPassword("");
                                                }}
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                className="primary-button"
                                                disabled={submitting}
                                            >
                                                {submitting
                                                    ? "Updating..."
                                                    : "Update Password"}
                                            </button>
                                        </div>
                                    </form>
                                </section>
                            )}
                        </>
                    )}

                    {/* Manage stores */}
                    {section === "stores" && (
                        <section className="panel">
                            <div className="panel-heading">
                                <div>
                                    <h3>All Stores</h3>
                                    <p>Manage registered stores</p>
                                </div>

                                <button
                                    className="primary-button"
                                    onClick={() => showSection("add-store")}
                                >
                                    + Add Store
                                </button>
                            </div>

                            <div className="table-toolbar">
                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        setSortOrder(
                                            sortOrder === "ASC" ? "DESC" : "ASC"
                                        )
                                    }
                                >
                                    Name {sortOrder === "ASC" ? "↑" : "↓"}
                                </button>
                            </div>

                            {renderStoreTable(filteredStores)}

                            <p className="table-footnote">
                                Showing {filteredStores.length} stores
                            </p>
                        </section>
                    )}

                    {/* Add user */}
                    {section === "add-user" && (
                        <section className="panel form-panel">
                            <div className="panel-heading">
                                <div>
                                    <h3>Create User Account</h3>
                                    <p>Add a normal user or another administrator</p>
                                </div>
                            </div>

                            <form className="admin-form" onSubmit={handleAddUser}>
                                <div className="form-grid">
                                    <label>
                                        Full Name
                                        <input
                                            name="name"
                                            value={userForm.name}
                                            onChange={handleUserChange}
                                            minLength="20"
                                            maxLength="60"
                                            required
                                            placeholder="Enter full name (20–60 characters)"
                                        />
                                    </label>

                                    <label>
                                        Email Address
                                        <input
                                            type="email"
                                            name="email"
                                            value={userForm.email}
                                            onChange={handleUserChange}
                                            required
                                            placeholder="Enter email address"
                                        />
                                    </label>

                                    <label className="full-field">
                                        Address
                                        <textarea
                                            name="address"
                                            value={userForm.address}
                                            onChange={handleUserChange}
                                            maxLength="400"
                                            required
                                            placeholder="Enter address"
                                        />
                                    </label>

                                    <label>
                                        Password
                                        <input
                                            type="password"
                                            name="password"
                                            value={userForm.password}
                                            onChange={handleUserChange}
                                            minLength="8"
                                            maxLength="16"
                                            required
                                            placeholder="Create password"
                                        />
                                        <small>
                                            8–16 characters, with an uppercase letter and special character.
                                        </small>
                                    </label>

                                    <label>
                                        User Role
                                        <select
                                            name="role"
                                            value={userForm.role}
                                            onChange={handleUserChange}
                                        >
                                            <option value="USER">Normal User</option>
                                            <option value="ADMIN">Administrator</option>
                                        </select>
                                    </label>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => showSection("users")}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="primary-button"
                                        type="submit"
                                        disabled={submitting}
                                    >
                                        {submitting ? "Creating..." : "Create User"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    {/* Add store */}
                    {section === "add-store" && (
                        <section className="panel form-panel">
                            <div className="panel-heading">
                                <div>
                                    <h3>Register a Store</h3>
                                    <p>Add a new store to the platform</p>
                                </div>
                            </div>

                            <form className="admin-form" onSubmit={handleAddStore}>
                                <div className="form-grid">
                                    <label>
                                        Store Name
                                        <input
                                            name="name"
                                            value={storeForm.name}
                                            onChange={handleStoreChange}
                                            minLength="20"
                                            maxLength="60"
                                            required
                                            placeholder="Enter store name (20–60 characters)"
                                        />
                                    </label>

                                    <label>
                                        Store Email
                                        <input
                                            type="email"
                                            name="email"
                                            value={storeForm.email}
                                            onChange={handleStoreChange}
                                            required
                                            placeholder="Enter store email"
                                        />
                                    </label>

                                    <label className="full-field">
                                        Store Address
                                        <textarea
                                            name="address"
                                            value={storeForm.address}
                                            onChange={handleStoreChange}
                                            maxLength="400"
                                            required
                                            placeholder="Enter store address"
                                        />
                                    </label>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => showSection("stores")}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="primary-button"
                                        type="submit"
                                        disabled={submitting}
                                    >
                                        {submitting ? "Adding..." : "Add Store"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    {/* Ratings */}
                    {section === "ratings" && (
                        <section className="panel">
                            <div className="panel-heading">
                                <div>
                                    <h3>Ratings Overview</h3>
                                    <p>Rating statistics from the database</p>
                                </div>
                            </div>

                            <div className="rating-overview">
                                <span className="rating-star">★</span>
                                <strong>{stats.totalRatings}</strong>
                                <p>Total ratings submitted by customers</p>
                            </div>

                            <p className="info-note">
                                The current admin API provides the total rating
                                count. A full ratings table requires an admin
                                ratings-list endpoint in the backend.
                            </p>
                        </section>
                    )}

                </div>

                <footer className="admin-footer">
                    © {new Date().getFullYear()} StoreRate Management System
                </footer>

            </main>
        </div>
    );
}

export default AdminDashboard;
