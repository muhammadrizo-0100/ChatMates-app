import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Messages from "../components/Messages";

const Dashboard = () => {
    // 1. Initial state: Refresh berganda saqlab qolish uchun sessionStorage'dan olamiz
    const [selectedChat, setSelectedChat] = useState(() => {
        const savedChat = sessionStorage.getItem("activeChat");
        return savedChat ? JSON.parse(savedChat) : null;
    });

    // 2. Chat o'zgarganda uni sessionStorage'ga yozib boramiz
    useEffect(() => {
        if (selectedChat) {
            sessionStorage.setItem("activeChat", JSON.stringify(selectedChat));
        }
    }, [selectedChat]);

    // 3. MUHIM: Home pagedan dashboardga birinchi marta kirganda chatni tozalash
    // Agar URL'da biron bir belgi bo'lmasa yoki kirishda tozalash kerak bo'lsa:
    useEffect(() => {
        // Agar sizga faqat Navbar orqali o'tganda tozalash kerak bo'lsa, 
        // ushbu mantiqni Sidebar'dagi logout yoki boshqa joyga ham qo'shish mumkin.
        // Hozirgi holatda refresh uchun sessionStorage yetarli.
    }, []);

    return (
        <div className="flex h-screen bg-[#0a0a0c] text-white overflow-hidden font-sans">
            {/* Left Side: Sidebar */}
            <Sidebar
                onSelectChat={setSelectedChat}
                selectedChatId={selectedChat?.id || selectedChat?._id}
            />

            {/* Right Side: Chat or Empty State */}
            <div className="flex-1 flex flex-col relative bg-[#0d0d0f]">
                {selectedChat ? (
                    <Messages
                        selectedChat={selectedChat}
                        setSelectedChat={setSelectedChat}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse border border-white/5">
                            <MessageCircle className="text-gray-700" size={48} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-400 tracking-tight">Your Messages</h2>
                        <p className="text-gray-600 mt-2 max-w-xs text-sm italic">
                            Search or select a chat to start messaging
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;