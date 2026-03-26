import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MessageSquare, Menu, X, LogOut, LayoutDashboard, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const profileRef = useRef(null);

    // Profil tashqarisiga bosilganda menyuni yopish
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        navigate("/");
    };

    const getInitial = () => {
        return user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";
    };

    return (
        <nav className="sticky top-0 z-[100] w-full border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 md:px-10 py-4 max-w-7xl mx-auto">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group cursor-pointer">
                    <motion.div
                        whileHover={{ rotate: -10, scale: 1.1 }}
                        className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                        <MessageSquare className="text-black" size={22} fill="currentColor" />
                    </motion.div>
                    <span className="text-2xl font-bold tracking-tighter text-white">ChatMates</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-6">
                            {/* Dashboard Button */}
                            <Link to="/dashboard">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
                                    ${location.pathname === '/dashboard'
                                            ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                            : 'bg-white/5 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/10'}`}
                                >
                                    <LayoutDashboard size={18} />
                                    Dashboard
                                </motion.button>
                            </Link>

                            {/* User Profile Trigger */}
                            <div className="relative" ref={profileRef}>
                                <motion.button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    whileHover={{ scale: 1.02 }}
                                    className={`flex items-center gap-3 pl-1 pr-3 py-1 rounded-full border transition-all
                                    ${isProfileOpen ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                                >
                                    {/* Avatar Circle */}
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-black text-sm shadow-inner">
                                        {getInitial()}
                                    </div>
                                    <span className="text-sm font-medium text-gray-200 hidden lg:block">
                                        {user.username || "Account"}
                                    </span>
                                    <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </motion.button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-64 bg-[#111113] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50"
                                        >
                                            <div className="px-5 py-5 border-b border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-black font-black text-xl">
                                                        {getInitial()}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-sm font-bold text-white truncate">{user.username || "User"}</p>
                                                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                                                    <span className="text-[10px] uppercase tracking-widest font-black text-emerald-500">Pro Member</span>
                                                </div>
                                            </div>

                                            <div className="p-2">
                                                <button className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                                    <User size={18} />
                                                    My Profile
                                                </button>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium"
                                                >
                                                    <LogOut size={18} />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="px-6 py-2 text-gray-400 font-medium hover:text-white transition">Log in</Link>
                            <Link to="/register" className="px-6 py-2 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition transform active:scale-95 shadow-lg shadow-emerald-500/20">Sign up</Link>
                        </div>
                    )}
                </div>

                {/* Mobile Burger */}
                <button className="md:hidden p-2 text-gray-400 hover:text-white transition" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;