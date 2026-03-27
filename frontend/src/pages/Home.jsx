import { Link } from "react-router-dom";
import { Shield, Zap, Users, Send, Smile } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Home = () => {
    const { user } = useAuth();

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
            <header className="relative z-10 pt-12 md:pt-20 pb-16 md:pb-32 px-4 md:px-6 text-center">
                <motion.div {...fadeInUp}>
                    <span className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-400 mb-6 inline-block">
                        Future of Chat
                    </span>

                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight max-w-3xl mx-auto mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent leading-[1.1]">
                        Connect with anyone, <br className="hidden sm:block" /> anywhere.
                    </h1>

                    <p className="text-gray-500 text-xs sm:text-sm md:text-lg max-w-lg mx-auto mb-10 leading-relaxed px-2">
                        Experience a new era of communication. Secure, lightning fast,
                        and built for the next generation of the web.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-12 md:mb-24">
                        <Link
                            to={user ? "/dashboard" : "/register"}
                            className="w-full max-w-[280px] sm:w-auto px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all transform active:scale-95 text-sm md:text-base"
                        >
                            {user ? "Go to Dashboard" : "Get started for free"}
                        </Link>

                        <button className="w-full max-w-[280px] sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition text-sm md:text-base text-white">
                            View Docs
                        </button>
                    </div>
                </motion.div>

                {/* --- FLOATING CHAT UI (O'sha muammoli qism to'g'irlandi) --- */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="relative max-w-4xl mx-auto mt-6 md:mt-10"
                >
                    <div className="w-full h-[320px] sm:h-[450px] rounded-2xl md:rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm relative overflow-hidden shadow-2xl">
                        {/* Browser Header */}
                        <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2 shrink-0">
                            <div className="w-2 h-2 rounded-full bg-red-500/40" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                            <div className="w-2 h-2 rounded-full bg-green-500/40" />
                        </div>

                        {/* Chat Body */}
                        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto h-[calc(100%-100px)]">
                            <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-2 sm:gap-3">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 shrink-0 shadow-[0_0_15px_rgba(147,51,234,0.5)]" />
                                <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-[10px] sm:text-sm text-left max-w-[80%] sm:max-w-[70%] border border-white/5">
                                    "This UI is looking sick! 🔥"
                                </div>
                            </motion.div>

                            <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="flex flex-row-reverse gap-2 sm:gap-3">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                <div className="bg-emerald-500 text-black p-3 rounded-2xl rounded-tr-none text-[10px] sm:text-sm text-left max-w-[80%] sm:max-w-[70%] font-medium">
                                    "Incredible speed! Loving the dark theme 🚀"
                                </div>
                            </motion.div>
                        </div>

                        {/* INPUT AREA (350px da ham ideal turishi uchun) */}
                        <div className="absolute bottom-4 left-4 right-4 h-12 sm:h-14 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl flex items-center px-3 sm:px-4 gap-2 sm:gap-3 backdrop-blur-md">
                            <Smile size={18} className="text-gray-500 shrink-0 cursor-pointer hover:text-white transition hidden xs:block" />
                            <div className="flex-1 text-left text-[10px] sm:text-sm text-gray-500 truncate">Write a message...</div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 cursor-pointer hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20">
                                <Send size={16} className="text-black" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </header>

            {/* FEATURE CARDS - Mobilda 2 ustun, 350px da sig'ishi uchun gap-2 qilingan */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pb-20 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <FeatureCard title="Real-time" desc="Zero latency." icon={<Zap className="text-emerald-500" size={16} />} />
                <FeatureCard title="Encrypted" desc="Privacy first." icon={<Shield className="text-purple-500" size={16} />} />
                <FeatureCard title="Cloud" desc="Sync all." icon={<Users className="text-blue-500" size={16} />} active />
                <FeatureCard title="Groups" desc="Team collab." icon={<Users className="text-orange-500" size={16} />} />
            </section>
        </div>
    );
};

const FeatureCard = ({ title, desc, icon, active = false }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border ${active ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-white/[0.02]'} hover:border-emerald-500/20 transition-all cursor-default text-left`}
    >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center mb-4 sm:mb-10">
            {icon}
        </div>
        <h3 className="text-xs sm:text-base font-bold mb-1">{title}</h3>
        <p className="text-gray-500 text-[10px] sm:text-xs leading-tight sm:leading-relaxed">{desc}</p>
    </motion.div>
);

export default Home;