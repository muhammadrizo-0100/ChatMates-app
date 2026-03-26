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

// 1. CORS manzillarini aniqlash (Render va Vercel uchun)
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "https://chat-mates-app.vercel.app" // O'zingizning aniq vercel manzilingizni qo'shing
];

// 2. Socket.io CORS sozlamalari
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
    console.log("🟢 Yangi ulanish:", socket.id);

    // 1. SETUP & ONLINE STATUS
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

    // 2. JOIN CHAT
    socket.on("join chat", (room) => {
        if (room) {
            socket.join(String(room));
            console.log(`💬 Xonaga kirdi: ${room}`);
        }
    });

    // 3. NEW MESSAGE
    socket.on("new message", (newMessage) => {
        const chatId = String(newMessage.chat_id || newMessage.chatId);
        if (!chatId) return;
        // Xabarni xonadagi boshqalarga yuborish
        socket.to(chatId).emit("message received", newMessage);
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
            socket.to(String(chatId)).emit("message deleted", { messageId });
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
                // Ma'lumotlar bazasini yangilash (asinxron)
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

// Ma'lumotlar bazasi bilan sinxronizatsiya va serverni ishga tushirish
sequelize.authenticate()
    .then(() => {
        console.log('✅ Ma\'lumotlar bazasiga ulanish muvaffaqiyatli.');
        return sequelize.sync({ alter: false });
    })
    .then(() => {
        server.listen(PORT, () => {
            console.log(`✅ Server portda ishlamoqda: ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ MB ulanishda xato:', err);
    });