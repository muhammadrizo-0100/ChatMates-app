import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Lock, Loader2, ArrowRight, MessageSquare, Eye, EyeOff, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const Login = () => {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth(); // AuthContext'dagi login funksiyasi
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // AuthContext ichidagi login'ni chaqiramiz (u o'zi API bilan gaplashadi)
        const result = await login(formData);

        if (result.success) {
            toast.success("Welcome back!");
            navigate("/dashboard");
        } else {
            toast.error(result.message || "Login failed!");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans">
            <Navbar />

            <div className="flex-1 flex items-center justify-center px-4 relative">
                {/* Orqa fondagi ambient nurlar */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-[420px] relative"
                >
                    {/* Oynasimon Card - BALANDLIK 480PX QILINDI */}
                    <div className="bg-[#111113]/40 border border-white/10 backdrop-blur-2xl p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden h-[480px] flex flex-col justify-center">

                        {/* Tepasidagi chiziq effekti */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                        <div className="text-center mb-6">
                            <motion.div
                                whileHover={{ rotate: 15 }}
                                className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                            >
                                <MessageSquare className="text-black" size={28} fill="black" />
                            </motion.div>
                            <h2 className="text-2xl font-black tracking-tight text-white mb-1">Welcome Back</h2>
                            <div className="flex items-center justify-center gap-2 text-gray-500">
                                <Sparkles size={12} className="text-emerald-500" />
                                <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Secure Access</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-4">
                                {/* Username Input */}
                                <div className="group">
                                    <label className="text-[10px] font-bold text-gray-400 ml-2 mb-1.5 block uppercase tracking-tighter">Username</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="text-gray-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-sm placeholder:text-gray-700"
                                            placeholder="Enter your username"
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div className="group">
                                    <div className="flex justify-between items-center ml-2 mb-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 block uppercase tracking-tighter">Password</label>
                                        <button type="button" className="text-[9px] text-emerald-500/70 hover:text-emerald-500 font-bold uppercase transition-colors">Forgot?</button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="text-gray-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-11 pr-11 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-sm placeholder:text-gray-700"
                                            placeholder="••••••••"
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={loading}
                                className="w-full relative group overflow-hidden bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl transition-all shadow-[0_15px_30px_rgba(16,185,129,0.2)] disabled:opacity-50 flex items-center justify-center gap-3 mt-2"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span className="text-sm">SIGN IN</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-white/5 text-center">
                            <p className="text-gray-500 text-xs">
                                New here? <Link to="/register" className="text-white font-bold hover:text-emerald-400 transition-colors underline underline-offset-4 decoration-emerald-500/30">Create account</Link>
                            </p>
                        </div>
                    </div>

                    {/* Pastdagi dekorativ yozuv */}
                    <p className="text-center mt-6 text-[10px] text-gray-600 uppercase tracking-[0.5em]">
                        &copy; 2026 Stealth Messenger
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;