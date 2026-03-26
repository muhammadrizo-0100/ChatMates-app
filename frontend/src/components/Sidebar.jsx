import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Menu, Loader2, LogOut, MoreVertical, Trash2, UserPlus, Settings, BellOff } from "lucide-react";
import { chatApi, userApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Sidebar = ({ onSelectChat, selectedChatId }) => {
    const { user, logout } = useAuth();
    const { onlineUsers, socket } = useSocket();
    const [chats, setChats] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [chatToDelete, setChatToDelete] = useState(null);

    const currentUserId = useMemo(() => String(user?.id || user?._id), [user]);

    // Partnerni aniqlash funksiyasi
    const getPartner = useCallback((chat) => {
        if (!chat) return null;
        return String(chat.user1_id) === currentUserId ? chat.user2 : chat.user1;
    }, [currentUserId]);

    // Chatlarni yuklash
    const fetchChats = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await chatApi.getMyChats();
            const sortedChats = (response.data || []).sort((a, b) =>
                new Date(b.updatedAt) - new Date(a.updatedAt)
            );
            setChats(sortedChats);
        } catch (err) {
            console.error("Chatlarni yuklashda xatolik:", err);
            toast.error("Suhbatlarni yuklab bo'lmadi");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchChats(); }, [fetchChats]);

    // Socket orqali real-time yangilash
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg) => {
            setChats(prev => {
                const chatIndex = prev.findIndex(c => String(c.id) === String(msg.chat_id));

                if (chatIndex !== -1) {
                    const updatedChats = [...prev];
                    const isNotActive = String(selectedChatId) !== String(msg.chat_id);

                    updatedChats[chatIndex] = {
                        ...updatedChats[chatIndex],
                        last_message: msg.text,
                        updatedAt: new Date().toISOString(),
                        // Agar chat ochiq bo'lmasa, o'qilmaganlar sonini oshirish
                        unread_count: isNotActive
                            ? (updatedChats[chatIndex].unread_count || 0) + 1
                            : 0
                    };
                    return updatedChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                } else {
                    fetchChats(); // Yangi chat bo'lsa ro'yxatni yangilash
                    return prev;
                }
            });
        };

        socket.on("message received", handleNewMessage);
        return () => socket.off("message received", handleNewMessage);
    }, [socket, fetchChats, selectedChatId]);

    // Qidiruv mantiqi
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            const trimmedQuery = searchQuery.trim();
            if (trimmedQuery.length > 1) {
                setIsSearching(true);
                try {
                    const res = await userApi.search(trimmedQuery);
                    setSearchResults((res.data || []).filter(u => String(u.id || u._id) !== currentUserId));
                } catch (err) {
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, currentUserId]);

    const handleSearchSelect = (selectedUser) => {
        const partnerId = String(selectedUser.id || selectedUser._id);
        const existingChat = chats.find(chat => {
            const p = getPartner(chat);
            return String(p?.id || p?._id) === partnerId;
        });

        if (existingChat) {
            onSelectChat(existingChat);
        } else {
            onSelectChat({
                id: `temp-${partnerId}`,
                isNew: true,
                user1: user,
                user2: selectedUser,
                user1_id: currentUserId,
                user2_id: partnerId,
                last_message: ""
            });
        }
        setSearchQuery("");
    };

    const confirmDelete = async () => {
        if (!chatToDelete) return;
        try {
            await chatApi.deleteChat(chatToDelete);
            setChats(prev => prev.filter(c => c.id !== chatToDelete));
            if (String(selectedChatId) === String(chatToDelete)) onSelectChat(null);
            toast.success("Chat o'chirildi");
        } catch (err) {
            toast.error("O'chirishda xatolik yuz berdi");
        } finally {
            setChatToDelete(null);
            setOpenMenuId(null);
        }
    };

    // Vaqtni chiroyli ko'rsatish funksiyasi
    const formatChatTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffInDays === 1) return "Kecha";
        if (diffInDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="w-80 border-r border-white/5 flex flex-col bg-[#0a0a0c] h-full overflow-hidden select-none relative">

            {/* Click Outside for Context Menu */}
            {openMenuId && <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />}

            {/* Menu overlay */}
            <AnimatePresence>
                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="absolute left-4 top-16 w-52 bg-[#16161a] border border-white/10 rounded-2xl shadow-2xl z-40 p-2">
                            <div className="px-4 py-3 border-b border-white/5 mb-1 text-xs">
                                <p className="text-gray-500">Profil</p>
                                <p className="text-white font-bold truncate">{user?.username || user?.email}</p>
                            </div>
                            <button className="w-full flex items-center gap-3 p-3 text-gray-400 hover:bg-white/5 rounded-xl text-sm transition-colors"><Settings size={18} /> Sozlamalar</button>
                            <button onClick={logout} className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-400/10 rounded-xl text-sm font-medium transition-colors"><LogOut size={18} /> Chiqish</button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {chatToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#16161a] border border-white/10 p-6 rounded-3xl max-w-sm w-full text-center">
                            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
                            <h3 className="text-lg font-bold text-white mb-2">Chatni o'chirish?</h3>
                            <p className="text-gray-400 text-xs mb-6">Barcha xabarlar butunlay yo'qoladi. Bu amalni qaytarib bo'lmaydi.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setChatToDelete(null)} className="flex-1 py-3 rounded-xl bg-white/5 text-white text-sm hover:bg-white/10 transition-colors">Bekor qilish</button>
                                <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">O'chirish</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400">
                        <Menu size={22} />
                    </button>
                    <h1 className="font-black text-lg text-white tracking-tight">ChatMates</h1>
                    <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/20">
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                </div>

                <div className="relative">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-emerald-500' : 'text-gray-500'}`} size={18} />
                    <input
                        type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Foydalanuvchilarni qidirish..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-gray-600"
                    />
                    {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" size={16} />}
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {searchQuery.length > 0 ? (
                        <motion.div key="search" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <p className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Qidiruv natijalari</p>
                            {searchResults.length === 0 && !isSearching && (
                                <p className="px-4 py-4 text-sm text-gray-600 italic">Hech kim topilmadi</p>
                            )}
                            {searchResults.map(sUser => (
                                <div key={sUser.id || sUser._id} onClick={() => handleSearchSelect(sUser)} className="flex items-center gap-4 p-3 hover:bg-emerald-500/10 cursor-pointer rounded-2xl transition-all group">
                                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-lg">
                                        {sUser.username?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 text-sm font-bold text-white">{sUser.username}</div>
                                    <UserPlus size={18} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div key="chats" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {isLoading ? (
                                <div className="flex flex-col items-center py-20 opacity-20"><Loader2 className="animate-spin mb-2" /></div>
                            ) : chats.length === 0 ? (
                                <div className="text-center py-20">
                                    <p className="text-xs text-gray-600">Suhbatlar mavjud emas</p>
                                    <p className="text-[10px] text-gray-700 mt-1">Qidiruv orqali do'stlaringizni toping</p>
                                </div>
                            ) : (
                                chats.map(chat => {
                                    const partner = getPartner(chat);
                                    const isActive = String(selectedChatId) === String(chat.id);
                                    const isOnline = onlineUsers.some(u => String(u) === String(partner?.id || partner?._id));

                                    return (
                                        <div key={chat.id} onClick={() => onSelectChat(chat)}
                                            className={`p-3 rounded-[22px] flex items-center gap-4 cursor-pointer mb-1 group transition-all duration-300 ${isActive ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'hover:bg-white/5 text-gray-400'}`}>

                                            <div className="relative flex-shrink-0">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-colors ${isActive ? 'bg-black/10' : 'bg-white/5 text-emerald-500'}`}>
                                                    {partner?.username?.[0]?.toUpperCase() || "?"}
                                                </div>
                                                {isOnline && (
                                                    <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-[3px] ${isActive ? 'bg-black border-emerald-500' : 'bg-emerald-500 border-[#0a0a0c]'}`} />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <h3 className={`text-sm font-bold truncate ${isActive ? 'text-black' : 'text-white'}`}>
                                                        {partner?.username || "Noma'lum"}
                                                    </h3>
                                                    <span className={`text-[10px] ${isActive ? 'text-black/60' : 'text-gray-500'}`}>
                                                        {formatChatTime(chat.updatedAt)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className={`text-xs truncate pr-2 ${isActive ? 'text-black/70 font-medium' : 'text-gray-500'}`}>
                                                        {chat.last_message || "Suhbatni boshlang..."}
                                                    </p>
                                                    {chat.unread_count > 0 && !isActive && (
                                                        <span className="bg-emerald-500 text-black text-[10px] font-black h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center animate-pulse">
                                                            {chat.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="opacity-0 group-hover:opacity-100 relative transition-opacity">
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                                                }} className={`p-1 rounded-lg ${isActive ? 'hover:bg-black/10' : 'hover:bg-white/10'}`}>
                                                    <MoreVertical size={16} />
                                                </button>

                                                <AnimatePresence>
                                                    {openMenuId === chat.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="absolute right-0 top-8 w-36 bg-[#1b1b21] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                                                        >
                                                            <button onClick={(e) => { e.stopPropagation(); setChatToDelete(chat.id); }} className="w-full flex items-center gap-2 px-4 py-3 text-xs text-red-500 hover:bg-red-500/10 transition-colors">
                                                                <Trash2 size={14} /> Chatni o'chirish
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Sidebar;