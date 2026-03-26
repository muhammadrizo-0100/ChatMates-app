const { Message, Chat, User } = require("../models");
const { validateMessage } = require("../validations/messageValidation");
const { Op } = require('sequelize');

// 1. SEND MESSAGE (Xabar yuborish)
exports.sendMessage = async (req, res) => {
    const { error } = validateMessage(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { chat_id, text } = req.body;
    const sender_id = req.user.id;

    try {
        const chat = await Chat.findByPk(chat_id);
        if (!chat) return res.status(404).json({ message: "Chat topilmadi" });

        // 1. Xabarni bazada yaratish
        let message = await Message.create({
            chat_id,
            sender_id,
            text
        });

        // 2. Xabar ma'lumotlarini sender bilan birga qayta yuklash
        message = await Message.findByPk(message.id, {
            include: [
                {
                    model: User,
                    as: "sender",
                    attributes: ["id", "username", "firstname", "avatar"]
                }
            ]
        });

        // 3. Chatning oxirgi xabarini yangilash
        await Chat.update(
            {
                last_message: text,
                last_message_time: new Date()
            },
            { where: { id: chat_id } }
        );

        // --- 4. REAL-TIME (SOCKET.IO) ---
        const io = req.app.get("socketio");
        if (io) {
            // Chat xonasidagilarga yangi xabarni yuborish
            io.to(String(chat_id)).emit("message received", message);

            // Partnerga bildirishnoma yuborish (Sidebar yangilanishi uchun)
            const partnerId = chat.user1_id === sender_id ? chat.user2_id : chat.user1_id;
            io.to(String(partnerId)).emit("new message notification", {
                chatId: chat_id,
                text: text,
                sender: message.sender
            });
        }

        res.status(201).json(message);
    } catch (err) {
        console.error("Xabar yuborishda xatolik:", err);
        res.status(500).json({ message: err.message });
    }
};

// 2. UPDATE MESSAGE (Xabarni tahrirlash)
exports.updateMessage = async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) return res.status(400).json({ message: "Xabar matni bo'sh bo'lmasligi kerak" });

    try {
        const message = await Message.findByPk(id);
        if (!message) return res.status(404).json({ message: "Xabar topilmadi" });

        if (message.sender_id !== req.user.id) {
            return res.status(403).json({ message: "Faqat o'z xabaringizni tahrirlashingiz mumkin" });
        }

        message.text = text;
        message.is_edited = true;
        await message.save();

        // Chat modelini yangilash (agar oxirgi xabar bo'lsa)
        const lastMsgInChat = await Message.findOne({
            where: { chat_id: message.chat_id },
            order: [['createdAt', 'DESC']]
        });

        if (lastMsgInChat && lastMsgInChat.id === message.id) {
            await Chat.update({ last_message: text }, { where: { id: message.chat_id } });
        }

        // --- SOCKET.IO: Tahrirlanganini hamma ko'rsin ---
        const io = req.app.get("socketio");
        if (io) {
            io.to(String(message.chat_id)).emit("message updated", message);
        }

        res.json(message);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. GET ALL MESSAGES (O'zgarishsiz qoldi)
exports.getMessages = async (req, res) => {
    const { chatId } = req.params;
    try {
        const chat = await Chat.findByPk(chatId);
        if (!chat) return res.status(404).json({ message: "Chat topilmadi" });

        if (chat.user1_id !== req.user.id && chat.user2_id !== req.user.id) {
            return res.status(403).json({ message: "Ruxsat yo'q" });
        }

        const messages = await Message.findAll({
            where: { chat_id: chatId },
            include: [{ model: User, as: "sender", attributes: ["id", "username", "firstname", "avatar"] }],
            order: [["createdAt", "ASC"]]
        });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. MARK MESSAGES AS READ (Xabarlarni o'qilgan deb belgilash)
exports.markAsRead = async (req, res) => {
    const { chatId } = req.params;
    const reader_id = req.user.id;

    try {
        const chat = await Chat.findByPk(chatId);
        if (!chat) return res.status(404).json({ message: "Chat topilmadi" });

        const [updatedCount] = await Message.update(
            { is_read: true },
            {
                where: {
                    chat_id: chatId,
                    is_read: false,
                    sender_id: { [Op.ne]: reader_id }
                }
            }
        );

        // --- SOCKET.IO: Narigi odamda "Double Check" ko'k bo'lishi uchun ---
        const io = req.app.get("socketio");
        if (io && updatedCount > 0) {
            io.to(String(chatId)).emit("messages read", { chatId, reader_id });
        }

        res.json({ message: "O'qildi deb belgilandi" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 5. DELETE MESSAGE (Xabarni o'chirish)
exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findByPk(req.params.id);
        if (!message) return res.status(404).json({ message: "Xabar topilmadi" });

        if (message.sender_id !== req.user.id) {
            return res.status(403).json({ message: "Faqat o'z xabaringizni o'chira olasiz" });
        }

        const chatId = message.chat_id;
        const messageId = message.id;
        await message.destroy();

        // Chatning oxirgi xabarini yangilash
        const newLastMsg = await Message.findOne({
            where: { chat_id: chatId },
            order: [['createdAt', 'DESC']]
        });

        await Chat.update(
            {
                last_message: newLastMsg ? newLastMsg.text : "Xabarlar o'chirildi",
                last_message_time: newLastMsg ? newLastMsg.createdAt : new Date()
            },
            { where: { id: chatId } }
        );

        // --- SOCKET.IO: Xabar o'chganini xonadagilarga aytish ---
        const io = req.app.get("socketio");
        if (io) {
            io.to(String(chatId)).emit("message deleted", { id: messageId, chatId });
        }

        res.json({ message: "Xabar o'chirildi" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};