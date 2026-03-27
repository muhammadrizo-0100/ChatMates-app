import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Send, Edit2, Trash2, X, Check, CheckCheck, Loader2, MoreVertical } from "lucide-react";
import { messageApi, chatApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Messages = ({ selectedChat, setSelectedChat, onChatCreated }) => {
    const { user } = useAuth();
    const { socket, onlineUsers } = useSocket();
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [editingMessage, setEditingMessage] = useState(null);
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const scrollRef = useRef();
    const typingTimeoutRef = useRef(null);

    // ID larni har doim String-ga o'girib solishtirish xavfsiz
    const currentUserId = useMemo(() => String(user?.id || user?._id || ""), [user]);

    const partner = useMemo(() => {
        if (!selectedChat) return null;

        // 1. Agar qidiruvdan kelgan yangi chat bo'lsa
        if (selectedChat.isNew) return selectedChat.user2 || selectedChat.User2;

        // 2. Mavjud chat ichidan sherikni qidirish
        const u1_id = String(selectedChat.user1_id || selectedChat.User1?.id || selectedChat.user1?.id || "");

        const u1 = selectedChat.user1 || selectedChat.User1;
        const u2 = selectedChat.user2 || selectedChat.User2;

        return u1_id === currentUserId ? u2 : u1;
    }, [selectedChat, currentUserId]);

    // --- TUZATISH: Online holatini tekshirish ---
    const isPartnerOnline = useMemo(() => {
        const partnerId = partner?.id || partner?._id;
        if (!partnerId || !onlineUsers) return false;
        return onlineUsers.some(u => String(u) === String(partnerId));
    }, [partner, onlineUsers]);

    // Xabarlarni yuklash
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedChat?.id || selectedChat.isNew) {
                setMessages([]);
                return;
            }
            try {
                setLoading(true);
                const res = await messageApi.getMessages(selectedChat.id);
                setMessages(res.data || []);
                await messageApi.markAsRead(selectedChat.id);
                socket?.emit("read messages", { chatId: selectedChat.id, userId: currentUserId });
            } catch (err) {
                console.error("Xatolik:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
        if (socket && selectedChat?.id && !selectedChat.isNew) {
            socket.emit("join chat", selectedChat.id);
        }
    }, [selectedChat?.id, socket, currentUserId, selectedChat?.isNew]);

    // Socket orqali yangi xabar kelishi
    const handleNewMessage = useCallback((msgData) => {
        if (String(msgData.chat_id) === String(selectedChat?.id)) {
            setMessages(prev => {
                if (prev.some(m => String(m.id) === String(msgData.id))) return prev;
                return [...prev, msgData];
            });

            if (String(msgData.sender_id) !== currentUserId) {
                socket.emit("read messages", { chatId: selectedChat.id, userId: currentUserId });
            }
        }
    }, [selectedChat?.id, currentUserId, socket]);

    useEffect(() => {
        if (!socket || !selectedChat?.id) return;

        const handleUpdate = (u) => setMessages(p => p.map(m => String(m.id) === String(u.id) ? { ...m, text: u.text, is_edited: true } : m));
        const handleDelete = ({ messageId }) => setMessages(p => p.filter(m => String(m.id) !== String(messageId)));
        const handleRead = ({ chatId }) => String(chatId) === String(selectedChat.id) && setMessages(p => p.map(m => ({ ...m, is_read: true })));
        const handleTyping = (id) => String(id) === String(selectedChat.id) && setIsPartnerTyping(true);
        const handleStopTyping = (id) => String(id) === String(selectedChat.id) && setIsPartnerTyping(false);

        socket.on("message received", handleNewMessage);
        socket.on("message updated", handleUpdate);
        socket.on("message deleted", handleDelete);
        socket.on("messages read", handleRead);
        socket.on("typing", handleTyping);
        socket.on("stop typing", handleStopTyping);

        return () => {
            socket.off("message received", handleNewMessage);
            socket.off("message updated", handleUpdate);
            socket.off("message deleted", handleDelete);
            socket.off("messages read", handleRead);
            socket.off("typing", handleTyping);
            socket.off("stop typing", handleStopTyping);
        };
    }, [socket, selectedChat?.id, handleNewMessage]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        const text = messageText.trim();
        if (!text || isSending) return;

        try {
            setIsSending(true);
            if (editingMessage) {
                await messageApi.editMessage(editingMessage.id, text);
                socket.emit("edit message", { id: editingMessage.id, text, chatId: selectedChat.id });
                setMessages(p => p.map(m => m.id === editingMessage.id ? { ...m, text, is_edited: true } : m));
                setEditingMessage(null);
            } else {
                let activeChatId = selectedChat.id;

                if (selectedChat.isNew) {
                    const partnerId = partner.id || partner._id;
                    const chatRes = await chatApi.createChat(partnerId);
                    const newChat = chatRes.data;
                    activeChatId = newChat.id;
                    setSelectedChat(newChat);
                    if (onChatCreated) onChatCreated(newChat);
                    socket.emit("join chat", activeChatId);
                }

                const res = await messageApi.sendMessage(activeChatId, text);
                const { message: sentMsg } = res.data;

                setMessages(prev => {
                    if (prev.some(m => String(m.id) === String(sentMsg.id))) return prev;
                    return [...prev, sentMsg];
                });

                socket.emit("new message", { ...sentMsg, chatId: activeChatId });
            }
            setMessageText("");
            socket.emit("stop typing", selectedChat.id);
        } catch (err) {
            toast.error("Xabar yuborilmadi");
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteMessage = async (id) => {
        if (!window.confirm("O'chirilsinmi?")) return;
        try {
            await messageApi.deleteMessage(id);
            socket.emit("delete message", { messageId: id, chatId: selectedChat.id });
            setMessages(p => p.filter(m => m.id !== id));
        } catch (err) {
            toast.error("Xatolik");
        }
    };

    const groupedMessages = useMemo(() => {
        const groups = {};
        messages.forEach(msg => {
            const date = new Date(msg.createdAt).toDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });
        return groups;
    }, [messages]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, isPartnerTyping]);

    if (!selectedChat) return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0c] text-gray-600">
            <Send size={32} className="opacity-20 rotate-12 mb-4" />
            <p className="text-sm tracking-widest uppercase opacity-50">Suhbatni tanlang</p>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-[#0a0a0c] relative">
            <header className="px-6 py-4 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-11 h-11 bg-emerald-500 rounded-2xl flex items-center justify-center text-black font-bold text-xl">
                            {partner?.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        {isPartnerOnline && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-[#0a0a0c] rounded-full" />}
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">{partner?.username || "Noma'lum foydalanuvchi"}</h2>
                        <p className={`text-[10px] ${isPartnerTyping ? "text-emerald-400" : "text-gray-500"}`}>
                            {isPartnerTyping ? "yozmoqda..." : (isPartnerOnline ? "online" : "offline")}
                        </p>
                    </div>
                </div>
                <button className="p-2 hover:bg-white/5 rounded-xl text-gray-500"><MoreVertical size={20} /></button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 custom-scrollbar">
                {loading && <div className="flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>}

                {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date} className="space-y-4">
                        <div className="flex justify-center">
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                {date === new Date().toDateString() ? "Bugun" : new Date(date).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long' })}
                            </span>
                        </div>

                        {msgs.map((msg) => {
                            const isMe = String(msg.sender_id) === currentUserId;
                            return (
                                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
                                    <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                        <div className={`flex items-center gap-2 ${isMe ? "flex-row" : "flex-row-reverse"}`}>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {isMe && <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>}
                                                {isMe && <button onClick={() => { setEditingMessage(msg); setMessageText(msg.text) }} className="p-1.5 text-gray-500 hover:text-blue-500"><Edit2 size={14} /></button>}
                                            </div>
                                            <div className={`px-4 py-2.5 rounded-2xl ${isMe ? "bg-emerald-500 text-black rounded-tr-none shadow-lg shadow-emerald-500/10" : "bg-white/5 text-white border border-white/10 rounded-tl-none"}`}>
                                                <p className="text-[13px] whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                                <div className="flex items-center justify-end gap-1 mt-1 opacity-50 text-[9px]">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && (msg.is_read ? <CheckCheck size={12} className="text-blue-700" /> : <Check size={12} />)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            <footer className="p-6 bg-[#0a0a0c]">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
                    <AnimatePresence>
                        {editingMessage && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute -top-10 left-0 right-0 bg-emerald-500/10 text-emerald-500 text-xs py-2 px-4 rounded-t-xl border-t border-x border-emerald-500/20 flex justify-between items-center backdrop-blur-md">
                                <span className="flex items-center gap-2 font-bold"><Edit2 size={12} /> Tahrirlash...</span>
                                <button type="button" onClick={() => { setEditingMessage(null); setMessageText(""); }}><X size={14} /></button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className={`flex items-end gap-3 bg-white/5 border p-2 rounded-2xl transition-all ${editingMessage ? "border-emerald-500 rounded-tr-none" : "border-white/10 focus-within:border-emerald-500/50"}`}>
                        <textarea
                            rows="1"
                            value={messageText}
                            onChange={(e) => {
                                setMessageText(e.target.value);
                                if (!selectedChat.isNew) {
                                    socket?.emit("typing", selectedChat.id);
                                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                    typingTimeoutRef.current = setTimeout(() => socket?.emit("stop typing", selectedChat.id), 2000);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Xabar yozing..."
                            className="flex-1 bg-transparent outline-none text-white text-sm px-4 py-2.5 resize-none max-h-32"
                        />
                        <button type="submit" disabled={!messageText.trim() || isSending} className="bg-emerald-500 p-3 rounded-xl text-black disabled:opacity-30 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
                            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>
                </form>
            </footer>
        </div>
    );
};

export default Messages;