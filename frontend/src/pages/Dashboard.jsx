import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Messages from "../components/Messages";

const Dashboard = () => {
    const [selectedChat, setSelectedChat] = useState(() => {
        const savedChat = sessionStorage.getItem("activeChat");
        return savedChat ? JSON.parse(savedChat) : null;
    });

    useEffect(() => {
        if (selectedChat) {
            sessionStorage.setItem("activeChat", JSON.stringify(selectedChat));
        } else {
            sessionStorage.removeItem("activeChat");
        }
    }, [selectedChat]);

    return (
        // h-[100dvh] mobil brauzerlardagi URL bar bilan bog'liq muammolarni hal qiladi
        <div className="flex h-[100dvh] bg-[#0a0a0c] text-white overflow-hidden font-sans relative">

            {/* --- SIDEBAR CONTAINER --- */}
            <aside className={`
                /* 768px dan pastda (md:): Chat tanlangan bo'lsa butunlay yo'qoladi */
                ${selectedChat ? "hidden md:flex" : "flex w-full"} 
                
                /* Desktopda qat'iy kenglik: shrink-0 ustun semirib ketishini oldini oladi */
                md:w-[350px] lg:w-[400px] md:shrink-0
                
                h-full border-r border-white/5 bg-[#0a0a0c] z-20
            `}>
                <Sidebar
                    onSelectChat={setSelectedChat}
                    selectedChatId={selectedChat?.id || selectedChat?._id}
                />
            </aside>

            {/* --- CHAT OR EMPTY STATE CONTAINER --- */}
            <main className={`
                /* Mobilda: Chat tanlanmagan bo'lsa yo'qoladi */
                ${!selectedChat ? "hidden md:flex" : "flex w-full"} 
                
                /* Desktopda: Qolgan barcha bo'sh joyni egallaydi */
                md:flex-1 h-full bg-[#0d0d0f] relative z-10
            `}>
                <AnimatePresence mode="wait">
                    {selectedChat ? (
                        <motion.div
                            key={selectedChat?.id || selectedChat?._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full flex flex-col"
                        >
                            <Messages
                                selectedChat={selectedChat}
                                setSelectedChat={setSelectedChat}
                            />
                        </motion.div>
                    ) : (
                        /* Bo'sh holat (Faqat Desktopda ko'rinadi) */
                        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-24 h-24 bg-emerald-500/5 rounded-full flex items-center justify-center mb-6 border border-emerald-500/10">
                                    <MessageCircle className="text-emerald-500/40" size={48} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-200 tracking-tight">Xush kelibsiz!</h2>
                                <p className="text-gray-500 mt-2 max-w-xs text-sm leading-relaxed">
                                    Suhbatni boshlash uchun kontaktlaringizdan birini tanlang yoki yangi foydalanuvchi qidiring.
                                </p>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Dashboard;