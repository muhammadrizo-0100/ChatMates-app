import { createContext, useState, useEffect, useContext } from "react";
import { userApi } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const res = await userApi.getMe();
                    setUser(res.data.user || res.data);
                } catch (err) {
                    console.error("Auth init error:", err);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const res = await userApi.login(credentials);
            const { token: newToken, user: loggedUser } = res.data;
            if (newToken) {
                localStorage.setItem("token", newToken);
                setUser(loggedUser);
                return { success: true };
            }
            throw new Error("Token error");
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Login failed" };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const register = async (formData) => {
        try {
            const res = await userApi.register(formData);
            return { success: true, data: res.data };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Registration failed" };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);