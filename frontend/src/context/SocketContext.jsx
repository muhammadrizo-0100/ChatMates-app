import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};

// .env dan keladigan URL, bo'lmasa localhost ishlatadi
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const SocketProvider = ({ children, user }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    // User ID ni aniq belgilab olamiz
    const userId = user?.id || user?._id;

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    useEffect(() => {
        let newSocket = null;

        if (userId) {
            newSocket = io(SOCKET_URL, {
                query: { userId },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 2000,
                transports: ["websocket"],
            });

            newSocket.on("connect", () => {
                console.log("🟢 Soketga ulandi:", newSocket.id);
                setIsConnected(true);
                newSocket.emit("setup", user);
            });

            newSocket.on("disconnect", (reason) => {
                console.log("🔴 Soket uzildi:", reason);
                setIsConnected(false);
            });

            newSocket.on("get-online-users", (users) => {
                setOnlineUsers(users);
            });

            // SocketContext.jsx ichida
            newSocket.on("message received", (newMessage) => {
                const senderId = newMessage.sender_id || newMessage.sender?.id;

                if (String(senderId) !== String(userId)) {
                    setNotifications((prev) => {
                        // DUBLIKAT TEKSHIRUVI
                        if (prev.some(n => n.id === newMessage.id)) return prev;
                        return [newMessage, ...prev];
                    });
                }
            });

            newSocket.on("connect_error", (err) => {
                console.error("❌ Soket ulanishida xato:", err.message);
            });

            setSocket(newSocket);
        }

        return () => {
            if (newSocket) {
                newSocket.off("message received");
                newSocket.off("get-online-users");
                newSocket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        };
    }, [userId]); // Faqat userId o'zgarganda qayta ishlaydi

    const value = {
        socket,
        onlineUsers,
        notifications,
        setNotifications,
        isConnected,
        clearNotifications
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};