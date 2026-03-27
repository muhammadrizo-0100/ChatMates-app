import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { userApi } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setUser(null);
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const res = await userApi.getMe();
                    // Backend /user/me dan qaytarayotgan ma'lumot strukturasi
                    const userData = res.data?.user || res.data;
                    setUser(userData);
                } catch (err) {
                    console.error("Auth init error:", err);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [logout]);

    const login = async (credentials) => {
        try {
            const res = await userApi.login(credentials);

            // Backenddan kelayotgan ma'lumotni tekshiramiz
            // Odatda: { token: "...", user: { id: 1, ... } }
            const data = res.data;
            const newToken = data.token;
            const loggedUser = data.user || data;

            if (newToken) {
                localStorage.setItem("token", newToken);
                setUser(loggedUser);
                return { success: true };
            }
            throw new Error("Token topilmadi");
        } catch (err) {
            console.error("Login error:", err);
            return {
                success: false,
                message: err.response?.data?.message || "Login muvaffaqiyatsiz tugadi"
            };
        }
    };

    const register = async (formData) => {
        try {
            const res = await userApi.register(formData);
            return { success: true, data: res.data };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || "Ro'yxatdan o'tishda xatolik"
            };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);