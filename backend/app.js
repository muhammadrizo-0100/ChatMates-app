const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const { sequelize, User } = require("../backend/models");
const setupSwagger = require("./swagger/swagger");

const userRoute = require("./routes/userRoute");
const chatRoute = require("./routes/chatRoute");
const messageRoute = require("./routes/messageRoute");

dotenv.config();

const app = express();
const server = http.createServer(app);

// --- MUHIM: RUXSAT BERILGAN MANZILLAR ---
const allowedOrigins = [
    "https://chat-mates-app.vercel.app",
    "http://localhost:5173"
];

// 1. Socket.io CORS sozlamalari
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

app.set("socketio", io);
app.use(express.json());

// 2. Express CORS sozlamalari
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use("/api", userRoute);
app.use("/api", chatRoute);
app.use("/api", messageRoute);

if (setupSwagger) setupSwagger(app);

// ---------------- SOCKET.IO LOGIKASI ----------------
let onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("🟢 Yangi ulanish:", socket.id);

    socket.on("setup", (userData) => {
        if (userData?.id) {
            const userIdString = String(userData.id);
            socket.join(userIdString);
            onlineUsers.set(userIdString, socket.id);
            console.log(`👤 Foydalanuvchi ${userIdString} onlayn.`);
            io.emit("get-online-users", Array.from(onlineUsers.keys()));
            socket.emit("connected");
        }
    });

    socket.on("join chat", (room) => {
        if (room) {
            socket.join(String(room));
            console.log(`💬 Xonaga kirdi: ${room}`);
        }
    });

    socket.on("new message", (newMessage) => {
        const chatId = String(newMessage.chat_id || newMessage.chatId);
        if (!chatId) return;
        socket.to(chatId).emit("message received", newMessage);
    });

    socket.on("read messages", (data) => {
        const { chatId, userId } = data;
        if (chatId) {
            socket.to(String(chatId)).emit("messages read", { chatId, userId });
        }
    });

    socket.on("delete message", (data) => {
        const { messageId, chatId } = data;
        if (chatId) {
            socket.to(String(chatId)).emit("message deleted", { messageId });
        }
    });

    socket.on("edit message", (data) => {
        const { id, text, chatId } = data;
        if (chatId) {
            socket.to(String(chatId)).emit("message updated", { id, text });
        }
    });

    socket.on("typing", (room) => socket.to(String(room)).emit("typing", room));
    socket.on("stop typing", (room) => socket.to(String(room)).emit("stop typing", room));

    socket.on("disconnect", async () => {
        let disconnectedUserId = null;
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                disconnectedUserId = userId;
                break;
            }
        }

        if (disconnectedUserId) {
            onlineUsers.delete(disconnectedUserId);
            try {
                await User.update(
                    { lastSeen: new Date() },
                    { where: { id: disconnectedUserId } }
                );
                io.emit("get-online-users", Array.from(onlineUsers.keys()));
                console.log(`🔴 Foydalanuvchi ${disconnectedUserId} oflayn.`);
            } catch (err) {
                console.error("Disconnect error:", err.message);
            }
        }
    });
});

const PORT = process.env.PORT || 5000;
sequelize.sync({ alter: false }).then(() => {
    server.listen(PORT, () => {
        console.log(`✅ Server portda ishlamoqda: ${PORT}`);
    });
});