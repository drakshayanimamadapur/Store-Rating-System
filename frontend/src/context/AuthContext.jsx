
import {
    useState,
    useMemo,
    useCallback
} from "react";

import api from "../services/api";
import AuthContext from "./authContext";

export const AuthProvider = ({ children }) => {

    // Restore user information from session storage
    const [user, setUser] = useState(() => {
        try {
            const savedUser = sessionStorage.getItem("user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            sessionStorage.removeItem("user");
            return null;
        }
    });

    // Restore JWT token
    const [token, setToken] = useState(
        () => sessionStorage.getItem("token")
    );

    // Login function
    const login = useCallback(async (credentials) => {
        const response = await api.post(
            "/auth/login",
            credentials
        );

        const {
            token: newToken,
            user: loggedInUser
        } = response.data;

        if (!newToken || !loggedInUser) {
            throw new Error("Invalid login response");
        }

        // Save authentication details
        sessionStorage.setItem("token", newToken);

        sessionStorage.setItem(
            "user",
            JSON.stringify(loggedInUser)
        );

        setToken(newToken);
        setUser(loggedInUser);

        return loggedInUser;
    }, []);

    // Logout function
    const logout = useCallback(() => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        setToken(null);
        setUser(null);
    }, []);

    // Provide authentication information
    const value = useMemo(() => ({
        user,
        token,
        isAuthenticated: Boolean(user && token),
        login,
        logout
    }), [user, token, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
