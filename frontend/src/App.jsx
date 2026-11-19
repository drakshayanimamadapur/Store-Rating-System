
import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/useAuth";
import { getDashboardPath } from "./context/authUtils";

const HomeRedirect = () => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Navigate
            to={getDashboardPath(user.role)}
            replace
        />
    );
};

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomeRedirect />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                element={<ProtectedRoute allowedRoles={["ADMIN"]} />}
            >
                <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            <Route
                element={<ProtectedRoute allowedRoles={["USER"]} />}
            >
                <Route path="/user" element={<UserDashboard />} />
            </Route>

            <Route
                element={<ProtectedRoute allowedRoles={["STORE_OWNER"]} />}
            >
                <Route path="/owner" element={<OwnerDashboard />} />
            </Route>

            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={["ADMIN", "USER", "STORE_OWNER"]}
                    />
                }
            >
                <Route
                    path="/change-password"
                    element={<ChangePassword />}
                />
            </Route>

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}

export default App;
