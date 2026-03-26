const express = require("express");
const router = express.Router();
const controller = require("../controller/chatController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Suhbatlarni boshqarish va xabarlar uchun xonalar ochish API tizimi
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Chat yaratish yoki mavjudini olish (Access Chat)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *             properties:
 *               receiverId:
 *                 type: integer
 *                 description: Kim bilan chat ochmoqchi bo'lsangiz o'sha foydalanuvchining ID raqami
 *                 example: 2
 *     responses:
 *       200:
 *         description: Chat topildi yoki muvaffaqiyatli yaratildi
 *       400:
 *         description: Validatsiya xatosi yoki o'zi bilan chat ochishga urinish
 *       401:
 *         description: Avtorizatsiya xatosi (Token yo'q)
 */
router.post("/chat", authMiddleware, controller.accessChat);

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Foydalanuvchining barcha chatlar ro'yxatini olish
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chatlar ro'yxati (oxirgi yangilangani bo'yicha saralangan)
 *       401:
 *         description: Avtorizatsiya xatosi
 */
router.get("/chat", authMiddleware, controller.getChats);

/**
 * @swagger
 * /api/chat/{id}:
 *   get:
 *     summary: ID orqali bitta chat ma'lumotlarini ko'rish
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chatning ID raqami
 *     responses:
 *       200:
 *         description: Chat ma'lumotlari qaytarildi
 *       403:
 *         description: Bu chatni ko'rishga ruxsat yo'q
 *       404:
 *         description: Chat topilmadi
 */
router.get("/chat/:id", authMiddleware, controller.getChatById);

/**
 * @swagger
 * /api/chat/{id}:
 *   delete:
 *     summary: Suhbatni (Chatni) butunlay o'chirish
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O'chirilishi kerak bo'lgan chat ID raqami
 *     responses:
 *       200:
 *         description: Chat muvaffaqiyatli o'chirildi
 *       403:
 *         description: Bu chatni o'chirishga huquqingiz yo'q
 *       404:
 *         description: Chat topilmadi
 */
router.delete("/chat/:id", authMiddleware, controller.deleteChat);

module.exports = router;