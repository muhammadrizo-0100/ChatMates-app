const express = require("express");
const router = express.Router();
const controller = require("../controller/messageController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Message
 *   description: Xabarlar bilan ishlash va chat tarixini boshqarish API tizimi
 */

/**
 * @swagger
 * /api/message:
 *   post:
 *     summary: Yangi xabar yuborish
 *     description: Chatga matnli xabar yuboradi va chatning "last_message" maydonini yangilaydi.
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chat_id
 *               - text
 *             properties:
 *               chat_id:
 *                 type: integer
 *                 description: Xabar qaysi chatga yuborilayotgani (Chat ID)
 *                 example: 1
 *               text:
 *                 type: string
 *                 description: Xabar matni
 *                 example: "Salom, qandaysan? Ishlar yaxshimi?"
 *     responses:
 *       201:
 *         description: Xabar muvaffaqiyatli yuborildi
 *       400:
 *         description: Validatsiya xatosi yoki bo'sh xabar
 *       401:
 *         description: Avtorizatsiya xatosi (Token xato yoki yo'q)
 *       404:
 *         description: Chat topilmadi
 */
router.post("/message", authMiddleware, controller.sendMessage);

/**
 * @swagger
 * /api/message/{chatId}:
 *   get:
 *     summary: Chatdagi barcha xabarlarni olish (Chat tarixi)
 *     description: Muayyan chatga tegishli barcha xabarlarni vaqt tartibida qaytaradi.
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Xabarlari olinishi kerak bo'lgan chatning ID raqami
 *     responses:
 *       200:
 *         description: Xabarlar ro'yxati muvaffaqiyatli qaytarildi
 *       403:
 *         description: Siz bu chat ishtirokchisi emassiz
 *       404:
 *         description: Chat topilmadi
 */
router.get("/message/:chatId", authMiddleware, controller.getMessages);

/**
 * @swagger
 * /api/message/read/{chatId}:
 *   put:
 *     summary: Xabarlarni o'qilgan deb belgilash
 *     description: Muayyan chatdagi barcha kelgan xabarlarni o'qilgan holatga o'tkazadi.
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Xabarlari o'qilgan deb belgilanishi kerak bo'lgan chat ID
 *     responses:
 *       200:
 *         description: Xabarlar muvaffaqiyatli o'qildi deb belgilandi
 *       401:
 *         description: Avtorizatsiya xatosi
 *       404:
 *         description: Chat topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/message/read/:chatId", authMiddleware, controller.markAsRead);

/**
 * @swagger
 * /api/message/{id}:
 *   put:
 *     summary: Xabarni tahrirlash (Edit Message)
 *     description: Yuborilgan xabar matnini o'zgartiradi. Faqat xabar egasi tahrirlashi mumkin.
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tahrirlanishi kerak bo'lgan xabar ID raqami
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Yangi xabar matni
 *                 example: "Bu xabar tahrirlandi"
 *     responses:
 *       200:
 *         description: Xabar muvaffaqiyatli tahrirlandi
 *       400:
 *         description: Matn kiritilmagan yoki xato
 *       403:
 *         description: Siz faqat o'z xabaringizni tahrirlashingiz mumkin
 *       404:
 *         description: Xabar topilmadi
 */
router.put("/message/:id", authMiddleware, controller.updateMessage);

/**
 * @swagger
 * /api/message/{id}:
 *   delete:
 *     summary: Xabarni o'chirish
 *     description: Yuborilgan xabarni ID bo'yicha o'chiradi (faqat yuboruvchi).
 *     tags: [Message]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O'chirilishi kerak bo'lgan xabar ID
 *     responses:
 *       200:
 *         description: Xabar muvaffaqiyatli o'chirildi
 *       403:
 *         description: Ruxsat yo'q
 *       404:
 *         description: Xabar topilmadi
 */
router.delete("/message/:id", authMiddleware, controller.deleteMessage);

module.exports = router;