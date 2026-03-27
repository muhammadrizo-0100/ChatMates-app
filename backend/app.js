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

// 1. CORS manzillari
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "https://chat-mates-app.vercel.app"
];

// 2. Socket.io sozlamalari
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

// 3. Express CORS sozlamalari
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
    console.log("🟢 New connection:", socket.id);

    // 1. SETUP & ONLINE STATUS
    socket.on("setup", (userData) => {
        if (userData?.id) {
            const userIdString = String(userData.id);
            socket.join(userIdString);
            onlineUsers.set(userIdString, socket.id);
            console.log(`👤 User ${userIdString} is online.`);

            io.emit("get-online-users", Array.from(onlineUsers.keys()));
            socket.emit("connected");
        }
    });

    // 2. JOIN CHAT
    socket.on("join chat", (room) => {
        if (room) {
            socket.join(String(room));
            console.log(`💬 Joined room: ${room}`);
        }
    });

    // --- YANGI QO'SHILDI: CHAT YARATILGANDA ---
    socket.on("new chat", (data) => {
        const { receiverId, chat } = data;
        if (receiverId) {
            socket.to(String(receiverId)).emit("new chat created", chat);
        }
    });

    // --- YANGI QO'SHILDI: CHAT O'CHIRILGANDA ---
    socket.on("delete chat", (data) => {
        const { chatId, partnerId } = data;
        if (partnerId) {
            socket.to(String(partnerId)).emit("chat deleted", chatId);
        }
    });

    // 3. NEW MESSAGE
    socket.on("new message", (newMessage) => {
        // Xabar obyektidan chat_id va qabul qiluvchi (receiver) ID sini olamiz
        const chatId = String(newMessage.chat_id || newMessage.chatId);

        // Partnerning ID sini aniqlash (frontenddan yuborilayotgan obyektda bo'lishi kerak)
        const receiverId = newMessage.receiverId || (newMessage.chat && newMessage.chat.receiverId);

        if (!chatId) return;

        // 1. Chat xonasiga yuborish (o'sha paytda chatni ichida o'tirganlar uchun)
        socket.to(chatId).emit("message received", newMessage);

        // 2. Yangilanish: Partnerning shaxsiy xonasiga yuborish (Sidebar yangilanishi uchun)
        if (receiverId) {
            socket.to(String(receiverId)).emit("message received", newMessage);
        }
    });

    // 4. READ STATUS
    socket.on("read messages", (data) => {
        const { chatId, userId } = data;
        if (chatId) {
            socket.to(String(chatId)).emit("messages read", { chatId, userId });
        }
    });

    // 5. DELETE MESSAGE
    socket.on("delete message", (data) => {
        const { messageId, chatId } = data;
        if (chatId) {
            socket.to(String(chatId)).emit("message deleted", { messageId, chatId });
        }
    });

    // 6. EDIT MESSAGE
    socket.on("edit message", (data) => {
        const { id, text, chatId } = data;
        if (chatId) {
            socket.to(String(chatId)).emit("message updated", { id, text });
        }
    });

    // 7. TYPING STATUS
    socket.on("typing", (room) => socket.to(String(room)).emit("typing", room));
    socket.on("stop typing", (room) => socket.to(String(room)).emit("stop typing", room));

    // 8. DISCONNECT
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
                console.log(`🔴 User ${disconnectedUserId} is offline.`);
            } catch (err) {
                console.error("Disconnect error:", err.message);
            }
        }
    });
});

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
    .then(() => {
        console.log('✅ Database connected successfully.');
        return sequelize.sync({ alter: false });
    })
    .then(() => {
        server.listen(PORT, () => {
            console.log(`✅ Server is running on port: ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Database connection error:', err);
    });