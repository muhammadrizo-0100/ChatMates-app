import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4 text-emerald-500">
            <Loader2 className="animate-spin" size={40} />
            <span className="font-bold tracking-[0.3em] uppercase text-[10px]">Checking Access...</span>
        </div>
    );
    if (!user) return <Navigate to="/login" />;
    return children;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    // Login bo'lgan bo'lsa, avtomat dashboardga yuborsin
    if (user) return <Navigate to="/dashboard" />;
    return children;
};

function App() {
    return (
        <div className="bg-[#050505] min-h-screen">
            <Router>
                <Toaster position="top-center" />
                <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />

                    <Route path="/register" element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    } />

                    {/* Dashboard yo'lini to'g'ri nomlaymiz */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    {/* Xato yo'l bo'lsa dashboard yoki homega */}
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;