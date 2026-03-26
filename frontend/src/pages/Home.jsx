import { Link } from "react-router-dom";
import { Shield, Zap, Users, Send, Smile } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext"; // AuthContext qo'shildi
import Navbar from "../components/Navbar";

const Home = () => {
    const { user } = useAuth(); // User holatini olamiz

    // Animatsiya variantlari (Dizaynni buzmaydi, faqat mayinlashtiradi)
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-emerald-500/30 overflow-x-hidden">
            <Navbar />

            {/* Background Ornaments */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute top-[-10%] left-[-10%] w-[70%] md:w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ opacity: [0.05, 0.1, 0.05] }}
                    transition={{ duration: 7, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-[10%] right-[-5%] w-[60%] md:w-[30%] h-[30%] bg-emerald-900/10 rounded-full blur-[100px]"
                />
            </div>

            {/* HERO SECTION */}
            <header className="relative z-10 pt-12 md:pt-20 pb-20 md:pb-32 px-6 text-center">
                <motion.div {...fadeInUp}>
                    <span className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-400 mb-6 inline-block">
                        Future of Chat
                    </span>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight max-w-3xl mx-auto mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent leading-tight">
                        Connect with anyone, <br className="hidden md:block" /> anywhere.
                    </h1>

                    <p className="text-gray-500 text-sm md:text-lg max-w-lg mx-auto mb-10 leading-relaxed px-4">
                        Experience a new era of communication. Secure, lightning fast,
                        and built for the next generation of the web.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-16 md:mb-24 px-4">
                        {/* Shartli Link: Agar user bo'lsa Dashboardga, bo'lmasa Registerga */}
                        <Link
                            to={user ? "/dashboard" : "/register"}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all transform active:scale-95 text-sm md:text-base"
                        >
                            {user ? "Go to Dashboard" : "Get started for free"}
                        </Link>

                        <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition text-sm md:text-base text-white">
                            View Docs
                        </button>
                    </div>
                </motion.div>

                {/* --- FLOATING CHAT UI --- */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="relative max-w-4xl mx-auto mt-10 px-4"
                >
                    <div className="w-full h-64 md:h-[450px] rounded-2xl md:rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm relative overflow-hidden shadow-2xl">
                        {/* Browser Header */}
                        <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                        </div>

                        {/* Chat Body */}
                        <div className="p-6 space-y-4">
                            <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-600 shrink-0 shadow-[0_0_15px_rgba(147,51,234,0.5)]" />
                                <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-xs md:text-sm text-left max-w-[70%] border border-white/5">
                                    "This UI is looking sick! 🔥"
                                </div>
                            </motion.div>

                            <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="flex flex-row-reverse gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                <div className="bg-emerald-500 text-black p-3 rounded-2xl rounded-tr-none text-xs md:text-sm text-left max-w-[70%] font-medium">
                                    "Incredible speed! Loving the dark theme 🚀"
                                </div>
                            </motion.div>
                        </div>

                        {/* INPUT AREA */}
                        <div className="absolute bottom-6 left-6 right-6 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 gap-3">
                            <Smile size={20} className="text-gray-500 cursor-pointer hover:text-white transition" />
                            <div className="flex-1 text-left text-sm text-gray-500">Write a message...</div>
                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center cursor-pointer hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20">
                                <Send size={18} className="text-black" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </header>

            {/* FEATURE CARDS */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20 grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10 md:mt-20">
                <FeatureCard title="Real-time" desc="Zero latency." icon={<Zap className="text-emerald-500" size={18} />} />
                <FeatureCard title="Encrypted" desc="Privacy first." icon={<Shield className="text-purple-500" size={18} />} />
                <FeatureCard title="Cloud" desc="Sync all devices." icon={<Users className="text-blue-500" size={18} />} active />
                <FeatureCard title="Groups" desc="Team collab." icon={<Users className="text-orange-500" size={18} />} />
            </section>
        </div>
    );
};

const FeatureCard = ({ title, desc, icon, active = false }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`p-5 md:p-6 rounded-2xl md:rounded-3xl border ${active ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-white/[0.02]'} hover:border-emerald-500/20 transition-all cursor-default text-left`}
    >
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 flex items-center justify-center mb-6 md:mb-10">
            {icon}
        </div>
        <h3 className="text-sm md:text-base font-bold mb-1 md:mb-2">{title}</h3>
        <p className="text-gray-500 text-[11px] md:text-xs leading-relaxed">{desc}</p>
    </motion.div>
);

export default Home;