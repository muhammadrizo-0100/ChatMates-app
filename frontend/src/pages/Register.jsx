import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userApi } from "../services/api";
import { User, Mail, Lock, Loader2, MessageSquare, BadgeCheck, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

const Register = () => {
    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem("register_draft");
        return savedData ? JSON.parse(savedData) : {
            username: "", password: "", firstname: "", lastname: "", email: "", tel: ""
        };
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem("register_draft", JSON.stringify(formData));
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await userApi.register({ ...formData });
            toast.success("Account created!");
            localStorage.removeItem("register_draft");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Error!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col overflow-x-hidden font-sans">
            <style dangerouslySetInnerHTML={{
                __html: `
                input:-webkit-autofill {
                    -webkit-text-fill-color: white !important;
                    -webkit-box-shadow: 0 0 0px 1000px #111113 inset !important;
                }
                .react-international-phone-input-container { width: 100%; }
                .react-international-phone-input {
                    width: 100% !important;
                    background: rgba(255, 255, 255, 0.03) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    border-left: none !important;
                    border-radius: 0 12px 12px 0 !important;
                    color: white !important;
                    height: 44px !important; /* Kichraytirildi */
                    font-size: 13px !important;
                }
                .react-international-phone-country-selector-button {
                    background: rgba(255, 255, 255, 0.03) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    border-radius: 12px 0 0 12px !important;
                    height: 44px !important;
                    width: 48px !important;
                }
            `}} />

            <Navbar />

            <div className="flex-1 flex items-center justify-center px-4 py-6 relative">
                {/* Neon effektlar - biroz kichikroq */}
                <div className="absolute top-[25%] right-[15%] w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[25%] left-[15%] w-[200px] h-[200px] bg-emerald-900/10 rounded-full blur-[80px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg bg-[#0f0f11]/80 border border-white/5 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] shadow-2xl relative z-10"
                >
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                            <MessageSquare className="text-black" size={24} fill="currentColor" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-white">Create Account</h2>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Join the community</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {[
                            { label: "First Name", name: "firstname", icon: User, placeholder: "Abbos" },
                            { label: "Last Name", name: "lastname", icon: BadgeCheck, placeholder: "Aliyev" },
                            { label: "Username", name: "username", icon: MessageSquare, placeholder: "abbos_dev" },
                            { label: "Email", name: "email", icon: Mail, placeholder: "master@gmail.com", type: "email" },
                        ].map((f) => (
                            <div key={f.name} className="space-y-1">
                                <label className="text-[9px] font-black text-emerald-500/70 ml-1 uppercase tracking-wider">{f.label}</label>
                                <div className="relative group">
                                    <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
                                    <input
                                        type={f.type || "text"}
                                        required
                                        value={formData[f.name]}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all text-sm text-white placeholder:text-gray-600"
                                        placeholder={f.placeholder}
                                        onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-emerald-500/70 ml-1 uppercase tracking-wider">Phone</label>
                            <PhoneInput
                                defaultCountry="uz"
                                value={formData.tel}
                                onChange={(phone) => setFormData({ ...formData, tel: phone })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-emerald-500/70 ml-1 uppercase tracking-wider">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all text-sm text-white placeholder:text-gray-600"
                                    placeholder="••••••••"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-400"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className="sm:col-span-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-black py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-emerald-500/20 uppercase tracking-wider text-xs"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                <><span>Sign Up Now</span><BadgeCheck size={18} /></>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-white/5 text-center">
                        <p className="text-gray-500 text-xs">
                            Already a member? <Link to="/login" className="text-emerald-400 font-black hover:text-emerald-300 ml-1 underline underline-offset-4">Log In</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;