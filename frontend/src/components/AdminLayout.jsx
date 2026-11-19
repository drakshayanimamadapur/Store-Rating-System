
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./AdminLayout.css";

function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const menuGroups = [
        {
            title: "OVERVIEW",
            items: [
                { label: "Dashboard", path: "/admin", icon: "▦" }
            ]
        },
        {
            title: "USER MANAGEMENT",
            items: [
                { label: "Manage Users", path: "/admin/users", icon: "👥" },
                { label: "Add User", path: "/admin/add-user", icon: "＋" },
                { label: "Manage Store Owners", path: "/admin/store-owners", icon: "🏪" },
                { label: "Add Store Owner", path: "/admin/add-store-owner", icon: "＋" }
            ]
        },
        {
            title: "STORE MANAGEMENT",
            items: [
                { label: "Manage Stores", path: "/admin/stores", icon: "🏬" },
                { label: "Add Store", path: "/admin/add-store", icon: "＋" }
            ]
        },
        {
            title: "RATING MANAGEMENT",
            items: [
                { label: "Manage Ratings", path: "/admin/ratings", icon: "⭐" }
            ]
        },
        {
            title: "ACCOUNT",
            items: [
                { label: "Change Password", path: "/change-password", icon: "🔒" }
            ]
        }
    ];

    return (
        <div className="admin-layout">

            <aside className="admin-sidebar">

                <div className="admin-brand">
                    <h2>StoreRate</h2>
                    <span>ADMIN PANEL</span>
                </div>

                <nav className="admin-navigation">

                    {menuGroups.map((group) => (
                        <div className="admin-menu-group" key={group.title}>
                            <p className="admin-menu-title">
                                {group.title}
                            </p>

                            {group.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === "/admin"}
                                    className={({ isActive }) =>
                                        isActive ? "admin-menu-link active" : "admin-menu-link"
                                    }
                                >
                                    <span className="admin-menu-icon">
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    ))}

                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-profile">
                        <div className="admin-avatar">
                            {user?.name?.charAt(0).toUpperCase() || "A"}
                        </div>

                        <div>
                            <strong>{user?.name || "Administrator"}</strong>
                            <small>Administrator</small>
                        </div>
                    </div>

                    <button
                        className="admin-logout"
                        onClick={handleLogout}
                    >
                        ⇥ Logout
                    </button>
                </div>

            </aside>

            <main className="admin-main">
                <Outlet />
            </main>

        </div>
    );
}

export default AdminLayout;
