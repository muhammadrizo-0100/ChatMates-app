const { Chat, User, Message } = require("../models");
const { validateChat } = require("../validations/chatValidation");
const { Op } = require("sequelize");

// 1. ACCESS CHAT (Chat yaratish yoki mavjudini olish)
exports.accessChat = async (req, res) => {
    // 1. Validatsiya
    if (typeof validateChat === "function") {
        const { error } = validateChat(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
    }

    const { receiverId } = req.body;
    const senderId = req.user.id;

    // O'zi bilan chat ochishni cheklash
    if (senderId === parseInt(receiverId)) {
        return res.status(400).json({ message: "O'zingiz bilan chat ocholmaysiz" });
    }

    try {
        // 2. Mavjud chatni qidirish
        let chat = await Chat.findOne({
            where: {
                [Op.or]: [
                    { user1_id: senderId, user2_id: receiverId },
                    { user1_id: receiverId, user2_id: senderId }
                ]
            },
            include: [
                { model: User, as: 'user1', attributes: ["id", "username", "firstname", "lastname", "avatar", "lastSeen"] },
                { model: User, as: 'user2', attributes: ["id", "username", "firstname", "lastname", "avatar", "lastSeen"] }
            ]
        });

        // 3. Agar chat mavjud bo'lmasa, yangi yaratish
        if (!chat) {
            chat = await Chat.create({
                user1_id: senderId,
                user2_id: receiverId
            });

            // Yangi yaratilgan chatni hamma ma'lumotlari (userlar) bilan qayta yuklash
            chat = await Chat.findByPk(chat.id, {
                include: [
                    { model: User, as: 'user1', attributes: ["id", "username", "firstname", "lastname", "avatar", "lastSeen"] },
                    { model: User, as: 'user2', attributes: ["id", "username", "firstname", "lastname", "avatar", "lastSeen"] }
                ]
            });

            // --- SOCKET.IO INTEGRATSIYASI ---
            const io = req.app.get("socketio");
            if (io) {
                // Qabul qiluvchining shaxsiy xonasiga (room) yangi chat haqida ma'lumot yuboramiz
                // Bu receiver'ning sidebar-ida yangi chat paydo bo'lishini ta'minlaydi
                io.to(String(receiverId)).emit("new chat created", chat);
            }
        }

        // 4. Javob qaytarish
        res.status(200).json(chat);
    } catch (err) {
        console.error("accessChat xatosi:", err);
        res.status(500).json({ message: err.message });
    }
};

// 2. GET ALL MY CHATS (Mening barcha suhbatlarim ro'yxati)
exports.getChats = async (req, res) => {
    try {
        const chats = await Chat.findAll({
            where: {
                [Op.or]: [{ user1_id: req.user.id }, { user2_id: req.user.id }]
            },
            include: [
                {
                    model: User,
                    as: 'user1',
                    attributes: ["id", "username", "firstname", "lastname", "avatar", "lastSeen"]
                },
                {
                    model: User,
                    as: 'user2',
                    attributes: ["id", "username", "firstname", "lastname", "avatar", "lastSeen"]
                },
                {
                    model: Message,
                    as: "messages",
                    limit: 1,
                    order: [['createdAt', 'DESC']]
                }
            ],
            order: [['updatedAt', 'DESC']]
        });

        res.json(chats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. GET CHAT BY ID (Bitta chat ma'lumotlarini olish)
exports.getChatById = async (req, res) => {
    try {
        const data = await Chat.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: "user1",
                    attributes: ["id", "username", "firstname", "lastname", "avatar", "lastSeen"]
                },
                {
                    model: User,
                    as: "user2",
                    attributes: ["id", "username", "firstname", "lastname", "avatar", "lastSeen"]
                },
                {
                    model: Message,
                    as: "messages",
                    limit: 50,
                    order: [['createdAt', 'DESC']]
                }
            ],
        });

        if (!data) return res.status(404).json({ message: "Chat topilmadi" });

        if (data.user1_id !== req.user.id && data.user2_id !== req.user.id) {
            return res.status(403).json({ message: "Sizda bu chatni ko'rish huquqi yo'q" });
        }

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. DELETE CHAT (Suhbatni o'chirish)
exports.deleteChat = async (req, res) => {
    try {
        const chat = await Chat.findByPk(req.params.id);
        if (!chat) return res.status(404).json({ message: "Chat topilmadi" });

        if (chat.user1_id !== req.user.id && chat.user2_id !== req.user.id) {
            return res.status(403).json({ message: "Sizda bu chatni o'chirish huquqi yo'q" });
        }

        await chat.destroy();
        res.json({ message: "Suhbat muvaffaqiyatli o'chirildi" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};