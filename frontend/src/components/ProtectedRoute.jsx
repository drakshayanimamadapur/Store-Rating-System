
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import { getDashboardPath } from "../context/authUtils";

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isAuthenticated } = useAuth();

    const location = useLocation();

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    if (!allowedRoles.includes(user.role)) {
        return (
            <Navigate
                to={getDashboardPath(user.role)}
                replace
            />
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
